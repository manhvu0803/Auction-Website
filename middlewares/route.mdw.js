import accountRoute from '../routes/account.route.js';
import auctionRoute from '../routes/auction.route.js';
import categoriesRoute from '../routes/categories.route.js';
import itemRoute from '../routes/item.route.js';
import { item } from "../model/model.js"
import fs from 'fs';

import multer from "multer"

export default function(app){
    app.get('/', async (req,res)=>{
        let data=(await item.getAllItems());
        for(let i=0;i<data.length;i++){
            data[i]['mainImage']= await item.getMainImageUrl(data[i].id);
            const highestBidder = await item.getBid(data[i].id,1);
            if(highestBidder.length>0){
                data[i]['price'] = +highestBidder[0].amount;
            }
            else{
                data[i]['price'] = data[i].startingPrice;
            }
        }

        const almost= data.sort((a,b)=>{
            return a.expireTime-b.expireTime;
        }).slice(0,4);

        const high= data.sort((a,b)=>{
            return b.price-a.price;
        }).slice(0,4);

        res.render("home", { items: {
            almostFinish: almost,
            popular: high,
            highestBidded: high,
        }});
    });
    
    app.use('/account',accountRoute);
    
    app.use('/auction',auctionRoute);
    
    app.use('/categories',categoriesRoute);

    app.use('/item',itemRoute);

    app.get("/search", async (req, res) => {
        
        const idList = await item.getItemByQuery(req.query.query);

        let data = [];
        for(let i = 0; i < idList.length; i++){
            data.push(await item.getItem(idList[i]));
            data[i]['mainImage']= await item.getMainImageUrl(data[i].id);
            const highestBidder = await item.getBid(data[i].id,1);
            if(highestBidder.length>0){
                data[i].price = highestBidder[0].amount;
                data[i].highestBidder= highestBidder[0].user;
            }
            else{
                data[i].price = data[i].startingPrice;
                data[i].highestBidder= "No bids yet";
            }
        }

        if(req.query.sort!==undefined){
            if(req.query.sort=="price"){
                data.sort((a,b)=>{
                    return a.startingPrice-b.startingPrice;
                });
                
            }else if(req.query.sort=="timeLeft"){
                data.sort((a,b)=>{
                    return b.time-a.time});
            }
        }

        res.render("search_result", { itemCount: data.length, items: data });
    })

    app.get("/create", async (req, res) => {
        let data = {};
        data.categories = [];
        const cats = await item.getAllCategories();
        const names = cats.categories;
        names.forEach(name=>{
            data.categories.push({
                name:name,
                subcat:cats[name]
            })
        })
        res.render("vwProduct/create", data);
    })
    const storage = multer.memoryStorage()
    var multiHandler = multer({ dest: "uploads/" ,storage: storage})
    
    app.post("/create/item", multiHandler.single("mainImage"), async (req, res) => {
        let data=req.body;
        data.startingPrice=+data.startingPrice;
        data.step=+data.step;
        data.maximumPrice=+data.maximumPrice;
        data.postedTime=new Date();
        data.expireTime=new Date(data.expireTime);
        data.mainImage=req.file.buffer;
        data.autoExtend=false;
        data.seller=req.session.authUser.username;
        await item.addItem(data);
        res.send("OK");
    })
    app.use((req,res,next)=>{
        res.render('vwError/404');
    });

    app.use((err,req,res,next)=>{
        console.log(err);
        res.status(500).render('vwError/500');
    });
}