import create from "zustand";

type Context = {
  volume: number;
  file?: File | null;
  isPlaying: boolean;
  currentTime: number;
};

type Actions = {
  set(args: Partial<Context>): void;
};

type State = Context & Actions;

const useStore = create<State>((set, get) => ({
  volume: 1,
  currentTime: 0,
  isPlaying: true,
  set: (args) => set({ ...get(), ...args }),
}));

export default useStore;
