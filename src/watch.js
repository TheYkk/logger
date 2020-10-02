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

const chokidar = require('chokidar');

const fs = require('fs');

// ? Env helper
const env = require('./getenv');

const {insertLog, loadPaths, savePaths} = require('./db');
const {parse} = require('./parser');

const os = require('os');

let file_stats = {};

const fileName = (path) => {
  return path.split('\\').pop().split('/').pop().slice(0, -4);
};

const nodeInfo = () => {
  const hostname = env('KUBE_HOSTNAME', '');
  return {
    uptime: os.uptime(),
    cpus: os.cpus().length,
    arch: os.arch(),
    platform: os.platform(),
    hostname,
  };
};

const watch = (main_path) => {
  // ? Load path sizes from mongo
  loadPaths().then((p) => {
    console.log(p);
    if (p) {
      file_stats = p;
    }
  });

  console.log(`Watching ${main_path}`);
  chokidar.watch(main_path).on('all', (event, path, stats) => {
    const file = path.split('.').slice(0, -1).join('.');
    if (file.indexOf('theykk-logger') >= 0) return;

    if (event == 'add') {
      console.log(`Added path ${file}`);

      //* If file new save to object and mongodb
      if (!file_stats[file]) {
        file_stats[file] = stats.size;
        savePaths(file_stats);
      }
    }
    if (event == 'change') {
      fs.readFile(path, (err, data) => {
        if (err) throw err;

        // ? Get file changed part
        const changed_line = data
          .slice(file_stats[file], stats.size)
          .toString();

        // ? Parse new lines
        const lines = changed_line.split('\n');

        lines.forEach((line) => {
          if (line.length < 10) return;
          //* Example log: 2020-09-08T11:34:47.881738667+03:00 stdout F [2020/09/08 08:34:47] [logger.go:490] mapping path "/dev/null" => file system "/dev/null"
          const split_file = line.split(' ');
          if (new Date(split_file[0]).toISOString()) {
            // ? Remove timestampts etc.
            const getjson = split_file.slice(3, split_file.length).join(' ');

            const logum = parse(getjson);
            const fileInfo = fileName(path);

            const [pod, namespace, containerRaw] = fileInfo.split('_');
            const conta = containerRaw.split('-');
            // ? Insert log to mongodb
            console.log(`Pod logs inserted ${pod}`);

            insertLog({
              log: logum,
              pod,
              namespace,
              container: conta.slice(0, conta.length - 1).join('-'),
              containerId: conta.slice(conta.length - 1)[0].substring(0, 12),
              node: nodeInfo(),
              time: new Date().toISOString(),
              logTime: new Date(split_file[0]).toISOString(),
              writer: split_file[1],
              tags: 'k8s',
            });
          }
        });

        // ? Change file size
        file_stats[file] = stats.size;
        savePaths(file_stats);
      });
    }
  });
};
module.exports = {watch};
