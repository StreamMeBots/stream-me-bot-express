var util = require('util'),
	EventEmitter = require('events').EventEmitter,
	Message = require('./message');

// helper function to time commands out
var startTimeout = function(message, cb) {
	return setTimeout(function(){
		cb && cb(new Error(message.serverMessage + ': command timed out'));
		cb = null;
	}, 5000);
}

// @mixin Commands
// @usage intended to be abstract
// Containing class must have "this.connection"
var Commands = module.exports = function() {};
util.inherits(Commands, EventEmitter);

// @method pass
Commands.prototype.pass = function(key, secret, cb) {
	var message = new Message('PASS ' + key + ' ' + secret);

	var to = startTimeout(message, cb);

	this.connection.lookFor('PASS', function(message) {
		clearTimeout(to);
		cb && cb(null, message);
		cb = null;
	});
	this.connection.write(message.interpret());
}

// @method joinRoom
Commands.prototype.joinRoom = function(roomId, cb) {
	var message = new Message('JOIN ' + roomId);

	var to = startTimeout(message, cb);

	this.connection.lookFor('JOIN', function(message) {
		clearTimeout(to);
		cb && cb(null, message);
		cb = null;
	});
	this.connection.write(message.interpret());
}

// @method say
Commands.prototype.say = function(text) {
	var message = new Message('SAY ' + text);
	this.connection.write(message.interpret());
}

// @method erase
Commands.prototype.erase = function(ids) {
	var message = new Message('ERASE ' + this.options.roomId + ' ' + ids.join(','));
	this.connection.write(message.interpret());
}

// @method ban user
Commands.prototype.ban = function(userId, isGuest) {
	var targetRole = isGuest ? 'bannedGuest' : 'banned';
	var message = new Message('CHANGEROLE ' + userId + ' ' + this.options.roomId + ' ' + targetRole);
	this.connection.write(message.interpret());
}

// @method mute user
Commands.prototype.mute = function(userId, isGuest) {
	var targetRole = isGuest ? 'mutedGuest' : 'muted';
	var message = new Message('CHANGEROLE ' + userId + ' ' + this.options.roomId + ' ' + targetRole);
	this.connection.write(message.interpret());
}

// @method unban user
Commands.prototype.unban = function(userId, isGuest) {
	var targetRole = isGuest ? 'guest' : 'user';
	var message = new Message('CHANGEROLE ' + userId + ' ' + this.options.roomId + ' ' + targetRole);
	this.connection.write(message.interpret());
}

// @method unmute user
Commands.prototype.unmute = function(userId, isGuest) {
	var targetRole = isGuest ? 'guest' : 'user';
	var message = new Message('CHANGEROLE ' + userId + ' ' + this.options.roomId + ' ' + targetRole);
	this.connection.write(message.interpret());
}

// @method unban user
Commands.prototype.unban = function(userId, isGuest) {
	var targetRole = isGuest ? 'guest' : 'user';
	var message = new Message('CHANGEROLE ' + userId + ' ' + this.options.roomId + ' ' + targetRole);
	this.connection.write(message.interpret());
}

// @method mod user
Commands.prototype.mod = function(userId) {
	var message = new Message('CHANGEROLE ' + userId + ' ' + this.options.roomId + ' moderator');
	this.connection.write(message.interpret());
}

// @method unmod user
Commands.prototype.unmod = function(userId) {
	var message = new Message('CHANGEROLE ' + userId + ' ' + this.options.roomId + ' user');
	this.connection.write(message.interpret());
}
