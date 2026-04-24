import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  TextBasedChannel,
} from "discord.js";

import cron from "node-cron";

import { CONFIG } from "./config.js";
import { scrapeSpiritPage } from "./scrape.js";
import { formatSinceHuman } from "./time-format.js";

const command = new SlashCommandBuilder()
  .setName("eda")
  .setDescription(
    "Mostra há quanto tempo 'Espiões de Aluguel' está sem atualização.",
  );

function mention(userId: string): string {
  return userId ? `<@${userId}>` : "(ID do Discord não configurado)";
}

function chargeMessage(lastUpdaterUser: string): string | null {
  const ganest = mention(CONFIG.ganestDiscordId);
  const akeml = mention(CONFIG.akemlDiscordId);

  if (lastUpdaterUser === "akeml")
    return `O vagabundo ${ganest} está devendo o próximo capítulo! Deixe esse pobre cadáver em paz e vá escrever!`;
  if (lastUpdaterUser === "Ganestgamer11")
    return `A vagabunda ${akeml} está devendo o próximo capítulo! Tire esses cachorros da panela e vá escrever!`;
  return null;
}

async function buildEdaMessage(): Promise<string> {
  const { updatedAt, lastUpdaterUser } = await scrapeSpiritPage(
    CONFIG.targetUrl,
  );
  const prettyHuman = formatSinceHuman(updatedAt, new Date());

  const mainLine = `Au, au! Fazem **${prettyHuman}** que EDA não é atualizada`;
  const whoLine = `Au, au! Última atualização por: **${lastUpdaterUser}**`;

  const charge = chargeMessage(lastUpdaterUser);
  const cobrançaLine = charge ? `Au, au! ${charge}` : null;

  return [mainLine, whoLine, cobrançaLine].filter(Boolean).join("\n");
}

async function onEdaCommand(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const content = await buildEdaMessage();
  await interaction.editReply({ content });
}

function isSendableTextChannel(ch: unknown): ch is TextBasedChannel {
  return !!ch && typeof (ch as any).send === "function";
}

async function start() {
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
      { body: [command.toJSON()] },
    );

    console.log(
      `Logado como ${client.user.tag}. Comando /eda registrado em guild ${CONFIG.guildId}.`,
    );

    // Cron diário (09:00 America/Sao_Paulo)
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
              `Cron: channelId ${CONFIG.channelId} não é um canal de texto enviável (ou não foi encontrado).`,
            );
            return;
          }

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
      if (interaction.commandName === "eda") {
        await onEdaCommand(interaction);
      }
    } catch (err) {
      console.error(err);
      if (interaction.isRepliable()) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        const content = `Erro ao executar /eda: ${msg}`;
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
