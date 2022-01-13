import express from "express";
import moment from "moment";
import { item } from "../model/model.js"

const router = express.Router();

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
        await item.bid(proID,req.session.authUser.username,+req.body.bid);
        res.redirect('/item/'+req.params.id)
    }
    
})

router.get('/:id/kick', async (req, res) => {
    if (req.query.username!==undefined){
        await item.banBidder(req.params.id,req.query.username);
        res.redirect('/item/'+req.params.id);
    }
    else{
        res.render('vwError/404');
    }
})

export default router;