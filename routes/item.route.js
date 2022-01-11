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
        let highestBidder=-1;
        if(pastBids.length>0){
            highestBidder = item[0];
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
    const proID = req.params.id;
    const itemData = await item.getItem(proID);
    res.redirect('/item/'+req.params.id)
})

export default router;