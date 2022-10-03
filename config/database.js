const { ServerApiVersion } = require('mongodb');
const mongoose = require("mongoose");
require("dotenv").config();


const { MONGO_URL } =process.env;

//here, I am connecting to the database
const connectDB = async () => {

     await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })
    .then(() => {
        console.log(`Successful connection to DB`);
    })
    .catch((error) => {
        console.log(`Fail to connect to database ---- ${error}`);
        process.exit(1);
    });
};

module.exports =  { connectDB };