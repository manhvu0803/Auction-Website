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
    defaultLayout: 'main',
}));
app.set('view engine','hbs');
app.set('views',_dirname+'/view');

app.get('/',function(req,res){
    res.render('home');
});

app.get('/login',function(req,res){
    res.render('vwAccount/Login');
});

const port = 3000;


app.listen(port,function(){
    console.log('Hi, I am listening on port '+port);
})