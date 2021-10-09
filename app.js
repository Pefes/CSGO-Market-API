require("dotenv").config();

const express = require("express"),
    app = express(),
    createConnection = require("./database/createConnection"),
    populateDatabase = require("./database/populateDatabase"),
    authController = require("./controllers/auth.controller"),
    itemsController = require("./controllers/items.controller");


// initialization
createConnection();
// populateDatabase();

// settings
app.use(express.json());

// controllers
app.use("/api", authController);
app.use("/api", itemsController);

// listen
app.listen(process.env.PORT ?? 3000, () => {
    console.log(`[app.js] Server is running on port: ${ process.env.PORT ?? 3000 }`);
});