const express = require('express');
const path = require('path');

const app = express();

const forceSSL = function() {
  console.log(process.env.BASE_URL)
  console.log(path.join(__dirname + '/dist/index.html'))
  return function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(
       ['https://', req.get('Host'), req.url].join('')
      );
    }
    next();
  }
}

// Instruct the app
// to use the forceSSL
// middleware
app.use(forceSSL());

// Run the app by serving the static files
// in the dist directory
app.use(express.static('dist'));

// For all GET requests, send back index.html
// so that PathLocationStrategy can be used
app.get('/*', function(req, res) {
  res.sendFile('dist/index.html', { root: __dirname });
});

// Start the app by listening on the default
// Heroku port
app.listen(process.env.PORT || 5000);
