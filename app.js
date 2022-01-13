import express from "express";
import morgan from "morgan";
import {user,item} from "./model/model.js";
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

let port = process.env.PORT || 3000;

setInterval(async () => {
    let cart = await item.getAllValidItems();
    cart.forEach(async (auctionItem) => {
        if( auctionItem.expireTime < Date.now())
        {
            let seller = await user.getUser(auctionItem.seller);
            try{
                let lastBidPerson = await user.getUser(item.finalizeBid(auctionItem.id,true));
                mail.sendMail(seller.email, "Auction finish", "<h1>Your item has been sold to: <br>"+lastBidPerson.username+'<br>https://auctioner-hcmus.herokuapp.com/item/'+auctionItem.id+"/h1>");
                mail.sendMail(lastBidPerson.email, "Bought success", "<h1>You bid <br>https://auctioner-hcmus.herokuapp.com/item/"+auctionItem.id+"/h1>");
            }
            catch{
                mail.sendMail(seller.email, "Auction finish", '<h1>No one bought your item: <br>https://auctioner-hcmus.herokuapp.com/item/'+auctionItem.id+"/h1>");
            }
        }
    })
} , 10000);

app.listen(port,function(){
    console.log('Website running at : ' + port);
})

