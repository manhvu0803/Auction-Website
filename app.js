import express from "express";
import morgan from "morgan";
import {item} from "./model/model.js";
import mailing from "./mail/mail.js";
import session from "express-session";
import viewMdw from "./middlewares/view.mdw.js";
import localsMdw from "./middlewares/locals.mdw.js";
import routeMdw from "./middlewares/route.mdw.js";
import asyncError from "express-async-errors";

const mail = new mailing();


const app = express();
app.use(morgan("dev"));
app.use(express.urlencoded({extended:true}));

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'fF(.qLPzV"rUMhZjN^cV2"KKb*HcoU*BlCwj{Fc)<)+!6CL,y$qBoQ#h+>#p`7=',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    //   secure: true
    }
}))

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

