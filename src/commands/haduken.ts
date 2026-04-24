import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export const hadukenCommand = {
  data: new SlashCommandBuilder()
    .setName("haduken")
    .setDescription("Tenta a sorte... será que vem haduken?"),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    const roll = Math.floor(Math.random() * 100) + 1;

    const content = `Au, au! ${roll === 1 ? "VAI TER HADUKEN" : "ERROU!"}`;
    await interaction.editReply({ content });
  },
};
