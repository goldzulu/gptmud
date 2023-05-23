import { Tool } from 'langchain/agents';
import Ajv from 'ajv';

// The following is the actual code that will be
// run by the tool when it is called
import axios from "axios";


async function call({ symbol, slug }) {

  // endpoints
const endpoint = "/v2/cryptocurrency/info"

const headers = {
  'X-CMC_PRO_API_KEY': process.env.X_CMC_PRO_API_KEY ? process.env.X_CMC_PRO_API_KEY : process.env.X_CMC_PRO_API_KEY_SANDBOX,
};
const coinmarketcap_url = process.env.COINMARKETCAP_PROD ? process.env.COINMARKETCAP_PROD : process.env.COINMARKETCAP_SANDBOX;
    
  // get the metadata for the given symbol or slug
  // slug is one word only so just get the first word 
  // if there are multiple words that is saperated by dash
  const param = symbol ? `symbol=${symbol}` : `slug=${slug}`;
  const response = await axios.get(
    `${coinmarketcap_url}${endpoint}?${param}`
    , { headers }
  );
  const data = response.data;
  return response.data;
}

// This is a class that corresponds to the Langchain tool definition
// https://js.langchain.com/docs/modules/agents/tools/
// It validates the input & output against the schemas
// and then it calls the tool code
class GetCryptocurrencyMetadataBySymbolOrSlug extends Tool {
  name = 'get-cryptocurrency-metadata-by-symbol-or-slug';
  
  description = `Get metadata on cryptocurrency by symbol or slug. The action input should adhere to this JSON schema:
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
      }}
    }},
    "anyOf": [
      {{ "required": ["symbol"] }},
      {{ "required": ["slug"] }}
    ]
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
      }
    },
    anyOf: [
      { required: ["symbol"] },
      { required: ["slug"] }
    ]
  };
  
  outputSchema = 
  {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
      "status": {
        "type": "object",
        "properties": {
          "timestamp": { "type": "string" },
          "error_code": { "type": "integer" },
          "error_message": { "type": "null" },
          "elapsed": { "type": "integer" },
          "credit_count": { "type": "integer" },
          "notice": { "type": "null" }
        },
        "required": ["timestamp", "error_code", "error_message", "elapsed", "credit_count", "notice"]
      },
      "data": {
        "type": "object",
        "properties": {
          symbol: {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": { "type": "integer" },
                "name": { "type": "string" },
                "symbol": { "type": "string" },
                "category": { "type": "string" },
                "description": { "type": "string" },
                "slug": { "type": "string" },
                "logo": { "type": "string" },
                "subreddit": { "type": "string" },
                "notice": { "type": "string" },
                "tags": { "type": "array", "items": { "type": "string" } },
                "tag-names": { "type": "array", "items": { "type": "string" } },
                "tag-groups": { "type": "array", "items": { "type": "string" } },
                "urls": {
                  "type": "object",
                  "properties": {
                    "website": { "type": "array", "items": { "type": "string" } },
                    "twitter": { "type": "array", "items": { "type": "string" } },
                    "message_board": { "type": "array", "items": { "type": "string" } },
                    "chat": { "type": "array", "items": { "type": "string" } },
                    "facebook": { "type": "array", "items": { "type": "string" } },
                    "explorer": { "type": "array", "items": { "type": "string" } },
                    "reddit": { "type": "array", "items": { "type": "string" } },
                    "technical_doc": { "type": "array", "items": { "type": "string" } },
                    "source_code": { "type": "array", "items": { "type": "string" } },
                    "announcement": { "type": "array", "items": { "type": "string" } }
                  },
                  "required": [
                    "website",
                    "twitter",
                    "message_board",
                    "chat",
                    "facebook",
                    "explorer",
                    "reddit",
                    "technical_doc",
                    "source_code",
                    "announcement"
                  ]
                },
                "platform": { "type": "null" },
              "date_added": { "type": "string" },
                "twitter_username": { "type": "string" },
                "is_hidden": { "type": "integer" },
                "date_launched": { "type": "null" },
                "contract_address": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "contract_address": { "type": "string" },
                      "platform": {
                        "type": "object",
                        "properties": {
                          "name": { "type": "string" },
                          "coin": {
                            "type": "object",
                            "properties": {
                              "id": { "type": "string" },
                              "name": { "type": "string" },
                              "symbol": { "type": "string" },
                              "slug": { "type": "string" }
                            },
                            "required": ["id", "name", "symbol", "slug"]
                          }
                        },
                        "required": ["name", "coin"]
                      }
                    },
                    "required": ["contract_address", "platform"]
                  }
                },
                "self_reported_circulating_supply": { "type": "null" },
                "self_reported_tags": { "type": "null" },
                "self_reported_market_cap": { "type": "null" },
                "infinite_supply": { "type": "boolean" }
              },
              "required": [
                "id",
                "name",
                "symbol",
                "category",
                "description",
                "slug",
                "logo",
                "subreddit",
                "notice",
                "tags",
                "tag-names",
                "tag-groups",
                "urls",
                "platform",
                "date_added",
                "twitter_username",
                "is_hidden",
                "date_launched",
                "contract_address",
                "self_reported_circulating_supply",
                "self_reported_tags",
                "self_reported_market_cap",
                "infinite_supply"
              ]
            }
          }
        }
      }
    },
    "required": ["status", "data"]
  }

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

export default GetCryptocurrencyMetadataBySymbolOrSlug;