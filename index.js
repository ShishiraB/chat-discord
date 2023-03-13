require('dotenv/config');
const { Client , IntentsBitField, Message } = require('discord.js');
const { Configuration, OpenAIApi} = require('openai');

const bot = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

bot.on('ready', () => {
    console.log('Bot is Online')
});

const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
})
const openai = new OpenAIApi(configuration);
let conversationalLog = [{ role: 'system',content: "I am an AI bot"}];

bot.on('messageCreate', async (message) =>{
    if (message.author.bot) return;
    if (message.channelId != process.env.CHANNEL_ID) return;
    if (message.content.startsWith(".")) return;
    
    await message.channel.sendTyping();

    let prevmsg = await message.channel.messages.fetch({ limit: 15 });
    prevmsg.reverse();

    prevmsg.forEach((msg) => {
        if (message.content.startsWith(".")) return;
        if (msg.author.id != bot.user.id && message.author.bot) return;
        if (msg.author.id != message.author.id) return;

        conversationalLog.push({
            role: 'user',
            content: message.content,
        });
    });

    conversationalLog.push({
        role: 'user',
        content: message.content,
    })
    const result = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationalLog,
    })
    message.reply(result.data.choices[0].message);
})

bot.login(process.env.TOKEN);