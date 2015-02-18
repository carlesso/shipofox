var { ToggleButton } = require('sdk/ui/button/toggle');
var { setInterval, clearInterval } = require("sdk/timers");
var panels = require("sdk/panel");
var self = require("sdk/self");
var s = require("sdk/simple-storage");
var tabs = require("sdk/tabs");
var Request = require("sdk/request").Request;

var POLLING_INTERVAL = 10000;
var updateInterval = null;
var notifications = require("sdk/notifications");
var triggeredNotifications = {};

var button = ToggleButton({
  id: "shapofox",
  label: "CodeShip Status",
  icon: {
    "19": "./img/shipscope_icon_19.png",
    "48": "./img/shipscope_icon_48.png",
    "128": "./img/shipscope_icon_128.png"
  },
  onChange: handleChange
});

var panel = panels.Panel({
  contentURL: './panel.html',
  onHide: handleHide,
  width: 640,
  height: 480,
  contentScriptFile: ['./lib/jquery.min.js', './lib/handlebars-v3.0.0.js', './lib/bootstrap.min.js', './templates.js', './panel.js'],
  contentStyleFile: ['./css/bootstrap/bootstrap.min.css', './css/shipofox.css', './css/font-awesome.min.css', './css/font-awesome-animation.min.css'],
  contentScript: "window.api_key = '" + s.storage.api_key + "';"
});

exports.toggleButton = button;
exports.mainPanel = panel;

function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
  }
}

function handleHide() {
  button.state('window', {checked: false});
}

panel.port.on('stop', function(api_key) {
  stopPolling();
  delete button.badge;
  delete button.badgeColor;
});

panel.port.on('api_key', function(api_key) {
  s.storage.api_key = api_key;
  updateProjects();
  startPolling();
});

if (s.storage.api_key) {
  updateProjects();
  startPolling();
}

panel.port.on('goto_build', function(data) {
  url = "https://codeship.com/projects/" + data.projectId + "/builds/" + data.buildId;
  tabs.open("https://codeship.com/projects/" + data.projectId + "/builds/" + data.buildId);
  panel.hide();
});
panel.port.on('restart_build', function(build_id) {
  restartBuild(build_id);
});

function loadProjects() {
  // url: "http://localhost:4567/api/v1/projects.json?api_key=" + s.storage.api_key,
  var req = Request({
    url: "https://codeship.com/api/v1/projects.json?api_key=" + s.storage.api_key,
    onComplete: function (data) {
      if (data.status == 200) {
        panel.port.emit('api_ok', data.json);
        updateIcon(data.json);
      } else if (data.status === 0) {
        panel.port.emit('offline');
      } else {
        delete s.storage.api_key;
        stopPolling('API Error');
        panel.port.emit('api_error', data.json);
      }
    }
  }).get();
}

function restartBuild(build_id) {
  var req = Request({
    url: "https://codeship.com/api/v1/builds/" + build_id + "/restart.json?api_key=" + s.storage.api_key,
    onComplete: loadProjects
  }).post();
}

function updateIcon(data) {
  errors = 0;
  testing = 0;
  for (i = 0; i < data.projects.length; i++) {
    p = data.projects[i];
    for (j = 0; j < data.projects[i].builds.length; j++) {
      b = data.projects[i].builds[j];
      if (j === 0 && b.status == 'error') {errors++;}
      if (b.status == 'testing') {testing++;}

      if (triggeredNotifications[b.id] && triggeredNotifications[b.id] != b.status) {
        notifyBuild(p, b);
      }
      triggeredNotifications[b.id] = b.status;
    }
  }
  if (errors > 0) {
    button.badge = errors;
    button.badgeColor = '#FE402C';
  } else if (testing > 0) {
    button.badge = testing;
    button.badgeColor = '#5A95E5';
  } else {
    button.badge = data.projects.length;
    button.badgeColor = '#60CC69';
  }
}

function notifyBuild(project, build) {
  notifications.notify({
    title: project.repository_name,
    text: "[" + build.branch + "] " + build.status,
    icon: "./img/shipscope_icon_48.png",
    data: "https://codeship.com/projects/" + project.id + "/builds/" + build.id,
    onClick: function (data) {
      tabs.open(data);
    }
  });
}

function updateProjects() {
  loadProjects();
}

function startPolling() {
  updateInterval = setInterval(updateProjects, POLLING_INTERVAL);
}

function stopPolling(message) {
  if (message) {
    button.badge = message;
    button.badgeColor = '#FE402C';
  }
  clearInterval(updateInterval);
}
