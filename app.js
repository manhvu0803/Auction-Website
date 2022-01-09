import express from "express";
import morgan from "morgan";
import {dirname} from "path";
import { fileURLToPath } from "url";
import { engine } from "express-handlebars";

const _dirname = dirname(fileURLToPath(import.meta.url));
console.log(_dirname);

const app = express();
app.use(morgan("dev"));

app.engine('hbs',engine({
    defaultLayout: 'main.hbs',
}));
app.set('view engine','hbs');
app.set('views','./view');

app.get('/',(req,res)=>{
    res.render('home');
});

app.get('/login',(req,res)=>{
    res.render('vwAccount/Login');
});

app.get('/signup',(req,res)=>{
    res.render('vwAccount/Signup');
});

app.get('/error',(req,res)=>{
    res.render('vwError/500');
});

app.get('/*',(req,res)=>{
    res.render('vwError/404');
});

const port = 3000;


app.listen(port,function(){
    console.log('Hi, I am listening on port '+port);
})