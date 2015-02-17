# Shipofox, Get Codeship build notifications

Shipofox is the Firefox version of [Shipscope](https://chrome.google.com/webstore/detail/shipscope/jdedmgopefelimgjceagffkeeiknclhh) chrome extension.

It's not perfect, and it's not tested (yet), but it does his job.

If you find any bug/error/malfunction, please open an Issue.

## Developers information

This Firefox extension uses [Handlebars](http://handlebarsjs.com/) for two template, so if you want to play with it, do:

```bash
$ handlebars data/templates/build.handlebars data/templates/project.handlebars -f data/templates.js
$ cfx run
```

This will precompile compile build and project handlebars.
