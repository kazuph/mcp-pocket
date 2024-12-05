#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
	ToolSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { getPocketList } from "./pocket.js";

interface ServerConfig {
	pocket?: {
		consumerKey: string;
		accessToken: string;
	};
}

// Configuration from environment variables
const config: ServerConfig = {
	pocket:
		process.env.POCKET_CONSUMER_KEY && process.env.POCKET_ACCESS_TOKEN
			? {
					consumerKey: process.env.POCKET_CONSUMER_KEY,
					accessToken: process.env.POCKET_ACCESS_TOKEN,
				}
			: undefined,
};

// Schema definitions
const GetPocketArticlesSchema = z.object({
	count: z.number().optional().default(20),
});

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

// Server setup
const server = new Server(
	{
		name: "mcp-pocket",
		version: "1.0.0",
	},
	{
		capabilities: {
			tools: {},
		},
	},
);

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
	const tools = [
		{
			name: "pocket_get_articles",
			description:
				"Fetches the latest articles from Pocket API. Returns up to 20 articles by default. " +
				"You can specify the number of articles to fetch (1-20) using the count parameter. " +
				"Returns the title, URL, and excerpt for each article.",
			inputSchema: zodToJsonSchema(GetPocketArticlesSchema) as ToolInput,
		},
	];

	return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
	try {
		const { name, arguments: args } = request.params;

		switch (name) {
			case "pocket_get_articles": {
				if (!config.pocket) {
					throw new Error("Pocket API configuration is not available");
				}

				const parsed = GetPocketArticlesSchema.safeParse(args);
				if (!parsed.success) {
					throw new Error(
						`Invalid arguments for pocket_get_articles: ${parsed.error}`,
					);
				}
				try {
					const articles = await getPocketList(
						config.pocket,
						parsed.data.count,
					);
					return {
						content: [
							{
								type: "text",
								text: articles
									.map(
										(article) =>
											`Title: ${article.title}\nURL: ${article.url}\nExcerpt: ${article.excerpt}\n`,
									)
									.join("\n---\n"),
							},
						],
					};
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : String(error);
					return {
						content: [
							{
								type: "text",
								text: `Pocket API Error: ${errorMessage}`,
							},
						],
						isError: true,
					};
				}
			}
			default:
				throw new Error(`Unknown tool: ${name}`);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return {
			content: [{ type: "text", text: `Error: ${errorMessage}` }],
			isError: true,
		};
	}
});

// Start server
async function runServer() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error("MCP Pocket Server running on stdio");
}

runServer().catch((error) => {
	console.error("Fatal error running server:", error);
	process.exit(1);
});
