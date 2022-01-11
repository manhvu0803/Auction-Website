import express from "express";
import morgan from "morgan";
import {item} from "./model/model.js";
import mailing from "./mail/mail.js";
import viewMdw from "./middlewares/view.mdw.js";
import sessionMdw from "./middlewares/session.mdw.js";
import localsMdw from "./middlewares/locals.mdw.js";
import routeMdw from "./middlewares/route.mdw.js";
import asyncError from "express-async-errors";

const mail = new mailing();


const app = express();
app.use(morgan("dev"));
app.use(express.urlencoded({extended:true}));

sessionMdw(app);
localsMdw(app);
viewMdw(app);
routeMdw(app);


const port = 3000;

// Delete item
// setInterval(async () => {
//     let cart = await item.getAllItems();
//     cart.forEach(async (auctionItem) => {
//         if( auctionItem.expireTime < Date.now())
//         {
//             console.log(auctionItem);
//             await item.deleteItem(auctionItem.id);
//         }
//     })
// } , 5000);

app.listen(port,function(){
    console.log('Website running at localhost:'+port);
})

