var Bot = require('../src/bot');

var bot = new Bot({
	key: '',
	secret: '',
	roomId: '',
	debug: true
});

bot.on('connect', function() {});
bot.on('say', function(args) {
	if(args.message.toLowerCase().indexOf('profanity') !== -1) {
		bot.erase([args.messageId])
	}
});
