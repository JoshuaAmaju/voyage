import { createMachine } from "xstate";

type Context = {};

type States = { value: "active" | "inactive" | "waiting"; context: Context };

type Events = { type: "ACTIVE" | "INACTIVE" | "CYCLE" | "SUSPEND" | "RESUME" };

const machine = createMachine<Context, Events, States>({
  initial: "active",

  states: {
    waiting: {
      on: {
        RESUME: "active",
      },
    },
    active: {
      on: {
        CYCLE: "inactive",
        SUSPEND: "waiting",
        INACTIVE: "inactive",
      },

      invoke: {
        src: () => (send) => {
          let id = setTimeout(() => send("INACTIVE"), 3500);
          return () => clearTimeout(id);
        },
      },
    },

    inactive: {
      on: {
        CYCLE: "active",
        ACTIVE: "active",
        SUSPEND: "waiting",
      },
    },
  },
});

export default machine;
