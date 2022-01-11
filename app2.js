import express from "express"
import expressHbs from "express-handlebars"

const app = express();

app.use(express.urlencoded({ extended: true }));

const hbs = expressHbs.create({
    defaultLayout: 'main.hbs',
    extname: "hbs"
})

app.engine('hbs', hbs.engine);

app.set('view engine','.hbs');
app.set('views','./view');

app.get("/", (req, res) => {
    let data = [
        {
            id: "212das2vdvc",
            name: "ball",
            expireTime: 1641793217298 + 1000000,
            description: "asdasdnkaskldhasjkdhasjkhdasjk",
            price: "20000"
        },  
        {
            id: "212das2vdvc",
            name: "baall",
            description: "1 2 3 4",
            price: "200200"
        },  
        {
            id: "212das2vdvc",
            name: "balsl",
            description: "123 12312 23 12312 <br> 23423423 423 <br> asd",
            price: "202000"
        },
        {
            id: "212das2vdvc",
            name: "b2alsl",
            description: "123 12312 23 12312 <br> 23423423 423 <br> asd",
            price: "202000"
        },
    ]

    res.locals.auth = true;

    res.render("home", { items: {
        almostFinish: data,
        popular: data,
        highestBidded: data,
    }});
})

app.get("/search", (req, res) => {
    console.log(req.query);

    let data = [
        {
            id: "212das2vdvc",
            name: "ball",
            expireTime: 1641793217298 + 1000000,
            description: "asdasdnkaskldhasjkdhasjkhdasjk",
            price: "20000"
        },  
        {
            id: "212das2vdvc",
            name: "baall",
            description: "1 2 3 4",
            price: "200200"
        },  
        {
            id: "212das2vdvc",
            name: "balsl",
            description: "123 12312 23 12312 <br> 23423423 423 <br> asd",
            price: "202000"
        },
        {
            id: "212das2vdvc",
            name: "b2alsl",
            description: "123 12312 23 12312 <br> 23423423 423 <br> asd",
            price: "202000"
        },
    ]

    res.render("search_result", { itemCount: data.length, items: data });
})

app.get("/account/login", (req, res) => {
	res.render("vwAccount/login");
})

app.get("/account/signup", (req, res) => {
	res.render("vwAccount/signup");
})

app.listen(3000, () => console.log("listening"));
