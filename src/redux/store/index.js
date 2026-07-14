import {applyMiddleware, compose, legacy_createStore as createStore} from 'redux';
import reducers from '../reducers/index';
import {thunk} from 'redux-thunk';
import createSagaMiddleware from '@redux-saga/core';
import { watcherSaga } from 'redux/sagas/rootSaga';

const sagaMiddleware = createSagaMiddleware();

const middlewares = [thunk, sagaMiddleware];
const composeEnhancers = import.meta.env.DEV
  ? (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose)
  : compose;

export default function configureStore(initialState) {
  const store = createStore(
    reducers,
    initialState,
    composeEnhancers(applyMiddleware(...middlewares)),
  );

  sagaMiddleware.run(watcherSaga);

  if (import.meta.hot) {
    import.meta.hot.accept('../reducers/index', (module) => {
      store.replaceReducer(module.default);
    });
  }
  return store;
}
