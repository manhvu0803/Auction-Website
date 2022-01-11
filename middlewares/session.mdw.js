import session from "express-session";

export default function(app){
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'fF(.qLPzV"rUMhZjN^cV2"KKb*HcoU*BlCwj{Fc)<)+!6CL,y$qBoQ#h+>#p`7=',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    //   secure: true
    }
}))
}