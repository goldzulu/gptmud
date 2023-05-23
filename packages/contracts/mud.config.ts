import { mudConfig, resolveTableId } from "@latticexyz/world/register";

export default mudConfig({
  enums: {
    Direction: [
      "Unknown",
      "Up",
      "Down",
      "Left",
      "Right",
    ]
  },
  tables: {
    Position: {
      schema: {
        x: "int32",
        y: "int32",
      }
    },
    Health: {
      schema: {
        current: "int32",
        max: "int32",
      },
    },
    Strength: {
      schema: "int32",
    }
  },
  modules: [
    {
      name: "KeysWithValueModule",
      root: true,
      args: [resolveTableId("Position")],
    },
  ]
});
