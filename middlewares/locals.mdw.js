import { item } from "../model/model.js"

export default function(app){
    app.use(async (req, res, next) => {
        res.locals.categories=await item.getAllCategories();
        res.locals.items=await item.getAllItems();
        next();
    })
}