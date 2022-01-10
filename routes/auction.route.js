import express from "express";
import {user,item} from "../model/model.js";
import mailing from "../mail/mail.js";

const mail = new mailing();

const router = express.Router();
// setInterval(() => {
//     console.log("Sending email");
// } , 60000);

export default router;