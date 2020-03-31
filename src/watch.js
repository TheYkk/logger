/* eslint-disable no-useless-escape */
const chokidar = require('chokidar');

const fs = require('fs');

const {insertLog} = require('./db');

const os = require('os');

const file_stats = {};

// ? Regex for applications ref: https://github.com/fluent/fluent-bit/blob/master/conf/parsers.conf
const regexes = [
  /^(?<host>[^ ]*) - (?<user>[^ ]*) \[(?<time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>[^\"]*?)(?: +\S*)?)?" (?<code>[^ ]*) (?<size>[^ ]*) "(?<referer>[^\"]*)" "(?<agent>[^\"]*)" (?<request_length>[^ ]*) (?<request_time>[^ ]*) \[(?<proxy_upstream_name>[^ ]*)\] (\[(?<proxy_alternative_upstream_name>[^ ]*)\] )?(?<upstream_addr>[^ ]*) (?<upstream_response_length>[^ ]*) (?<upstream_response_time>[^ ]*) (?<upstream_status>[^ ]*) (?<reg_id>[^ ]*).*$/,
  /^(?<type>\S+) \[(?<time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>(?:[^\"]|\\.)*?)(?: +\S*)?) (?<protocol>\S+)?" (?<response_code>\S+) (?<response_flags>\S+) (?<bytes_received>\S+) (?<bytes_sent>\S+) (?<duration>\S+) (?<x_envoy_upstream_service_time>\S+) "(?<x_forwarded_for>[^\"]*)" "(?<user_agent>[^\"]*)" "(?<x_request_id>[^\"]*)" "(?<authority>[^\"]*)" "(?<upstream_host>[^\"]*)"/,
  /^\[(?<start_time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>[^\"]*?)(?: +\S*)?)? (?<protocol>\S+)" (?<code>[^ ]*) (?<response_flags>[^ ]*) (?<bytes_received>[^ ]*) (?<bytes_sent>[^ ]*) (?<duration>[^ ]*) (?<x_envoy_upstream_service_time>[^ ]*) "(?<x_forwarded_for>[^ ]*)" "(?<user_agent>[^\"]*)" "(?<request_id>[^\"]*)" "(?<authority>[^ ]*)" "(?<upstream_host>[^ ]*)" /,
  /^.*((?<req_method>GET|POST|PUT|DELETE|CONNECT|OPTIONS|HEAD[^ ]\w+)\s*(?<req_path>[^ ][-._?=%&\/[:alnum:]]*)\s*(?<req_protocol>[^ ][.\/\dHTFSP]+){0,1})(['"\s]*){0,1}((\s*status:\s*(?<req_status>[^ ]\d+)){0,1}(\s*len:\ (?<req_len>[^ ]\d+)){0,1}(\s*time:\s*(?<req_log_time>[^ ][.\d]+)){0,1}(\s*microversion:\s*(?<req_mver>[^ ][.\d]+)){0,1}){0,1}$/,
  /^(?<log_time>[^ ][-.\d\+:T]+[ ]*[.:\d]*)\s+(?<pid>[^ ]\d+)\s+(?<severity>[^ ][.-_\w]+)\s+(?<component>[^ ][.-_\w]+)(\s+\[(-|(?<req_id>[^ ][-\w]*) (?<req_user>[^ ][-\w]*) (?<req_project>[^ ][-\w]*) (?<req_domain>[^ ][-\w]*) (?<req_user_domain>[^ ][-\w]*) (?<req_project_domain>[^ ][-\w]*))\]){1}\s+(?<message>.*)$/,
  /^(?<remote>[^ ]*) (?<host>[^ ]*) (?<user>[^ ]*) \[(?<time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>[^\"]*?)(?: +\S*)?)?" (?<code>[^ ]*) (?<size>[^ ]*)(?: "(?<referer>[^\"]*)" "(?<agent>[^\"]*)")/,
  /^(?<host>[^ ]*) [^ ]* (?<user>[^ ]*) \[(?<time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>[^\"]*?)(?: +\S*)?)?" (?<code>[^ ]*) (?<size>[^ ]*)(?: "(?<referer>[^\"]*)" "(?<agent>[^\"]*)")?$/,
  /(?<tag>[^.]+)?\.?(?<pod_name>[a-z0-9](?:[-a-z0-9]*[a-z0-9])?(?:\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*)_(?<namespace_name>[^_]+)_(?<container_name>.+)-(?<docker_id>[a-z0-9]{64})\.log$/,
  /^(?<host>[^ ]*) [^ ]* (?<user>[^ ]*) \[(?<time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>[^ ]*) +\S*)?" (?<code>[^ ]*) (?<size>[^ ]*)(?: "(?<referer>[^\"]*)" "(?<agent>.*)")?$/,
  /^\<(?<pri>[0-9]+)\>(?<time>[^ ]* {1,2}[^ ]* [^ ]*) (?<host>[^ ]*) (?<ident>[a-zA-Z0-9_\/\.\-]*)(?:\[(?<pid>[0-9]+)\])?(?:[^\:]*\:)? *(?<message>.*)$/,
  /^\<(?<pri>[0-9]{1,5})\>1 (?<time>[^ ]+) (?<host>[^ ]+) (?<ident>[^ ]+) (?<pid>[-0-9]+) (?<msgid>[^ ]+) (?<extradata>(\[(.*)\]|-)) (?<message>.+)$/,
  /^(?<log_time>[^ +][-\d]+[\ T]*[:\dZ]+)\s*(?<myid>[^ ]\d+)\s+\[(?<severity>[^ ]\w+)\](\s+(?<subsystem>[^ ]\w+):){0,1}\s+(?<message>.*)$/,
  /^\<(?<pri>[0-9]+)\>(?<time>[^ ]* {1,2}[^ ]* [^ ]*) (?<ident>[a-zA-Z0-9_\/\.\-]*)(?:\[(?<pid>[0-9]+)\])?(?:[^\:]*\:)? *(?<message>.*)$/,
  /^\s*(?<log_time>[^ ]* {1,2}[^ ]* [^ ]*) \[(?<pid>\d+)\] (?<node>[\-\w]*)\s*(?<component>\w*):\s+(?<severity>\w+):\s+(?<message>.*)$/,
  /^# User\@Host:\s+(?<user>[^\@][\w\[\]]+)[@\s]+(?<dbhost>[^ ][-.\w]+)\s+(\[(?<dbhost_address>[.\d]+)\]){0,1}\s+(?<message>.*)$/,
  /^\[[^ ]* (?<time>[^\]]*)\] \[(?<level>[^\]]*)\](?: \[pid (?<pid>[^\]]*)\])?( \[client (?<client>[^\]]*)\])? (?<message>.*)$/,
  /^(?<time>[^ ]*)\s+(?<severity>\w)\s+(?<component>[^ ]+)\s+\[(?<context>[^\]]+)]\s+(?<message>.*?) *(?<ms>(\d+))?(:?ms)?$/,
  /^(?<time>\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}) \[(?<thread>.*)\] (?<level>[^\s]+)(?<message>.*)/,
  /^.*\[(?<log_time>[^ ][-.\d\+:]+T[:\d]*)([^\]])*?\]\s+?(?<severity>[^ ]\w+)([\s-]*):?\s+(?<message>.*)/,
  /^\[(?<log_time>[^ ][-.\d\+:]+T[:\d]*)([^\]])*?\]\s+(?<severity>[^ ]\w+):\s+(?<message>.*)$/,
  /^=(?<severity>[^ ]\w+)\s+REPORT[=\s]*(?<log_time>[^ =][-:.\d\w]+)[\s=]+(?<message>.*)$/,
  /^(?<time>[^ ]+) (?<stream>stdout|stderr) (?<logtag>[^ ]*) (?<message>.*)$/,
  /time="(?<time>[^ ]*)" level=(?<level>[^ ]*) msg="(?<msg>[^ ].*)"/,
  /^(?<log_time>[^ ][-.\d\+:T]+[ ]*[.:\d]*)\s+(?<message>.*)$/,
  /^(?<message>.*)$/,
];

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
    if (path.indexOf('theykk-logger') >= 0) return;

    if (event == 'add') {
      console.log(`Added path ${path}`);
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

        let logum;
        try {
          logum = JSON.parse(final);
        } catch (_err) {
          for (let i = 0; i < regexes.length; i += 1) {
            const regex = regexes[i];
            if (regex.test(final)) {
              logum = regex.exec(final).groups;
              break;
            }
          }
        }

        const fileInfo = fileName(path);

        const [podname, namespace, cotainer] = fileInfo.split('_');
        // ? Insert log to mongodb
        console.log(`Pod logs inserted ${podname}`);

        insertLog({
          log: logum,
          podname,
          namespace,
          cotainer,
          node: nodeInfo(),
          time: new Date().toISOString(),
        });

        // ? Change file size
        file_stats[path] = stats.size;
      });
    }
  });
};
module.exports = {watch};
