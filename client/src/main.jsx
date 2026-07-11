// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import { injectStore } from './api/axios';
import App from './App';
import './index.css';

window.store = store;
injectStore(store);

// store.subscribe(() => {
//   console.log('🔄 Redux State Updated:', store.getState().auth);
// });

// console.log('📦 Initial Redux Store:', store.getState());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);