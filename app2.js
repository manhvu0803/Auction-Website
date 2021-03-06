import express from "express"
import expressHbs from "express-handlebars"
import multer from "multer"

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

app.get("/create", (req, res) => {
    let data = {};
    data.categories = [
        {
            name: "toys",
            subcat: ["sport", "kid", "wood"]
        },
        {
            name: "elec",
            subcat: ["phone", "tablet", "smart"]
        },
        {
            name: "ball",
            subcat: ["vas", "kibased", "ded"]
        }
    ]
    res.render("vwProduct/create", data);
})

var multiHandler = multer({ dest: "uploads/" });
app.post("/item/create", multiHandler.single("img"), (req, res) => {
    console.log(req.body);
    res.send("OK");
})

app.get("/admin/users", (req, res) => {
    res.redirect("/admin/users/1")
})

app.get("/admin/users/:page", (req, res) => {
    let current = parseInt(req.params.page);
    let data = [
        {
            username: "mock",
            type: "bidder",
            wantUpgrade: true,
            upvoteRatio: 90
        },
        {
            username: "cas",
            type: "seller",
            wantUpgrade: false,
            upvoteRatio: 50
        },
        {
            username: "coc",
            type: "admin",
            wantUpgrade: false,
            upvoteRatio: 90.25
        },
        {
            username: "try",
            type: "bidder",
            wantUpgrade: false,
            upvoteRatio: 90
        },
    ]
    
    res.render("user_list", { 
        users: data ,
        pageData: {
            prev: Math.max(1, current - 1),
            next: current + 1
        }
    });
})

app.listen(3000, () => console.log("listening"));
