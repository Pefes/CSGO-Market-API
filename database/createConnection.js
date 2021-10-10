const mongoose = require("mongoose");
const mongoDbUri = process.env.MONGODB_URI || "mongodb://localhost/my_database";

const createConnection = () => {
    mongoose.connect(mongoDbUri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection;
    
    console.log("[createConnection.js] Database connection has been created!");
    db.on("error", console.error.bind(console, "MongoDB connection error: "));

    return db;
}

module.exports = createConnection;