import { createMachine } from "xstate";

type Context = {};

type States = { value: "active" | "inactive"; context: Context };

type Events = { type: "ACTIVE" | "INACTIVE" };

const machine = createMachine<Context, Events, States>({
  initial: "active",

  states: {
    active: {
      on: {
        INACTIVE: "inactive",
      },

      after: {
        4000: "inactive",
      },
    },

    inactive: {
      on: {
        ACTIVE: "active",
      },
    },
  },
});

export default machine;
