import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

import { CONFIG } from "./config.js";
import { scrapeSpiritPage } from "./scrape.ts";
import { formatSince } from "./time-format.ts";

const command = new SlashCommandBuilder()
  .setName("eda")
  .setDescription("Mostra há quanto tempo 'Espiões de Aluguel' está sem atualização.");

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(CONFIG.discordToken);

  await rest.put(
    Routes.applicationGuildCommands(
      // applicationId é o id do bot (client.user.id). A gente registra depois de logar,
      // então aqui vamos registrar em runtime na função start.
      // Esta função será chamada com o appId.
      "" as unknown as string,
      CONFIG.guildId
    ),
    { body: [command.toJSON()] }
  );
}

function cobrançaMessage(lastUpdaterUser: string): string | null {
  if (lastUpdaterUser === "akeml") {
    return "O vagabundo Ganestgamer11 está devendo o próximo capítulo! Deixe esse pobre cadáver em paz e vá escrever!";
  }
  if (lastUpdaterUser === "Ganestgamer11") {
    return "A vagabunda akeml está devendo o próximo capítulo! Tire esses cachorros da panela e vá escrever!";
  }
  return null;
}

async function onEdaCommand(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const { updatedAt, lastUpdaterUser } = await scrapeSpiritPage(CONFIG.targetUrl);
  const now = new Date();

  const pretty = formatSince(updatedAt, now);

  const mainLine = `Fazem **${pretty.value}** que EDA não é atualizada`;
  const whoLine = `Última atualização por: **${lastUpdaterUser}**`;

  const cobrança = cobrançaMessage(lastUpdaterUser);

  const content = [mainLine, whoLine, cobrança].filter(Boolean).join("\n");

  await interaction.editReply({ content });
}

async function start() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once("ready", async () => {
    if (!client.user) return;

    // Registrar comandos (guild) agora que sabemos o applicationId
    const rest = new REST({ version: "10" }).setToken(CONFIG.discordToken);
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, CONFIG.guildId),
      { body: [command.toJSON()] }
    );

    console.log(`Logado como ${client.user.tag}. Comando /eda registrado em guild ${CONFIG.guildId}.`);
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

  await client.login(CONFIG.discordToken);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});