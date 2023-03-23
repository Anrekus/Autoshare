const Discord = require("discord.js-selfbot-v13");
const mongoose = require("mongoose");
const simpledbmongo = require("./simpledbmongo/index");
const config = require("./config.json");
const db = new simpledbmongo({
  name: config.database.name,
});

// connect database
mongoose.connect(config.mongourl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const client = new Discord.Client({
  checkUpdate: false,
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  let data = await db.all();
  if (!data.length) return console.log("No channels in the list!");
  data = data.map((d) => {
    const channel = client.channels.cache.get(d._id);
    if (!channel) return;
    return {
      channel,
      duration: d.data.duration,
      msg: d.data.msg,
    };
  });

  data.forEach((d) => {
    if (!["s", "m", "h", "d"].includes(d.duration.slice(-1))) return;
    if (!d.channel) return;
    if (!d.msg) return;
    if (!d.channel.isText()) return;
    if (!d.channel.viewable) return;
    if (!d.channel.permissionsFor(client.user).has("SEND_MESSAGES")) return;
    setInterval(() => {
      d.channel.send(d.msg);
      console.log(
        `[SUCCESS] Sent message to ${d.channel.name} - ${d.channel.guild.name}`
      );
    }, ms(d.duration));
  });
  function ms(duration) {
    const a = duration.slice(-1);
    const b = duration.slice(0, -1);
    if (a === "s") return b * 1000;
    if (a === "m") return b * 60 * 1000;
    if (a === "h") return b * 60 * 60 * 1000;
    if (a === "d") return b * 24 * 60 * 60 * 1000;
  }
});

client.on("messageCreate", async (message) => {
  if (!config.owners.includes(message.author.id)) return;
  if (!message.content.startsWith(config.prefix)) return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    const msg = await message.channel.send("Pinging...");
    msg.edit(
      `Pong! Latency is **${
        msg.createdTimestamp - message.createdTimestamp
      }ms**. API Latency is **${Math.round(client.ws.ping)}ms**`
    );
  }

  if (command === "add") {
    const channel = message.mentions.channels.first();
    if (!channel) return message.channel.send("Please mention a channel!");
    const duration = args[1];
    if (!duration) return message.channel.send("Please specify a duration!");
    if (!["s", "m", "h", "d"].includes(duration.slice(-1)))
      return message.channel.send("Please specify a valid duration!");
    const msg = args.slice(2).join(" ");
    if (!msg) return message.channel.send("Please specify a message!");
    db.set(channel.id, {
      duration,
      msg,
    });
    return message.channel.send(`Added ${channel} to the autoshare list`);
  }

  if (command === "list") {
    let data = await db.all();
    if (!data.length) return message.channel.send("No channels in the list!");
    data = data.map((d) => {
      const channel = client.channels.cache.get(d._id);
      if (!channel) return;
      return `${channel} - ${d.data.duration} - ${d.data.msg}`;
    });
    message.channel.send(`${data.join("\n")}`);
  }

  // create command refresh to refresh the interval
  if (command === "refresh") {
    client.destroy();
    client.login(config.token);
  }
});

client.login(config.token);
