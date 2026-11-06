import { createElement, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.jsx'

hydrateRoot(
  document.getElementById('root'),
  createElement(
    StrictMode,
    null,
    createElement(BrowserRouter, null, createElement(App)),
  ),
)
