import { Tool } from 'langchain/agents';
import Ajv from 'ajv';

// The following is the actual code that will be
// run by the tool when it is called
import axios from "axios";

async function call({ start, limit, sort }) {

  // endpoints
const endpoint = "/v1/cryptocurrency/map"

const headers = {
  'X-CMC_PRO_API_KEY': process.env.X_CMC_PRO_API_KEY ? process.env.X_CMC_PRO_API_KEY : process.env.X_CMC_PRO_API_KEY_SANDBOX,
};
const coinmarketcap_url = process.env.COINMARKETCAP_PROD ? process.env.COINMARKETCAP_PROD : process.env.COINMARKETCAP_SANDBOX;
    
  // get the parameters for the given start, limit and/or sort
 
  const paramStart = start ? `start=${start}` : 'start=1';
  const paramLimit = limit ? `limit=${limit}` : 'limit=10';
  const paramSort = sort ? `sort=${sort}` : 'sort=cmc_rank';
  const response = await axios.get(
    `${coinmarketcap_url}${endpoint}?${paramStart}&${paramLimit}&${paramSort}`
    , { headers }
  );

  return response.data;
}

// This is a class that corresponds to the Langchain tool definition
// https://js.langchain.com/docs/modules/agents/tools/
// It validates the input & output against the schemas
// and then it calls the tool code
class GetCoinmarketcapRanking extends Tool {
  name = 'get-coinmarketcap-ranking';
  
  description = `Get coinmarketcap ranking. The action input should adhere to this JSON schema:
  {{
    "type": "object",
    "properties": {{
      "start": {{
        "type": "integer",
        "description": "Optionally offset the start (1-based index) of the paginated list of items to return."
      }},
      "limit": {{
        "type": "integer",
        "description": "Optionally specify the number of results to return. Default is 10"
      }},
      "sort": {{
        "type": "string",
        "description": "What field to sort the list of cryptocurrencies by. Default is cmc_rank. Valid values are id or cmc_rank."
      }}
    }}
  }}`;
  
  ajv = new Ajv();

  inputSchema = {
    "type": "object",
    properties: {
      start: {
        type: "integer",
        description: "Optionally offset the start (1-based index) of the paginated list of items to return."
      },
      limit: {
        type: "integer",
        description: "Optionally specify the number of results to return. Default is 10"
      },
      sort: {
        type: "string",
        enum: ["cmc_rank", "id"],
        description: "What field to sort the list of cryptocurrencies by. Default is cmc_rank. Valid values are id or cmc_rank."
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

export default GetCoinmarketcapRanking;