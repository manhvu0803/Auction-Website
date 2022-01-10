import express from "express";
import {user,item} from "../model/model.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.render("categories", { categories: [
        { name: "sub1", subcat: ["1", "2", "32"]},
        { name: "sub2", subcat: ["1", "2", "3"]},
        { name: "sub3", subcat: ["1", "2", "13"]},
    ]})
})

router.get("/:category/:subcategory/:page", (req, res) => {
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

export default router;