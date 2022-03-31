import clsx from "clsx";
import { flow } from "fp-ts/lib/function";
import { AnimateSharedLayout, motion, useAnimation } from "framer-motion";
import { createElement, createRef, useMemo, useRef } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { usePrevious } from "react-use";
import { useManager } from "./context/Manager";
import Floater from "./modules/Floater";
import Home from "./modules/Home";
import Player from "./modules/Player";
import usePlayerStore from "./zustand/player.store";

function App() {
  const docRef = useRef(document.getElementById("root"));

  const controls = useAnimation();

  const { isFloating, enterFull } = useManager();

  const { file, reset } = usePlayerStore(({ file, reset }) => ({
    file,
    reset,
  }));

  const prevFile = usePrevious(file);

  const ref = createRef<HTMLDivElement>();

  // recreate the floater display whenever the user selects a new file
  const Node = useMemo(() => {
    return (props: { onClose?: () => void }) =>
      file?.name !== prevFile?.name &&
      file?.size !== prevFile?.size &&
      file?.type !== prevFile?.type ? (
        createElement(Floater, props)
      ) : (
        <Floater {...props} />
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
            key="floater"
            initial={false}
            layoutId="player"
            animate={controls}
            dragConstraints={docRef}
            className={clsx([
              "w-96 h-60 max-w-full",
              "fixed right-0 bottom-0",
              "m-4 rounded-lg overflow-hidden",
            ])}
          >
            <Node
              onClose={() => {
                controls
                  .start({ scale: 0.7, opacity: 0 })
                  .then(flow(enterFull, reset));
              }}
            />
          </motion.div>
        )}
        {/* </AnimatePresence> */}
      </BrowserRouter>
    </AnimateSharedLayout>
  );
}

export default App;
