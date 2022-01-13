import express from "express";
import {user,item} from "../model/model.js";
import NodeCache from "node-cache";

const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

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


router.get('/delete/:category', async (req, res) => {
    if(req.session.auth){
        if(req.session.authUser.isAdmin)
        {
            await item.deleteCategory(req.params.category)
            res.redirect('/admin/managecategory')
        }
        else
            res.render('vwError/404')
    }
    else{
        res.render('vwError/404')
    }
});
router.get('/delete/:category/:subcategory', async (req, res) => {
    if(req.session.auth){
        if(req.session.authUser.isAdmin)
        {
            await item.deleteCategory(req.params.category,req.params.subcategory)
            res.redirect('/admin/managecategory')
        }
        else
            res.render('vwError/404')
    }
    else{
        res.render('vwError/404')
    }
});

router.post('/add', async (req, res) => {
    if(req.session.auth){
        if(req.session.authUser.isAdmin)
        {
            console.log(req.body);
            await item.addCategory(req.body.category)
            res.redirect('/admin/managecategory')
        }
        else
            res.render('vwError/404')
    }
    else{
        res.render('vwError/404')
    }
});
router.post('/add/:category/', async (req, res) => {
    if(req.session.auth){
        if(req.session.authUser.isAdmin)
        {
            await item.addCategory(req.params.category,[req.body.subcategory]);
            res.redirect('/admin/managecategory')
        }
        else
            res.render('vwError/404')
    }
    else{
        res.render('vwError/404')
    }
});

router.get("/:category/:subcategory/:page", async (req, res) => {
    let current = parseInt(req.params.page);
    if(current<1)
    {
        res.redirect(":/category/:subcategory/1");
        return
    }
    let itemDatas
    let start=false
    if(current==1)
    {
        itemDatas=await item.getItemsByCategory(req.params.category,req.params.subcategory);
        start=true
    }else{
        itemDatas=await item.getItemsByCategory(req.params.category,req.params.subcategory,myCache.get('tail'));
        myCache.set('prev'+current,itemDatas[0],10000)
    }
    const end = itemDatas.length<5;
    if(!end){
        myCache.set('tail',itemDatas[4],10000)
        itemDatas.pop()
    }
    
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
            start: start,
            end: end
        },
        categories: data,
        items: itemDatas,
    })
})

export default router;