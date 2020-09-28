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

// eslint-disable-next-line no-unused-vars
const {MongoClient, Db} = require('mongodb');

/**
 * @type Db
 */
let db;

/**
 * Init MongoDB connection
 * @param config
 * @returns {PromiseLike<void> | Promise<void>}
 */
const init = (config) => {
  return MongoClient.connect(config.connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then((client) => {
    db = client.db(config.dbName);
    console.log('MongoDB connection success');
  });
};
/**
 * Insert log to mongo
 * @param log
 * @returns {Promise}
 */
const insertLog = (log) => {
  const collection = db.collection('logs');
  return collection.insertOne(log);
};

/**
 * Save path size to mongo
 * @param paths
 */
const savePaths = (paths) => {
  const collection = db.collection('paths');
  collection
    .updateOne(
      {
        cfg: true,
      },
      {$set: {...paths, cfg: true}},
      {upsert: true},
    )
    .then(() => {
      console.log('Path size updated');
    });
};

/**
 * Load path size
 * @returns {Promise<void>}
 */
const loadPaths = () => {
  const collection = db.collection('paths');
  return collection.findOne({
    cfg: true,
  });
};

module.exports = {init, insertLog, savePaths, loadPaths};
