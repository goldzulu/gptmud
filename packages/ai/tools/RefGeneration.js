import { Tool } from 'langchain/agents';
import Ajv from 'ajv';

// The following is the actual code that will be
// run by the tool when it is called
import axios from "axios";

async function call({ symbol }) {
  const response = await axios.get(
    `https://api.coinpaprika.com/v1/tickers/${symbol}`
  );
  const data = response.data;

  return {
    name: data.name,
    symbol: data.symbol,
    marketCap: data.market_cap_usd,
    price: data.price_usd,
  };
}

// This is a class that corresponds to the Langchain tool definition
// https://js.langchain.com/docs/modules/agents/tools/
// It validates the input & output against the schemas
// and then it calls the tool code
class GetMetadataOnCryptocurrencyWithSymbol extends Tool {
  name = 'get-metadata-on-cryptocurrency-with-symbol';
  
  description = `Get metadata on cryptocurrency with symbol. The action input should adhere to this JSON schema:
{{"type":"object","properties":{{"symbol":{{"type":"string","description":"The symbol of the cryptocurrency"}}}},"required":["symbol"]}}`;
  
  ajv = new Ajv();

  inputSchema = {
    "type": "object",
    "properties": {
      "symbol": {
        "type": "string",
        "description": "The symbol of the cryptocurrency"
      }
    },
    "required": [
      "symbol"
    ]
  };
  
  outputSchema = {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "The name of the cryptocurrency"
      },
      "symbol": {
        "type": "string",
        "description": "The symbol of the cryptocurrency"
      },
      "marketCap": {
        "type": "number",
        "description": "The market capitalization of the cryptocurrency"
      },
      "price": {
        "type": "number",
        "description": "The current price of the cryptocurrency"
      }
    },
    "required": [
      "name",
      "symbol",
      "marketCap",
      "price"
    ]
  };

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

export default GetMetadataOnCryptocurrencyWithSymbol;