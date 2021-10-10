import clsx from "clsx";
import { AnimateSharedLayout, motion } from "framer-motion";
import { createRef, useRef, useMemo, createElement } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { useManager } from "./context/Manager";
import Floater from "./modules/Floater";
import Home from "./modules/Home";
import Player from "./modules/Player";
import usePlayerStore from "./zustand/player.store";
import { usePrevious } from "react-use";

function App() {
  const docRef = useRef(document.getElementById("root"));

  const { isFloating } = useManager();

  const file = usePlayerStore(({ file }) => file);

  const prevFile = usePrevious(file);

  const ref = createRef<HTMLDivElement>();

  // recreate the floater display whenever the user selects a new file
  const Node = useMemo(() => {
    return () =>
      file?.name !== prevFile?.name &&
      file?.size !== prevFile?.size &&
      file?.type !== prevFile?.type ? (
        createElement(Floater)
      ) : (
        <Floater />
      );
  }, [
    file?.name,
    file?.size,
    file?.type,
    prevFile?.name,
    prevFile?.size,
    prevFile?.type,
  ]);

  return (
    <AnimateSharedLayout>
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/player">
            <Player />
          </Route>
        </Switch>

        {/* <AnimatePresence> */}
        {isFloating && (
          <motion.div
            drag
            ref={ref}
            layoutId="player"
            dragConstraints={docRef}
            exit={{ scale: 0.6, opacity: 0 }}
            className={clsx([
              "w-96 h-60",
              "fixed right-0 bottom-0",
              "m-4 rounded-lg overflow-hidden",
            ])}
          >
            <Node />
          </motion.div>
        )}
        {/* </AnimatePresence> */}
      </BrowserRouter>
    </AnimateSharedLayout>
  );
}

export default App;
