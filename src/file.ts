import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Command } from "./types/command.model";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isCommand(obj: any): obj is Command {
  return (
    obj &&
    typeof obj === "object" &&
    "data" in obj &&
    "execute" in obj &&
    typeof obj.execute === "function"
  );
}

export async function loadCommands(): Promise<Command[]> {
  const commands: Command[] = [];

  const commandsPath = path.join(__dirname, "commands");
  const files = fs.readdirSync(commandsPath);

  for (const file of files) {
    if (!file.endsWith(".js")) continue;

    const fullPath = path.join(commandsPath, file);
    const module = await import(pathToFileURL(fullPath).href);

    const command = Object.values(module).find(isCommand);

    if (!command) {
      console.warn(`Arquivo ${file} não exporta comando válido.`);
      continue;
    }

    commands.push(command);
  }

  return commands;
}
