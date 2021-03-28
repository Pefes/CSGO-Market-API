const express = require("express");
const app = express();
const mongo = require("mongodb");


app.get("/home", (req, res) => {
    res.send("XXXX");
});

app.listen(3000, () => {
    console.log("[app.js] Server is running on port: 3000");
});