import express from "express";
import morgan from "morgan";
import {dirname} from "path";
import { fileURLToPath } from "url";
import {item} from "./model/model.js";
import accountRoute from './routes/account.route.js';
import auctionRoute from './routes/auction.route.js';
import mailing from "./mail/mail.js";
import session from "express-session";
import viewMdw from "./middlewares/view.mdw.js";

const mail = new mailing();

const _dirname = dirname(fileURLToPath(import.meta.url));
console.log(_dirname);

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

viewMdw(app);

app.get('/', (req,res)=>{
    res.render('home');
});

app.get('/error',(req,res)=>{
    res.render('vwError/500');
});

app.use('/account',accountRoute);

app.use('/auction',auctionRoute);

app.get('/*',(req,res)=>{
    res.render('vwError/404');
});

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

