import create from "zustand";

type Context = {
  file?: File | null;
  currentTime: number;
};

type Actions = {
  set(args: Partial<Context>): void;
};

type State = Context & Actions;

const useStore = create<State>((set, get) => ({
  currentTime: 0,
  set: (args) => set({ ...get(), ...args }),
}));

export default useStore;
