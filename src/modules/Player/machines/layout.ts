import { createMachine } from "xstate";

type Context = {};

type States =
  | {
      value: "lock" | { lock: "locked" } | { lock: "unlocked" };
      context: Context;
    }
  | {
      value:
        | "fullscreen"
        | { fullscreen: "exited" }
        | { fullscreen: "entered" };
      context: Context;
    };

type Events =
  | { type: "FULLSCREEN.exit" | "FULLSCREEN.enter" | "FULLSCREEN.cycle" }
  | { type: "LOCK.lock" | "LOCK.unlock" | "LOCK.cycle" };

const machine = createMachine<Context, Events, States>({
  type: "parallel",

  states: {
    lock: {
      initial: "unlocked",

      states: {
        locked: {
          on: {
            "LOCK.unlock": "unlocked",
            "LOCK.cycle": "unlocked",
          },
        },

        unlocked: {
          on: {
            "LOCK.lock": "locked",
            "LOCK.cycle": "locked",
          },
        },
      },
    },

    fullscreen: {
      initial: "exited",

      states: {
        exited: {
          on: {
            "FULLSCREEN.enter": "entered",
            "FULLSCREEN.cycle": "entered",
          },
        },

        entered: {
          entry: "enterFullscreen",
          exit: "exitFullscreen",

          on: {
            "FULLSCREEN.exit": "exited",
            "FULLSCREEN.cycle": "exited",
          },
        },
      },
    },
  },
});

export default machine;
