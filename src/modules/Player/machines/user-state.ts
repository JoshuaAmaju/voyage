import { actions, createMachine } from "xstate";

type Context = {};

type States = { value: "active" | "inactive" | "waiting"; context: Context };

type Events = { type: "ACTIVE" | "INACTIVE" | "CYCLE" | "SUSPEND" | "RESUME" };

const { send, cancel } = actions;

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

      entry: send("INACTIVE", { delay: 4000, id: "timer" }),

      exit: cancel("timer"),
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
