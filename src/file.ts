import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommands() {
  const commands = [];

  const commandsPath = path.join(__dirname, "commands");
  const files = fs.readdirSync(commandsPath);

  for (const file of files) {
    if (!file.endsWith(".js")) continue;

    const fullPath = path.join(commandsPath, file);

    const module = await import(pathToFileURL(fullPath).href);

    const command = Object.values(module).find(
      (exp: any) => exp?.data && exp?.execute,
    );

    if (!command) {
      console.warn(`Arquivo ${file} não exporta comando válido.`);
      continue;
    }

    commands.push(command);
  }

  return commands;
}