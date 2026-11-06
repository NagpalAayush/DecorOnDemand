function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d75443]">{eyebrow}</p>
        <h2 className="font-serif text-3xl font-semibold tracking-[-0.04em] text-[#2f2924] sm:text-4xl">{title}</h2>
      </div>
      {action && <a href="#collections" className="hidden text-sm font-bold text-[#d75443] sm:block">{action} <span aria-hidden="true">→</span></a>}
    </div>
  )
}

export default SectionHeading
