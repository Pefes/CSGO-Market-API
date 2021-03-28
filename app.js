const express = require("express");
const createConnection = require("./database/createConnection");
const populateDatabase = require("./database/populateDatabase");
const { item } = require("./database/defineSchemas");
const getSuccessResponse = require("./utilities/getSuccessResponse");
const getErrorResponse = require("./utilities/getErrorResponse");
const app = express();


createConnection();
//populateDatabase();

app.get("/getAllMarketItems", (req, res) => {
    item.find({}).limit(50)
    .then(items => {
        res.json(items);
    })
    .catch(error => {
        res.send("ERROR XD");
    })
});

app.listen(3000, () => {
    console.log("[app.js] Server is running on port: 3000");
});