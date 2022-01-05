import * as firestore from "firebase-admin/firestore";
import * as firebase from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";

import userModel from "./userModel.js";
import itemModel from "./itemModel.js"

const serviceAccount =  JSON.parse(fs.readFileSync("model/serviceAccountKey.json"));

const app = firebase.initializeApp({
	credential: firebase.cert(serviceAccount),
	storageBucket: "auction-database-db506.appspot.com"
});

const bucket = getStorage().bucket();
bucket.exists().then((res) => {
	if (res[0]) 
		console.log("Connected to bucket")
	else 
		console.error("Failed to connect to bucket")
})

const db = firestore.getFirestore(app);

export let user = new userModel(db);
export let item = new itemModel(db, bucket);