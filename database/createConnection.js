const mongoose = require("mongoose");
const mongoDbUrl = "mongodb://localhost/my_database";

const createConnection = () => {
    mongoose.connect(mongoDbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection;
    
    console.log("[createConnection.js] Database connection has been created!");
    db.on("error", console.error.bind(console, "MongoDB connection error: "));

    return db;
}

module.exports = createConnection;