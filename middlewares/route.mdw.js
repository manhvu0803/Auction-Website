import accountRoute from '../routes/account.route.js';
import categoriesRoute from '../routes/categories.route.js';
import itemRoute from '../routes/item.route.js';
import { item } from "../model/model.js"

import multer from "multer"

export default function(app){
    app.get('/', async (req,res)=>{

        let almost= await item.getItemsByOrder("expireTime",'asc');

        almost.sort((a,b)=>{
            return b.expireTime-a.expireTime;
        })

        for(let i=0;i<almost.length;i++){
            almost[i]['mainImage']= await item.getMainImageUrl(almost[i].id);
        }

        let votes= await item.getItemsByOrder("bidCount",'desc');

        for(let i=0;i<votes.length;i++){
            votes[i]['mainImage']= await item.getMainImageUrl(votes[i].id);
        }

        let high= await item.getItemsByOrder("currentPrice",'desc')

        for(let i=0;i<high.length;i++){
            high[i]['mainImage']= await item.getMainImageUrl(high[i].id);
        }

        res.render("home", { items: {
            almostFinish: almost,
            popular: votes,
            highestBidded: high,
        }});
    });
    
    app.use('/account',accountRoute);
        
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
        if(req.session.auth){
            if(req.session.authUser.isSeller)
            {
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
            }else{
                res.redirect("/");
            }
        }
        else{
            res.redirect("/");
        }
        
    })

    const storage = multer.memoryStorage()
    var multiHandler = multer({ dest: "uploads/" ,storage: storage})
    
    app.post("/create/item", multiHandler.array("images",10), async (req, res) => {
        let data=req.body;
        data.startingPrice=+data.startingPrice;
        data.step=+data.step;
        data.maximumPrice=+data.maximumPrice;
        data.postedTime=new Date();
        data.expireTime=new Date(data.expireTime);
        data.mainImage=req.files[0].buffer;
        data.images=[];
        for(let i=1;i<req.files.length;i++){
            data.images.push(req.files[i].buffer);
        }
        data.autoExtend=false;
        data.seller=req.session.authUser.username;
        await item.addItem(data);
        res.redirect("/");
    })
    app.use((req,res,next)=>{
        res.render('vwError/404');
    });

    app.use((err,req,res,next)=>{
        console.log(err);
        res.status(500).render('vwError/500');
    });
}