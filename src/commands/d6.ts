import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export const d6Command = {
  data: new SlashCommandBuilder()
    .setName("d6")
    .setDescription("Rola um dado de 6 faces")
    .addBooleanOption((option) =>
      option
        .setName("critico")
        .setDescription("Rola 3 dados e verifica sucesso crítico")
        .setRequired(false),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const isCritico = interaction.options.getBoolean("critico");

    if (!isCritico) {
      const result = rollD6();
      await interaction.editReply({
        content: `Au, au! 🎲 Você rolou: **${result}**`,
      });
      return;
    }

    const rolls = [rollD6(), rollD6(), rollD6()];

    const success = rolls.every((r) => r > 3);

    const content = success
      ? `Au, au! 🎲 Rolagens: **${rolls.join(", ")}**\nAu, au! 🔥 Ação bem-sucedida!`
      : `Au, au! 🎲 Rolagens: **${rolls.join(", ")}**\nAu, au! Se lascou ganest fdp!`;

    await interaction.editReply({ content });
  },
};
