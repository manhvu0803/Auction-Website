import express from "express";
import {user,item} from "../model/model.js";
import mailing from "../mail/mail.js";

const mail = new mailing();


// setInterval(() => {
//     console.log("Sending email");
// } , 60000);
console.log(await user.getEmail(19127072));