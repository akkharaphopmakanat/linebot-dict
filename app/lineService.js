const axios = require("axios");

async function handleEvent(event, client) {
  console.log(event);
  console.log(event.message.text);

  try {
    const meaning = await getWordMeaning(event.message.text);
    client.replyMessage(event.replyToken, { type: "text", text: meaning });
  } catch (error) {
    console.error(error);
  }
}

async function getWordMeaning(word) {
  try {
    const response = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = response.data;

    // Check if the API response got any meanings or not
    if (data.length > 0) {
      let nounMeaning = "";
      let verbMeaning = "";

      // Find the [0] of noun and verb meanings, if got one to make result like Example Situation
      for (const meaning of data[0].meanings) {
        if (meaning.partOfSpeech === "noun" && !nounMeaning) {
          nounMeaning = meaning.definitions[0].definition;
        } else if (meaning.partOfSpeech === "verb" && !verbMeaning) {
          verbMeaning = meaning.definitions[0].definition;
        }

        // If both noun and verb meanings found, then break the loop
        if (nounMeaning && verbMeaning) {
          break;
        }
      }

      // Create the final string with the meanings
      let meaningString = "";

      if (nounMeaning) {
        meaningString += `\nNoun: ${nounMeaning}\n`;
      }

      if (verbMeaning) {
        meaningString += `\nVerb: ${verbMeaning}\n`;
      }

      // Return the string with meanings
      return meaningString;
    } else {
      return "No meanings for the word you gave.";
    }
  } catch (error) {
    // Handle any errors that happen during the API request
    console.error("Error:", error.message);
    return "Got an error when fetching the word meaning.";
  }
}

module.exports = {
  handleEvent,
  getWordMeaning,
};
