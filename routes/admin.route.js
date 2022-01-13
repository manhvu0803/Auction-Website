import express from "express";
import {user,item} from "../model/model.js";


const router = express.Router();

router.get('/', async (req, res) => {
    if(req.session.auth){
        if(req.session.authUser.isAdmin)
            res.redirect('/admin/manageuser')
        else
            res.render('vwError/404')
    }
    else{
        res.render('vwError/404')
    }
})

router.get('/manageuser', async (req, res) => {
    if(req.session.auth){
        if(req.session.authUser.isAdmin)
        {   
            let users= await user.getAllUser()
            console.log(user)
            for(let i=0;i<users.length;i++){
                users[i].upvoteRatio=users[i].totalVote==0?100:Math.floor(+users[i].upvoteCount/+users[i].totalVote)*100
            }
            res.render('vwAdmin/user_list',{users:users})
        }
        else
            res.render('vwError/404')
    }
    else{
        res.render('vwError/404')
    }
})

router.get('/managecategory', async (req, res) => {
    if(req.session.auth){
        if(req.session.authUser.isAdmin)
        {
            const cats = await item.getAllCategories();
            const names = cats.categories;
            let data=[];
            names.forEach(name=>{
                data.push({
                    name:name,
                    subcat:cats[name]
                })
            })
            res.render('vwAdmin/category_edit',{categories:data})
        }
        else
            res.render('vwError/404')
    }
    else{
        res.render('vwError/404')
    }
})

router.post('/categories/edit/:categories', async (req, res) => {
    if(req.session.auth){
        if(req.session.authUser.isAdmin)
        {
            const oldCat = req.params.categories;
            const cats = await item.getAllCategories();
            const subcat = cats[oldCat];
            await item.deleteCategory(oldCat);
            await item.addCategory(req.body.category,subcat);

            const items=await item.getAllItems();
            for(let i=0;i<items.length;i++){
                if(items[i].category==oldCat)
                    await item.update(items[i].id,{category:req.body.category});
            }

            res.redirect('/admin/managecategory')
        }
        else
            res.render('vwError/404')
    }
    else{
        res.render('vwError/404')
    }
})

router.post('/categories/edit/:categories/:subcategories', async (req, res) => {
    if(req.session.auth){
        if(req.session.authUser.isAdmin)
        {
            const cat=req.params.categories
            const oldSubCat = req.params.subcategories;
            await item.deleteCategory(cat,oldSubCat);
            await item.addCategory(cat,req.body.subcategory);
            const items=await item.getAllItems();
            for(let i=0;i<items.length;i++){
                if(items[i].subcategory==oldSubCat)
                await item.update(items[i].id,{subcategory:req.body.subcategory});
            }
            res.redirect('/admin/managecategory')
        }
        else
            res.render('vwError/404')
    }
    else{
        res.render('vwError/404')
    }
})
export default router;