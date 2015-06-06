var assert = require('assert'),
	mocha = require('mocha'),
	Message = require('../src/message');

var TEST_SAY = 'SAY publicId="f45d6b74-016a-4438-8363-ff7187fc6bba" username="Test" role="admin" messageId="585ed200-e2be-4b0e-aa9f-96c1a7626ef0" timestamp="2015-06-05T02:24:17+00:00" bot="true" message="Hello world."';
var TEST_JOIN = 'JOIN publicId="f45d6b74-016a-4438-8363-ff7187fc6bba" roomId="user:c472aa6a-b707-11e4-8c21-42010af0d2f6:web" username="Test" role="admin" bot="true" timestamp="2015-06-05T02:24:17+00:00"';
var TEST_ERASE = 'ERASE messageIds="user:c472aa6a-b707-11e4-8c21-42010af0d2f6:web,585ed200-e2be-4b0e-aa9f-96c1a7626ef0" publicId="c472aa6a-b707-11e4-8c21-42010af0d2f6" username="jordan" role="admin" bot="false" timestamp="2015-06-05T03:11:56+00:00"';
var TEST_LEAVE = 'LEAVE publicId="c472aa6a-b707-11e4-8c21-42010af0d2f6" roomId="user:c472aa6a-b707-11e4-8c21-42010af0d2f6:web" username="jordan" role="admin" bot="false" timestamp="2015-06-05T03:25:29+00:00"';

var tests = {};
tests.incoming = {};
tests.outgoing = {};

tests.incoming.say = function() {
	var message = new Message(TEST_SAY, true);
	assert.equal(message.type, 'SAY');
	assert.equal(message.args.publicId, "f45d6b74-016a-4438-8363-ff7187fc6bba");
	assert.equal(message.args.username, "Test");
	assert.equal(message.args.role, "admin");
	assert.equal(message.args.messageId, "585ed200-e2be-4b0e-aa9f-96c1a7626ef0");
	assert.equal(message.args.timestamp, "2015-06-05T02:24:17+00:00");
	assert.equal(message.args.bot, true);
	assert.equal(message.args.message, "Hello world.");
}

tests.incoming.join = function() {
	var message = new Message(TEST_JOIN, true);
	assert.equal(message.type, 'JOIN');
	assert.equal(message.args.publicId, "f45d6b74-016a-4438-8363-ff7187fc6bba");
	assert.equal(message.args.username, "Test");
	assert.equal(message.args.role, "admin");
	assert.equal(message.args.timestamp, "2015-06-05T02:24:17+00:00");
	assert.equal(message.args.bot, true);
}

tests.incoming.erase = function() {
	var message = new Message(TEST_ERASE, true);
	assert.equal(message.type, 'ERASE');
	assert.equal(message.args.publicId, "c472aa6a-b707-11e4-8c21-42010af0d2f6");
	assert.equal(message.args.messageIds[0], "585ed200-e2be-4b0e-aa9f-96c1a7626ef0");
	assert.equal(message.args.username, "jordan");
	assert.equal(message.args.role, "admin");
	assert.equal(message.args.timestamp, "2015-06-05T03:11:56+00:00");
	assert.equal(message.args.bot, false);
}

tests.incoming.leave = function() {
	var message = new Message(TEST_LEAVE, true);
	assert.equal(message.type, 'LEAVE');
	assert.equal(message.args.publicId, 'c472aa6a-b707-11e4-8c21-42010af0d2f6');
	assert.equal(message.args.roomId, 'user:c472aa6a-b707-11e4-8c21-42010af0d2f6:web');
	assert.equal(message.args.username, 'jordan');
	assert.equal(message.args.role, 'admin');
	assert.equal(message.args.bot, false);
	assert.equal(message.args.timestamp, '2015-06-05T03:25:29+00:00');
}

tests.outgoing.say = function() {
	var message = new Message('SAY foobar');
	assert.equal(message.serverMessage, 'SAY foobar');
}

tests.outgoing.join = function() {
	var message = new Message('JOIN foobar');
	assert.equal(message.serverMessage, 'JOIN foobar');
}

tests.outgoing.erase = function() {
	var message = new Message('ERASE a,b,c');
	assert.equal(message.serverMessage, 'ERASE a,b,c');
}

tests.outgoing.leave = function() {
	var message = new Message('LEAVE foobar');
	assert.equal(message.serverMessage, 'LEAVE foobar');
}


describe('message', function() {
	describe('parse', function() {
		describe('incoming', function() {
			it('parses say', tests.incoming.say);
			it('parses join', tests.incoming.join);
			it('parses erase', tests.incoming.erase);
			it('parses leave', tests.incoming.leave);
		});

		describe('outgoing', function() {
			it('sends say', tests.outgoing.say);
			it('sends join', tests.outgoing.join);
			it('sends erase', tests.outgoing.erase);
			it('sends leave', tests.outgoing.leave);
		});
	});
});
