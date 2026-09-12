const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const express = require('express');

// --- 1. Express Web Server (Required for Render) ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('😇 Glenn Sturgis is on the clock and ready to welcome shoppers!');
});

app.listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});

// --- 2. Discord Bot Setup ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

client.once('ready', () => {
  console.log(`Glenn Sturgis is on the clock! Logged in as ${client.user.tag}`);
});

// --- 3. Automatic Welcome Greeter ---
client.on('guildMemberAdd', async member => {
  const welcomeChannel = member.guild.channels.cache.find(c => c.name === 'welcome');
  if (!welcomeChannel) return;

  const welcomeMessage = `Welcome <@${member.id}> to Cloud 9, have a heavenly day!\n\n` +
    `https://y.yarn.co/c9d356bc-6322-439e-9f60-ec505431811f_text.gif`;

  await welcomeChannel.send(welcomeMessage);
});

client.login(process.env.DISCORD_TOKEN);
