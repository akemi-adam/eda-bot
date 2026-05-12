import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "./types/command.model";

export function createHelpCommand(commands: Command[]): Command {
  return {
    data: new SlashCommandBuilder()
      .setName("help")
      .setDescription("Lista todos os comandos disponíveis"),

    async execute(interaction: ChatInputCommandInteraction) {
      await interaction.deferReply();

      const lines: string[] = [];

      for (const cmd of commands.filter((c) => c.data.name !== "help")) {
        const data = cmd.data.toJSON();

        let line = `/**${data.name}** - *${data.description}*`;

        if (data.options && data.options.length > 0) {
          const opts = data.options
            .map((opt: any) => {
              const required = opt.required ? "(obrigatório)" : "(opcional)";
              return `\t• **${opt.name}**: *${opt.description}* ${required}`;
            })
            .join("\n");

          line += `\n${opts}`;
        }

        lines.push(line);
      }

      const content = lines.join("\n\n");

      await interaction.editReply({ content });
    },
  };
}
