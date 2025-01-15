// add atlas req along with url

const mongoose = require('mongoose');
// const db = process.env.db;
const db = "mongodb+srv://flyingfortress289:flyingfortress289@cluster0.zlhd1zd.mongodb.net/?retryWrites=true&w=majority"; 
// const db = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.7";

mongoose.connect(db, {
    useNewUrlParser: true,
    // useCreateIndex:true,
    useUnifiedTopology: true
    // useFindAndModify:false
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });