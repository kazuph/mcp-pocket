# MCP Pocket

This is a connector to allow Claude Desktop (or any MCP client) to fetch your saved articles from Pocket API.

## Prerequisites
- Node.js (install via `brew install node`)
- Claude Desktop (install from https://claude.ai/desktop)
- tsx (install via `npm install -g tsx`)
- Pocket API credentials

## Installation

1. Clone this repository and install dependencies:
```bash
git clone https://github.com/kazuph/mcp-pocket.git
cd mcp-pocket
npm install
```

2. Modify your Claude Desktop config located here:
`~/Library/Application\ Support/Claude/claude_desktop_config.json`

You can easily find this through the Claude Desktop menu:
1. Open Claude Desktop
2. Click Claude on the Mac menu bar
3. Click "Settings"
4. Click "Developer"

If you don't have this config, you can create an empty file at this location.

Add the following to the config file, replacing the path and credentials with your own:

```json
{
  "mcpServers": {
    "pocket": {
      "command": "npx",
      "args": ["tsx", "/path/to/mcp-pocket/index.ts"],
      "env": {
        "POCKET_CONSUMER_KEY": "your-pocket-consumer-key",
        "POCKET_ACCESS_TOKEN": "your-pocket-access-token"
      }
    }
  }
}
```

To obtain Pocket API credentials:
1. Create a Pocket application at https://getpocket.com/developer/
2. Get your consumer key
3. Follow the OAuth process to get your access token

## Available Commands

The following MCP tool will be available in Claude Desktop:

- `pocket_get_articles`: Fetch your saved articles from Pocket API. Returns title, URL, and excerpt for each article.

## Development

```bash
# Install dependencies
npm install

# Run with tsx
npx tsx index.ts
```
