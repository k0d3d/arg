
/**
 * Module dependencies.
 */

var express = require('express'),
    path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    mongoStore = require('connect-mongo')(express),
    flash = require('connect-flash'),
    helpers = require('view-helpers'),
    lingua = require('lingua'),
    nconf = require('nconf'),
    pkg = require('../package.json');

module.exports = function (app, config, passport) {
  //Set Configuaration Module using
  //environment 
  nconf
  .argv()
  .env()
  .file({file: process.ENV+'.json'});

  //Set other config params
  nconf.set('app:root', rootPath);

  app.set('showStackError', true);

  // should be placed before express.static
  app.use(express.compress({
    filter: function (req, res) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
    },
    level: 9
  }));

  app.use(express.favicon());
  app.use(express.static(rootPath + '/public'));

  // don't use logger for test env
  if (process.env.NODE_ENV !== 'test') {
    app.use(express.logger('dev'));
  }

  // set views path, template engine and default layout
  app.set('views', rootPath + '/app/views');
  app.set('view engine', 'jade');

  // Lingua configuration
  app.use(lingua(app, {
      defaultLocale: 'en',
      path: __dirname + '/i18n'
  }));  

  app.configure(function () {
    // expose package.json to views
    app.use(function (req, res, next) {
      res.locals.pkg = pkg;
      next();
    });

    app.use(function(req, res, next){
      res.locals.facility = config.app.facility;
      next();
    });

    // cookieParser should be above session
    app.use(express.cookieParser());

    // bodyParser should be above methodOverride
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    // express/mongo session storage
    app.use(express.session({
      secret: 'edb00nt0bi4s',
      store: new mongoStore({
        url: config.database.host,
        collection : 'sessions'
      })
    }));

    // use passport session
    //app.use(passport.initialize())
    //app.use(passport.session())

    // connect flash for flash messages - should be declared after sessions
    app.use(flash())

    // should be declared after session and flash
    app.use(helpers(pkg.name))

    // adds CSRF support
    if (process.env.NODE_ENV !== 'test') {
      //app.use(express.csrf())
    }

    // This could be moved to view-helpers :-)
    //app.use(function(req, res, next){
    //  res.locals.csrf_token = req.session._csrf
    //  next()
    //})

    // routes should be at the last
    app.use(app.router);

    // assume "not found" in the error msgs
    // is a 404. this is somewhat silly, but
    // valid, you can do whatever you like, set
    // properties, use instanceof etc.
    app.use(function(err, req, res, next){
      var t = new Date();
      // treat as 404
      if  ( err.message && 
          (~err.message.indexOf('not found') || 
          (~err.message.indexOf('Cast to ObjectId failed'))
          )) {
        return next();
      }

      // log it
      // send emails if you want
      console.error(t.toString());
      console.error(err.stack);

      // error page
      //res.status(500).json({ error: err.stack });
      res.json(500, err.message);
    });

    // assume 404 since no middleware responded
    app.use(function(req, res, next){
      res.status(404).render('404', {
        url: req.originalUrl,
        error: 'Not found'
      });
    });
  });

  // development env config
  app.configure('development', function () {
    app.locals.pretty = true;
  });
};
