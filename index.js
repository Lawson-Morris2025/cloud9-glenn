const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
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

// In-memory channel store (defaults to 'welcome' if not set via command)
const welcomeChannels = new Map();

client.once('ready', async () => {
  console.log(`Glenn Sturgis is on the clock! Logged in as ${client.user.tag}`);

  const data = [
    {
      name: 'set',
      description: 'Configure bot settings',
      options: [
        {
          name: 'welcome',
          description: 'Set the channel where Glenn welcomes new members',
          type: 7, // Channel type
          required: true,
          channel_types: [0] // GuildText
        }
      ]
    },
    {
      name: 'test',
      description: 'Test bot features',
      options: [
        {
          name: 'welcome',
          description: 'Test Glenn\'s welcome message',
          type: 1, // Subcommand type
          required: false
        }
      ]
    }
  ];

  await client.application.commands.set(data);
});

// --- 3. Slash Commands Handling ---
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // --- /set welcome [channel] ---
  if (interaction.commandName === 'set' && interaction.options.getSubcommand() === 'welcome') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: 'Oh goodness, you need Administrator permissions to reassign Glenn!', ephemeral: true });
    }

    const channel = interaction.options.getChannel('welcome');
    welcomeChannels.set(interaction.guildId, channel.id);

    return interaction.reply({ content: `*(Glenn smiles warmly)* "All set! I will now greet all new shoppers in ${channel}."`, ephemeral: true });
  }

  // --- /test welcome ---
  if (interaction.commandName === 'test' && interaction.options.getSubcommand() === 'welcome') {
    const customChannelId = welcomeChannels.get(interaction.guildId);
    const welcomeChannel = customChannelId 
      ? interaction.guild.channels.cache.get(customChannelId)
      : interaction.guild.channels.cache.find(c => c.name === 'welcome') || interaction.channel;

    const welcomeMessage = `Welcome <@${interaction.user.id}> to Cloud 9, have a heavenly day!\n\n` +
      `https://y.yarn.co/c9d356bc-6322-439e-9f60-ec505431811f_text.gif`;

    await welcomeChannel.send(welcomeMessage);
    return interaction.reply({ content: `Test welcome message sent to ${welcomeChannel}!`, ephemeral: true });
  }
});

// --- 4. Automatic Welcome Greeter ---
client.on('guildMemberAdd', async member => {
  const customChannelId = welcomeChannels.get(member.guild.id);
  const welcomeChannel = customChannelId 
    ? member.guild.channels.cache.get(customChannelId)
    : member.guild.channels.cache.find(c => c.name === 'welcome');

  if (!welcomeChannel) return;

  const welcomeMessage = `Welcome <@${member.id}> to Cloud 9, have a heavenly day!\n\n` +
    `https://y.yarn.co/c9d356bc-6322-439e-9f60-ec505431811f_text.gif`;

  await welcomeChannel.send(welcomeMessage);
});

client.login(process.env.DISCORD_TOKEN);
