import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { Provider } from 'react-redux'
import { makeStore } from './store/store.js'
import './index.css'
import App from './App.jsx'

const preloadedState = window.__PRELOADED_STATE__
const store = makeStore(preloadedState)
delete window.__PRELOADED_STATE__

hydrateRoot(
  document.getElementById('root'),
  <Provider store={store}>
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  </Provider>
)
