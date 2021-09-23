import { assign, createMachine } from "xstate";

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
      context: Context;
      value: "loaded" | { loaded: "playing" | "paused" };
    }
  | { value: "ended"; context: Context };

type Events =
  | { type: "ENDED" }
  | { type: "PAUSE" | "PLAY" | "PLAY_PAUSE" }
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
          ENDED: "ended",

          SEEK: {
            actions: ["seek", "setTime"],
          },

          TIME_UPDATE: {
            actions: "setTime",
          },
        },

        states: {
          paused: {
            entry: "pause",

            on: {
              PLAY_PAUSE: "playing",
            },
          },

          playing: {
            entry: "play",

            on: {
              PLAY_PAUSE: "paused",
            },
          },
        },
      },
      ended: {
        on: {
          PLAY_PAUSE: "loaded.playing",
        },
      },
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
