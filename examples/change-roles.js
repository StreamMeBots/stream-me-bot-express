var Bot = require('../src/bot');

var bot = new Bot({
	key: '',
	secret: '',
	roomId: '',
	debug: true
});

bot.on('connect', function() {});
bot.on('say', function(args) {
	if(args.message.toLowerCase() === 'mod me') {
		bot.mod(args.publicId);
	}
	if(args.message.toLowerCase() === 'unmod me') {
		bot.unmod(args.publicId);
	}
	if(args.message.toLowerCase() === 'ban me') {
		bot.ban(args.publicId, args.role === 'guest');
		setTimeout(function() {
			bot.unban(args.publicId, args.role === 'guest');
		}, 1000);
	}
	if(args.message.toLowerCase() === 'mute me') {
		bot.mute(args.publicId, args.role === 'guest');
		setTimeout(function() {
			bot.unmute(args.publicId, args.role === 'guest');
		}, 1000);
	}
});
