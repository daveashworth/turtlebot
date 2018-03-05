/*
  TurtleBot
  Shows random turtle pics... until the time when it gives turtle trading alerts.
*/
require("dotenv").config()

const { UNSPLASH_APPLICATION_ID, UNSPLASH_SECRET, UNSPLASH_CALLBACK_URL, TELEGRAM_BOT_ID } = process.env;

const sample = require("lodash/sample");
const fetch = require("isomorphic-fetch");
const Unsplash = require("unsplash-js").default;
const unsplash = new Unsplash({
  applicationId: UNSPLASH_APPLICATION_ID,
  secret: UNSPLASH_SECRET,
  callbackUrl: UNSPLASH_CALLBACK_URL,
});
const TeleBot = require('telebot');
const bot = new TeleBot(TELEGRAM_BOT_ID);


// Command keyboard
const replyMarkup = bot.keyboard([
    ['/turtle']
], {resize: true, once: false});

// Log every text message
bot.on('text', function (msg) {
    console.log(`[text] ${ msg.chat.id } ${ msg.text }`);
  const message = sample([
    "Aren't turtles so great?!",
    "Oh really?",
    "Hmmmmm.....",
    "I'm not sure about that",
    "What would your mother think?",
    "I can't even...",
    "I know...",
    "Probably so",
    "YOU KNOW WHY!",
  ]);
  if (msg.text !== "/turtle") {
    bot.sendMessage(msg.chat.id, message);
  }
});

// On command "start" or "help"
bot.on(['/start', '/help'], function (msg) {

    return bot.sendMessage(msg.chat.id,
        'Use commands: /turtle, and /about', {replyMarkup}
    );

});

// On command "about"
bot.on('/about', function (msg) {

    let text = 'This bot is powered by TeleBot library ' +
        'https://github.com/kosmodrey/telebot Go check the source code!';

    return bot.sendMessage(msg.chat.id, text);

});

// On command "turtle"
bot.on(['/turtle'], async function (msg) {

    const result = await unsplash.photos.getRandomPhoto({
      query: "turtle",
    });
    const photo = await result.json();
    const url = photo.urls.small;

    let promise;
    let id = msg.chat.id;
    let cmd = msg.text.split(' ')[0];

    // Photo or gif?
    promise = bot.sendPhoto(id, url, {
      fileName: 'turtle.jpg',
      serverDownload: true
    });

    // Send "uploading photo" action
    bot.sendAction(id, 'upload_photo');

    return promise.catch(error => {
      console.log('[error]', error);
      // Send an error
      bot.sendMessage(id, `An error ${ error } occurred, try again.`);
    });

});

// Start getting updates
bot.start();
