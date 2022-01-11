import express from "express";
import { item } from "../model/model.js"

const router = express.Router();

router.get('/:id', async (req, res) => {
    const proID = req.params.id;
    try{
        const itemData = await item.getItem(proID);
        const mainImage = await item.getMainImageUrl(proID);
        const images = await item.getExtraImageUrls(proID);
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

router.post('/:id', async (req, res) => {
    const itemData = await item.getItem(proID);
    res.redirect('/item/'+req.params.id)
})

export default router;