import express from "express";
import {user,item} from "../model/model.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const cats = await item.getAllCategories();
    const names = cats.categories;

    let data=[];
    names.forEach(name=>{
        data.push({
            name:name,
            subcat:cats[name]
        })
    })

    res.render("categories", { categories: data})
})

router.get("/:category/:subcategory/:page", async (req, res) => {
    let current = parseInt(req.params.page);
    let itemDatas=await item.getItemsByCategory(req.params.category,req.params.subcategory);
    
    itemDatas.forEach(async (itemData)=>{
        itemData.mainImage= await item.getMainImageUrl(itemData.id);
        const highestBidder = await item.getBid(itemData.id,1);
        if(highestBidder.length>0){
            console.log(1);
            itemData.price = highestBidder[0].amount;
        }
        else{
            itemData.price = itemData.startingPrice;
        }
    })
    const cats = await item.getAllCategories();
    const names = cats.categories;

    let data=[];
    names.forEach(name=>{
        data.push({
            name:name,
            subcat:cats[name]
        })
    })
    res.render("categories", {
        pageData: {
            category: req.params.category,
            subcategory: req.params.subcategory,
            current: current,
            next: current + 1,
            prev: Math.max(1, current - 1),
        },
        categories: data,
        items: itemDatas
    })
})

export default router;