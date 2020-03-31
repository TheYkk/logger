const chokidar = require('chokidar');
const fs = require('fs');
const {insertLog} = require('./db');

const file_stats = {};

const watch = (main_path) => {
  chokidar.watch(main_path).on('all', (event, path, stats) => {
    if (event == 'add') {
      file_stats[path] = stats.size;
    }
    if (event == 'change') {
      fs.readFile(path, function (err, data) {
        if (err) throw err;

        // ? Get file changed part
        const changed_line = data
          .slice(file_stats[path], stats.size)
          .toString();

        const split_file = changed_line.split(' ');

        // ? Remove timestampts etc.
        const getjson = split_file.slice(3, split_file.length).join(' ');

        // ? Remove new line
        const final = getjson.replace(/(\r\n|\n|\r)/gm, '');

        console.log(final);

        // ? Insert log to mongodb
        insertLog(final);

        // ? Change file size
        file_stats[path] = stats.size;
      });
    }
  });
};
module.exports = {watch};
