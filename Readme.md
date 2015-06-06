# <img src="https://static1.stream.me/web/active/images/robot-avatar.png" width=30px; style="display= inline-block" /> Stream Me Bot Express


Core bot functionality to aid in the development of bots.

## Installation

```bash
$ npm install stream-me-bot-express
```

## Quick start - echo bot

```js
var Bot = require('stream-me-bot-express');

var bot = new Bot({
  key: 'KEY',
  secret: 'SECRET',
  roomId: 'ROOM',
  debug: true
});

bot.on('connect', function() {});
bot.on('say', function(args) {
  if(!args.bot) {
    bot.say(args.message)
  }
});
```

## Features

  * Robust connection
  * Efficient message parsing
  * API integration

## Events

connect

Emitted when the tcp server has connected, the bot has authenticated, and the bot has successfully joined the room.

disconnect

Emitted when the bot has been disconnected

error

Emitted on error, network error, authentication error, or otherwise, "fatal" errors cannot be recovered

```js
bot.on('error', function(err) {
  // All of these errors are fatal
  console.error(err.message);
  process.exit(1);
});
```

message

Emits all messages

```js
bot.connect.on('message', function(m) {});
```

message by command

Emits specific mesages

```js
bot.connect.on('say', function(args){ });
bot.connect.on('erase', function(args){ });
bot.connect.on('join', function(args){ });
bot.connect.on('leave', function(args){ });
bot.connect.on('pass', function(args){ });
bot.connect.on('erase', function(args){ });
```

## Methods

say

Says something on the channel as a bot

```js
bot.say("foobar", function(err){});
```


mute

Mutes a user by publicId

```js
bot.on('message', function(message) {
  switch(message.type) {
    case "say":
      if(message.text.indexOf('badWord') !== -1) {
        bot.mute(message.publicId, function(err){});
      }
      break;
  }
});
```

unmute

Unmutes a user
```js
bot.unmute(userPublicId, function(err){ })
```

ban

Bans a user
```js
bot.ban(userPublicId, function(err){ })
```

unban

Unbans a user
```js
bot.unban(userPublicId, function(err){ })
```

erase

Erases a list of messages
```js
bot.on('message', function(message) {
  switch(message.type) {
    case "say":
      if(message.text.indexOf('badWord') !== -1) {
        bot.erase([message.messageId], function(err){});
      }
      break;
  }
});
```

roster

Gets the current room roster

```js
bot.roster({
  limit: 100,
  offset: 0
}, function(err, roster){

});
```

channel

Gets the current room channel information
```js
bot.channel(function(err, channel){

});
```