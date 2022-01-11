import accountRoute from '../routes/account.route.js';
import auctionRoute from '../routes/auction.route.js';
import categoriesRoute from '../routes/categories.route.js';
import itemRoute from '../routes/item.route.js';
import { item } from "../model/model.js"

export default function(app){
    app.get('/', async (req,res)=>{
        let data=(await item.getAllItems()).slice(0,5);
        for(let i=0;i<data.length;i++){
            data[i]['mainImage']= await item.getMainImageUrl(data[i].id);
            const highestBidder = await item.getBid(data[i].id,1);
            if(highestBidder.length>0){
                data[i]['price'] = highestBidder[0].amount;
            }
            else{
                data[i]['price'] = data[i].startingPrice;
            }
        }
        console.log(data);
        res.render("home", { items: {
            almostFinish: data,
            popular: data,
            highestBidded: data,
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
        console.log(data);

        res.render("search_result", { itemCount: data.length, items: data });
    })

    app.use((req,res,next)=>{
        res.render('vwError/404');
    });

    app.use((err,req,res,next)=>{
        console.log(err);
        res.status(500).render('vwError/500');
    });
}