import hbs_sections  from "express-handlebars-sections";
import expressHbs from "express-handlebars";
import hbs_helpers from "../hbs_helpers.js";


export default function(app){
    app.engine('hbs', expressHbs.engine({
        defaultLayout: 'main.hbs',
        section: hbs_sections(),
        helpers: hbs_helpers
    }));
    app.set('view engine','hbs');
    app.set('views','./view');
}