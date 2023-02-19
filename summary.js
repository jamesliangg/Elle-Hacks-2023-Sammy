// authenticates you with the API standard library
// type `await lib.` to display API autocomplete
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
// creating variables
let channelQuery = await context.params.event.data.options[0].value;
console.log(channelQuery);
var channelText = "";
var outputMessage = "";
var authors = new Array;
var totalMessages = 0;
var orderedAuthors = new Array;
let imageResult;
cohere_key = process.env.COHERE_API_KEY;
const cohere = require("cohere-ai");
cohere.init(cohere_key);
const examples = [
  {text: "fine", label: "positive"},
  {text: "great", label: "positive"},
  {text: "Whoa", label: "positive"},
  {text: "got it", label: "positive"},
  {text: "amazing", label: "positive"},
  {text: "friend", label: "positive"},
  {text: "lmao", label: "positive"},
  {text: "lol", label: "positive"},
  {text: "haha", label: "positive"},
  {text: "love that for you", label: "positive"},
  {text: "I live for that", label: "positive"},
  {text: "🎉 ", label: "positive"},
  {text: "🔥  ", label: "positive"},
  {text: "sleep", label: "neutral"},
  {text: "bro", label: "neutral"},
  {text: "trying", label: "neutral"},
  {text: "its alright", label: "neutral"},
  {text: "ok", label: "neutral"},
  {text: "maybe", label: "neutral"},
  {text: "bud", label: "neutral"},
  {text: "idk", label: "neutral"},
  {text: "😭 ", label: "negative"},
  {text: "💀 ", label: "negative"},
  {text: "👀 ", label: "negative"},
  {text: "spam", label: "negative"},
  {text: "late", label: "negative"},
  {text: "weak", label: "negative"},
  {text: "miss", label: "negative"},
  {text: "fuck", label: "negative"},
  {text: "oof", label: "negative"},
  {text: "shit", label: "negative"},
  {text: "That was so bad", label: "negative"},
  {text: "I hated it", label: "negative"},
]

// make API request and get last 100 messages
let result = await lib.discord.channels['@0.3.4'].messages.list({
  channel_id: channelQuery,
  limit: 100
});

// get queried channel information
let channelResult = await lib.discord.channels['@0.3.4'].retrieve({
  channel_id: channelQuery // required
});
// outputMessage += "**Channel: " + channelResult.name+"**";

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
    // console.log(authors[i]);
    orderedAuthors.push([authors[total], parseFloat((authors[i]/totalMessages*100).toFixed(2))]);
    // var output = "- **" + authors[total] + "** spoke " + (authors[i]/totalMessages*100).toFixed(2) + "% of the time";
    // outputMessage += "\n" +  output;
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
// convert to array for Cohere analysis
const channelTextArray = [channelText];

// generates summary - true is OpenAI, false is Cohere
if (summarySelection) {
  let completion = await lib.openai.playground['@0.0.2'].completions.create({
    model: `text-davinci-003`,
    prompt: ["summarize " + channelText],
    max_tokens: 40,
    temperature: 0.5,
    top_p: 1,
    n: 1,
    echo: false,
    presence_penalty: 0,
    frequency_penalty: 0,
    best_of: 1
  });
  // let topKeywords = await lib.openai.playground['@0.0.2'].completions.create({
    // model: `text-davinci-003`,
    // prompt: ["please find the top 5 most common words " + channelText],
    // max_tokens: 40,
    // temperature: 0.5,
    // top_p: 1,
    // n: 1,
    // echo: false,
    // presence_penalty: 0,
    // frequency_penalty: 0,
    // best_of: 1
  // });
  // analyze sentiment of messages
  const sentiment = await cohere.classify({
    inputs: channelTextArray,
    examples: examples,
  });
  // summary text
  console.log(sentiment);
  let messageResponse = completion.choices[0].text;
  outputMessage += "\n\n**Sentiment:** " + sentiment.body.classifications[0].prediction + "\n**Confidence:** " + sentiment.body.classifications[0].confidence;
  outputMessage += "\n**Summary:** \`\`\`" + messageResponse.trim() + "\`\`\`";
  // prompt for image generation
  prompt = messageResponse;
  console.log(messageResponse);
  // console.log(topKeywords.choices[0].text);
  // outputMessage += "\n**Top Words:** \n" + topKeywords.choices[0].text.trim();
}
else {
  // Cohere summary
  const summarize = await cohere.generate({model: "xlarge",
    prompt: channelText,
    max_tokens: 10,
    temperature: 0.8,
    stop_sequences: ["--"]
  });
  // analyze sentiment of messages
  const sentiment = await cohere.classify({
    inputs: channelTextArray,
    examples: examples,
  });
  outputMessage += "\n\n**Sentiment:** " + sentiment.body.classifications[0].prediction + "\n**Confidence:** " + sentiment.body.classifications[0].confidence;
  outputMessage += "\n**Summary:** \`\`\`" + summarize.body.generations[0].text.trim() + "\`\`\`";
  // prompt for image generation
  prompt = summarize.body.generations[0].text.trim();
}
console.log(outputMessage);
// remove special symbols and @ so people aren't mentioned
outputMessage = outputMessage.replace(/(?<=\<)(.*?)(?=\>)/g, "");
outputMessage = outputMessage.replace(/@/g, '');
// bot writes message in Discord
await lib.discord.channels['@0.3.0'].messages.create({
  channel_id: context.params.event.channel_id,
  content: "",
  // content: `Pogers!`,
  // content: outputMessage,
  embeds: [{
    "type": "rich",
    "title": channelResult.name + " Analysis",
    "description": outputMessage + "\nOldest message analyzed: \"" + oldestMessage.content + "\" by " + oldestMessage.author.username + " at " + oldestMessage.timestamp,
    "color": 0x006400
  }]
});

// generation of image with Stability AI
try {
  imageResult = await lib.stabilityai.api['@0.1.2'].generation.txt2img({
    model: 'stable-diffusion-v1-5',
    prompts: [
      {
        'text': prompt,
        'weight': 1
      }
    ],
    images: 1,
    steps: 30,
    cfg: 7.5,
    width: 512,
    height: 512,
    sampler: 'AUTO',
    guidance: true
  });
} catch (e) {
  let editMessageResponse = await lib.discord.channels['@0.3.4'].messages.create({
    channel_id: context.params.event.channel_id,
    content: `Sorry, I couldn't generate an image for **${prompt}**.`,
    embeds: [
      {
        "type": "rich",
        "title": `Error with Stability AI API`,
        "description": e.message,
        "color": 0xff4444
      }
    ]
  });
}

// Changes "beautiful scenery, 50mm" to "beautiful-scenery-50mm"
let filename = prompt.replace(/[^A-Za-z0-9]+/gi, '-');

// bot sends image in Discord
let editMessageResponse = await lib.discord.channels['@0.3.4'].messages.create({
  channel_id: context.params.event.channel_id,
  // content: `**\"${prompt}\"**`,
  content: "",
  attachments: [{
    file: imageResult.artifacts[0].image,
    filename: `${filename}.png`,
    description: prompt
  }]
});