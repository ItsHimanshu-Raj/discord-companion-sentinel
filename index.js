import {
  Client,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import http from "node:http";
import os from "node:os";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { deployCommands } from "./deploy-commands.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });
dotenv.config();

const token = process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN;
const port = parseInt(process.env.PORT || "10000", 10);
const startTime = Date.now();

if (!token) {
  console.error("CRITICAL: DISCORD_BOT_TOKEN / BOT_TOKEN is missing!");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

/* ---- Formatting Helpers --------------------------------------------------- */

function formatUptime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

function getMemoryUsage() {
  const mem = process.memoryUsage();
  return {
    rss: `${(mem.rss / 1024 / 1024).toFixed(1)} MB`,
    heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB`,
    heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(1)} MB`,
  };
}

/* ---- Bot Event Handlers --------------------------------------------------- */

client.once("ready", async () => {
  console.log(`====================================================`);
  console.log(`🤖 Companion DevOps Sentinel is ONLINE!`);
  console.log(`Logged in as: ${client.user.tag} (ID: ${client.user.id})`);
  console.log(`Connected to ${client.guilds.cache.size} guild(s)`);
  console.log(`Platform: ${process.platform} (${process.arch}) | Node: ${process.version}`);
  console.log(`====================================================`);

  // Set 24/7 Rich Presence
  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: "over Discord Companion | v2.1.2",
        type: ActivityType.Watching,
        state: "🛡️ 24/7 Sentinel Active • v2.1.2",
      },
    ],
  });

  // Ensure commands are deployed
  try {
    await deployCommands();
  } catch (err) {
    console.warn("Notice: deployCommands on ready:", err.message);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    if (commandName === "ping") {
      const sent = await interaction.reply({
        content: "📡 Pinging sentinel telemetry gateway...",
        fetchReply: true,
      });
      const latency = sent.createdTimestamp - interaction.createdTimestamp;
      const wsPing = client.ws.ping;

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("🏓 Pong! Sentinel Gateway Latency")
        .addFields(
          { name: "⚡ API Roundtrip", value: `\`${latency} ms\``, inline: true },
          { name: "💓 WebSocket Heartbeat", value: `\`${wsPing} ms\``, inline: true },
          { name: "🟢 Status", value: "`Healthy / Operational`", inline: true },
        )
        .setFooter({ text: "Discord Companion DevOps Sentinel" })
        .setTimestamp();

      await interaction.editReply({ content: null, embeds: [embed] });
    } else if (commandName === "status") {
      const uptimeMs = Date.now() - startTime;
      const mem = getMemoryUsage();
      const wsPing = client.ws.ping;

      const embed = new EmbedBuilder()
        .setColor(0x22c55e)
        .setTitle("🛡️ Discord Companion — DevOps Sentinel Status")
        .setDescription(
          "Real-time operational health, telemetry collector status, and release infrastructure monitoring.",
        )
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: "📦 Latest App Release", value: "`v2.1.2 (Definitive Production)`", inline: true },
          { name: "⏱️ Sentinel Uptime", value: `\`${formatUptime(uptimeMs)}\``, inline: true },
          { name: "📶 Gateway Ping", value: `\`${wsPing} ms\``, inline: true },
          { name: "🖥️ Host Environment", value: `\`${process.platform}-${process.arch}\` (Node \`${process.version}\`)`, inline: true },
          { name: "🧠 Memory Usage", value: `RSS: \`${mem.rss}\` (Heap: \`${mem.heapUsed}\`)`, inline: true },
          { name: "🔒 Privacy Mode", value: "`100% Local DPAPI / Keychain (Zero-PII)`", inline: true },
          {
            name: "🤖 COMPANION DEV HQ",
            value:
              "• `#💥-crash-stacktraces` — Panic & unhandled stacktrace catcher\n" +
              "• `#🔌-gateway-and-overlay-errors` — Opcode & Direct2D failure logs\n" +
              "• `#🐛-user-bug-reports` — In-app submitted bug tickets\n" +
              "• `#💬-support-and-feedback` — Feature suggestions & user questions\n" +
              "• `#🚀-ci-cd-builds` — Release publishing & SHA-256 logs\n" +
              "• `#📈-anonymous-app-metrics` — Aggregate daily app health heartbeats\n" +
              "• `#⚖️-legal-and-compliance-docs` — Global EULA, Privacy & Security terms",
            inline: false,
          },
        )
        .setFooter({ text: "Sentinel 24/7 Monitoring • Zero-Downtime Guarantee" })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("View Releases")
          .setStyle(ButtonStyle.Link)
          .setURL("https://github.com/ItsHimanshu-Raj/discord-companion-releases/releases/latest"),
        new ButtonBuilder()
          .setLabel("Update Manifest (JSON)")
          .setStyle(ButtonStyle.Link)
          .setURL("https://github.com/ItsHimanshu-Raj/discord-companion-releases/releases/latest/download/latest.json"),
      );

      await interaction.reply({ embeds: [embed], components: [row] });
    } else if (commandName === "release") {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("🚀 Discord Companion v2.1.2 Definitive Production Released")
        .setDescription(
          "The definitive v2.1.2 release is cryptographically signed with Minisign (`Ed25519`) and available with live remote config, zero-bloat process termination, and Raycast command palette.",
        )
        .addFields(
          { name: "Version Tag", value: "`v2.1.2`", inline: true },
          { name: "Channel", value: "`Stable / Public`", inline: true },
          { name: "Status", value: "🟢 Published & Live", inline: true },
          {
            name: "✨ Included Enhancements",
            value:
              "• **Zero WebView2 Background Bloat:** Window destruction kills `msedgewebview2.exe` (<6MB RAM / 0.0% CPU in tray).\n" +
              "• **In-Memory Hot State & WAL Actor:** <50µs state access with 2000ms async write-behind transaction batches.\n" +
              "• **Live Gateway Ping & Heartbeat ACK:** Real-time round-trip latency (`gateway_ping_ms`) and zombie socket recovery.\n" +
              "• **Raycast Command Palette (`Ctrl+K`):** Floating instant search across friends, Spotify history, and tabs.\n" +
              "• **Red-Team Hardened Security:** Strict HTML escaping, URL whitelisting, SSRF image lockdowns, and CSWSH prevention.\n" +
              "• **Global Compliance Suite:** Updated GDPR/UK-GDPR, CCPA, DPDP Act 2023, LGPD, PIPEDA, and APPI disclosures.",
            inline: false,
          },
          {
            name: "📥 Downloads",
            value:
              "• [macOS Installer (.dmg)](https://github.com/ItsHimanshu-Raj/discord-companion-releases/releases/download/v2.1.2/Discord-Companion_2.1.2_macOS.dmg)\n" +
              "• [Windows Setup (.exe)](https://github.com/ItsHimanshu-Raj/discord-companion-releases/releases/download/v2.1.2/Discord-Companion_2.1.2_x64-setup.exe)\n" +
              "• [Windows MSI (.msi)](https://github.com/ItsHimanshu-Raj/discord-companion-releases/releases/download/v2.1.2/Discord-Companion_2.1.2_x64_en-US.msi)\n" +
              "• [Daemon Standalone (.exe)](https://github.com/ItsHimanshu-Raj/discord-companion-releases/releases/download/v2.1.2/companiond.exe)",
            inline: false,
          },
        )
        .setFooter({ text: "Verified SHA-256 & Minisign Signatures" })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Download macOS (.dmg)")
          .setStyle(ButtonStyle.Link)
          .setURL("https://github.com/ItsHimanshu-Raj/discord-companion-releases/releases/download/v2.1.2/Discord-Companion_2.1.2_macOS.dmg"),
        new ButtonBuilder()
          .setLabel("Download Windows (.exe)")
          .setStyle(ButtonStyle.Link)
          .setURL("https://github.com/ItsHimanshu-Raj/discord-companion-releases/releases/download/v2.1.2/Discord-Companion_2.1.2_x64-setup.exe"),
        new ButtonBuilder()
          .setLabel("All Releases")
          .setStyle(ButtonStyle.Link)
          .setURL("https://github.com/ItsHimanshu-Raj/discord-companion-releases/releases/tag/v2.1.2"),
      );

      await interaction.reply({ embeds: [embed], components: [row] });
    } else if (commandName === "hq") {
      const embed = new EmbedBuilder()
        .setColor(0x7289da)
        .setTitle("🤖 COMPANION DEV HQ Architecture")
        .setDescription(
          "Guild `1550227368889684058` serves as the private backend headquarters for Discord Companion developer operations and automated telemetry feeds.",
        )
        .addFields(
          {
            name: "Category: `🤖 COMPANION DEV HQ`",
            value:
              "1. `#💥-crash-stacktraces` — Real-time Rust/JS panic traces (PII stripped)\n" +
              "2. `#🔌-gateway-and-overlay-errors` — Gateway opcode errors & D2D resets\n" +
              "3. `#🐛-user-bug-reports` — Form submissions from in-app Settings\n" +
              "4. `#💬-support-and-feedback` — Feedback & user requests\n" +
              "5. `#🚀-ci-cd-builds` — Auto-update releases & checksums\n" +
              "6. `#📈-anonymous-app-metrics` — Anonymous daily active build telemetry\n" +
              "7. `#⚖️-legal-and-compliance-docs` — Global legal policies & revisions",
            inline: false,
          },
          {
            name: "Security Standard",
            value:
              "• `@everyone` view access is **denied** on all telemetry channels.\n" +
              "• All incoming data is scrubbed client-side of Discord tokens, filenames, IPs, and user IDs.\n" +
              "• No bot token is ever bundled into user-facing binaries.",
            inline: false,
          },
        )
        .setFooter({ text: "Companion DevOps Sentinel" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else if (commandName === "help") {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("🤖 Companion DevOps Sentinel Commands")
        .setDescription("Available slash commands for developer and sentinel monitoring:")
        .addFields(
          { name: "`/status`", value: "View sentinel uptime, memory, and telemetry health." },
          { name: "`/ping`", value: "Test WebSocket heartbeat and REST API latency." },
          { name: "`/release`", value: "View latest client release information and download links." },
          { name: "`/hq`", value: "Inspect Dev HQ channel routing and architecture." },
          { name: "`/help`", value: "Show this help menu." },
        )
        .setFooter({ text: "Discord Companion Sentinel" });

      await interaction.reply({ embeds: [embed] });
    }
  } catch (err) {
    console.error("Error executing command:", err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "⚠️ An error occurred while executing this command.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "⚠️ An error occurred while executing this command.",
        ephemeral: true,
      });
    }
  }
});

