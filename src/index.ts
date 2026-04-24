import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  TextBasedChannel,
} from "discord.js";

import cron from "node-cron";

import { CONFIG } from "./config.js";
import { buildEdaMessage, edaCommand } from "./commands/eda.js";
import { loadCommands } from "./file.js";

function isSendableTextChannel(ch: unknown): ch is TextBasedChannel {
  return !!ch && typeof (ch as any).send === "function";
}

async function start() {
  const commands = await loadCommands();

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once("ready", async () => {
    if (!client.user) return;

    if (CONFIG.debug) {
      console.log("Bot ID:", client.user.id);
      console.log(
        "Guilds que o bot vê:",
        client.guilds.cache.map((g) => `${g.name}(${g.id})`).join(", "),
      );
    }

    const rest = new REST({ version: "10" }).setToken(CONFIG.discordToken);

    await rest.put(
      Routes.applicationGuildCommands(client.user.id, CONFIG.guildId),
      {
        body: commands.map((c) => c.data.toJSON()),
      },
    );

    console.log(
      `Logado como ${client.user.tag}. ${commands.length} comando(s) registrado(s) na guild ${CONFIG.guildId}.`,
    );

    // 🔹 Cron diário (09:00 America/Sao_Paulo)
    cron.schedule(
      "0 9 * * *",
      async () => {
        try {
          if (!CONFIG.channelId) {
            if (CONFIG.debug)
              console.log("Cron: CONFIG.channelId não configurado, pulando.");
            return;
          }

          const channel = await client.channels.fetch(CONFIG.channelId);

          if (!isSendableTextChannel(channel)) {
            console.error(
              `Cron: channelId ${CONFIG.channelId} não é um canal enviável.`,
            );
            return;
          }

          const eda = commands.find((c) => c.data.name === "eda");
          if (!eda) return;

          const msg = await buildEdaMessage();

          await channel.send({ content: msg });
        } catch (e) {
          console.error("Cron falhou:", e);
        }
      },
      { timezone: "America/Sao_Paulo" },
    );
  });

  client.on("interactionCreate", async (interaction) => {
    try {
      if (!interaction.isChatInputCommand()) return;

      const command = commands.find(
        (c) => c.data.name === interaction.commandName,
      );

      if (!command) return;

      await command.execute(interaction);
    } catch (err) {
      console.error(err);

      if (interaction.isRepliable()) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        const content = `Erro ao executar /${interaction.commandName}: ${msg}`;

        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content });
        } else {
          await interaction.reply({ content, ephemeral: true });
        }
      }
    }
  });

  client.on("error", console.error);
  process.on("unhandledRejection", console.error);

  await client.login(CONFIG.discordToken);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
