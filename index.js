const express = require('express');
const path = require('path');
const flash = require('express-flash');
const cookieParser = require("cookie-parser");
const session = require("express-session");
var methodOverride = require('method-override');
var bodyParser = require('body-parser')
const multer  = require('multer')


const app = express();

require('dotenv').config();
const port = process.env.PORT;

app.use(methodOverride('_method'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

const database = require('./config/database');

const route = require('./routes/client/index.route');
const routeAdmin = require('./routes/admin/index.route');
const systemConfig = require('./config/system')

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

//Flash
app.use(cookieParser('keyboard cat'));
app.use(session({ cookie: { maxAge: 60000 }}));
app.use(flash());

// TinyMCE
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce"))
);

// End TinyMCE

//App local
app.locals.prefixAdmin = systemConfig.prefixAdmin;

app.use(express.static(`${__dirname}/public`));

//Route
route(app);
routeAdmin(app);

database.connect();

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })