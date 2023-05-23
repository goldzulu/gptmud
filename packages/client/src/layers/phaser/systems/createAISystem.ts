// seems the above has no effect? To be revisited
import { OpenAI } from "langchain/llms/openai";
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
//import { Movement }
import {
  // SerpAPI,
  AIPluginTool,
  RequestsGetTool,
  RequestsPostTool,
} from 'langchain/tools';
import {
  Calculator,
} from 'langchain/tools/calculator';

import { Has, defineEnterSystem, defineRxSystem, defineSystem, defineUpdateSystem, getComponentValueStrict, hasComponent, setComponent } from "@latticexyz/recs";
import { PhaserLayer } from "../createPhaserLayer";
import { Animations, TILE_HEIGHT, TILE_WIDTH } from "../constants";
import { pixelCoordToTileCoord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
// NOTE: requires adding rxjs as a dependency in your project
import { merge } from "rxjs";


//AI Model
const model = new OpenAI({ temperature: 0 , openAIApiKey: "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"});
// const model = new OpenAI({ temperature: 0, model: 'gpt-4' });
const tools = [
  //new SerpAPI(),
  new Calculator(),
];


export function createAISystem(layer: PhaserLayer) {
  
  const {
    world,
    networkLayer: {
      components: {
        Position,
      },
      systemCalls: {
        spawn
      },
      playerEntity,
    },
    scenes: {
      Main: {
        objectPool,
        input,
        camera,
      },
    },
  } = layer;

  // This will be the AI Memory with the seed prompt
  
  let SeedPrompt = "You are a Golem in the Mudv2 autonomous world.\n\nYou can take one action on every turn when prompted. Commands are restricted to MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT or PASS. You can asked to be moved by giving one and only one command per turn. You have an x and y position which will be given at every turn. You are free to move by responding with MOVE_UP, MOVE_DOWN, MOVE_LEFT and MOVE_RIGHT.\n\nIf you have achieved your objective, just give the command PASS.\n\n";
  let AIMemoryContext = "";

  // This is a trigger

  // This potentially is the trigger point for the GPTMud AI to do some initial setup
  input.pointerdown$.subscribe((event) => {
    if (playerEntity && hasComponent(Position, playerEntity)) return;

    const x = event.pointer.worldX;
    const y = event.pointer.worldY;

    const position = pixelCoordToTileCoord({ x, y }, TILE_WIDTH, TILE_HEIGHT);
    if (position.x === 0 && position.y === 0) return;

    spawn(position.x, position.y);


  });

  defineEnterSystem(world, [Has(Position)], ({ entity }) => {
    const playerObj = objectPool.get(entity, "Sprite");
    const position = getComponentValueStrict(Position, entity);

    // Initial prompt currently do nothing but to output to console
    console.log("Enter system! PlayerId-",playerObj.id);
    // Initial prompt currently do nothing but to output to console
    // console.log(position.x + " " + position.y);
    // AI Memory Context Buildup

    AIMemoryContext += `You have just spawned as Player ID ${playerObj.id}!\n`;
    // AI Memory Context Buildup
    console.log(AIMemoryContext);
  });


// run on new block, or when the Position component updates
// Tried here to capture blocknumber and update the AI
// but failed with typescript errors
// defineRxSystem(world, merge(blockNumber$, Position.update$), (update) => {
//   // system code
// });

  // defineUpdateSystem(world, [Has(Position)], ({ entity }) => {
  //   const position = getComponentValueStrict(Position, entity);
  //   const pixelPosition = tileCoordToPixelCoord(position, TILE_WIDTH, TILE_HEIGHT);
  //   console.log("Position Updated- "+position.x + " " + position.y)
  // });

  defineSystem(world, [Has(Position)], async ({ entity }) => {
    const position = getComponentValueStrict(Position, entity);
    const pixelPosition = tileCoordToPixelCoord(position, TILE_WIDTH, TILE_HEIGHT);

    const playerObj = objectPool.get(entity, "Sprite");

    console.log("Position changed normal defineSystem - "+position.x + " " + position.y);
    
    const currentDirectives = "Move to position x=0 y=0\n\n";
    const currentFinalPrompt = "What will be your move? Use MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT or PASS exactly\n\n"
    AIMemoryContext += `Your position: y=${position.y}, x=${position.x}\n\n`;

    const toPromptAI = SeedPrompt + AIMemoryContext + currentDirectives + currentFinalPrompt;

 
    const executor = await initializeAgentExecutorWithOptions(tools, model, {
      agentType: "zero-shot-react-description",
      verbose: true,
    });
    
    //const input = `Who is Olivia Wilde's boyfriend? What is his current age raised to the 0.23 power?`;
    
    const result = await executor.call({ input: toPromptAI });

    console.log(result);

    AIMemoryContext += `You responded: ${result}\n\n`;

    console.log(toPromptAI + `You responded: ${result}\n\n`);

    // playerObj.setComponent({
    //   id: 'position',
    //   once: (sprite) => {
    //     sprite.setPosition(pixelPosition.x, pixelPosition.y);

    //     const isPlayer = entity === playerEntity;
    //     if (isPlayer) {
    //       camera.centerOn(pixelPosition.x, pixelPosition.y);
    //     }
    //   }
    // });
  });

}