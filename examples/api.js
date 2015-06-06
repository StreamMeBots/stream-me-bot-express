var Bot = require('../src/bot');

var bot = new Bot({
	key: '',
	secret: '',
	roomId: '',
	debug: true
});

bot.on('connect', function() {});

bot.channel(function(err, channel) {
	if(err) {
		console.log(err);
		process.exit(1);
	}
	console.log('-----channel-----\n', JSON.stringify(channel, null, '  '), '\n----------\n');

	bot.roster({}, function(err, roster) {
		if(err) {
			console.log(err);
			process.exit(1);
		}
		console.log('-----roster-----\n', JSON.stringify(roster, null, '  '), '\n----------\n');
		process.exit();
	});
});
