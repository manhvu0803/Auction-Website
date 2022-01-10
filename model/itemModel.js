import * as firestore from "firebase-admin/firestore";
import lunr from "lunr-mutable-indexes";
import { getDatabase } from "firebase-admin/database";

const fileDuration = 10000000000;
const debug = true;

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

/**
 * @param {QuerySnapshot} doc
 * @returns {item} item data
 */
function parseItemDoc(doc)
{
	let data = doc.data();
	if (!data)
		return null;
	
	data.id = doc.id;
	for (let prop in data)
		if (data[prop] instanceof firestore.Timestamp)
			data[prop] = data[prop].toDate();
	
	return data;
}

export default class itemModel
{
	constructor(database, bucket, buildIndex = true)
	{
		this.itemsRef = database.collection("auctionItems");
		this.categoryRef = database.collection("categories");
		this.rtdbRef = getDatabase().ref("bids/");
		this.bucket = bucket;

		this.index = lunr(function() {
			this.field("name");
			this.field("description");
			this.field("seller");
			this.field("category");
		})

		if (buildIndex)
			 this.createIndex();
	}

	async createIndex()
	{
		let items = await this.getAllItems();
		
		for (let item of items) 
			this.updateIndex(item)
		
		console.log("Full-text search index has been built");
	}

	updateIndex(item, itemId = null)
	{
		this.index.add({
			id: (itemId) ? itemId : item.id,
			name: item.name,
			description: item.description,
			seller: item.seller,
			category: item.category
		})
	}

	async getAllItems()
	{
		let snapshot = await this.itemsRef.get();
		let res = [];
		snapshot.forEach((doc) => {
			res.push(parseItemDoc(doc));
		});
		return res;
	}

	/**
	 * 
	 * @param {string} id 
	 * @returns item data with this id
	 */
	async getItem(id)
	{
		let doc = await this.itemsRef.doc(id).get();
		return parseItemDoc(doc);
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
								.where("listing", "==", true)
								.where("category", "==", category)
								.orderBy(order)
								.startAfter(start)
								.limit(count)
								.get();

		return res.docs.map(doc => parseItemDoc(doc));
	}

	async getItemByQuery(query)
	{
		//console.log(this.index);
		let searchRes = this.index.search(query);
		let res = [];
		for (var val of searchRes) 
			res.push(val.ref);
		return res;
	}

	/**
	 * Get the main image of an item
	 * @param {string} id 
	 * @returns {Promise<url>} url of the main images
	 */
	async getMainImageUrl(id)
	{
		let res = await this.bucket.getFiles({prefix: `items/${id}`})
		for (let file of res[0])
			if (parsePrefix(file.name) == "main")
				return await getUrl(file);
	}
	
	/**
	 * Get non-main images of an item
	 * @param {string} id 
	 * @returns {Promise<[url]>} array of urls of images
	 */
	async getExtraImageUrls(id)
	{
		let res = await this.bucket.getFiles({prefix: `items/${id}`})
		let urls = [];
		for (let i = 1; i < res[0].length; i++) {
			let file = res[0][i];
			if (parsePrefix(file.name) != "main")
				urls.push(await getUrl(file));
		}
		return urls;
	}

	/**
	 * 
	 * @returns an object:
	 * ```javascript
	 * {
	 * 		catgories: [] // category names
	 * 		|category|: [] // subcategories
	 * }	
	 * ```
	 */
	async getAllCategories() {
		let snapshot = await this.categoryRef.get();
		let res = {
			categories: []
		}
		
		snapshot.forEach((doc) => {
			res.categories.push(doc.id);
			res[doc.id] = [];
			for (let subcat in doc.data()) 
				res[doc.id].push(subcat);
		})

		return res;
	}

	/**
	 * @param {string} category
	 * @returns {Promise<[string]} array of subcategory names
	 */
	 async getSubcategories(category) {
		let snapshot = await this.categoryRef.get(category);
		let res = []
		for (let subcat in snapshot.data()) 
			res.push(subcat);
		return res;
	}

