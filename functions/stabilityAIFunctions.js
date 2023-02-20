const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

async function generateImage (prompt) {
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
  return imageResult;
}

module.exports.generateImage = generateImage;