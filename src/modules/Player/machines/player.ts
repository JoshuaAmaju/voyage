import { assign, createMachine } from "xstate";

type Context = {
  volume: number;
  muted: boolean;
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
  | { type: "SEEK" | "TIME_UPDATE" | "VOLUME"; value: number };

const machine = createMachine<Context, Events, States>(
  {
    initial: "load",

    context: {
      volume: 1,
      duration: 0,
      muted: false,
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
        initial: "paused",

        invoke: {
          src: "watcher",
        },

        on: {
          ENDED: "ended",

          PAUSE: ".paused",

          PLAY: ".playing",

          SEEK: {
            actions: ["seek", "setTime"],
          },

          TIME_UPDATE: {
            actions: "setTime",
          },

          VOLUME: {
            actions: ["volume", "setVolume"],
          },
        },

        states: {
          paused: {
            // entry: "pause",

            on: {
              PLAY_PAUSE: {
                actions: "play",
                target: "playing",
              },
            },
          },

          playing: {
            // entry: "play",

            on: {
              PLAY_PAUSE: {
                target: "paused",
                actions: "pause",
              },
            },
          },
        },
      },
      ended: {
        on: {
          PLAY_PAUSE: {
            target: "loaded.playing",
            actions: "play",
          },
        },
      },
    },
  },
  {
    actions: {
      setTime: assign({
        currentTime: (_, { value }: any) => value,
      }),
      setVolume: assign({
        volume: (_, { value }: any) => value,
      }),
    },
  }
);

export default machine;
