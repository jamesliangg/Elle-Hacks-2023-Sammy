// authenticates you with the API standard library
// type `await lib.` to display API autocomplete
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
let channelQuery = await context.params.event.data.options[0].value;
console.log(channelQuery);
var channelText = "";
var outputMessage = "";
var authors = new Array;
var totalMessages = 0;

// make API request
let result = await lib.discord.channels['@0.3.4'].messages.list({
  // channel_id: '<#1076522205053210758>', // required
  channel_id: channelQuery,
  limit: 100
});

// output channel name
let channelResult = await lib.discord.channels['@0.3.4'].retrieve({
  channel_id: channelQuery // required
});
outputMessage += "**Channel: " + channelResult.name+"**";

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

for (var i in authors) {
  if (i%2==0) {
    var total = i++;
    // console.log(authors[i]);
    
    var output = "**" + authors[total] + "** spoke " + (authors[i]/totalMessages*100).toFixed(2) + "% of the time";
    outputMessage += "\n" +  output;
  }
}

outputMessage = outputMessage.replace(/(?<=\<)(.*?)(?=\>)/g, "");
outputMessage = outputMessage.replace(/@/g, '');

let summarySelection = await context.params.event.data.options[1].value;
console.log(summarySelection);

console.log("TestP1" + outputMessage);
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
  let messageResponse = completion.choices[0].text;
  outputMessage += "\n**Summary:** " + messageResponse;
  prompt = messageResponse;
  console.log(messageResponse);
}
else {
  cohere_key = process.env.COHERE_API_KEY
  const cohere = require("cohere-ai");
  cohere.init(cohere_key)
  channelTextArray = [channelText];
  const examples = [
    {text: "The order came 5 days early", label: "positive"},
    {text: "The item exceeded my expectations", label: "positive"},
    {text: "I ordered more for my friends", label: "positive"},
    {text: "I would buy this again", label: "positive"},
    {text: "I would recommend this to others", label: "positive"},
    {text: "The package was damaged", label: "negative"},
    {text: "The order is 5 days late", label: "negative"},
    {text: "The order was incorrect", label: "negative"},
    {text: "I want to return my item", label: "negative"},
    {text: "The item\'s material feels low quality", label: "negative"},
    {text: "The product was okay", label: "neutral"},
    {text: "I received five items in total", label: "neutral"},
    {text: "I bought it from the website", label: "neutral"},
    {text: "I used the product this morning", label: "neutral"},
    {text: "The product arrived yesterday", label: "neutral"},
  ]
  const summarize = await cohere.generate({model: "xlarge",
    prompt: channelText,
    max_tokens: 10,
    temperature: 0.8,
    stop_sequences: ["--"]
  });
  const toxicity = await cohere.classify({
    inputs: channelTextArray,
    examples: examples,
  });
  outputMessage += "\n**Summary:** " + summarize.body.generations[0].text.trim();
  outputMessage += "\n**Sentiment:** " + toxicity.body.classifications[0].prediction + "\n**Confidence:** " + toxicity.body.classifications[0].confidence;
  prompt = summarize.body.generations[0].text.trim();
}
console.log("TestP2" + outputMessage);
await lib.discord.channels['@0.3.0'].messages.create({
  channel_id: context.params.event.channel_id,
  // content: `Pog!`
  content: outputMessage
});

let imageResult;

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

let editMessageResponse = await lib.discord.channels['@0.3.4'].messages.create({
  channel_id: context.params.event.channel_id,
  content: `**\"${prompt}\"**!`,
  attachments: [{
    file: imageResult.artifacts[0].image,
    filename: `${filename}.png`,
    description: prompt
  }]
});