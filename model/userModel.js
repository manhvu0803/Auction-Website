import bcrypt from "bcrypt"
import * as firestore from "firebase-admin/firestore";

const saltRound = 10;
const debug = true;

export default class userModel
{
	constructor(database)
	{
		this.usersRef = database.collection("users");
	}

	/**
	 * 
	 * @param {string} username 
	 * @param {string} password 
	 * @param {string} fullName 
	 * @param {Date} dob 
	 * @param {string} email 
	 * @param {("bidder"|"seller"|"admin")} type 
	 */
	async newUser(username, password, fullName, dob, email, type)
	{
		if (type != "bidder" && type != "seller" && type != "admin")
			throw new Error(`Invalid user type: ${type}`);

		let hash = bcrypt.hashSync(password, saltRound);
		let doc = this.usersRef.doc(username);
		await doc.set({
			password: hash,
			name: fullName,
			email: email,
			dob: dob,
			type: type,
			upvoteCount: 0,
			totalVote: 0
		});

		if (debug)
			console.log(`User ${username} written to database`);
	}

	/**
	 * 
	 * @param {String} username 
	 * @param {String} password 
	 * @returns compared result
	 */
	async checkPassword(username, password)
	{
		let userDoc = await this.usersRef.doc(username).get();
		return bcrypt.compareSync(password, userDoc.get("password"));
	}

	async getUser(username)
	{
		let userDoc = await this.usersRef.doc(username).get();
		let data = userDoc.data();
		if (!data)
			throw new Error("User not found");
		
		for (let prop in data)
		 	if (data[prop] instanceof firestore.Timestamp) 
				data[prop] = data[prop].toDate();
		delete data.password;
		return data;
	}

	async getAllUser()
	{
		let snapshot = await this.usersRef.get();

		return snapshot.docs.map(doc => {
			let data = doc.data();
			for (let prop in data)
				 if (data[prop] instanceof firestore.Timestamp) 
					data[prop] = data[prop].toDate();
			delete data.password;
			return data;
		})
	}

	async getEmail(username)
	{
		let userDoc = await this.usersRef.doc(username).get();
		return userDoc.get("email");
	}

	/**
	 * Do not call this function
	 * @param {string} username 
	 * @param {firestore.QuerySnapshot} oldDoc 
	 * @param {boolean} upvote 
	 */
	async updateVoteCount(username, oldDoc, upvote)
	{
		let oldData = oldDoc.data();
		let change = {upvote: 0, total: 0};
		if (oldData) {
			if (oldData.upvote != upvote) {
				if (upvote)
					change.upvote = 1
				else 
					change.upvote = -1;
			}
		}
		else {
			change.total = 1;
			if (upvote)
				change.upvote = 1;
		}

		await this.usersRef.doc(username).update({
			upvoteCount: firestore.FieldValue.increment(change.upvote),
			totalVote: firestore.FieldValue.increment(change.total)
		});

		if (debug)
			console.log(`Update vote count for user ${username}`)
	}

	async updateInfo(username, data)
	{
		if (data.password)
			data.password = bcrypt.hashSync(data.password, saltRound);
		this.usersRef.doc(username).update(data);
	}

	/**
	 * Change account type of a user. Changing to seller will create `sellerExpireTime` field. `sellerExpireTime` will be 7 days from the upgrade moment
	 * @param {string} username 
	 * @param {("seller" | "admin" | "bidder")} type default seller
	 */
	async upgradeAccount(username, type = "seller")
	{
		let data = {};
		data.type = type;
		if (type == seller)
			data.sellerExpireTime = new Date(Date.now() + 7 * 1000 * 60 * 60 * 24);
		await this.usersRef.doc(username).set(data, { merge: true });

		if (debug)
			console.log(`Upgrade user ${username} to ${type}`);
	}

	/**
	 * Add a user-to-user review. This won't check if the rater or the rated exists or not
	 * @param {string} rater username of the rating user
	 * @param {string} rated username of the rated user
	 * @param {boolean} upvote true for thumbs up (+1), false for thumbs down (-1)
	 * @param {string} review
	 */
	async addReview(rater, rated, upvote, review)
	{
		let reviewRef = this.usersRef.doc(rated).collection("reviews").doc(rater);

		this.updateVoteCount(rated, await reviewRef.get(), upvote);

		await reviewRef.set({
			upvote: upvote,
			review: review,
			time: firestore.Timestamp.fromDate(new Date())
		}, {merge: true});
		
		if (debug)
			console.log(`Updated the review of ${rated} by ${rater}`);
	}

	/**
	 * @param {*} username
	 * @param {*} start default: 0. The starting index (page) of reviews to get
	 * @param {*} count default: 5. The number of reviews to get
	 * @param {("time"|"upvote")} order default: "time". The sort order of reviews
	 * @returns {Promise<review[]>} array of reviews:``` {rater: string, review: string, time: Date, upvote: boolean}```
	 */
	async getReviews(username, start = 0, count = 5, order = "time")
	{
		let docs = await this.usersRef
									.doc(username)
									.collection("reviews")
									.orderBy(order)
									.startAfter(start)
									.limit(count)
									.get();

		return docs.docs.map((doc) => {
			let data = doc.data();
			data.rater = doc.id;
			data.time = data.time.toDate();
			return data;
		});
	}

	/**
	 * 
	 * @param {string} email 
	 * @param {string} password 
	 * @param {string} returnAccount default false
	 * @returns {boolean | user} Return true/false if returnAccount is false. Return user account data if returnAccount is true and password is correct
	 */
	async checkPasswordByEmail(email, password, returnAccount = false)
	{
		let snapshot = await this.usersRef.where("email", "==", email).get();
		let doc = snapshot.docs[0].data();
		let correct = bcrypt.compareSync(password, doc.password);
		
		if (!returnAccount)
			return correct;
		else if (!correct)
			return null;

		if (doc.password)
			delete doc.password;
		
		return doc;
	}
	
	async getUserByEmail(email)
	{
		let snapshot = await this.usersRef.where("email", "==", email).get();
		let data = snapshot.docs[0].data();
		if (data.password)
			delete data.password;
		return data;
	}

	async addItemToWatch(username, itemId) {
		await this.usersRef
				.doc(username)
				.collection("watch")
				.doc("itemId")
				.set({ [itemId]: null }, { merge: true });
		if (debug)
			console.log(`Add item ${itemId} to user ${username}'s watch list`);
	}

	async deleteWatchItem(username, itemId) {
		await this.usersRef
				.doc(username)
				.collection("watch")
				.doc("itemId")
				.set({ [itemId]: firestore.FieldValue.delete() });
		if (debug)
			console.log(`Delete item ${itemId} from user ${username}'s watch list`);
	}

	async getWatchItems(username) {
		let snapshot = await this.usersRef.doc(username).collection("watch").doc("itemId").get();
		let doc = snapshot.data();
		let res = []
		for (let prop in doc)
			res.push(prop);

		return res;
	}
}