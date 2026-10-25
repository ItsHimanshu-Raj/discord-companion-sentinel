# 🤖 Companion DevOps Sentinel

24/7 Sentinel bot and health telemetry monitor for **Discord Companion** and its private Developer Headquarters (Guild `1550227368889684058`).

---

## ⚡ Features

- **24/7 Discord Gateway Connection**:
  - Sets Rich Presence: `Watching over Discord Companion | v1.1.0` with state `🛡️ 24/7 Sentinel Active`.
  - Automatic reconnection with exponential backoff on network dropouts.
- **Built-in HTTP Health Check Server**:
  - Listens on `PORT=10000` (Render's default) or `PORT`.
  - `/health` — Returns `200 OK` JSON with uptime, ping, and status for container health probes and uptime monitors.
  - `/status` — Detailed JSON health metrics (memory usage, Node.js version, platform, guilds).
  - Self-pinger keep-alive: When `RENDER_EXTERNAL_URL` is set, automatically pings itself every 10 minutes so Render's free tier never spins down.
- **Developer Slash Commands**:
  - `/status` — Displays interactive visual embed of bot health, latency, memory, and telemetry channels.
  - `/ping` — Measures roundtrip latency and Discord WebSocket heartbeat.
  - `/release` — Detailed release info for `v1.1.0` with verified download links.
  - `/hq` — Outlines the channels in `🤖 COMPANION DEV HQ` and their specific telemetry roles.
  - `/help` — Command directory.

---

## 🚀 Deploy to Render (Blueprint)

1. Connect this GitHub repository (`ItsHimanshu-Raj/discord-companion`) to **Render**.
2. Click **New +** -> **Blueprint**.
3. Render detects `render.yaml` automatically and configures:
   - **Service Name**: `companion-devops-sentinel`
   - **Runtime**: `Node`
   - **Root Directory**: `bot`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. Set the secret environment variable:
   - `DISCORD_BOT_TOKEN`: `<your-bot-token>`
5. Deploy! Render will build and host the Sentinel 24/7 with zero downtime.

---

## 💻 Local 24/7 Daemon

To run locally in the background:
```bash
cd bot
npm install
npm run deploy:commands
npm start
```
