import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import { Tool } from 'langchain/agents';
import Ajv from 'ajv';

// The following is the actual code that will be
// run by the tool when it is called
import axios from "axios";

async function call({ symbol, slug, convert }) {
  // endpoints
  const endpoint = "/v2/cryptocurrency/quotes/latest"

  const headers = {
    'X-CMC_PRO_API_KEY': process.env.X_CMC_PRO_API_KEY ? process.env.X_CMC_PRO_API_KEY : process.env.X_CMC_PRO_API_KEY_SANDBOX,
  };
  const coinmarketcap_url = process.env.COINMARKETCAP_PROD ? process.env.COINMARKETCAP_PROD : process.env.COINMARKETCAP_SANDBOX;
  

console.log(process.env.COINMARKETCAP_PROD)
  // get the metadata for the given symbol or slug
  // slug is one word only so just get the first word 
  // if there are multiple words that is saperated by dash
  const param = symbol ? `symbol=${symbol}` : `slug=${slug}`;
  const param2 = convert ? `&convert=${convert}` : '&convert=USD';

  console.log(`${coinmarketcap_url}${endpoint}?${param}${param2}`);

  const response = await axios.get(
    `${coinmarketcap_url}${endpoint}?${param}${param2}`
    , { headers }
  );
  const data = response.data;
  return response.data;
}

// This is a class that corresponds to the Langchain tool definition
// https://js.langchain.com/docs/modules/agents/tools/
// It validates the input & output against the schemas
// and then it calls the tool code
class GetCryptocurrencyPriceBySymbolOrSlug extends Tool {
  name = 'get-cryptocurrency-price-by-symbol-or-slug';
  
  description = `Get price of cryptocurrency by symbol or slug. The following can also be obtained, percentage change in price from the last 24h, 1h, 7d, 30d, 60d, 90d. You can also get the traded volume in the last 24h via volume_24h and the volume changed in the last 24h (volume_change_24h) The action input should adhere to this JSON schema:
  {{
    "type": "object",
    "properties": {{
      "symbol": {{
        "type": "string",
        "description": "The symbol of the cryptocurrency. e.g. ETH, LINK, BNB, etc. Must be one word only. Do not use dash."
      }},
      "slug": {{
        "type": "string",
        "description": "The slug of the cryptocurrency. e.g. bitcoin, ethereum, etc. Must be one word only. Do not use dash."
      }},
      "convert": {{
        "type": "string",
        "description": "Optionally calculate market quotes in up to 120 currencies at once by passing a comma-separated list of cryptocurrency or fiat currency symbols. e.g. USD, GBP, BTC. Each conversion is returned in its own quote object."
      }}
    }}
  }}`;
  
  ajv = new Ajv();

  inputSchema = {
    "type": "object",
    properties: {
      symbol: {
        type: "string",
        description: "The symbol of the cryptocurrency"
      },
      slug: {
        type: "string",
        description: "The slug of the cryptocurrency"
      },
      convert: {
        type: "string",
        description: "Optionally calculate market quotes in up to 120 currencies at once by passing a comma-separated list of cryptocurrency or fiat currency symbols. e.g. USD, GBP, BTC. Each conversion is returned in its own quote object."
      }
    }
  };
  
  outputSchema = '';
  // no output validation for now

  validate(data, schema) {
    if (schema) {
      const validateSchema = this.ajv.compile(schema);
      if (!validateSchema(data)) {
        throw new Error(this.ajv.errorsText(validateSchema.errors));
      }
    }
  }

  async _call(arg) {
    let output;
    try {
      const input = JSON.parse(arg);
      this.validate(input, this.inputSchema);
      output = await call(input);
      // there is no neeed to validate the output as it is too complex
      // try {
      //   this.validate(output, this.outputSchema);
      // } catch (err) {
      //   throw new Error(`${err.message}: ${JSON.stringify(output)}`);
      // }
    } catch (err) {
      output = { error: err.message || err };
    }
    return JSON.stringify(output);
  }
}

export default GetCryptocurrencyPriceBySymbolOrSlug;