import express from "express";
import {user} from "../model/model.js";

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('vwAccount/Login');
});

router.get('/signup', (req, res) => {
    res.render('vwAccount/Signup');
});

router.get('/is-available', async (req, res) => {
    const name  = req.query.user;
    const username = await user.getUser(name);
    if(username===null){
        return res.json(true)
    }
    res.json(false);
})

router.post('/signup', async (req, res) => {
    await user.newUser(req.body.username, req.body.password,req.body.email, 'bidder');
    res.render('vwAccount/Signup');
});

export default router;