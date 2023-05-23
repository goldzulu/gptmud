import { Tool } from 'langchain/agents';
import Ajv from 'ajv';
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";

// The following is the actual code that will be
// run by the tool when it is called

async function call({ symbol = "ETH" }) {
    await Moralis.start({
        apiKey: process.env.MORALIS_API_KEY,
        // ...and any other configuration
      });
    
      const symbols = [symbol];
    
      const chain = EvmChain.BSC;
    
      const response = await Moralis.EvmApi.token.getTokenMetadataBySymbol({
        symbols,
        chain,
      });
      
      console.log(response.toJSON().filter((token) => (!token.possible_spam || (token.logo !== null))).length);
      // throw new Error("Interruption");
      return response.toJSON().filter((token) => (!token.possible_spam || (token.logo !== null)))[0];
      
      // filter the response to only include possible_spam false tokens
      // let filteredResponse = response.filter((token) => !token.possible_spam);
      // return filteredResponse;
}

// This is a class that corresponds to the Langchain tool definition
// https://js.langchain.com/docs/modules/agents/tools/
// It validates the input & output against the schemas
// and then it calls the tool code
class GetTokenMetadataBySymbolForBinanceSmartChain extends Tool {
  name = 'get-token-metadata-by-symbol-for-binance-smart-chain';
  
  description = `Get token metadata by symbol for binance smart chain. If no symbol is specified use ETH. The action input should adhere to this JSON schema:
{{"type":"object","properties":{{"symbol":{{"type":"string","default":"ETH"}}}},"required":[]}}`;
  
  ajv = new Ajv();

  inputSchema = {
    "type": "object",
    "properties": {
      "symbol": {
        "type": "string",
        "default": "ETH"
      }
    },
    "required": []
  };
  
  outputSchema = {
    "type": "object",
    "properties": {
      "address": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "symbol": {
        "type": "string"
      },
      "decimals": {
        "type": "string"
      },
      "logo": {
        "type": "string"
      },
      "logo_hash": {
        "type": "string"
      },
      "thumbnail": {
        "type": "string"
      },
      "block_number": {
        "type": ["integer", "null"]
      },
      "validated": {
        "type": ["boolean", "null"]
      },
      "created_at": {
        "type": "string"
      }
    }
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

export default GetTokenMetadataBySymbolForBinanceSmartChain;