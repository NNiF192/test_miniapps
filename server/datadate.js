require('dotenv').config();
const { MongoClient } = require('mongoose');

const URL = process.env.MONGO_URL;
const userSchema = new mongoose.Schema({
  name: String,
  age: Number
});

const User = mongoose.model('User', userSchema);
await mongoose.connect(URL);
// await User.create({ name: 'ada', aga:1 });
