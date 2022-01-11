import express from "express";
import { item } from "../model/model.js"

const router = express.Router();

router.get('/:id', async (req, res) => {
    const proID = req.params.id;
    try{
    const itemData = await item.getItem(proID);
    console.log(itemData);
    const mainImage = await item.getMainImageUrl(proID);
    console.log(mainImage);
    const images = await item.getExtraImageUrls(proID);
    console.log(images);
    res.render('vwProduct/detail.hbs', {
        itemData,
        mainImage,
        images,
        pluralImages: images.length >= 1
    })}
    catch(err){
        console.log(err);
        res.redirect('/')
    }
})

export default router;