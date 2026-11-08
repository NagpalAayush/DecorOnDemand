import { useDispatch } from 'react-redux'
import { addToCart } from '../slice/cart-slice.js'

function PackageCard({ item }) {
  const dispatch = useDispatch()

  return (
    <article className="group min-w-[270px] flex-1">
      <div className="relative aspect-[1.12] overflow-hidden rounded-2xl bg-[#f5e8dc]">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#d75443]">{item.tag}</span>
        <button aria-label={`Add ${item.name} to wishlist`} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-lg text-[#d75443] transition hover:bg-white">♡</button>
      </div>
      <div className="pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9b8c80]">{item.type}</p>
        <h3 className="mt-1 text-lg font-bold">{item.name}</h3>
        <p className="mt-2 text-sm"><b>{item.price}</b> <span className="ml-1 text-[#a99b91] line-through">{item.oldPrice}</span></p>
        <button
          type="button"
          onClick={() => dispatch(addToCart(item))}
          className="mt-4 w-full rounded-xl border border-[#d75443] px-4 py-2.5 text-sm font-bold text-[#d75443] transition hover:bg-[#d75443] hover:text-white"
        >
          Add to cart
        </button>
      </div>
    </article>
  )
}

export default PackageCard
