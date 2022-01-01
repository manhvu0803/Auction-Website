import bcrypt from "bcrypt"

const saltRound = 10;

export default class userModel
{
	constructor(database)
	{
		this.db = database.collection("users");
	}

	/**
	 * 
	 * @param {string} username 
	 * @param {string} password 
	 * @param {string} email 
	 * @param {('bidder'|'seller'|'admin')} type 
	 */
	async newUser(username, password, email, type)
	{
		if (type != "bidder" && type != "seller" && type != "admin")
			throw new Error(`Invalid user type: ${type}`);

		let hash = bcrypt.hashSync(password, saltRound);
		let userDoc = this.db.doc(username);
		await userDoc.set({
			password: hash,
			email: email,
			type: type
		});

		console.log(`User ${username} written to database`);
	}

	/**
	 * 
	 * @param {string} username 
	 * @param {string} password 
	 * @returns compared result
	 */
	async checkPassword(username, password)
	{
		let userDoc = await this.db.doc(username).get();
		return bcrypt.compareSync(password, userDoc.get("password"));
	}
	
	/*
	async checkPasswordByEmail(email, password)
	{
		let userDoc = await this.db.where("email", "==", email).get();
		return bcrypt.compareSync(password, userDoc.password);
	}
	*/
}