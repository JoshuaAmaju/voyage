import create from "zustand";

type Context = {
  volume: number;
  file?: File | null;
  isPlaying: boolean;
  currentTime: number;
};

type Actions = {
  reset: () => void;
  set(args: Partial<Context>): void;
};

type State = Context & Actions;

const useStore = create<State>((set, get) => ({
  volume: 1,
  currentTime: 0,
  isPlaying: true,
  set: (args) => set({ ...get(), ...args }),
  reset: () => set({ file: null, volume: 1, currentTime: 0, isPlaying: false }),
}));

export default useStore;
