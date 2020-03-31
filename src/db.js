const {MongoClient} = require('mongodb');

let db;

const init = (config) =>
  MongoClient.connect(config.connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then((client) => {
    db = client.db(config.dbName);
    console.log('MongoDB connection success');
  });

const insertLog = (log) => {
  const collection = db.collection('logs');
  return collection.insertOne(log);
};

const getlogs = () => {
  const collection = db.collection('logs');
  return collection.find({}).toArray();
};

module.exports = {init, insertLog, getlogs};
