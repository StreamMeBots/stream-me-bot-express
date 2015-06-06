var _ = require('lodash'),
	util = require('util'),
	request = require('request'),
	Connection = require('./connection'),
	Commands = require('./commands');

// @class Bot
var Bot = module.exports = function(options) {
	this.options = _.defaults(options, Bot.defaultOptions);

	// Set up logger
	this.log = function() {
		if(arguments[0] === 'debug') {
			if(this.options.debug) {
				console.log.apply(console, arguments);
			}
			return;
		}
		console.log.apply(console, arguments);
	}.bind(this);

	this.state = Bot.STATES.disconnected;

	this.connection = new Connection({
		host: this.options.host,
		port: this.options.port
	}, this.log, {
		retryInterval: 2000
	});

	// Whenever we get a connection, join the room
	this.connection.on('connect', this.join.bind(this));

	// Whenever we disconnect, set our state properly
	this.connection.on('disconnect', this.disconnected.bind(this));

	this.connection.on('message', this.onMessage.bind(this));

	// Try to establish the connection
	this.connection.tryToConnect();
};

// inherits from commands
util.inherits(Bot, Commands);

// Default options
Bot.defaultOptions = {
	debug: false,
	host: 'stream.me',
	port: 2020,
	roomId: null, //required
	key: null, //required
	secret: null //required
};

// States constants
Bot.STATES = {
	disconnected: 'disconnected',
	connected: 'connected',
	authorized: 'authorized',
	inRoom: 'inroom'
};

Bot.prototype.onMessage = function(m) {
	this.emit(m.type.toLowerCase(), m.args);
};

Bot.prototype.disconnected = function() {
	this.state = Bot.STATES.disconnected;
};

/** Ensures a connection, authorizes the bot, joins the room
 * @method join
 */
Bot.prototype.join = function() {
	this.state = Bot.STATES.connected;

	this.pass(this.options.key, this.options.secret, function(err, authenticated) {
		if(err) {
			this.emit('error', err);
			return;
		}

		if(!authenticated) {
			this.emit('error', new Error('unauthorized bot, could not connect to server'));
			return;
		}

		this.state = Bot.STATES.authorized;

		this.joinRoom(this.options.roomId, function(err, joined) {
			if(err) {
				this.emit('error', err);
				return;
			}

			if(!joined) {
				this.emit('error', new Error('unauthorized bot, could not join room'));
				return;
			}
			this.state = Bot.STATES.inRoom;

			this.emit('connect');

		}.bind(this));
	}.bind(this));
};

Bot.prototype.roster = function(options, cb) {
	var qs = {
		limit: parseInt(options.limit) || 100,
		offset: parseInt(options.offset) || 0,
		q: options.q || ''
	};

	request({
		method: 'get',
		url: 'https://' + this.options.host + '/api-chat/v1/rooms/' + this.options.roomId + '/roster',
		qs: qs,
		json: true
	}, function(err, response, body) {
		if(err) {
			this.log('stream-bots:failed-roster-request', err.message);
			return cb(err);
		}

		if(response.statusCode !== 200) {
			err = new Error('unexpected statusCode ' + response.statusCode + ' ' + body);
			this.log('stream-bots:failed-roster-request', err.message);
			return cb(err);
		}

		cb(null, body);
	}.bind(this));
};

Bot.prototype.channel = function(cb) {
	var d = this.options.roomId.split(':');

	if(d[0] !== 'user') {
		var err = new Error('can only get channel information for user rooms');
		return cb(err);
	}

	request({
		method: 'get',
		url: 'https://' + this.options.host + '/api-user/v1/users/'+ d[1] + '/channel',
		json: true
	}, function(err, response, body) {
		if(err) {
			this.log('stream-bots:failed-channel-request', err.message);
			return cb(err);
		}

		if(response.statusCode !== 200) {
			err = new Error('unexpected statusCode ' + response.statusCode + ' ' + body);
			this.log('stream-bots:failed-channel-request', err.message);
			return cb(err);
		}

		cb(null, body);
	}.bind(this));
};

