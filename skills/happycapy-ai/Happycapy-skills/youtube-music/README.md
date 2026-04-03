# YouTube Music MCP

🎵 A simple MCP Server that enables AI assistants to search and play YouTube Music tracks.

## Overview

This skill provides integration with YouTube Music through the Model Context Protocol (MCP), allowing AI assistants like Cursor and Claude Desktop to search for songs and play them directly in your default web browser.

## Features

- **Search Tracks**: Find music by title or artist name on YouTube Music
- **Play Tracks**: Automatically open and play tracks in your default browser
- **MCP Integration**: Seamless integration with Cursor AI and Claude Desktop
- **No Installation Required**: Runs via `npx` without local setup

## Prerequisites

- A valid **Google YouTube API Key**
  - Get yours at: [Google Cloud Console](https://console.cloud.google.com/marketplace/product/google/youtube.googleapis.com)
  - Enable the YouTube Data API v3 for your project

## Installation

### For Cursor Users

Add this configuration to your `.cursor/mcp.json` file:

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

### For Claude Desktop Users

Add this to your Claude Desktop MCP settings configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

Remember to replace `<YOUR_API_KEY>` with your actual YouTube API key.

## Usage

Once configured, you can ask your AI assistant to:

- "Search for Bohemian Rhapsody by Queen"
- "Play some relaxing piano music"
- "Find tracks by The Beatles"
- "Play the latest song by Taylor Swift"

The assistant will use the MCP tools to search YouTube Music and can automatically open tracks in your browser.

## Available MCP Tools

- `searchTrack` - Search for music tracks by title or artist
- `playTrack` - Search and automatically play tracks in default browser

## Development

To modify or contribute to this skill:

```bash
# Clone the original repository
git clone https://github.com/instructa/mcp-youtube-music.git
cd mcp-youtube-music

# Install dependencies
npm install

# Make your changes and test
```

## License

MIT License

## Credits

**Original Author**: Kevin Kern / Instructa ([@kregenrek](https://x.com/kregenrek))

**Source Repository**: [instructa/mcp-youtube-music](https://github.com/instructa/mcp-youtube-music)

## Related Resources

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Instructa.ai](https://www.instructa.ai)

## Troubleshooting

### API Key Issues

If you encounter API key errors:
1. Verify your API key is correct
2. Ensure YouTube Data API v3 is enabled in your Google Cloud Console
3. Check that your API key has the necessary permissions

### Tool Not Found

If the MCP tools aren't available:
1. Restart your AI assistant (Cursor or Claude Desktop)
2. Verify the configuration file syntax is correct
3. Check that `npx` is available in your system PATH
