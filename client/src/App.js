import { BrowserRouter, Switch, Route } from "react-router-dom";
import GameBoard from "./pages/GameBoard";
import Controller from "./pages/Controller";
import PuzzleCreator from "./pages/PuzzleCreator";

function App() {
  return (
    <div className="App">
      <div className="plane-bg"></div>
      <BrowserRouter>
        <Switch>
          <Route path="/control">
            <Controller />
          </Route>
          <Route path="/puzzle">
            <PuzzleCreator />
          </Route>
          <Route>
            <GameBoard />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
