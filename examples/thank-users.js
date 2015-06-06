var Bot = require('../src/bot');

var bot = new Bot({
	key: '',
	secret: '',
	roomId: '',
	debug: true
});

bot.on('connect', function() {});
bot.on('userevent', function(args) {
	switch(args.type) {
		case 'follow':
			bot.say('thanks for the follow ' + args['follower.username'] + '!');
			break;
		case 'donate':
		bot.say('thanks for the donation ' + args['donater.username'] + '!');
			break;
	}
});
