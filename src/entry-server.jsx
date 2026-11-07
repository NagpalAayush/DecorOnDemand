import { createElement, StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { Provider } from 'react-redux'
import App from './App.jsx'
import store from './store/store.js'
import './index.css'

export function render(url) {
  
  return renderToString(
    createElement(
      StrictMode,
      null,
      createElement(
        Provider,
        { store },
        createElement(
          StaticRouter,
          { location: url },
          createElement(App)
        )
      )
    ),
  )
}