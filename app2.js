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

    res.locals.account = { username: "jason"} ;

    res.render("home", { items: {
        almostFinish: data,
        popular: data,
        highestBidded: data,
    }});
})

app.get("/categories", (req, res) => {
    res.render("categories", { categories: [
        { name: "sub1", subcat: ["1", "2", "32"]},
        { name: "sub2", subcat: ["1", "2", "3"]},
        { name: "sub3", subcat: ["1", "2", "13"]},
    ]})
})

app.get("/categories/:category/:subcategory/:page", (req, res) => {
    let current = parseInt(req.params.page);
    res.render("categories", {
        pageData: {
            category: req.params.category,
            subcategory: req.params.subcategory,
            current: current,
            next: current + 1,
            prev: Math.max(1, current - 1),
        },
        categories: [
            { name: "sub1", subcat: ["1", "2", "32"]},
            { name: "sub2", subcat: ["1", "2", "3"]},
            { name: "sub3", subcat: ["1", "2", "13"]},
        ],
        items: [ 
            {
                id: "212da22s2vdvc",
                name: "ball",
                expireTime: Date.now() + 1000000,
                description: "asdasdnkaskldhasjkdhasjkhdasjk",
                price: "20000"
            },  
            {
                id: "212da2s2vdvc",
                name: "baall",
                expireTime: Date.now() + 1000000,
                description: "1 2 3 4",
                price: "200200"
            },  
            {
                id: "212das2vdvc",
                name: "balsl",
                expireTime: Date.now() + 1000000,
                description: "123 12312 23 12312 <br> 23423423 423 <br> asd",
                price: "202000"
            },
            {
                id: "cac",
                name: "d",
                expireTime: Date.now() + 1000000,
                description: "123 12312 23 12312 <br> 23423423 423 <br> asd",
                price: "202000"
            },
        ]
    })
})

app.get("/account/login", (req, res) => {
	res.render("vwAccount/login");
})

app.get("/account/signup", (req, res) => {
	res.render("vwAccount/signup");
})

app.listen(3000, () => console.log("listening"));
