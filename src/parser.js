/* eslint-disable no-control-regex */
/* eslint-disable prettier/prettier */
// ? Regex for applications ref: https://github.com/fluent/fluent-bit/blob/master/conf/parsers.conf

const regexes = {
  'k8s-nginx-ingress':    /^(?<host>[^ ]*) - (?<user>[^ ]*) \[(?<time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>[^"]*?)(?: +\S*)?)?" (?<code>[^ ]*) (?<size>[^ ]*) "(?<referer>[^"]*)" "(?<agent>[^"]*)" (?<request_length>[^ ]*) (?<request_time>[^ ]*) \[(?<proxy_upstream_name>[^ ]*)\] (\[(?<proxy_alternative_upstream_name>[^ ]*)\] )?(?<upstream_addr>[^ ]*) (?<upstream_response_length>[^ ]*) (?<upstream_response_time>[^ ]*) (?<upstream_status>[^ ]*) (?<reg_id>[^ ]*).*$/,
  ambassador:             /^(?<type>\S+) \[(?<time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>(?:[^"]|\\.)*?)(?: +\S*)?) (?<protocol>\S+)?" (?<response_code>\S+) (?<response_flags>\S+) (?<bytes_received>\S+) (?<bytes_sent>\S+) (?<duration>\S+) (?<x_envoy_upstream_service_time>\S+) "(?<x_forwarded_for>[^"]*)" "(?<user_agent>[^"]*)" "(?<x_request_id>[^"]*)" "(?<authority>[^"]*)" "(?<upstream_host>[^"]*)"/,
  envoy:                  /^\[(?<start_time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>[^"]*?)(?: +\S*)?)? (?<protocol>\S+)" (?<code>[^ ]*) (?<response_flags>[^ ]*) (?<bytes_received>[^ ]*) (?<bytes_sent>[^ ]*) (?<duration>[^ ]*) (?<x_envoy_upstream_service_time>[^ ]*) "(?<x_forwarded_for>[^ ]*)" "(?<user_agent>[^"]*)" "(?<request_id>[^"]*)" "(?<authority>[^ ]*)" "(?<upstream_host>[^ ]*)" /,
  http_statement:         /^.*((?<req_method>GET|POST|PUT|DELETE|CONNECT|OPTIONS|HEAD[^ ]\w+)\s*(?<req_path>[^ ][-._?=%&/[:alnum:]]*)\s*(?<req_protocol>[^ ][./\dHTFSP]+){0,1})(['"\s]*){0,1}((\s*status:\s*(?<req_status>[^ ]\d+)){0,1}(\s*len: (?<req_len>[^ ]\d+)){0,1}(\s*time:\s*(?<req_log_time>[^ ][.\d]+)){0,1}(\s*microversion:\s*(?<req_mver>[^ ][.\d]+)){0,1}){0,1}$/,
  cinder:                 /^(?<log_time>[^ ][-.\d+:T]+[ ]*[.:\d]*)\s+(?<pid>[^ ]\d+)\s+(?<severity>[^ ][.-_\w]+)\s+(?<component>[^ ][.-_\w]+)(\s+\[(-|(?<req_id>[^ ][-\w]*) (?<req_user>[^ ][-\w]*) (?<req_project>[^ ][-\w]*) (?<req_domain>[^ ][-\w]*) (?<req_user_domain>[^ ][-\w]*) (?<req_project_domain>[^ ][-\w]*))\]){1}\s+(?<message>.*)$/,
  nginx:                  /^(?<remote>[^ ]*) (?<host>[^ ]*) (?<user>[^ ]*) \[(?<time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>[^"]*?)(?: +\S*)?)?" (?<code>[^ ]*) (?<size>[^ ]*)(?: "(?<referer>[^"]*)" "(?<agent>[^"]*)")/,
  apache:                 /^(?<host>[^ ]*) [^ ]* (?<user>[^ ]*) \[(?<time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>[^"]*?)(?: +\S*)?)?" (?<code>[^ ]*) (?<size>[^ ]*)(?: "(?<referer>[^"]*)" "(?<agent>[^"]*)")?$/,
  'kube-custom':          /(?<tag>[^.]+)?\.?(?<pod_name>[a-z0-9](?:[-a-z0-9]*[a-z0-9])?(?:\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*)_(?<namespace_name>[^_]+)_(?<container_name>.+)-(?<docker_id>[a-z0-9]{64})\.log$/,
  apache2:                /^(?<host>[^ ]*) [^ ]* (?<user>[^ ]*) \[(?<time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>[^ ]*) +\S*)?" (?<code>[^ ]*) (?<size>[^ ]*)(?: "(?<referer>[^"]*)" "(?<agent>.*)")?$/,
  'syslog-rfc3164':       /^<(?<pri>[0-9]+)>(?<time>[^ ]* {1,2}[^ ]* [^ ]*) (?<host>[^ ]*) (?<ident>[a-zA-Z0-9_/.-]*)(?:\[(?<pid>[0-9]+)\])?(?:[^:]*:)? *(?<message>.*)$/,
  'syslog-rfc5424':       /^<(?<pri>[0-9]{1,5})>1 (?<time>[^ ]+) (?<host>[^ ]+) (?<ident>[^ ]+) (?<pid>[-0-9]+) (?<msgid>[^ ]+) (?<extradata>(\[(.*)\]|-)) (?<message>.+)$/,
  prometheus:             /^level=(?<level>[^ ]*) ts=(?<time>[^ ]*) caller=(?<caller>[^ ].*) component=(?<component>[^ ].*) msg="(?<msg>[^ ].*)" key=(?<key>[^ ].*)/,
  mysql_error:            /^(?<log_time>[^ +][-\d]+[ T]*[:\dZ]+)\s*(?<myid>[^ ]\d+)\s+\[(?<severity>[^ ]\w+)\](\s+(?<subsystem>[^ ]\w+):){0,1}\s+(?<message>.*)$/,
  'syslog-rfc3164-local': /^<(?<pri>[0-9]+)>(?<time>[^ ]* {1,2}[^ ]* [^ ]*) (?<ident>[a-zA-Z0-9_/.-]*)(?:\[(?<pid>[0-9]+)\])?(?:[^:]*:)? *(?<message>.*)$/,
  pacemaker:              /^\s*(?<log_time>[^ ]* {1,2}[^ ]* [^ ]*) \[(?<pid>\d+)\] (?<node>[-\w]*)\s*(?<component>\w*):\s+(?<severity>\w+):\s+(?<message>.*)$/,
  mysql_slow:             /^# User@Host:\s+(?<user>[^@][\w[\]]+)[@\s]+(?<dbhost>[^ ][-.\w]+)\s+(\[(?<dbhost_address>[.\d]+)\]){0,1}\s+(?<message>.*)$/,
  apache_error:           /^\[[^ ]* (?<time>[^\]]*)\] \[(?<level>[^\]]*)\](?: \[pid (?<pid>[^\]]*)\])?( \[client (?<client>[^\]]*)\])? (?<message>.*)$/,
  mongodb:                /^(?<time>[^ ]*)\s+(?<severity>\w)\s+(?<component>[^ ]+)\s+\[(?<context>[^\]]+)]\s+(?<message>.*?) *(?<ms>(\d+))?(:?ms)?$/,
  java_multiline:         /^(?<time>\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}) \[(?<thread>.*)\] (?<level>[^\s]+)(?<message>.*)/,
  crowbar:                /^.*\[(?<log_time>[^ ][-.\d+:]+T[:\d]*)([^\]])*?\]\s+?(?<severity>[^ ]\w+)([\s-]*):?\s+(?<message>.*)/,
  'kubernetes-logger':    /^((?<level>[A-Z])(?<date>\w+)) (?<time>[^ ]*)\s+(?<frame>[^d])\s+(?<file>[^ ]*)\]\s+(?<message>.*)/,
  harbor:                 /^(?<log_time>[^ +][-\d]+[ T]*[:\dZ]+) \[(?<level>[^\]]*)\] \[(?<file>[^\]]*)\]: (?<message>.*)/,
  chefclient:             /^\[(?<log_time>[^ ][-.\d+:]+T[:\d]*)([^\]])*?\]\s+(?<severity>[^ ]\w+):\s+(?<message>.*)$/,
  rabbitmq:               /^=(?<severity>[^ ]\w+)\s+REPORT[=\s]*(?<log_time>[^ =][-:.\d\w]+)[\s=]+(?<message>.*)$/,
  cri:                    /^(?<time>[^ ]+) (?<stream>stdout|stderr) (?<logtag>[^ ]*) (?<message>.*)$/,
  'docker-daemon':        /time="(?<time>[^ ]*)" level=(?<level>[^ ]*) msg="(?<msg>[^ ].*)"/,
  ceph:                   /^(?<log_time>[^ ][-.\d+:T]+[ ]*[.:\d]*)\s+(?<message>.*)$/,
  universal:              /^(?<message>.*)$/,
};

module.exports = {
  parse: (line) => {
    let logum;

    try {
      logum = JSON.parse(line);
      logum.parser = 'json';
    } catch (_err) {

      // ? Remove color codes from line
      line = line.replace(/\x1b\[[0-9;]*m/g,'');
      // ? Parsers
      const regexs = Object.keys(regexes);
      for (let i = 0; i < regexs.length; i += 1) {
        const parser = regexs[i];
        const regex = regexes[parser];
        if (regex.test(line)) {
          logum = regex.exec(line).groups;
          logum.parser = parser;
          break;
        }
      }
    }

    logum.raw = line;
    return logum;
  },
};
