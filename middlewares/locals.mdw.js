import { item } from "../model/model.js"

export default function(app){

    app.use(async (req,res,next)=>{

        if(typeof (req.session.auth)==='undefined'){
            req.session.auth=false;
        }
        else{
            res.locals.auth=req.session.auth;
            res.locals.authUser=req.session.authUser;
            if(req.session.auth){
            res.locals.authUser.downvoteCount=+req.session.authUser.totalVote-+req.session.authUser.upvoteCount;
            }
        }
        next();
    } )
}