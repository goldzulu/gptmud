
# GPTMud - langchain-tools-for-mud
Inspired by ChatGPT Code generator and AutoGPT, GPTMud is a simple MUDv2 module(?) using LangChainJS https://js.langchain.com/docs/ tools and agents setup that makes it easy to test and to create autonomous ai bots that respond via natural language and/or to reason, plan and execute in an autonomous way.

This is an ambitous idea to utilise LangchainJS by bulding tools that queries and react to state changes in MudV2.
I believe this is a very exciting way to explore autonomous AI agents and what better system the MudV2 to do this!

Unfortunately I ran out of time but still submit to the EthOnline Autonomous world hackathon as a work in progress so others if interested can colaborate with me beyond the hackthon to build a full working product.

Let me know @voicetechguy1 if you are interested or submit a PR at (https://github.com/goldzulu/gptmud)[https://github.com/goldzulu/gptmud]


# Completed System

You can find the initial test code I have been using at packages/ai directory.

Ideally at it's completion it will have:

* Generate MUD tool which will use OpenAI Code Generation and Completion to generate tools that the GPTMud Agent can use to solve problems in MUD

* Starter tools that can be used as a starting point:
    * A tool to get the position of the player
    * A tool to move the player in a given direction
    * A tool to read the position of anything of interest e.g. other players or objects
    * A tool to read players health

* A driver bot.js that can be run to test the tools either one by one or as a whole by asking for commands in natural language

Start the agent by calling:

`pnpm dev`

# Tool Generation
You can also try to generate a new LangChain tool using the work initialy done by HeyPal team

(https://github.com/hey-pal/toolkit-ai)[https://github.com/hey-pal/toolkit-ai]

Just open up the `generate-mud-tool.js` file, and swap out the info for the tool you want to generate. Need to explain a bit more to give the AI context so it can generate proper code as Mud V2 does not exist prior to end of 2021!

Then call `pnpm generate-mud-tool` 

In a little bit of time you'll have a working or at least a starting LangChain tool you can then import.

Bot.js is the driver for the agent and can be used to test the tools generated or the starter tools.

