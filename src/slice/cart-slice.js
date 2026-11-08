import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload
      const existingItem = state.items.find((cartItem) => cartItem.name === item.name)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push({ ...item, quantity: 1 })
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.name !== action.payload)
    },
    updateQuantity: (state, action) => {
      const item = state.items.find((cartItem) => cartItem.name === action.payload.name)
      if (!item) return

      item.quantity = Math.max(1, action.payload.quantity)
    },
    clearCart: (state) => {
      state.items = []
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
