import "dotenv/config";

export const CONFIG = {
  discordToken: process.env.DISCORD_TOKEN ?? "",
  guildId: process.env.GUILD_ID ?? "",
  targetUrl:
    "https://www.spiritfanfiction.com/historia/espioes-de-aluguel-14666858",
};

if (!CONFIG.discordToken)
  throw new Error("DISCORD_TOKEN não configurado no .env");
if (!CONFIG.guildId) throw new Error("GUILD_ID não configurado no .env");
