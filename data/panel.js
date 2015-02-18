Handlebars.partials = Handlebars.templates;

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
    case '==':
      return (v1 == v2) ? options.fn(this) : options.inverse(this);
    case '===':
      return (v1 === v2) ? options.fn(this) : options.inverse(this);
    case '<':
      return (v1 < v2) ? options.fn(this) : options.inverse(this);
    case '<=':
      return (v1 <= v2) ? options.fn(this) : options.inverse(this);
    case '>':
      return (v1 > v2) ? options.fn(this) : options.inverse(this);
    case '>=':
      return (v1 >= v2) ? options.fn(this) : options.inverse(this);
    case '&&':
      return (v1 && v2) ? options.fn(this) : options.inverse(this);
    case '||':
      return (v1 || v2) ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

$(document).on('submit', '#api_form', function(e) {
  e.preventDefault();
  self.port.emit('api_key', $('#api_key').val());
  $('#api_errors').hide();
  $('#api_form').hide();
  $('#projects').show();
});

self.port.on('api_key_stored', function(api_key) {
  $('#api_form').hide();
  $('#api_key').val(api_key);
});

$(document).on('click', '.goto_build', function(e) {
  e.preventDefault();
  data = $(e.currentTarget).data();
  self.port.emit('goto_build', data);
});

$(document).on('click', '#gotoOptions', function(e) {
  e.preventDefault();
  self.port.emit('stop');
  $('#projects').hide();
  $('#api_form').show();
});
$(document).on('click', '.restart_build', function(e) {
  e.preventDefault();
  build_id = $(e.currentTarget).data('buildId');
  self.port.emit('restart_build', build_id);
  i = $("#build_" + build_id + " h4 i");
  i.removeClass('text-success text-danger fa-check-circle fa-times-circle').addClass('text-primary fa-spin fa-refresh');
});

self.port.on('api_error', function(msg) {
  $('#projects').hide();
  if (msg && msg.error)
    $('#api_error_message').html(msg.error);
  $('#api_errors').show();
  $('#api_form').show();
});

self.port.on('offline', function() {
  $('#offline').show();
});

self.port.on('api_ok', function(msg) {
  $('#offline').hide();
  $('#api_errors').hide();
  $('#api_form').hide();

  // $('#accordion').html('');
  $.each(msg.projects, function(i, project) {
    if ($('#project_' + project.id).length > 0) {
      firstElement = $('#project_' + project.id + ' .list-group-item:first');
      $.each(project.builds, function(j, build) {
        if ($('#build_' + build.id).length > 0) {
          $('#build_' + build.id).html(Handlebars.templates.build(build));
        } else {
          firstElement.before("<li class='list-group-item' id='build_" + build.id + "'>" + Handlebars.templates.build(build) + '</li>');
        }
      });
    } else {
      $('#accordion').append(Handlebars.templates.project(project));
    }
  });
  $('#projects').show();
});

