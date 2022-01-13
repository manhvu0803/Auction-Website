import * as firestore from "firebase-admin/firestore";
import lunr from "lunr-mutable-indexes";

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

function parseIndex(item)
{
	let res = {};
	if (item.id)
		res.id = item.id;
	if (item.name)
		res.name = item.name;
	if (item.description)
		res.description = item.description;
	if (item.seller)
		res.seller = item.seller;
	if (item.category)
		res.category = item.category;
	if (item.subcategory)
		res.subcategory = item.subcategory;
	return res;
}

export class lunrIndex
{
	constructor()
	{
		this.index = lunr(function() {
			this.field("name");
			this.field("description");
			this.field("seller");
			this.field("category");
			this.field("subcategory");
		})
	}

	add(itemId, item)
	{
		item = parseIndex(item);
		item.id = itemId;
		this.index.add(item)
	}

	remove(itemId)
	{
		this.index.remove({ id: itemId })
	}

	update(itemId, item)
	{
		let itemData = parseIndex(item);
		itemData.id = itemId;
		this.index.update(itemData)
	}

	search(query)
	{
		return this.index.search(query);
	}
}

export default class itemModel
{
	constructor(database, bucket, buildIndex = true)
	{
		this.itemsRef = database.collection("auctionItems");
		this.categoryRef = database.collection("categories");
		this.bucket = bucket;

		this.index = new lunrIndex();

		if (buildIndex)
			 this.buildIndex();
	}

