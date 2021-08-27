import { configureStore, createSlice } from "@reduxjs/toolkit";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import logger from "redux-logger";
import "./App.css";

const appSlice = createSlice({
  name: "app",
  initialState: {
    player: "idle",
    profile: "idle",
  },
  reducers: {
    setModuleLoading: (state, { payload }) => {
      if (!state[payload]) throw new Error(`module ${payload} doesn't exists`);

      if (state[payload] === "idle") {
        state[payload] = "pending";
      }
    },
    setModuleLoaded: (state, { payload }) => {
      if (!state[payload]) throw new Error(`module ${payload} doesn't exists`);

      if (state[payload] === "pending") {
        state[payload] = "loaded";
      }
    },
    setModulesLoading: (state, { payload }) => {
      if (!payload.every((module) => state[module]))
        throw new Error(`module ${payload} doesn't exists`);

      payload.forEach((module) => {
        if (state[module] === "idle") {
          state[module] = "pending";
        }
      });
    },
    setModulesLoaded: (state, { payload }) => {
      if (!payload.every((module) => state[module]))
        throw new Error(`module ${payload} doesn't exists`);

      payload.forEach((module) => {
        if (state[module] === "pending") {
          state[module] = "loaded";
        }
      });
    },
  },
});

/**
 *
 * @param {*} currentStore
 * @param {object} slices { player: playerSlice }
 * @returns
 */
function createStore(currentStore, slices = {}) {
  const reducer = {
    app: appSlice.reducer,
  };

  Object.entries(slices).forEach(([moduleName, slice]) => {
    if (slice && slice.reducer && moduleName) {
      reducer[moduleName] = slice.reducer;
    }
  });

  return configureStore({
    preloadedState: currentStore ? currentStore.getState() : undefined,
    reducer,
    middleware: (defaultMiddlewares) => defaultMiddlewares().concat(logger),
  });
}

function App() {
  const [store, setStore] = useState(null);

  useEffect(() => {
    const initialStore = createStore();
    setStore(initialStore);
  }, []);

  useEffect(() => {
    if (!store) return;

    const unsubscribe = store.subscribe(async () => {
      const state = store.getState();

      const modulesToLoad = {};

      if (state.app.player === "pending") {
        modulesToLoad.player = (
          await import(
            /* webpackChunkName: "player" */ "./modules/player.slice"
          )
        ).playerSlice;
      }

      if (state.app.profile === "pending") {
        modulesToLoad.profile = (
          await import(
            /* webpackChunkName: "profile" */ "./modules/profile.slice"
          )
        ).profileSlice;
      }

      if (!Object.keys(modulesToLoad).length) return;

      const newStore = createStore(store, modulesToLoad);

      newStore.dispatch(
        appSlice.actions.setModulesLoaded(Object.keys(modulesToLoad))
      );

      setStore(newStore);

      /**
       * Because of this unsubscription, it's impossible
       * to delay module loading on a store instance.
       * For example this will not work
       *
       * // OK
       * store.dispatch(appSlice.actions.setModuleLoading("player"));
       *
       * setTimeout(() => {
       *  // Not OK because unsubcribe as already been called
       *  store.dispatch(appSlice.actions.setModuleLoading("profile"));
       * })
       */
      unsubscribe();
    });
  }, [store]);

  const handleClick = () => {
    store.dispatch(appSlice.actions.setModulesLoading(["player", "profile"]));
  };

  if (!store) return null;

  const appState = store.getState().app;

  return (
    <Provider store={store}>
      <div className="App">
        <header className="App-header">
          <button onClick={handleClick}>Charger un module</button>
          <ul>
            {Object.entries(appState).map(([name, status]) => {
              return (
                <li key={name}>
                  {name} : {status}
                </li>
              );
            })}
          </ul>
        </header>
      </div>
    </Provider>
  );
}

export default App;
