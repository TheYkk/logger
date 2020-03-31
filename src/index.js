// ? Db coonector
const {init} = require('./db');
const {watch} = require('./watch');

// ? Env helper
const env = require('./getenv');

init({
  connectionUrl: env('MONGO_URI', ''),
  dbName: env('MONGO_DB', 'logger'),
}).then(() => {
  watch(env('LOG_PATH', '/var/lib/containers'));
});