	async buildIndex()
	{
		let items = await this.getAllItems();

		for (let item of items)
			if (item.listing)
				this.index.add(item.id, item);
		
		console.log("Built full-text index")
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

	async getAllValidItems()
	{
		let snapshot = await this.itemsRef.where("listing", "==", true).get();
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
	 * @param {string} subcategory default null
	 * @param {number} count default 5
	 * @param {("postedTime")} order default "postedTime"
	 * @returns {Promise<[item]>} array of items
	 */
	async getItemsByCategory(category, subcategory = null,  start=null, count = 5,order = "postedTime")
	{
		let res = this.itemsRef
						.where("listing", "==", true)
						.where("category", "==", category);
		if(start)
			if (subcategory)
				res = await res
							.where("subcategory", "==", subcategory)
							.orderBy(order)
							.limit(count)
							.startAt(start)
							.get();
			else
				res = await res
							.orderBy(order)
							.limit(count)
							.startAt(start)
							.get();
		else
			if (subcategory)
				res = await res
							.where("subcategory", "==", subcategory)
							.orderBy(order)
							.limit(count)
							.get();
			else
				res = await res
							.orderBy(order)
							.limit(count)
							.get();

		return res.docs.map(doc => parseItemDoc(doc));
	}

	/**
	 * 
	 * @param {("expireTime" | "currentPrice" | "bidCount")} order 
	 * @param {("asc" | "desc")} direction default "desc"
	 * @param {number} start default 0
	 * @param {number} count default 5
	 * @returns {Promise<item[]>} 
	 */
	async getItemsByOrder(order, direction = "desc", count = 5)
	{
		let snapshot = await this.itemsRef
						.where("listing", "==", true)
						.orderBy(order, direction)
						.limit(count)
						.get();

		return snapshot.docs.map(doc => parseItemDoc(doc));
	}

	async getItemsByBuyer(username, count = 5)
	{
		let snapshot = await this.itemsRef.where("buyer", "==", username);
		return snapshot.docs.map(doc => parseItemDoc(doc));
	}

	async getItemByQuery(query)
	{
		let searchRes = this.index.search(query);
		let res = [];
		for (var val of searchRes) 
			res.push(val.ref);
		return res;
	}

	async getItemBySeller(username)
	{
		let snapshot = await this.itemsRef.where("seller", "==", username).get();
		return snapshot.docs.map(doc => parseItemDoc(doc));
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
	 * @returns {Promise<string[]>} array of subcategory names
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
	 * Add `subcategories` to `category`. If `category` doesn't exists, create that category. Omit `subcategories` to create `category` only
	 * @param {string} category category to add or add to
	 * @param {string[]} subcategories default null. Subcategories to add
	 */
	async addCategory(category, subcategories = null)
	{
		let catRef = this.categoryRef.doc(category);
		if (subcategories) {
			let data = {};
			for (let subcat of subcategories)
				data[subcat] = null;
			await catRef.set(data, { merge: true });
			console.log(`Added ${subcategories.length} subcategories for category "${category}"`);
		}
		else {
			await catRef.set({});
			console.log(`Added category "${category}"`)
		}
	}
	
	/**
	 * Deleted `subcategories` to `category`. If `subcategories` is null, delete `category`
	 * @param {string} category category to delete from or be deleted
	 * @param {string[]} subcategories default null. Subcategories to be deleted
	 */
	async deleteCategory(category, subcategories = null)
	{
		let catRef = this.categoryRef.doc(category);
		if (subcategories) {
			let data = {};
			for (let subcat of subcategories)
				data[subcat] = firestore.FieldValue.delete();
			await catRef.update(data);	
			console.log(`Deleted ${subcategories.length} subcategories from category "${category}"`);
		}
		else {
			await catRef.delete();
			console.log(`Deleted category "${category}"`)
		}
	}

	/**
	 * 
	 * @param {string} id 
	 * @param {binary[]} images array of image (binary)
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
	 * 	subcategory: string,
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
			subcategory: item.subcategory,
			step: item.step,
			description: item.description,
			postedTime: item.postedTime,
			expireTime: item.expireTime,
			autoExtend: item.autoExtend,
			seller: item.seller,
			listing: true,
			startingPrice: item.startingPrice,
			currentPrice: item.startingPrice,
			bidCount: 0
		}

		let doc = await this.itemsRef.add(itemData);

		this.index.add(doc.id, itemData);

		if (item.mainImage)
			this.addMainImage(doc.id, item.mainImage);

		if (item.images && item.images.length)
			this.addExtraImages(doc.id, item.images);

		if (debug)
			console.log(`Added item ${itemData.name} to database with id ${doc.id}`);

		return doc.id;
	}

	async update(itemId, data)
	{
		let update = this.itemsRef.doc(itemId).update(data);

		this.index.update(itemId, data);

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
		let updateBid = this.itemsRef.doc(itemId).collection("bids").doc(username).set({
			time: new Date(),
			amount: amount
		});

		let updateItem = this.itemsRef.doc(itemId).update({
			bidCount: firestore.FieldValue.increment(1),
			currentPrice: amount
		})

		await updateBid;
		await updateItem;

		if (debug)
			console.log(`User ${username} bid ${amount} for item ${itemId}`);
	}

	/**
	 * 
	 * @param {string} itemId 
	 * @param {number} limit the number of bids to get. Default 6
	 * @returns array of latest bid sorted by bid time, with length equal `limit`
	 */
	async getBid(itemId, limit = 6)
	{
		let snapshot = await this.itemsRef
									.doc(itemId)
									.collection("bids")
									.orderBy("time", "desc")
									.limit(limit)
									.get();

		let res = snapshot.docs.map((doc) => {
			let data = doc.data();
			data.user = doc.id;
			data.time = data.time.toDate();
			return data;
		});

		return res.sort((a, b) => b.time > a.time ? 1 : -1);
	}

	/**
	 * Finish an item auction. The highest bidder would be written to database and return
	 * @param {string} itemId 
	 * @param {boolean} waitForUpdate if true, wait until the database is fully updated before return. Default false
	 * @returns {string} username of the highest bidder (the winner)
	 */
	async finalizeBid(itemId, waitForUpdate = false)
	{
		let bids = await this.getBid(itemId, 1);
		if (bids.length < 1)
			throw Error(`No bid found for item ${itemId}`);

		let update = this.update(itemId, { 
			listing: false,
			buyer: bids[0].user 
		})

		this.index.remove(itemId);

		if (waitForUpdate)
			await update;

		return bids[0].user;
	}

	/**
	 * Add a user to item's ban list. Delete their bid from database
	 * @param {string} itemId 
	 * @param {string} username 
	 */
	async banBidder(itemId, username)
	{
		let updateBan = this.itemsRef.doc(itemId).set({ 
			bannedUser : firestore.FieldValue.arrayUnion(username) 
		}, { merge: true });

		await this.itemsRef.doc(itemId).collection("bids").doc(username).delete();

		let bid = await this.getBid(itemId, 1);
		
		await this.itemsRef.doc(itemId).update({
			bidCount: firestore.FieldValue.increment(-1),
			currentPrice: bid[0].amount
		})

		await updateBan

		console.log(`Banned user ${username} from item ${itemId}`)
	}
	
	async unbanBidder(itemId, username)
	{
		await this.itemsRef.doc(itemId).set({ 
			bannedUser : firestore.FieldValue.arrayRemove(username) 
		}, { merge: true });

		console.log(`Unbanned user ${username} from item ${itemId}`)
	}
}