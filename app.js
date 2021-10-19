require("dotenv").config();

const express = require("express"),
    app = express(),
    cors = require("cors"),
    createConnection = require("./database/createConnection"),
    populateDatabase = require("./database/populateDatabase"),
    authController = require("./controllers/auth.controller"),
    itemsController = require("./controllers/items.controller"),
    utilitiesController = require("./controllers/utilities.controller"),
    runCron = require("./utilities/cron");

// initialization
createConnection();
// populateDatabase();
runCron();


// settings
app.use(express.json());
app.use(cors());

// controllers
app.use("/api", authController);
app.use("/api", itemsController);
app.use("/api", utilitiesController);

// listen
app.listen(process.env.PORT ?? 3000, () => {
    console.log(`[app.js] Server is running on port: ${ process.env.PORT ?? 3000 }`);
});