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
	 * @param {String} username 
	 * @param {String} password 
	 * @param {String} email 
	 * @param {("bidder"|"seller"|"admin")} type 
	 */
	async newUser(username, password, email, type)
	{
		if (type != "bidder" && type != "seller" && type != "admin")
			throw new Error(`Invalid user type: ${type}`);

		let hash = bcrypt.hashSync(password, saltRound);
		let doc = this.usersRef.doc(username);
		await doc.set({
			password: hash,
			email: email,
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
		delete data.password;
		delete data.email;
		return data;
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
	 * @returns {Promise<[review]} array of reviews:``` {rater: string, review: string, time: Date, upvote: boolean}```
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

	/*
	async checkPasswordByEmail(email, password)
	{
		let userDoc = await this.usersRef.where("email", "==", email).get();
		return bcrypt.compareSync(password, userDoc.password);
	}
	*/
}