import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { reducer, State } from './reducer';

const persistedReducer = persistReducer(
  {
    key: 'riptide',
    storage
  },
  reducer
);

const store = createStore(persistedReducer);
const persistor = persistStore(store);

export { store, persistor };