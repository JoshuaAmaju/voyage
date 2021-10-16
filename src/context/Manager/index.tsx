import React, {
  createContext,
  ReactNode,
  useContext,
  useCallback,
} from "react";
import { useMachine } from "@xstate/react";
import machine from "./machine";

type ManagerType = {
  isFull: boolean;
  enterFull(): void;
  enterFloat(): void;
  isFloating: boolean;
};

const Context = createContext<ManagerType>({} as any);

export const useManager = () => useContext(Context);

const Manager = ({ children }: { children: ReactNode }) => {
  const [state, send] = useMachine(machine);

  const isFull = state.matches("full");
  const isFloating = state.matches("floating");

  const enterFull = useCallback(() => {
    send("FULL");
  }, [send]);

  const enterFloat = useCallback(() => {
    send("FLOAT");
  }, [send]);

  return (
    <Context.Provider value={{ isFull, enterFull, enterFloat, isFloating }}>
      {children}
    </Context.Provider>
  );
};

export default Manager;
