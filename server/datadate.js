require('dotenv').config();
const { MongoClient } = require('mongodb');

const URL = process.env.MONGO_URL;
const client = new MongoClient(URL);
