# JexBot

A Discord and Twitch bot for managing speedrun races, built for communities running *The Legend of Zelda: A Link to the Past Randomizer* (ALTTPR) and *Final Fantasy IV Free Enterprise* (FF4FE). It handles the full race lifecycle — from entry and category selection through timing, relay legs, and final results — across both Discord and Twitch simultaneously.

## Features

- **Race management** — standard, ladder, invitational, team, and relay race formats
- **Multi-platform** — coordinates between Discord channels and Twitch chat in real time
- **Multi-guild** — independent race state per Discord server
- **Role-based access** — separate permissions for racers and referees
- **Relay races** — per-leg categories, timed leg transitions, handoff coordination
- **Guessing games** — Guess-the-Blook (GTBK) with automated announcements
- **Seed of the Week** — SOTW competition tracking
- **Player profiles** — links Discord and Twitch accounts, tracks race history
- **Cron tasks** — runs every 5 seconds to handle timed events (leg transitions, announcements, connection management)
- **47 commands** across race operations and global settings

## Tech Stack

- **Runtime:** Node.js
- **Discord:** discord.js v14
- **Twitch:** tmi.js v1.8
- **Database:** MySQL (mysql2)
- **Scheduling:** node-cron
- **Testing:** Mocha + Chai + Sinon

## Project Structure

```
├── index.js              # Entry point
├── config.json           # Per-guild settings (channels, roles, emoji maps)
├── services/
│   ├── app.js            # Main orchestrator — loads all services
│   ├── db.js             # MySQL: players and race data
│   ├── discord.js        # Discord client and event handling
│   └── twitch.js         # Twitch client management
├── commands/             # 47 race and global commands
├── routines/             # 23 shared utility functions
├── cron/                 # Scheduled tasks (5-second tick)
├── categories/
│   ├── alttpr/           # ALTTPR category definitions
│   └── ff4fe/            # FF4FE category definitions
├── data/
│   └── race.json         # Live race state per guild
└── test/                 # Mocha test suite
```

## Setup

### Prerequisites

- Node.js
- MySQL server
- A Discord bot application ([Discord Developer Portal](https://discord.com/developers/applications))
- A Twitch bot account with OAuth token

### Installation

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
DISCORD_BOT_TOKEN=your_discord_bot_token
TWITCH_BOT_NAME=your_twitch_bot_username
TWITCH_BOT_TOKEN=your_twitch_oauth_token
```

### Configuration

Edit `config.json` to set up each Discord guild:
- Channel IDs for race announcements and logging
- Role IDs for racers and referees
- Emoji mappings for race items
- Timer intervals and relay delays

### Running

```bash
# Development (auto-reload on changes)
npm run dev

# Production
npm start

# Tests
npm test
```

## Commands

Commands are prefixed with `.` or `!` depending on the guild configuration. Examples:

| Command | Who | Description |
|---|---|---|
| `enter` | Racer | Join the current race |
| `done` | Racer | Mark yourself as finished |
| `forfeit` | Racer | Withdraw from the race |
| `connect` | Referee | Open the race for entries |
| `start` | Referee | Start the race timer |
| `close` | Referee | Close entries and begin |

Use the `help` command in Discord for the full list available in your server.
