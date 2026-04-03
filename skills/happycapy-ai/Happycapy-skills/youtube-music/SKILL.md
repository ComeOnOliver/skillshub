---
name: youtube-music
description: Search and play music tracks on YouTube Music through MCP integration. Use when user wants to search for songs, play music, or discover tracks on YouTube Music platform.
---

# YouTube Music MCP

🎵 A Model Context Protocol (MCP) server that enables AI assistants to search for and play tracks on YouTube Music.

## Overview

This skill provides integration with YouTube Music through the MCP protocol, allowing you to search for songs by title or artist name and play them directly in the user's default web browser.

## Available Tools

- **searchTrack** - Search for music tracks on YouTube Music by title or artist name
- **playTrack** - Search and automatically open tracks in the default web browser

## Prerequisites

Before using this skill, ensure you have:

1. A valid **Google YouTube API Key** from the [Google Cloud Console](https://console.cloud.google.com/marketplace/product/google/youtube.googleapis.com)
2. Cursor or Claude Desktop properly configured

## Installation

Add the following configuration to your `.cursor/mcp.json` file (or Claude Desktop configuration):

```json
{
  "mcpServers": {
    "youtube-music-mcp": {
      "command": "npx",
      "args": ["-y", "@instructa/mcp-youtube-music"],
      "env": {
        "YOUTUBE_API_KEY": "<YOUR_API_KEY>"
      }
    }
  }
}
```

Replace `<YOUR_API_KEY>` with your actual YouTube API key.

## Usage Examples

### Searching for Tracks

```
User: "Search for Bohemian Rhapsody by Queen"
Assistant: [Uses searchTrack tool to find the track on YouTube Music]
```

### Playing Tracks

```
User: "Play some jazz music"
Assistant: [Uses playTrack tool to search and open jazz music in browser]
```

## Guidelines

- Always verify that the YouTube API key is configured before attempting to use the tools
- Provide clear feedback to users about what tracks were found or played
- If a track cannot be found, suggest alternative search terms or artists
- The playTrack tool will open tracks in the user's default web browser
- Respect user preferences for music genres and artists

## Technical Details

- **Protocol**: Model Context Protocol (MCP)
- **Platform**: YouTube Music
- **Execution**: Runs via `npx` without requiring local installation
- **License**: MIT

## Author

Created by Kevin Kern / Instructa ([@kregenrek](https://x.com/kregenrek))

## Resources

- GitHub Repository: [instructa/mcp-youtube-music](https://github.com/instructa/mcp-youtube-music)
- Learn more: [instructa.ai](https://www.instructa.ai)
