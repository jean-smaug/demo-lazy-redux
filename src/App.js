import { configureStore, createSlice } from "@reduxjs/toolkit";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import logger from "redux-logger";
import "./App.css";

const appSlice = createSlice({
  name: "app",
  initialState: {
    player: "idle",
  },
  reducers: {
    loadPlayer: (state) => {
      state.player = "pending";
    },
    setPlayerLoaded: (state) => {
      state.player = "loaded";
    },
  },
});

const initialStore = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
  middleware: (defaultMiddlewares) => defaultMiddlewares().concat(logger),
});

function App() {
  const [store, setStore] = useState(initialStore);

  useEffect(() => {
    store.subscribe(async () => {
      const state = store.getState();

      if (state.app.player === "pending") {
        const { playerSlice } = await import("./player.slice");

        const newStore = configureStore({
          preloadedState: state,
          reducer: {
            app: appSlice.reducer,
            player: playerSlice.reducer,
          },
          middleware: (defaultMiddlewares) =>
            defaultMiddlewares().concat(logger),
        });

        newStore.dispatch(appSlice.actions.setPlayerLoaded());
        setStore(newStore);
      }
    });
  }, [store]);

  const handleClick = () => {
    store.dispatch(appSlice.actions.loadPlayer());
  };

  return (
    <Provider store={store}>
      <div className="App">
        <header className="App-header">
          <button onClick={handleClick}>Charger un module</button>
        </header>
      </div>
    </Provider>
  );
}

export default App;
