import express from "express";
import {user} from "../model/model.js";

const router = express.Router();
const account='';

router.get('/login', (req, res) => {
    if(req.session.auth){
        res.redirect('/account/info');
    }
    else{
        res.render('vwAccount/login');
    }
});

router.post('/login', async (req, res) => {
    try{
        if(await user.checkPassword(req.body.username, req.body.password)){
            req.session.auth = true;
            req.session.authUser = await user.getUser(req.body.username);
            req.session.authUser.minName=req.session.authUser.name.split(' ')[0];
            res.redirect('/');
        }
        else
        {
            res.render('vwAccount/Login',{
                err_message: "Invalid username or password"})
            }
        }
    catch{
        res.render('vwAccount/Login',{
            err_message: "Invalid username or password"})
    }
});

router.get('/logout', (req, res) => {
    req.session.auth = false;
    req.session.authUser = null;
    res.redirect('/');
});

router.get('/signup', (req, res) => {
    if(req.session.auth){
        res.redirect('/account/info');
    }
    else{
        res.render('vwAccount/signup');
    }
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
    await user.newUser(req.body.username, req.body.password,  req.body.name, req.body.dob ,req.body.email, "bidder");
    res.redirect('/account/login');
});

router.get('/info', async (req, res) => {
    if(req.session.auth){
        res.render('vwAccount/profile');
    }
    else{
        res.redirect('/account/login');
    }
})

export default router;