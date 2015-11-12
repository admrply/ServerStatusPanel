Node.js Server Status Panel
===========================

A web app that checks a list of IPs [and ports] to see if they are active and accessable.

Installation
------------

This application is designed to run on the MEAN stack, therefore your main prerequisites are Node.js and MongoDB. If these aren't already installed and set up, head over to [mean.io](http://mean.io) or via package manager:

###Debian/Ubuntu
```
apt-get install nodejs
apt-get install mongodb
```

###OS X
```
brew install nodejs
brew install mongodb
```

Bower is required to install dependancies for the web frontend.
```
npm install -g bower
```

Then install via npm and bower
```
npm install
bower install
```

The bower_components directory should be placed inside the public folder as this is where the index.html file looks for the components.

Running the server
------------------

Fire up MongoDB on localhost

###Debian/Ubuntu
```
mongod
```

###OS X (with Homebrew)
```
mongod --dbpath /usr/local/var/mongodb/
```

Spin up that server!
```
node server.js
```

Database Schema
---------------
This is designed for a list of games and allows people to add their own games. Here's the schema:
```javascript
var Game = mongoose.model('Game', {
    name   : String,
    ip     : String,
    port   : Number,
    status : Boolean, //true is active, false is down,
    ping   : Number,
    user   : Boolean
});
```
If the user variable is set to false, the "Remove" icon will not show next to that entry in the table. Designed for admin type control.

Future Development
------------------

Currently there is no server side validation for the port number that can be added by users, just client-side. I'll get round to adding proper validation at a later date as this was only running locally amongst friends. Client-side validation was to stop stupid human errors with port numbers being too high, invalid IP addresses/etc. The server (specifically Mongoose) **will** crash if you feed it a String for a port number instead of a Number.

Licence
-------
GNU General Public Licence v2