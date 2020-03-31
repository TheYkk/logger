const chokidar = require('chokidar');

const fs = require('fs');

const {insertLog} = require('./db');

const os = require('os');

const file_stats = {};

const fileName = (path) => {
  return path.split('\\').pop().split('/').pop().slice(0, -4);
};

const nodeInfo = () => {
  const hostname = fs.readFileSync('/etc/hostname', 'utf8').split(/\n/g)[0];
  return {
    uptime: os.uptime(),
    cpus: os.cpus().length,
    arch: os.arch(),
    platform: os.platform(),
    hostname,
  };
};

const watch = (main_path) => {
  console.log(`Watching ${main_path}`);
  chokidar.watch(main_path).on('all', (event, path, stats) => {
    if (event == 'add') {
      file_stats[path] = stats.size;
    }
    if (event == 'change') {
      fs.readFile(path, (err, data) => {
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

        // console.log(final);
        let logum;
        try {
          logum = JSON.parse(final);
        } catch (_err) {
          logum = final;
        }

        const fileInfo = fileName(path);

        const [podname, namespace, cotainer] = fileInfo.split('_');
        // ? Insert log to mongodb
        console.log(`Pod logs inserted ${podname}`);

        insertLog({log: logum, podname, namespace, cotainer, node: nodeInfo()});

        // ? Change file size
        file_stats[path] = stats.size;
      });
    }
  });
};
module.exports = {watch};
