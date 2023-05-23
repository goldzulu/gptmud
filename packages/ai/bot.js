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

/* 
  An example of a Toolkit generated file we copied over
*/
//import DownloadYoutubeVideoToFile from './tools/DownloadYoutubeVideo.js';
// import GetCryptocurrencyMetadataBySymbolOrSlug from './tools/GetCryptocurrencyMetadataBySymbolOrSlug.js';
// import GetCryptocurrencyPriceBySymbolOrSlug from './tools/GetCryptocurrencyPriceBySymbolOrSlug.js';
// import GetCoinmarketcapRanking from './tools/GetCoinmarketcapRanking.js/index.js';
// import GetCryptoContentFromCryptopanic from './tools/GetCryptoContentFromCryptopanic.js';
// import RunChatGPTPlugin from './tools/RunChatGPTPlugin.js';


const model = new OpenAI({ temperature: 0, model: 'gpt-3.5-turbo' });
// const model = new OpenAI({ temperature: 0, model: 'gpt-4' });
const tools = [
  //new SerpAPI(),
  new Calculator(),
  new RequestsPostTool(),
  new RequestsGetTool(),
  // new DownloadYoutubeVideoToFile(),
  // new GetCryptocurrencyMetadataBySymbolOrSlug(),
  // new GetCryptocurrencyPriceBySymbolOrSlug(),
  //new GetCoinmarketcapRanking(),
  // new GetCryptoContentFromCryptopanic(),
  await AIPluginTool.fromPluginUrl(
    "https://voxscript.awt.icu/.well-known/ai-plugin.json"
  ),
];

//https://voxscript.awt.icu/swagger/v1/swagger.yaml

const executor = await initializeAgentExecutorWithOptions(
  tools,
  model,
  { agentType: "chat-zero-shot-react-description", verbose: true }
);
console.log('Loaded agent.');



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

const result = await executor.call({
  input: "get me the best youtube video about making money online",
});

console.log({ result });
