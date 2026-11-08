import { Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { clearCart, removeFromCart, updateQuantity } from '../slice/cart-slice.js'

function priceValue(price) {
  return Number(price.replace(/[₹,]/g, ''))
}

function Cart() {
  const dispatch = useDispatch()
  const items = useSelector((state) => state.cart.items)
  const total = items.reduce((sum, item) => sum + priceValue(item.price) * item.quantity, 0)

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d75443]">Ready when you are</p><h1 className="mt-3 font-serif text-5xl font-semibold">Your cart</h1></div>
        {items.length > 0 && <button type="button" onClick={() => dispatch(clearCart())} className="text-sm font-bold text-[#d75443]">Clear cart</button>}
      </div>
      {items.length === 0 ? (
        <section className="mt-10 rounded-3xl border border-dashed border-[#d9b8a5] bg-white p-10 text-center">
          <h2 className="text-2xl font-bold">Your cart is waiting for a little magic</h2>
          <p className="mt-2 text-[#766a60]">Add a celebration setup to get started.</p>
          <Link to="/#packages" className="mt-6 inline-block rounded-full bg-[#d75443] px-6 py-3 font-bold text-white">Browse setups</Link>
        </section>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
          <section className="space-y-4">
            {items.map((item) => <article key={item.name} className="flex gap-4 rounded-2xl border border-[#eee2d5] bg-white p-4">
              <img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl object-cover" />
              <div className="min-w-0 flex-1"><h2 className="font-bold">{item.name}</h2><p className="mt-1 text-sm text-[#766a60]">{item.type}</p><p className="mt-2 font-bold text-[#d75443]">{item.price}</p></div>
              <div className="flex flex-col items-end justify-between"><button type="button" onClick={() => dispatch(removeFromCart(item.name))} className="text-xs text-[#9b8c80]">Remove</button><div className="flex items-center gap-2"><button type="button" onClick={() => dispatch(updateQuantity({ name: item.name, quantity: item.quantity - 1 }))} className="grid h-7 w-7 place-items-center rounded-full bg-[#f7e6d9]">−</button><span className="w-4 text-center text-sm font-bold">{item.quantity}</span><button type="button" onClick={() => dispatch(updateQuantity({ name: item.name, quantity: item.quantity + 1 }))} className="grid h-7 w-7 place-items-center rounded-full bg-[#f7e6d9]">+</button></div></div>
            </article>)}
          </section>
          <aside className="h-fit rounded-3xl bg-[#2f2924] p-7 text-white"><h2 className="text-xl font-bold">Order summary</h2><div className="mt-6 flex justify-between border-b border-white/15 pb-4 text-sm text-white/70"><span>Subtotal</span><span>₹{total.toLocaleString('en-IN')}</span></div><div className="mt-5 flex justify-between text-lg font-bold"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div><button type="button" onClick={() => window.alert('Thanks! Our team will contact you to confirm your booking.')} className="mt-7 w-full rounded-xl bg-[#efad93] py-3 font-bold text-[#2f2924]">Continue to booking</button></aside>
        </div>
      )}
    </main>
  )
}

export default Cart
