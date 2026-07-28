import { Link } from 'react-router-dom'
import { useState } from 'react'
import { getFavoriteIds, toggleFavorite } from '../lib/favorites'

type Property = {
  id: string
  title: string
  type: string
  listing_type: string
  price_display: string
  location: string
  beds: number
  baths: number
  sqft: string
  images: string[]
  featured?: boolean
}

export default function PropertyCard({ p, locked = false }: { p: Property; locked?: boolean }) {
  const [saved, setSaved] = useState(() => (locked ? false : getFavoriteIds().includes(p.id)))

  const handleSave = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setSaved(toggleFavorite(p.id))
  }

  // Logged-out visitors get sent to sign in/register with `next` pointing at the
  // real property, so once they authenticate they land on the actual listing —
  // not this randomized preview.
  const href = locked ? `/login?next=${encodeURIComponent(`/properties/${p.id}`)}` : `/properties/${p.id}`

  return (
    <Link
      to={href}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block"
    >
      <div className="relative bg-gray-200 overflow-hidden" style={{ height: '220px' }}>
        <img
          src={p.images?.[0] ?? 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop&auto=format'}
          alt={p.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
            style={{ background: p.listing_type === 'rent' ? '#2563eb' : '#16a34a' }}
          >
            {p.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>
        {locked ? (
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
            🔒 Preview
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
            📷 {p.images?.length ?? 1}
          </div>
        )}
        {!locked && (
          <button type="button" onClick={handleSave} aria-label={saved ? 'Remove from saved properties' : 'Save property'} className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/95 text-lg shadow flex items-center justify-center hover:scale-105 transition-transform">
            {saved ? '♥' : '♡'}
          </button>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-900 text-base leading-snug">{p.title}</h3>
          <span className="font-black text-green-600 text-sm ml-2 shrink-0">{p.price_display}</span>
        </div>
        <p className="text-sm text-gray-400 mb-4 flex items-center gap-1">
          <span>📍</span> {p.location}
        </p>
        <div className="flex gap-4 text-xs text-gray-500 border-t border-gray-100 pt-4">
          {p.beds > 0 && <span>🛏 {p.beds} Beds</span>}
          <span>🚿 {p.baths} Baths</span>
          <span>📐 {p.sqft}</span>
        </div>
      </div>
    </Link>
  )
}
