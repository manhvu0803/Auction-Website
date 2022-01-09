import express from "express";
import {user} from "../model/model.js";

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('vwAccount/Login');
});

router.get('/signup', (req, res) => {
    res.render('vwAccount/Signup');
});

router.post('/signup', async (req, res) => {
    console.log(req.body);
    // await user.newUser(req.body.username, req.body.password,req.body.email, req.body.type);
    res.render('vwAccount/Signup');
});

export default router;