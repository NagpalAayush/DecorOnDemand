import { createElement, StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App.jsx'
import './index.css'

export function render(url) {
  return renderToString(
    createElement(
      StrictMode,
      null,
      createElement(
        StaticRouter,
        { location: url },
        createElement(App)
      )
    ),
  )
}