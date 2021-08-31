import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./modules/Home";
import Player from "./modules/Player";

function App() {
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
