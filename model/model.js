import * as firestore from "firebase-admin/firestore";
import * as firebase from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";

import userModel from "./userModel.js";
import itemModel from "./itemModel.js"

let serviceAccount;
let serviceAccountStorage
try {
	serviceAccount = JSON.parse(fs.readFileSync("model/serviceAccountKey.json"));
	serviceAccountStorage = JSON.parse(fs.readFileSync("model/serviceAccountStorage.json"));
}
catch (e) {
	console.error(e);
	serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);
	serviceAccountStorage = JSON.parse(process.env.SERVICE_ACCOUNT_STORAGE);
}

const app = firebase.initializeApp({
	credential: firebase.cert(serviceAccount),
	storageBucket: "auction-database-db506.appspot.com",
});

const appStorage = firebase.initializeApp({
	credential: firebase.cert(serviceAccountStorage),
	storageBucket: "testdatabase-ff1d7.appspot.com",
}, "storage");

const bucket = getStorage(appStorage).bucket();
bucket.exists().then((res) => {
	if (res[0]) 
		console.log("Connected to bucket")
	else 
		console.error("Failed to connect to bucket")
})

const db = firestore.getFirestore(app);

export let user = new userModel(db);
export let item = new itemModel(db, bucket);