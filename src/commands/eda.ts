import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

import { CONFIG } from "../config.js";
import { scrapeSpiritPage } from "../scrape.js";
import { formatSinceHuman } from "../time-format.js";

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

export async function buildEdaMessage(): Promise<string> {
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

export const edaCommand = {
  data: new SlashCommandBuilder()
    .setName("eda")
    .setDescription(
      "Mostra há quanto tempo 'Espiões de Aluguel' está sem atualização.",
    ),

   execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();
    const content = await buildEdaMessage();
    await interaction.editReply({ content });
  },
};