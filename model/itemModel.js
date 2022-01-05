import * as firestore from "firebase-admin/firestore";

const fileDuration = 10000000000;

function parsePrefix(dir)
{
	let items = dir.split("/");
	let filename = items[items.length - 1]
	return filename.split(".")[0]
}

async function getUrl(file)
{
	let res = await file.getSignedUrl({
		action: "read",
		expires: Date.now() + fileDuration
	})

	return res[0]
}

export default class userModel
{
	constructor(database, bucket)
	{
		this.itemsRef = database.collection("auctionItems");
		this.bucket = bucket;	
	}

	/**
	 * Do not call
	 * @param {QuerySnapshot} doc
	 * @returns {item} item data
	 */
	parseItemData(doc)
	{
		let data = doc.data();
		data.id = doc.id;
		data.postedTime = data.postedTime.toDate();
		return data;
	}

	/**
	 * 
	 * @param {string} id 
	 * @returns item data with this id
	 */
	async getItem(id)
	{
		let doc = await this.itemsRef.doc(id).get();
		return this.parseItemData(doc);
	}

	/**
	 * 
	 * @param {string} category 
	 * @param {number} start 
	 * @param {number} count 
	 * @param {("postedTime")} order 
	 * @returns {Promise<[item]>} array of items
	 */
	async getItemsByCategory(category, start = 0, count = 5, order = "postedTime")
	{
		let res = await this.itemsRef
								.where("category", "==", category)
								.orderBy(order)
								.startAfter(start)
								.limit(count)
								.get();

		return res.docs.map(doc => this.parseItemData(doc));
	}

	/**
	 * Get the main image of an item
	 * @param {string} id 
	 * @returns {Promise<url>} url of the main images
	 */
	async getMainImageUrl(id) {
		let res = await this.bucket.getFiles({prefix: "items/${id}"})
		for (let file of res[0])
			if (parsePrefix(file.name) == "main")
				return await getUrl(file);
	}
	
	/**
	 * Get non-main images of an item
	 * @param {string} id 
	 * @returns {Promise<[url]>} array of urls of images
	 */
	async getImageUrls(id)
	{
		let res = await this.bucket.getFiles({prefix: "items/${id}"})
		let urls = [];
		for (let file of res[0])
			if (parsePrefix(file.name) != "main")
				urls.push(await getUrl(file));
		return urls;
	}
}