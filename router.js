var routes = require('routes')();
var fs = require('fs');
var db = require('monk')('localhost/myMovies');
var qs = require('qs');
var view = require('./view');
var mime = require('mime');
var movies = db.get('movies');

routes.addRoute('/movies', (req, res, url) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    movies.find({}, function(err, docs) {
      if (err) console.log('whoops');
      var template = view.render('movies/index', {
        movies: docs
      });
      res.end(template);
    });
  }
});

routes.addRoute('/index', (res, req, url) => {
  if (req.method === 'GET') {
    res.writeHead(302, {
      'Location': '/movies'
    });
    res.end();
  }
});

routes.addRoute('/movies/home', (req, res, url) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    fs.readFile('templates' + req.url + '.html', function(err, file) {
      if (err) console.log('whoops');
      res.end(file);
    });
  }
});

routes.addRoute('/movies/new', (req, res, url) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    var template = view.render('movies/new', {});
    res.end(template);
  }
  if (req.method === 'POST') {
    var data = '';
    req.on('data', function(chunk) {
      data += chunk;
    });
    req.on('end', function() {
      var movie = qs.parse(data);
      movies.insert(movie, function(err, doc) {
        if (err) res.end('whoops');
        res.writeHead(302, {
          'Location': '/movies'
        });
        res.end();
      });
    });
  }
});

routes.addRoute('/movies/:id', (req, res, url) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    movies.findOne({
      _id: url.params.id
    }, function(err, doc) {
      if (err) console.log('whoops');
      res.end(doc.name.toString());
    });
  }
});

routes.addRoute('/movies/:id/show', (req, res, url) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    movies.findOne({
      _id: url.params.id
    }, function(err, docs) {
      if (err) console.log('whoops');
      var template = view.render('movies/show', {
        movies: docs
      });
      res.end(template);
    });
  }
});

routes.addRoute('/movies/:id/edit', (req, res, url) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    movies.findOne({
      _id: url.params.id
    }, function(err, docs) {
      if (err) console.log('whoops');
      var template = view.render('movies/edit', docs);
      res.end(template);
    });
  }
});

routes.addRoute('/movies/:id/update', (req, res, url) => {
  if (req.method === 'POST') {
    var data = '';
    req.on('data', function(chunk) {
      data += chunk;
    });
    req.on('end', function() {
      var movie = qs.parse(data);
      movies.update({
        _id: url.params.id
      }, movie, function(err, doc) {
        if (err) console.log('whoops');
        res.writeHead(302, {
          'Location': '/movies'
        });
        res.end();
      });
    });
  }
});

routes.addRoute('/public/*', function(req, res, url) {
  res.setHeader('Content-Type', mime.lookup(req.url));
  fs.readFile('.' + req.url, function(err, file) {
    if (err) {
      res.setHeader('Content-Type', 'text/html');
      res.end('404');
    }
    res.end(file);
  });
});


module.exports = routes;
