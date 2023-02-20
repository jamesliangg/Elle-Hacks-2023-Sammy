# Sammy
<img src="readme/thumbnail.png" alt="logo" width="100"/>
<br><br>

[<img src="https://open.autocode.com/static/images/open.svg?" width="192">](https://autocode.com/jliang/templates/elle-hacks/)

## What it does
- Summarizes Discord channel of choice (up to 100 messages)
- Generates an image from summary
- Analyzes sentiment and provides a negative or positive rating
- Displays a scoreboard from how often individuals spoke

## Requirements
- OpenAI API Key
- Stability AI API Key
- co:here API key

***
## Using the bot
After [linking the bot to Discord](https://autocode.com/guides/how-to-build-a-discord-bot/), you can add it to your server.
The bot only requires the ability to read and write messages. You can modify its role so that it can't read every channel.

Use the command `/summary` to call the bot.
There are two parameters you need to fill in:
- channel_name - the name of the channel you want summarized
- summarization_ai - True for OpenAI or False for co:here summarization

The bot response will be outputted to the channel you issue the command.

## Credits
Made for ElleHacks 2023 by:
- James Liang
- Cindy Yin
- Brandi Chen

## Links
[ElleHacks 2023 Devpost](https://devpost.com/software/sammy) | [GitHub](https://github.com/jamesliangg/Elle-Hacks-2023-Sammy)

## Reference links
- https://autocode.com/tools/discord/command-builder/
- https://discord.com/developers/applications
- https://autocode-studios.notion.site/Autocode-ElleHacks-2023-b418705c9df84c2e9e34ca99fe99f98f
- https://autocode.com/guides/how-to-build-a-discord-bot/
- https://autocode.com/openai/snippets/cachsnpt_u3EXvKT27Xh1zFEYwJVK4r8KGd68NiMJhUHy/
- https://autocode.com/stabilityai/snippets/cachsnpt_brPPWjXtN7cpeQyLbKPpHjVf7YjiVwThAajq/
- https://autocode.com/discord/api/
- https://docs.autocode.com/building-endpoints/requiring-files/