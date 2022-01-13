import express from "express";
import moment from "moment";
import { item, user } from "../model/model.js"
import mailing from "../mail/mail.js";

const router = express.Router();
const mail=new mailing();

router.post('/edit/:id',async(req,res)=>{
    const proID = req.params.id;
    try{
        let product = await item.getItem(proID);
        const date = moment().format('MM/DD/YYYY');
        product.description = product.description.concat(`<br><br><b>${date}</b><br>${req.body.description}`);
        await item.update(proID, {description:product.description});
        res.redirect('/item/'+proID)
    }catch(err){
        console.log(err);
        res.render('vwError/500');
    }
})

router.get('/:id', async (req, res) => {
    const proID = req.params.id;
    try{
        const itemData = await item.getItem(proID);
        if(req.session.auth){
            if(itemData.bannedUser!==undefined)
            if(itemData.bannedUser.includes(req.session.authUser.username)){
                res.render('vwError/404');
                return;
            }
            req.session.authUser.isOwner = itemData.seller == req.session.authUser.username;
        }
        const mainImage = await item.getMainImageUrl(proID);
        const images = await item.getExtraImageUrls(proID);
        const pastBids = await item.getBid(proID,3);
        let highestBidder={};
        if(pastBids.length>0){
            highestBidder = pastBids[0];
        }
        else{
            highestBidder = {user:"No bids yet",amount:itemData.startingPrice};
        }
        
        res.render('vwProduct/detail.hbs', {
            itemData,
            mainImage,
            images,
            pluralImages: images.length >= 1,
            pastBids,
            highestBidder,
    })}
    catch(err){
        console.log(err);
        res.redirect('/')
    }
})

router.post('/:id', async (req, res) => {
    if(!req.session.auth){
        res.redirect('/account/login');
    }
    else{
        const proID = req.params.id;
        const bidItem = await item.getItem(proID);
        if(bidItem.maximumPrice==req.body.bid){
            mail.sendMail(req.session.authUser.email, "Bought success", "<h1>You bid <br>"+req.protocol + '://' + req.get('host') + req.originalUrl+"</br> on our website</h1> with amount: <h2>"+req.body.bid+"</h2>");
            await item.update(proID, {listing: false});
            await item.bid(proID,req.session.authUser.username,+req.body.bid);
            res.redirect('/');
            return;
        }
        else{
            mail.sendMail(req.session.authUser.email, "Bid success", "<h1>You bid <br>"+req.protocol + '://' + req.get('host') + req.originalUrl+"</br> on our website</h1> with amount: <h2>"+req.body.bid+"</h2>");
            await user.addItemToWatch(req.session.authUser.username,proID);
            await item.bid(proID,req.session.authUser.username,+req.body.bid);
        }
        res.redirect('/item/'+req.params.id)
    }
})

router.get('/:id/kick', async (req, res) => {
    try{
        if (req.query.username!==undefined){
            const kickedUser = await user.getUser(req.query.username);
            await item.banBidder(req.params.id,req.query.username);
            mail.sendMail(kickedUser.email, "Banned", "You have been banned from"+req.protocol + '://' + req.get('host') + req.originalUrl+"</br> on our website!</h1>");
            res.redirect('/item/'+req.params.id);
        }
        else{
            res.render('vwError/404');
        }
    }catch{
        res.render('vwError/500');
    }
})



export default router;