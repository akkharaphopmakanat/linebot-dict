const line = require('@line/bot-sdk');
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

const env = dotenv.config().parsed;
const app = express();
const lineConfig = {
  channelAccessToken: env.ACCESS_TOKEN,
  channelSecret: env.SECRET_TOKEN
};

const client = new line.Client(lineConfig);

app.post('/webhook', line.middleware(lineConfig), async (req, res, next) => {
  try {
    const events = req.body.events;
    console.log('event', events);
    if (events.length > 0) {
      await Promise.all(events.map(item => handleEvent(item)));
    } else {
      res.status(200).send('OK');
    }

    if (req.session.user) return next();
    return next(new NotAuthorizedError());
  } catch (e) {
    res.status(500).end();
  }
});

async function handleEvent(event) {
  console.log(event);
  console.log(event.message.text);

  try {
    const meaning = await getWordMeaning(event.message.text);
    client.replyMessage(event.replyToken, { type: 'text', text: meaning });
  } catch (error) {
    console.error(error);
  }
}

async function getWordMeaning(word) {
  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = response.data;

    // Check if the API response got any meanings or not
    if (data.length > 0) {
      let nounMeaning = '';
      let verbMeaning = '';

      // Find the [0] of noun and verb meanings, if got one to make result like Example Situation
      for (const meaning of data[0].meanings) {
        if (meaning.partOfSpeech === 'noun' && !nounMeaning) {
          nounMeaning = meaning.definitions[0].definition;
        } else if (meaning.partOfSpeech === 'verb' && !verbMeaning) {
          verbMeaning = meaning.definitions[0].definition;
        }

        // If both noun and verb meanings found, then break the loop 
        if (nounMeaning && verbMeaning) {
          break;
        }
      }

      // Create the final string with the meanings
      let meaningString = '';

      if (nounMeaning) {
        meaningString += `\nNoun: ${nounMeaning}\n`;
      }

      if (verbMeaning) {
        meaningString += `\nVerb: ${verbMeaning}\n`;
      }

      // Return the string with meanings
      return meaningString;
    } else {
      return 'No meanings for the word you gave.';
    }
  } catch (error) {
    // Handle any errors that happen during the API request
    console.error('Error:', error.message);
    return 'Got error when fetching the word meaning.';
  }
}

app.listen(3000, () => {
  console.log('Listening on Port 3000');
});
