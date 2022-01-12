import express from "express";
import {user} from "../model/model.js";

const router = express.Router();
const account='';

router.get('/', async (req,res)=>{
    if (req.query.username!==undefined){
        let info = await user.getUser(req.query.username);
        if(info.type==='seller'){
            info.isSeller=true;
        }
        else{
            info.isSeller=false;
        }

        if(req.session.auth){
            if(req.session.authUser.username===req.query.username){
                info.isSelf=true;
            }else{
                info.isSelf=false;
            }
        }
        else{
            info.isSelf=false;
        }

        info.downvoteCount=+info.totalVote-+info.upvoteCount;

        res.render('vwAccount/Profile_Infor',{info: info});
    }
    else{
        res.render('vwError/404');
    }
})

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
            req.session.authUser.username = req.body.username;
            req.session.authUser.minName=req.session.authUser.name.split(' ')[0];
            if(req.session.authUser.type==='seller')
                req.session.authUser.isSeller = true;
            else{
                req.session.authUser.isSeller = false;
            }
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

export default router;