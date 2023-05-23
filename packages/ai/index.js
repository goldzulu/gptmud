import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import { OpenAI } from 'langchain';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import {
  // SerpAPI,
  AIPluginTool,
  RequestsGetTool,
  RequestsPostTool,
} from 'langchain/tools';

import {
  Calculator,
} from 'langchain/tools/calculator';

import readline from 'readline';

const model = new OpenAI({ temperature: 0 });
// const model = new OpenAI({ temperature: 0, model: 'gpt-4' });
const tools = [
  //new SerpAPI(),
  new Calculator(),
];

//https://voxscript.awt.icu/swagger/v1/swagger.yaml

const executor = await initializeAgentExecutorWithOptions(
  tools,
  model,
  { agentType: "chat-zero-shot-react-description", verbose: true }
);
console.log('Loaded agent.');


// Uncomment below to make this interactive

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// rl.question('What do you want to do? ', async (input) => {
//   console.log(`Executing with input "${input}"...`);

//   const result = await executor.call({ input });

//   console.log(`Got output ${result.output}`);

//   rl.close();
// });

// comment this to make this non-autonomous
const result = await executor.call({
  input: "get me the best youtube video about making money online",
});

console.log({ result });
