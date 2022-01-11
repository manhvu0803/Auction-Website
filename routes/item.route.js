import express from "express";
import { item } from "../model/model.js"

const router = express.Router();

router.get('/:id', async (req, res) => {
    const proID = req.params.id;
    try{
        const itemData = await item.getItem(proID);
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
        await item.bid(proID,req.session.authUser.username,req.body.bid);
        res.redirect('/item/'+req.params.id)
    }
    
})

export default router;