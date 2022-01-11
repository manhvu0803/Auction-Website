import accountRoute from '../routes/account.route.js';
import auctionRoute from '../routes/auction.route.js';
import categoriesRoute from '../routes/categories.route.js';
import itemRoute from '../routes/item.route.js';
import { item } from "../model/model.js"

export default function(app){
    app.get('/', async (req,res)=>{
        const data=(await item.getAllItems()).slice(0,5);
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

    app.use((req,res,next)=>{
        res.render('vwError/404');
    });

    app.use((err,req,res,next)=>{
        res.status(500).render('vwError/500');
    });
}