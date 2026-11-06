import { createElement, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

hydrateRoot(
  document.getElementById('root'),
  createElement(StrictMode, null, createElement(App)),
)
