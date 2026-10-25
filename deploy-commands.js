import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });
dotenv.config(); // also fallback to bot/.env if present

const token = process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID || "1563536406431797409";
const guildId = process.env.DISCORD_DEV_GUILD_ID || "1550227368889684058";

if (!token) {
  console.error("Missing DISCORD_BOT_TOKEN / BOT_TOKEN environment variable!");
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder()
    .setName("status")
    .setDescription("View Discord Companion DevOps Sentinel live telemetry and health status"),
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot latency and gateway WebSocket heartbeat"),
  new SlashCommandBuilder()
    .setName("release")
    .setDescription("View the latest Discord Companion release (v1.1.0) and downloads"),
  new SlashCommandBuilder()
    .setName("hq")
    .setDescription("Display Companion Dev HQ telemetry channels and logging specs"),
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Display Sentinel commands and Discord Companion documentation links"),
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

export async function deployCommands() {
  try {
    console.log(`Deploying ${commands.length} application (/) commands to Guild ${guildId}...`);
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log(`Successfully registered guild slash commands for Guild ${guildId}!`);

    console.log(`Deploying ${commands.length} global application (/) commands...`);
    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });
    console.log("Successfully registered global slash commands!");
  } catch (err) {
    console.error("Error deploying commands:", err);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  deployCommands();
}
