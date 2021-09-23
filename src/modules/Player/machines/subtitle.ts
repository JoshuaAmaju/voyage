import { assign, createMachine } from "xstate";

type Context = {
  subtitles: string[];
};

type States =
  | {
      value: "disabled";
      context: Context;
    }
  | {
      context: Context;
      value: "enabled";
    }
  | {
      context: Context;
      value: "searching";
    };

type Events = { type: "ADD" };

const machine = createMachine<Context, Events, States>({
  initial: "disabled",

  context: {
    subtitles: [],
  },

  on: {
    ADD: {
      actions: assign({
        subtitles: (_) => [],
      }),
    },
  },

  states: {
    disabled: {},
    enabled: {},
  },
});

export default machine;
