/** Message object for incoming and outgoing messages
 *
 * @class Message
 * @param {String} [message] 
 * @param {Boolean} [incoming] whether or not its incoming from the server, determines how to construct it
 */
var Message = module.exports = function(message, incoming) {
	this.incoming = !!incoming;

	var msgParts = this.parse(message, incoming);
	this.type = this.getType(msgParts[0]);
	this.args = msgParts[1] || null;
	this.serverMessage = msgParts[2] || '';
};
Message.SUPPORTED_COMMANDS = ['SAY', 'JOIN', 'LEAVE', 'KICK', 'PASS', 'ERROR', 'ERASE', 'USEREVENT', 'CHANGEROLE'];
Message.PARSE_STATES = {key: 'key', value: 'value'};

Message.prototype.getType = function(str) {
	switch(str) {
		case 'ERROR':
			return 'CHAT-ERROR';
	}
	return str || null;
}

// Parse the arguments of a message
// k1="v1" k2="v2" k3="v\"3"
Message.prototype.parseArgs = function(s) {
	var state = Message.PARSE_STATES.key,
		tmpKey = '',
		tmpValue = '',
		qCount = 0,
		o = {};

	var unset = function() {
		tmpKey = '';
		tmpValue = '';
	}

	var set = function(tmpKey, tmpValue) {
		tmpKey = tmpKey.trim();
		if(o[tmpKey]) {
			return unset();
		}
		o[tmpKey] = tmpValue.replace(/\\/g, '');
		unset();
	}

	for(var i=0; i<s.length; i++) {
		switch(state) {
			// looking for keys
			case Message.PARSE_STATES.key:
				// found a =, now looking for values, reset the value
				if(s[i] === '=') {
					state = Message.PARSE_STATES.value;
					break;
				}
				// store the key name
				tmpKey += s[i];
				break;

			// looking for values
			case Message.PARSE_STATES.value:

				// found a " that wasn't preceded by a \, do something
				if(s[i] === '"' && i > 0 && s[i-1] !== '\\') {

					// its the second time, end the value, store it
					if(qCount === 1) {
						state = Message.PARSE_STATES.key;

						if(tmpKey) {
							set(tmpKey, tmpValue);
						}

						qCount = 0;
						break;
					}
					// its the first time, start the value
					qCount = 1;
					break;
				}

				// something funny is going on, something like foo=afeawfawef"bar" or ="bar"
				if(qCount !== 1 || !tmpKey) {
					break;
				}

				// keep track of the value
				tmpValue += s[i];
				break;
		}
	}

	return o;
};

// Parse a message
Message.prototype.parse = function(message, incoming) {
	if(!message) {
		return [];
	}

	var tmp = message.split(/\ /);
	if(Message.SUPPORTED_COMMANDS.indexOf(tmp[0]) === -1) {
		tmp.unshift('SAY');
	}

	var args = tmp.slice(1),
		serverMessage = '',
		meta = {};

	if(incoming) {
		args = this.filterArgs(tmp[0], this.parseArgs(args.join(' ')));
	} else {
		serverMessage = tmp[0] + ' ' + args.join(' ');
		args = null;
	}

	return [tmp[0], args, serverMessage];
}

Message.prototype.isValid = function() {
	return !!this.type;
}

Message.prototype.filterArgs = function(type, args) {
	switch(type) {
		case 'ERASE':
			var messageIds = [],
				t = args.messageIds.split(',');
			// The streamme chat currently puts some nonsense in as the first erased message
			// strip anything with a :
			for(var i=0; i<t.length; i++) {
				if(t[i].indexOf(':') === -1 ) {
					messageIds.push(t[i].trim())
				}
			}
			args.messageIds = messageIds;
			break;		
	}

	args.result = args.result === 'success' ? true : false;
	args.bot = args.bot === 'true' ? true : false;

	return args;
}

Message.prototype.interpret = function() {
	switch(this.type) {
		default:
			return this.serverMessage;
	}
}
