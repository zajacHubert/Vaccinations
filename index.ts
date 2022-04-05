import * as express from 'express';
import 'express-async-errors';
import * as methodOverride from "method-override";
import {static as eStatic, urlencoded} from "express";
import {engine} from "express-handlebars";
import {handleError} from "./utils/error";
import {homeRouter} from "./routers/home";
import {patientRouter} from "./routers/patient";
import {vaccinationRouter} from "./routers/vaccination";
import './utils/db';
import {handlebarsHelpers} from "./utils/handlebars-helpers";


const app = express();

app.use(methodOverride('_method'));
app.use(urlencoded({
    extended: true,
}));
app.use(eStatic('public'));
app.engine('.hbs', engine({
    extname: '.hbs',
    helpers: handlebarsHelpers,
}));
app.set('view engine', '.hbs');

app.use('/', homeRouter);
app.use('/patient', patientRouter);
app.use('/vaccination', vaccinationRouter);

app.use(handleError);


app.listen(3000, 'localhost', () => {
    console.log('server is listening');
});
