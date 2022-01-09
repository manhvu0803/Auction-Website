import express from "express";
import morgan from "morgan";
import hbs_sections  from "express-handlebars-sections";
import {dirname} from "path";
import { fileURLToPath } from "url";
import { engine } from "express-handlebars";
import {user, item} from "./model/model.js";

const _dirname = dirname(fileURLToPath(import.meta.url));
console.log(_dirname);

const app = express();
app.use(morgan("dev"));

app.engine('hbs',engine({
    defaultLayout: 'main.hbs',
    section: hbs_sections(),
}));
app.set('view engine','hbs');
app.set('views','./view');

app.get('/', (req,res)=>{
    res.render('home');
});

app.get('/login',(req,res)=>{
    res.render('vwAccount/Login');
});

app.get('/signup',(req,res)=>{
    res.render('vwAccount/Signup');
});

app.post('/signup', async (req,res)=>{
    await user.newUser(req.body.username, req.body.password,req.body.email, req.body.type);
    res.render('vwAccount/Signup');
});

app.get('/error',(req,res)=>{
    res.render('vwError/500');
});

app.get('/*',(req,res)=>{
    res.render('vwError/404');
});

const port = 3000;

(async()=>{
    let temp =await item.getAllCategories();
    console.log(1);
    console.log(temp[0]);
})

app.listen(port,function(){
    console.log('Website running at localhost:'+port);
})

