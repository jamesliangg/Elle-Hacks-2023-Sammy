cohere_key = process.env.COHERE_API_KEY;
const cohere = require("cohere-ai");
cohere.init(cohere_key);
const exampleData = require('../static/examples.json');
const examples = JSON.parse(JSON.stringify(exampleData));

async function cohereSummary (input) {
  // Cohere summary
  console.log(examples);
  const summarize = await cohere.generate({model: "xlarge",
    prompt: input,
    max_tokens: 10,
    temperature: 0.8,
    stop_sequences: ["--"]
  });
  return summarize;
}

async function cohereSentiment (input) {
  input = [input];
  // analyze sentiment of messages
  const sentiment = await cohere.classify({
    inputs: input,
    examples: examples,
  }); 
  return sentiment;
}

module.exports.cohereSummary = cohereSummary;
module.exports.cohereSentiment = cohereSentiment;