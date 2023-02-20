const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

async function openAISummary (input) {
  let completion = await lib.openai.playground['@0.0.2'].completions.create({
    model: `text-davinci-003`,
    prompt: ["summarize " + input],
    max_tokens: 40,
    temperature: 0.5,
    top_p: 1,
    n: 1,
    echo: false,
    presence_penalty: 0,
    frequency_penalty: 0,
    best_of: 1
  });
  return completion;
}

module.exports.openAISummary = openAISummary;