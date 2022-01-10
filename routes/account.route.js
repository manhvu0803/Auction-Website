import express from "express";
import {user} from "../model/model.js";

const router = express.Router();
const account='';
router.get('/login', (req, res) => {
    res.render('vwAccount/login');
});

router.post('/login', async (req, res) => {
    
        if(await user.checkPassword(req.body.username, req.body.password)){
            res.redirect('/');
        }
        else
        {
            res.render('vwAccount/Login',{
            err_message: "Invalid username or password"})
        }
});

router.get('/signup', (req, res) => {
    res.render('vwAccount/signup');
});

router.get('/is-available', async (req, res) => {
    const name  = req.query.user;
    try{
        const username = await user.getUser(name);
        res.json(false);
    }
    catch{
        return res.json(true)
    }
})

router.post('/signup', async (req, res) => {
    await user.newUser(req.body.username, req.body.name, req.body.password,req.body.email, 'bidder');
    res.render('vwAccount/login');
});

export default router;