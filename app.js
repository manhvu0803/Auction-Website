import express from "express";
import morgan from "morgan";
import hbs_sections  from "express-handlebars-sections";
import {dirname} from "path";
import { fileURLToPath } from "url";
import expressHbs from "express-handlebars";
import {item} from "./model/model.js";
import accountRoute from './routes/account.route.js';

import hbs_helpers from "./hbs_helpers.js";

const _dirname = dirname(fileURLToPath(import.meta.url));
console.log(_dirname);

const app = express();
app.use(morgan("dev"));
app.use(express.urlencoded({extended:true}));

app.engine('hbs', expressHbs.engine({
    defaultLayout: 'main.hbs',
    section: hbs_sections(),
    helpers: hbs_helpers
}));
app.set('view engine','hbs');
app.set('views','./view');

app.get('/', (req,res)=>{
    res.render('home');
});

app.get('/error',(req,res)=>{
    res.render('vwError/500');
});

app.use('/account',accountRoute);

app.get('/*',(req,res)=>{
    res.render('vwError/404');
});

const port = 3000;

app.listen(port,function(){
    console.log('Website running at localhost:'+port);
})

