var express = require('express');
var app = express();
app.use(express.static('public'))
//app.use('/', express.static('./'));
app.listen(8080);

// prepare server
// app.use('/api', api); // redirect API calls
// app.use('/', express.static(__dirname + '/www')); // redirect root
// app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
// app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
// app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap