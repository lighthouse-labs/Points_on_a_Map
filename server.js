
//the backend server

// load .env data into process.env
require("dotenv").config();
const path = require("path");

// Web server config
const PORT = process.env.PORT || 8080;
// const sassMiddleware = require("./lib/sass-middleware");
const sassMiddleware = require("node-sass-middleware");
const express = require("express");
const app = express();
const morgan = require("morgan");

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  sassMiddleware({
    /* Options */
    src: __dirname,
    dest: path.join(__dirname, "public"),
    debug: false,
    outputStyle: "compressed",
    prefix: "/styles", // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
  })
);

//Old Dependency with new one above
// app.use(
//   "/styles",
//   sassMiddleware({
//     source: __dirname + "/styles",
//     destination: __dirname + "/public/styles",
//     isSass: false, // false => scss, true => sass
//     debug: false
//   })
// );

app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/usersRoutes");
const mapsRoutes = require("./routes/mapsRoutes");
const mapspointsRoutes = require("./routes/mappointsRoutes");


// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/users", usersRoutes(db));
app.use("/maps", mapsRoutes(db));
app.use("/mappoints", mapspointsRoutes(db));
// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
