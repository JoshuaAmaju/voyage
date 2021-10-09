import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./modules/Home";
import Player from "./modules/Player";
import { useManager } from "./context/Manager";
import Floater from "./modules/Floater";

function App() {
  const { isFloating } = useManager();

  return (
    <>
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/player">
            <Player />
          </Route>
        </Switch>

        {isFloating && (
          <div className="w-96 h-60 fixed right-0 bottom-0 m-4 rounded">
            <Floater />
          </div>
        )}
      </BrowserRouter>
    </>
  );
}

export default App;
