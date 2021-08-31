import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./modules/Home";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
