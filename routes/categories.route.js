import express from "express";
import {user,item} from "../model/model.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const cats = await item.getAllCategories();
    const names = cats.categories;

    let votes= await item.getItemsByOrder("bidCount",'desc',4);

    for(let i=0;i<votes.length;i++){
        votes[i]['mainImage']= await item.getMainImageUrl(votes[i].id);
    }

    let data=[];
    names.forEach(name=>{
        data.push({
            name:name,
            subcat:cats[name]
        })
    })

    res.render("categories", { categories: data, items: votes, home:true})
})

router.get("/:category/:subcategory/:page", async (req, res) => {
    let current = parseInt(req.params.page);
    let itemDatas=await item.getItemsByCategory(req.params.category,req.params.subcategory);
    
    for(let i=0;i<itemDatas.length;i++){
        itemDatas[i].mainImage= await item.getMainImageUrl(itemDatas[i].id);
    }
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
        items: itemDatas,
        home: itemDatas.length>0
    })
})

export default router;