// Copyright 2020 Kaan Karakaya
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
