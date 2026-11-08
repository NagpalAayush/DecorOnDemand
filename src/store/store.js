import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../slice/user-slice.js'
import cartReducer from '../slice/cart-slice.js'

export function makeStore(preloadedState) {
  return configureStore({
    reducer: {
      user: userReducer,
      cart: cartReducer,
    },
    preloadedState,
  })
}