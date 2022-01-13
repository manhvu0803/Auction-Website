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
            res.render('vwAdmin/user_list')
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

export default router;