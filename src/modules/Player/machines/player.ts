import { assign, actions, createMachine } from "xstate";

type Context = {
  duration: number;
  currentTime: number;
};

type States =
  | {
      value: "load";
      context: Context;
    }
  | {
      value: "loaded" | { loaded: "playing" | "paused" };
      context: Context;
    }
  | { value: "ended"; context: Context };

type Events =
  | { type: "PAUSE" | "PLAY" | "PLAY_PAUSE" }
  | { type: "ENDED" }
  | { type: "SEEK" | "TIME_UPDATE"; value: number };

const machine = createMachine<Context, Events, States>(
  {
    initial: "load",

    context: {
      duration: 0,
      currentTime: 0,
    },

    states: {
      load: {
        invoke: {
          src: "load",
          onDone: {
            target: "loaded",
            actions: assign((_, { data }) => data),
          },
          onError: {
            actions: (_, { data }) => console.log(data),
          },
        },
      },

      loaded: {
        initial: "playing",

        invoke: {
          src: "watcher",
        },

        on: {
          SEEK: {
            actions: ["seek", "setTime"],
          },

          TIME_UPDATE: {
            actions: "setTime",
          },

          ENDED: "ended",
        },

        states: {
          paused: {
            entry: "pause",

            on: {
              PLAY_PAUSE: {
                target: "playing",
                // actions: "play",
              },
            },
          },

          playing: {
            entry: "play",

            on: {
              PLAY_PAUSE: {
                target: "paused",
                // actions: "pause",
              },
            },
          },
        },
      },
      ended: {},
    },
  },
  {
    actions: {
      setTime: assign({
        currentTime: (_, { value }: any) => value,
      }),
    },
  }
);

export default machine;
