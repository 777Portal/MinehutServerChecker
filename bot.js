// i made this because shopzzz kept crashing :/
const 
{ 
  channelId,
  loggingChannelId, // where the stuff like logins and usage of cmds will be logged
  token, 
  name, // name of mh server
  port,
  offlineRole,
  onlineRole,
  queueRole
} = require('./config.json');

const protocol = require('minecraft-protocol')

const { EmbedBuilder, WebhookClient, channelLink } = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js')
const { MessageContent, GuildMessages, Guilds } = GatewayIntentBits

const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] })

function sendEmbed(channelID, color, name, icon, desc, footer, thumbnail, ping, inline){
  var exampleEmbed = new EmbedBuilder()
  .setColor(color)
  .setAuthor({ name: name, iconURL: icon, url: 'https://github.com/777Portal' })
  .setDescription(desc)
  .setTimestamp()
  .setFooter({ text: footer });
  
  if(thumbnail != undefined || thumbnail != null){
    exampleEmbed.setThumbnail(thumbnail)
  }

  ping ? channelID.send({ content: `<@&${ping}>`, embeds: [exampleEmbed] }) : channelID.send({ embeds: [exampleEmbed] });

  // channelID.send({ embeds: [exampleEmbed] });
}
client.login(token);

let channel
let loggingChannel
// when discord client is ready, send login message
client.once('ready', (c) => {
  console.log(`Discord bot logged in as ${c.user.tag}`);
  channel = client.channels.cache.get(channelId);
  loggingChannel = client.channels.cache.get(loggingChannelId)

  sendEmbed(channel, 0x0000AA, "Discord client started!", "https://exonauto.me/assets/exonauto.png", "The discord client was successfully started", "logged into discord client");
})

var lastPlayersOnline = 1;
var lastMaxPlayers = 1;

function pingServer(){
  console.log('Pinging server')

  protocol.ping({ host:`${name}.minehut.gg`, port }, (err, pingResults) => { // Pinging server and getting result
    if (err) throw err;
    
    let // motd = JSON.stringify(pingResults.description.text), motd seems to be blank... i am unsure why.
          // ping = JSON.stringify(pingResults.latency), don't really need a ping ig
          playersOnline = JSON.stringify(pingResults.players.online),
          maxPlayers = JSON.stringify(pingResults.players.max)
          // favicon = pingResults.favicon it all looks the same but it is possible to use this in code.

    
    maxPlayers = maxPlayers ?? 999
    playersOnline = playersOnline ?? lastPlayersOnline

    console.log(playersOnline, maxPlayers)

    // minehut is bein fucking weird and randomly sending its own details instead of this servers.
    // to mitigate this, we will have to check last player count and check if its more then 100.
    // ill assume most servers won't have nearly as much as mh lobby, and account for the server starting up and having high player slots.
    if (maxPlayers - lastMaxPlayers > 1000 ) return;

    if ( playersOnline == 0 && lastPlayersOnline > 1 ) sendEmbed(channel, 0x000000, `${name} offline!`, "https://exonauto.me/assets/exonauto.png", `${name} is now offline`, "offline", null ,offlineRole);

    if ( playersOnline == 0 && maxPlayers == 0 && lastMaxPlayers != 0) sendEmbed(channel, 0xFFFF00, `${name} can be rebooted!`, "https://exonauto.me/assets/exonauto.png", `${name} can now by manually rebooted by players!`,"reboot");

    if ( playersOnline == 0 && maxPlayers != 0 && lastMaxPlayers == 0) sendEmbed(channel, 0xFFFF00, `${name} is starting!`, "https://exonauto.me/assets/exonauto.png", `${name} is currently being rebooted!`,"reboot");

    if ( lastPlayersOnline <= 0 && playersOnline >= 1 ) sendEmbed(channel, 0x00FF00, `${name} online!`, "https://exonauto.me/assets/exonauto.png", `${name} is now online`, "online", null,  onlineRole);
  
    if ( playersOnline < maxPlayers && lastPlayersOnline == maxPlayers) sendEmbed(channel, 0xFFFF00, `${name} open!`, "https://exonauto.me/assets/exonauto.png",  `${name} is now under max players! \n${playersOnline} / ${maxPlayers}`,"under max players", null, queueRole);
    
    if ( playersOnline == maxPlayers && lastPlayersOnline != playersOnline ) sendEmbed(channel, 0x960D0D, `${name} Full!`, "https://exonauto.me/assets/exonauto.png", `${name} is at max players! \n${playersOnline} / ${maxPlayers}`,"reached max players"); 

    lastPlayersOnline = playersOnline
    lastMaxPlayers = maxPlayers
  })
}

setInterval(() => {
  pingServer()
}, 1000 * 20);