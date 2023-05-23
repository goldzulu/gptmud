import { Tool } from 'langchain/agents';
import Ajv from 'ajv';

// GPTMud Movement Tool

// For now since it is simple, just echo back the movement for the main SystemAI to action on

// The following is the actual code that will be
// run by the tool when it is called


async function call({ input }) {
  return {
    movement: input.input
  };
}

// This is a class that corresponds to the Langchain tool definition
// https://js.langchain.com/docs/modules/agents/tools/
// It validates the input & output against the schemas
// and then it calls the tool code
class GetMetadataOnCryptocurrencyWithSymbol extends Tool {
  name = 'movement';
  
  description = `Move in a certain direction or stay where you are. The action input should adhere to this JSON schema:
  {{"type":"object","properties":{{"movement":{{"type":"string","default":"PASS"}}}}}}`;
  
  ajv = new Ajv();

  inputSchema = {
    "type": "object",
    "properties": {
      "movement": {
        "type": "string",
        "description": "The movement you want to make or pass to stay. Can be either MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, or PASS",
      }
    }
  };
  
  // outputSchema = {
  //   "type": "object",
  //   "properties": {
  //     "movement": {
  //       "type": "string",
  //       "description": "The movement you want to make or pass to stay. Can be either MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, or PASS"
  //     },
  //   }
  // };

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
    } catch (err) {
      output = { error: err.message || err };
    }
    return JSON.stringify(output);
  }
}

export default Movement;