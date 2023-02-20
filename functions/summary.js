// authenticates you with the API standard library
// type `await lib.` to display API autocomplete
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
// add AI functions
const cohereFunctions = require('./cohereFunctions.js');
const openAIFunctions = require('./openAIFunctions.js');
const stabilityAIFunctions = require('./stabilityAIFunctions.js');
// creating variables
let channelQuery = await context.params.event.data.options[0].value;
console.log(channelQuery);
var channelText = "";
var outputMessage = "";
var authors = new Array;
var orderedAuthors = new Array;
var totalMessages = 0;
let imageResult;

// make API request and get last 100 messages
let result = await lib.discord.channels['@0.3.4'].messages.list({
  channel_id: channelQuery,
  limit: 100
});

// get queried channel information
let channelResult = await lib.discord.channels['@0.3.4'].retrieve({
  channel_id: channelQuery // required
});

// find the oldest message
let oldestMessage = result[result.length - 1];
console.log(oldestMessage);
outputMessage += "**Who talked the most?**";

// find the authors of messages
for (var i in result) {
  channelText += " " + result[i].content;
  const messageAuthor = String(result[i].author.username);
  if (!authors.includes(String(messageAuthor))) {
    authors.push(messageAuthor, 1);
  }
  else {
    authors[authors.indexOf(messageAuthor) + 1]++;
  }
  totalMessages++;
}
console.log(authors);

// find total messages sent by each author
for (var i in authors) {
  if (i%2==0) {
    var total = i++;
    orderedAuthors.push([authors[total], parseFloat((authors[i]/totalMessages*100).toFixed(2))]);
  }
}

// sort from highest to lowest sent messages
orderedAuthors.sort((a, b) => (b[0] - a[0]) || (b[1] - a[1]));
console.log(orderedAuthors);
for (var i  in orderedAuthors) {
  var output = "- **" + orderedAuthors[i][0] + "** spoke " + orderedAuthors[i][1] + "% of the time";
  outputMessage += "\n" +  output;
}

// parameter that picks which AI to summarize with
let summarySelection = await context.params.event.data.options[1].value;
console.log(summarySelection);

// generates summary - true is OpenAI, false is Cohere
if (summarySelection) {
  // OpenAI summary
  const completion = await openAIFunctions.openAISummary(channelText);
  // analyze sentiment of messages
  const sentiment = await cohereFunctions.cohereSentiment(channelText);
  // summary text
  let messageResponse = completion.choices[0].text;
  outputMessage += "\n\n**Sentiment:** " + sentiment.body.classifications[0].prediction + "\n**Confidence:** " + sentiment.body.classifications[0].confidence;
  outputMessage += "\n**Summary:** \`\`\`" + messageResponse.trim() + "\`\`\`";
  // prompt for image generation
  prompt = messageResponse;
}
else {
  // cohere summary
  const summarize = await cohereFunctions.cohereSummary(channelText);
  // analyze sentiment of messages
  const sentiment = await cohereFunctions.cohereSentiment(channelText);
  outputMessage += "\n\n**Sentiment:** " + sentiment.body.classifications[0].prediction + "\n**Confidence:** " + sentiment.body.classifications[0].confidence;
  outputMessage += "\n**Summary:** \`\`\`" + summarize.body.generations[0].text.trim() + "\`\`\`";
  // prompt for image generation
  prompt = summarize.body.generations[0].text.trim();
}
console.log(outputMessage);

// add oldest analyzed message
outputMessage += "\nOldest message analyzed: \"" + oldestMessage.content + "\" by " + oldestMessage.author.username + " at " + oldestMessage.timestamp,

// remove special symbols and @ so people aren't mentioned
outputMessage = outputMessage.replace(/(?<=\<)(.*?)(?=\>)/g, "");
outputMessage = outputMessage.replace(/@/g, '');

// bot writes message in Discord
await lib.discord.channels['@0.3.0'].messages.create({
  channel_id: context.params.event.channel_id,
  content: "",
  embeds: [{
    "type": "rich",
    "title": channelResult.name + " Analysis",
    "description": outputMessage,
    "color": 0x006400
  }]
});

// generate AI image
imageResult = await stabilityAIFunctions.generateImage(prompt);

// Changes "beautiful scenery, 50mm" to "beautiful-scenery-50mm"
let filename = prompt.replace(/[^A-Za-z0-9]+/gi, '-');

// bot sends image in Discord
let editMessageResponse = await lib.discord.channels['@0.3.4'].messages.create({
  channel_id: context.params.event.channel_id,
  content: "",
  attachments: [{
    file: imageResult.artifacts[0].image,
    filename: `${filename}.png`,
    description: prompt
  }]
});