	/**
	 * Add item image to storage
	 * @param {string} id item id
	 * @param {binary} data
	 */
	async addMainImage(id, data)
	{
		await this.bucket.file(`items/${id}/main.jpg`).save(data);
		if (debug) 
			console.log(`Uploaded main images for item ${id}`);
	}

	/**
	 * 
	 * @param {string} id 
	 * @param {[bianry]} images array of image (binary)
	 */
	async addExtraImages(id, images)
	{
		let imageSaves = [];
		for (let i = 0; i < images.length; i++)
			imageSaves.push(this.bucket.file(`items/${id}/${i}.jpg`).save(images[i]));
			
		for (let promise of imageSaves)
			await promise;
		
		if (debug) 
			console.log(`Uploaded ${imageSaves.length} images for item ${id}`);
	}

	/**
	 * Add item to database. Item data structure: 
	 * ```javascript
	 * {
	 * 	name: string,
	 * 	maximumPrice: number, 
	 * 	category: string,
	 * 	step: number,
	 * 	description: string,
	 * 	postedTime: Date,
	 * 	autoExtend: boolean,
	 * 	seller: string,
	 * 	startingPrice: number
	 * 	mainImage?: binary
	 * 	images?: [binaries]
	 * }
	 * ```
	 * mainImage and images is optional
	 * @param {itemData} item 
	 * @returns {Promise<String>} item id
	 */
	async addItem(item)
	{
		let itemData = {
			name: item.name,
			maximumPrice: item.maximumPrice,
			category: item.category,
			step: item.step,
			description: item.description,
			postedTime: item.postedTime,
			expireTime: item.expireTime,
			autoExtend: item.autoExtend,
			seller: item.seller,
			listing: true,
			startingPrice: item.startingPrice
		}

		let doc = await this.itemsRef.add(itemData);

		this.updateIndex(itemData);

		if (item.mainImage)
			this.addMainImage(doc.id, item.mainImage);

		if (item.images && item.images.length)
			this.addExtraImages(id, item.images);

		if (debug)
			console.log(`Added item ${itemData.name} to database with id ${doc.id}`);

		return doc.id;
	}

	async update(itemId, data)
	{
		let update = this.itemsRef.doc(itemId).update(data);

		this.updateIndex(data, itemId);

		await update;
		
		if (debug)
			console.log(`Updated item ${itemId}`)
	}

	/**
	 * Write a bid to database. Please note that this function **does not** check for data validity (username or item existence, amount is high enough or not)
	 * @param {string} itemId 
	 * @param {string} username 
	 * @param {number} amount 
	 */
	async bid(itemId, username, amount)
	{
		await this.rtdbRef.child(itemId).child(username).set({
			time: Date.now(),
			amount: amount
		});

		if (debug)
			console.log(`User ${username} bid ${amount} for item ${itemId}`);
	}

	/**
	 * 
	 * @param {string} itemId 
	 * @returns array of bid sorted by bid time
	 */
	async getBid(itemId)
	{
		let snapshot = await this.rtdbRef.child(itemId).get();
		let data = snapshot.val();
		let res = []
		for (let bid in data)
			res.push({
				user: bid,
				amount: data[bid].amount,
				time: new Date(data[bid].time)
			})

		return res.sort((a, b) => b.time > a.time ? 1 : -1);
	}

	/**
	 * Finish an item auction. The highest bidder would be written to database and return
	 * @param {string} itemId 
	 * @param {boolean} waitForUpdate default false. If true, wait until the database is fully updated before return
	 * @returns {string} username of the highest bidder
	 */
	async finalizeBid(itemId, waitForUpdate = false)
	{
		let bids = await this.getBid(itemId);
		if (bids.length < 1)
			throw Error(`No bid found for item ${itemId}`);

		let update = this.update(itemId, { 
			listing: false,
			buyer: bids[0].user 
		})
		if (waitForUpdate)
			await update;

		return bids[0].user;
	}
}