import express from "express";
// const express = require("express");
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod"
import { createPost } from "./mcp.tool.js";


//bZM2BFB6djbG9ab34AsS4IXzP
//qUjKxvCJXlhVpuoQ4jSULxe14V59dQPs3mSakl7rpD6GS4nl00
const server = new McpServer({
    name: "example-server",
    version: "1.0.0"
});


server.tool(
    "addTwoNumbers",
    "Add two numbers",
    {
        a: z.number(),
        b: z.number()
    },
    async (arg) => {
        const { a, b } = arg;
        return {
            content: [
                {
                    type: "text",
                    text: `The sum of ${a} and ${b} is ${a + b}`
                }
            ]
        }
    }
)

server.tool(
    "createPost",
    "Create a post on X formally known as Twitter", {
    status: z.string()
}, async (arg) => {
    const { status } = arg;
    return createPost(status)
}
)

// ... set up server resources, tools, and prompts ...

const app = express();

// to support multiple simultaneous connections we have a lookup object from
// sessionId to transport
const transports = {};


//sse => server side event  => provide sudo real time communication  between client and server

app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport('/messages', res);
    transports[transport.sessionId] = transport;
    res.on("close", () => {
        delete transports[transport.sessionId];
    });
    await server.connect(transport);
});


// message  => Provide by client to server
app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = transports[sessionId];
    if (transport) {
        await transport.handlePostMessage(req, res);
    } else {
        res.status(400).send('No transport found for sessionId');
    }
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});