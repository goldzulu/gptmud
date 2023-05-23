import { Tool } from 'langchain/agents';
import Ajv from 'ajv';

// The following is the actual code that will be
// run by the tool when it is called
import axios from "axios";
let dump

async function call({ filter, currencies, regions, kind }) {

  // endpoints
const endpoint = "/api/v1/posts/"

const headers = {
  'auth_token': process.env.CRYPTOPANIC_API_KEY,
};
const cryptopanic_url = 'https://cryptopanic.com'
    
  // get the parameters for the given start, limit and/or sort
 
  const paramFilter = filter ? `filter=${filter}` : 'filter=hot'; // hot, rising, bullish, bearish,important, saved, lol
  const paramCurrencies = currencies ? `&currencies=${currencies}` : ''; // BNB
  const paramRegions = regions ? `regions=${regions}` : 'regions=en'; //de, nl, es,fr, it,pt,ru,tr,ar,cp,ko
  const paramKind = kind ? `&kind=${kind}` : ''; // media, news
  const response = await axios.get(
    `${cryptopanic_url}${endpoint}?auth_token=${process.env.CRYPTOPANIC_API_KEY}&public=true&${paramFilter}${paramCurrencies}&${paramRegions}${paramKind}`
    // , { headers }
  );
  dump=`${cryptopanic_url}${endpoint}?auth_token=${process.env.CRYPTOPANIC_API_KEY}&public=true&${paramFilter}${paramCurrencies}&${paramRegions}${paramKind}`

  // get the first 10 results from response.data.results
  // const cleanedUpResults = 

  const cleanedUpResults =  await response.data.results.slice(0, 10);

  return cleanedUpResults;
}

// This is a class that corresponds to the Langchain tool definition
// https://js.langchain.com/docs/modules/agents/tools/
// It validates the input & output against the schemas
// and then it calls the tool code
class GetCryptoContentFromCryptopanic extends Tool {
  name = 'get-crypto-content-from-cryptopanic';
  
  description = `Get latest crypto content from cryptopanic. The action input should adhere to this JSON schema:
  {{
    "type": "object",
    "properties": {{
      "filter": {{
        "type": "string",
        "description": "Sentiments of public filter. Valid values are rising,hot,bullish,bearish,important,saved,lol"
      }},
      "currencies": {{
        "type": "string",
        "description": "Currencies code to filter content by e.g. BNB can be comma separated e.g. BNB,ETH"
      }},
      "regions": {{
        "type": "string",
        "description": "Language regions. E.g. de, nl, es,fr, it,pt,ru,tr,ar,cp,ko. Default is en"
      }},
      "kind": {{
        "type": "string",
        "description": "What kind of content. Default is news. Valid values are news or media."
      }}
    }}
  }}`;
  
  ajv = new Ajv();

  inputSchema = {
    "type": "object",
    properties: {
      filter: {
        type: "string",
        description: "Sentiments of public filter. Valid values are rising,hot,bullish,bearish,important,saved,lol"
      },
      currencies: {
        type: "string",
        description: "Currencies code to filter content by e.g. BNB"
      },
      regions: {
        type: "string",
        description: "Language regions. E.g. de, nl, es,fr, it, pt, ru, tr, ar, cp, ko. Default is en"
      },
      kind: {
        type: "string",
        enum: ["news", "media"],
        description: "What kind of content. Default is news. Valid values are news or media."
      }
    }
  };
  
  // optionally can define the schema below but for now let's skip it
  outputSchema = '';

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
      try {
        this.validate(output, this.outputSchema);
      } catch (err) {
        throw new Error(`${err.message}: ${JSON.stringify(output)}`);
      }
    } catch (err) {
      output = { error: err.message || err };
    }

    return JSON.stringify(output);
  }
}

export default GetCryptoContentFromCryptopanic;