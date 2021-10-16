import { createMachine } from "xstate";

type Context = {};

type States = { value: "full" | "floating"; context: Context };

type Events = { type: "FULL" | "FLOAT" };

const machine = createMachine<Context, Events, States>({
  initial: "full",

  states: {
    full: {
      on: {
        FLOAT: "floating",
      },
    },

    floating: {
      on: {
        FULL: "full",
      },
    },
  },
});

export default machine;
