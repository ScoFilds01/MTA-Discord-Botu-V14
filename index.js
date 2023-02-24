const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Gamedig = require("gamedig");
const { token, guildId, serverIp, serverPort } = require("./config.json");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
    new SlashCommandBuilder().setName("sunucu").setDescription("MTA sunucu istatistik komutu - Scofilds#6200"),
    new SlashCommandBuilder().setName("oyuncular").setDescription("Sunucudaki üyeleri gösterir")
];

const rest = new REST({ version: "10" }).setToken(token);

client.once("ready", () => {
    console.log(`${client.user.username} başladı ve hazır!`)

    setInterval(() => {
        Gamedig.query({
            type: "mtasa",
            host: serverIp,
            port: serverPort
        }).then((state) => {
            client.user.setActivity({ name: `Şuan sunucuda ${state.raw.numplayers} kişi`})
        }).catch(error => console.log(error));
    }, 5000);

    (async () => {
        try {
            console.log(`${commands.length} adet (/) komutu yenilenmeye başladı.`)
            const data = await rest.put(
                Routes.applicationGuildCommands(client.user.id, guildId),
                { body: commands },
            );

            console.log(`${data.length} adet (/) komutu başarıyla kaydedildi.`);
        } catch (error) {
            console.error(error);
        }
    })();
})

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand());

    const { commandName } = interaction;

    if (commandName === "sunucu") {
        Gamedig.query({
            type: "mtasa",
            host: serverIp,
            port: serverPort
        }).then(async (state) => {
            const embed = new EmbedBuilder()
            .setColor("DarkButNotBlack")
            .setTitle(state.name)
            .addFields(
                { name: "Harita:", value: `${state.map}`, inline: true },
                { name: "Oyun tipi:", value: `${state.raw.gametype}`, inline: true },
                { name: "Oyuncular:", value: `${state.raw.numplayers}/${state.maxplayers}`, inline: true },
                { name: "Gecikme süresi:", value: `${state.ping}ms`, inline: true },
                { name: "IP/Adres", value: `${state.connect}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `${interaction.member.user.tag} tarafından kullanıldı`, iconURL: interaction.member.avatarURL() })

            await interaction.reply({ embeds: [embed] })
        }).catch(error => console.log(error));
    }

    if (commandName === "oyuncular") {
        Gamedig.query({
            type: "mtasa",
            host: serverIp,
            port: serverPort
        }).then(async (state) => {
            var players = [];
            state.players.forEach(p => {
                players.push(`\`\`${p.name}\`\``)
            })

            console.log(players)
            if (players.length === 0) {
                return await interaction.reply("Şuan sunucuda kimse yok!")
            } else {
                return await interaction.reply(`${players}`)
            }
        })
    }
})

client.login(token)