import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./modules/Home";
import Player from "./modules/Player";
import { useManager } from "./context/Manager";

function App() {
  const { enterFull, isFloating } = useManager();

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/player">
          <Player />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
