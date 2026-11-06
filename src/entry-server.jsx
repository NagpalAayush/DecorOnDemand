import { createElement, StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import './index.css'

export function render() {
  return renderToString(
    createElement(
      StrictMode,
      null,
      createElement(App)
    ),
  )
}