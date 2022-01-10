import express from "express";
import {user} from "../model/model.js";
import mailing from "../mail/mail.js";

const mail = new mailing();

mail.sendMail('tien.nnang@gmail.com', 'Test', 'Test');