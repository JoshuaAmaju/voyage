import { nanoid } from "nanoid";
import { assign, createMachine } from "xstate";

type Context = {
  current?: string;
  subtitles: Map<string, string>;
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

type Events =
  | { type: "ADD"; url: string }
  | { type: "SET.current"; id: string };

const machine = createMachine<Context, Events, States>({
  initial: "disabled",

  context: {
    subtitles: new Map(),
  },

  on: {
    ADD: {
      actions: assign(({ subtitles }, { url }) => {
        const id = nanoid();
        subtitles.set(id, url);
        return { subtitles, current: id };
      }),
    },

    "SET.current": {
      actions: assign({
        current: (_, { id }) => id,
      }),
    },
  },

  states: {
    disabled: {},
    enabled: {},
  },
});

export default machine;
