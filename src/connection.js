var tls = require('tls'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter,
	Message = require('./message');

// @class Connection
var Connection = module.exports = function(config, log, options) {
	this.config = config;
	this.log = log;
	this.client = null;
	this.state = Connection.STATES.disconnected;

	this.options = options || {};
	this.options.retryInterval = this.options.retryInterval || 2000;
};
util.inherits(Connection, EventEmitter);

// States
Connection.STATES = {
	connected: 'connected',
	disconnected: 'disconnected',
};


// We are disconnected
Connection.prototype.disconnected = function() {
	this.state = Connection.STATES.disconnected;
	this.emit('disconnect');
	this.client = null;
}

Connection.prototype.isConnected = function() {
	return Connection.STATES.connected === this.state;
};

// disconnect
Connection.prototype.disconnect = function() {
	if(!this.client) {
		return;
	}
	this.client.end();
}

// Helper processBuffer
var processBuffer = function(s) {
	var cmds = [],
		last = 0;

	for(var i=0; i<s.length; i++) {
		if(s[i] !== '\n') {
			continue;
		}
		cmds.push(s.slice(last, i+1 ).trim());
		last = i;
	}
	s = s.slice( last );
	return [s.trim(), cmds];
}

// We are connected
Connection.prototype.connected = function() {
	var buffer = '', m;

	this.state = Connection.STATES.connected;
	this.emit('connect');

	this.client.on('data', function(data) {
		buffer += data.toString();
		var d = processBuffer(buffer);
		buffer = d[0];

		for(var i=0; i<d[1].length; i++) {
			this.log('stream-bots:receiving', {msg: d[1][i]});
			m = new Message(d[1][i], true);
			if(m.type) {
				this.emit('message', m);
			}
		}
	}.bind(this));

	this.client.on('end', this.disconnected.bind(this));
}

Connection.prototype.lookFor = function(type, cb) {
	var off  = function(){
		this.removeListener('message', handler);
	}.bind(this);

	var handler = function(message) {
		if(message.type === type) {
			cb && cb(message);
			cb = null;
			off();
		}
	};

	this.on('message', handler);
}

// Send the message
Connection.prototype.write = function(s) {
	if(s[s.length-1] !== '\n') {
		s += '\n';
	}
	this.log('stream-bots:writing', {msg: s});
	this.client.write(s);
}


var connecting = false;
// Tries (and retries)
Connection.prototype.tryToConnect = function() {
	if(connecting || this.client) {
		return;
	}

	if( this.state === Connection.STATES.connected ) {
		return;
	}

	connecting = true;
	this.log('stream-bots:tcp-attempt-to-connect', {
		host: this.config.host,
		port: this.config.port
	});

	this.client = tls.connect(this.config.port, this.config.host, function(err){
		if(err) {
			this.log('stream-bots:tcp-error', {err: err});
			connecting = false;
			this.disconnected();
			setTimeout(this.tryToConnect.bind(this), this.options.retryInterval);
			return;
		}
		this.log('stream-bots:tcp-connected');

		connecting = false;
		this.connected();
	}.bind(this));
}
