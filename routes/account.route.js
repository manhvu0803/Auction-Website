import express from "express";
import {user,item} from "../model/model.js";

const router = express.Router();

router.get('/', async (req,res)=>{
    if (req.query.username!==undefined){
        try{
        let info = await user.getUser(req.query.username);
        info.username=req.query.username;
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
        catch{
            res.render('vwError/404');
        }
    }
    else{
        res.render('vwError/404');
    }
})

router.post('/edit', async (req,res)=>{
    console.log(req.body);
    const username=req.session.authUser.username
    try{
    await user.updateInfo(username,{
        name: req.body.name,
        dob: req.body.dob,
    });
        req.session.authUser = await user.getUser(username);
        req.session.authUser.username = username;
        req.session.authUser.minName=req.session.authUser.name.split(' ')[0];
        if(req.session.authUser.type==='seller')
            req.session.authUser.isSeller = true;
        else{
            req.session.authUser.isSeller = false;
        }
    }catch(err){
        console.log(err);
    }
    res.redirect('/account?username='+username);
})

router.get('/change-pwd',async(req,res)=>{
    if (req.query.username!==undefined){
        try{
            let info = await user.getUser(req.query.username);
            info.username=req.query.username;
            if(req.session.auth){
                if(req.session.authUser.username===req.query.username){
                    info.isSelf=true;
                    if(info.type==='seller'){
                        info.isSeller=true;
                    }
                    else{
                        info.isSeller=false;
                    }
                    info.downvoteCount=+info.totalVote-+info.upvoteCount;
                    res.render('vwAccount/Profile_ChangePassword',{info: info});
                }else{
                    info.isSelf=false;
                    res.render('vwError/404');
                }
            }
            else{
                info.isSelf=false;
                res.render('vwError/404');
            }
        }catch{
            res.render('vwError/404');
        }
    }
    else{
        res.render('vwError/404');
    }
})

router.post('/change-pwd',async(req,res)=>{
    if (req.query.username!==undefined){
        const username=req.session.authUser.username
        if(user.checkPassword(username,req.body.password)){
            await user.updateInfo(username,{
                password: req.body.newPassword,
            });
            res.redirect('/account?username='+username);
        }
        else res.redirect('/change-pwd?username='+username,{alertMessage: 'Wrong password'});
    }
    else{
        res.render('vwError/404');
    }
})

router.get('/fav',async(req,res)=>{
    if (req.query.username!==undefined){
        try{
            let info = await user.getUser(req.query.username);
            info.username=req.query.username;
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
            if(info.type==='seller'){
                info.isSeller=true;
            }
            else{
                info.isSeller=false;
            }
            const ids = await user.getWatchItems(req.query.username);
            let watchItems=[]

            for(let i=0;i<ids.length;i++){
                watchItems.push(await item.getItem(ids[i]));
                watchItems[i]['mainImage']= await item.getMainImageUrl(ids[i]);
            }

            info.downvoteCount=+info.totalVote-+info.upvoteCount;
            res.render('vwAccount/Profile_Favourite',{info: info, watchItems: watchItems});
        }catch(err){
            console.log(err);
            res.render('vwError/404');
        }
    }
    else{
        res.render('vwError/404');
    }
})

router.get('/point',async(req,res)=>{
    if (req.query.username!==undefined){
        try{
        let info = await user.getUser(req.query.username);
        info.username=req.query.username;
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
            if(info.type==='seller'){
                info.isSeller=true;
            }
            else{
                info.isSeller=false;
            }
            info.downvoteCount=+info.totalVote-+info.upvoteCount;

            if(info.totalVote==0)
            {
                info.percentVote=100;
            }
            else
                info.percentVote=Math.round((+info.upvoteCount/+info.totalVote)*100);
            const reviews = await user.getReview(req.query.username);
            res.render('vwAccount/Profile_Point',{info: info, reviews: reviews});
        }catch{
            res.render('vwError/404');
        }
    }
    else{
        res.render('vwError/404');
    }
})

router.get('/sell',async(req,res)=>{
    if (req.query.username!==undefined){
        try{
            let info = await user.getUser(req.query.username);
            info.username=req.query.username;
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
            if(info.type==='seller'){
                info.isSeller=true;
            }
            else{
                info.isSeller=false;
                res.render('vwError/404');
                return;
            }
            let items= await item.getItemBySeller(req.query.username);

            for(let i=0;i<items.length;i++){
                items[i]['mainImage']= await item.getMainImageUrl(items[i].id);
            }
            res.render('vwAccount/Profile_Sell',{info: info,item:items});

        }catch(err){
            console.log(err);
            res.render('vwError/404');
        }
    }
    else{
        res.render('vwError/404');
    }
})

router.get('/bought', async(req,res)=>{
    if (req.query.username!==undefined){
        try{
            let info = await user.getUser(req.query.username);
            info.username=req.query.username;
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
            if(info.type==='seller'){
                info.isSeller=true;
            }
            else{
                info.isSeller=false;
            }

            let items = await item.getAllItems(req.query.username);

            items=items.filter(item=>{
                if(item.buyer){
                    return item.buyer===req.query.username
                }
            });

            for(let i=0;i<items.length;i++){
                items[i]['mainImage']= await item.getMainImageUrl(items[i].id);
            }

            res.render('vwAccount/Profile_Bought',{info: info, boughtItems: items});
        }catch(err){
            console.log(err);
            res.render('vwError/404');
        }
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
            if(req.session.authUser.type==='admin')
                req.session.authUser.isAdmin = true;
            else{
                req.session.authUser.isAdmin = false;
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
        res.redirect('/');
    }
    else{
        res.render('vwAccount/signup');
    }
});

router.get('/is-available', async (req, res) => {
    if(req.query.user){
        const name  = req.query.user;
        try{
            const username = await user.getUser(name);
            return res.json(false);
        }
        catch{
            return res.json(true)
        }
    }else{
        const email  = req.query.email;
        try{
            let dump=await user.getUserByEmail(email);
            return res.json(false);
        }
        catch{
            return res.json(true)
        }
    }
})

router.get('/upgrade', async (req,res)=>{
    if(req.session.auth){
        await user.updateInfo(req.session.authUser.username,{wantUpgrade: true});
    }
    res.redirect('/')
})

router.post('/signup', async (req, res) => {
    await user.newUser(req.body.username, req.body.password,  req.body.name, req.body.dob ,req.body.email, "bidder");
    res.redirect('/account/login');
});

router.get('/:reviewer/review/:reviewed', async(req,res)=>{
    if(req.session.auth){
        if(req.session.authUser.username===req.params.reviewer){
            const reviewer = req.params.reviewer;
            const reviewed = req.params.reviewed;
            console.log(req.body);
            res.render('vwAccount/review',{reviewerUser:reviewer,reviewedUser:reviewed});
        }else{
            console.log(err);
            res.render('vwError/404');
        }
    }
    else{
        res.render('vwError/404');
    }
})
router.post('/:reviewer/review/:reviewed', async(req,res)=>{
    const reviewer = req.params.reviewer;
    const reviewed = req.params.reviewed;
    console.log(req.body);
    await user.addReview(reviewer,reviewed,req.body.vote=="up",req.body.review);
    res.redirect('/');

})

export default router;