/* ---- 24/7 HTTP Health & Keep-Alive Server --------------------------------- */

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/health" || url.pathname === "/healthz") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "healthy",
        uptime: formatUptime(Date.now() - startTime),
        bot: client.isReady() ? client.user.tag : "connecting",
        ping: client.isReady() ? client.ws.ping : null,
        timestamp: new Date().toISOString(),
      }),
    );
    return;
  }

  if (url.pathname === "/" || url.pathname === "/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        service: "Discord Companion DevOps Sentinel",
        version: "2.1.2",
        status: "online",
        uptime: formatUptime(Date.now() - startTime),
        memory: getMemoryUsage(),
        bot: client.isReady()
          ? {
              id: client.user.id,
              username: client.user.username,
              guilds: client.guilds.cache.size,
              ping: client.ws.ping,
            }
          : { status: "connecting" },
        time: new Date().toISOString(),
      }, null, 2),
    );
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`📡 24/7 HTTP Sentinel Server listening on port ${port} (0.0.0.0:${port})`);
});

/* ---- Self-Ping Keep-Alive for Free Hosting (Render / Railway) ------------ */

const keepAliveUrl = process.env.RENDER_EXTERNAL_URL || process.env.KEEP_ALIVE_URL;
if (keepAliveUrl) {
  console.log(`⏰ Keep-alive pinger activated for: ${keepAliveUrl} (every 10 minutes)`);
  setInterval(async () => {
    try {
      const pingUrl = `${keepAliveUrl.replace(/\/+$/, "")}/health`;
      const res = await fetch(pingUrl);
      console.log(`[Keep-Alive] Pinged ${pingUrl} - Status: ${res.status}`);
    } catch (err) {
      console.warn(`[Keep-Alive] Ping warning:`, err.message);
    }
  }, 10 * 60 * 1000); // 10 minutes
}

/* ---- Robust Error Handling ----------------------------------------------- */

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("SIGINT", () => {
  console.log("Shutting down cleanly...");
  client.destroy();
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down cleanly...");
  client.destroy();
  server.close(() => process.exit(0));
});

/* ---- Connect to Discord -------------------------------------------------- */

console.log("Connecting to Discord Gateway...");
client.login(token).catch((err) => {
  console.error("Failed to login to Discord Gateway:", err);
  process.exit(1);
});
