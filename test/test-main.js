var { toggleButton, mainPanel } = require("./main");

exports.testToggle = function(assert) {
  toggleButton.click();
  assert.pass(mainPanel.isShowing, "button activate panel");
  toggleButton.click();
  assert.pass(!mainPanel.isShowing, "button hide panel");
};

exports.testOk = function(assert) {
  toggleButton.click();
  mainPanel.port.emit('api_ok', {});
  assert.pass("TODO: need to find a way to access mainPanel content");
};

// exports["test main async"] = function(assert, done) {
//   assert.pass("async Unit test running!");
//   done();
// };

require("sdk/test").run(exports);
