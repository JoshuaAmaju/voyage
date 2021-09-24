import { actions, createMachine } from "xstate";

type Context = {};

type States = { value: "active" | "inactive"; context: Context };

type Events = { type: "ACTIVE" | "INACTIVE" | "CYCLE" };

const { send, cancel } = actions;

const machine = createMachine<Context, Events, States>({
  initial: "active",

  states: {
    active: {
      on: {
        CYCLE: "inactive",
        INACTIVE: "inactive",
      },

      entry: send("INACTIVE", { delay: 4000, id: "timer" }),

      exit: cancel("timer"),
    },

    inactive: {
      on: {
        CYCLE: "active",
        ACTIVE: "active",
      },
    },
  },
});

export default machine;
