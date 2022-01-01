import * as firestore from "firebase-admin/firestore";
import * as firebase from "firebase-admin/app";
import fs from "fs";

import userModel from "./userModel.js";

const serviceAccount =  JSON.parse(fs.readFileSync("model/serviceAccountKey.json"));

const app = firebase.initializeApp({
	credential: firebase.cert(serviceAccount)
});

const db = firestore.getFirestore(app);

export let user = new userModel(db);