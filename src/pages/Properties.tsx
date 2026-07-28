import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import { api } from '../lib/api'

const TYPES = ['All', 'Apartment', 'Bungalow', 'Duplex', 'Terrace', 'Villa', 'Commercial']
const LISTING_TYPES = ['All', 'For Sale', 'For Rent']

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [type, setType] = useState(searchParams.get('type') ?? 'All')
  const [listingType, setListingType] = useState(() => {
    const value = searchParams.get('listing_type')
    return value === 'sale' ? 'For Sale' : value === 'rent' ? 'For Rent' : 'All'
  })
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') ?? '')
  const [minBeds, setMinBeds] = useState(searchParams.get('min_beds') ?? '')

  const fetchProperties = async (params: Record<string, string> = {}) => {
    setLoading(true)
    try {
      const data = await api.properties.list(params)
      setProperties(data)
    } catch {
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params: Record<string, string> = {}
    if (searchParams.get('search')) params.search = searchParams.get('search')!
    if (searchParams.get('type') && searchParams.get('type') !== 'All') params.type = searchParams.get('type')!
    if (searchParams.get('listing_type')) params.listing_type = searchParams.get('listing_type')!
    if (searchParams.get('min_price')) params.min_price = searchParams.get('min_price')!
    if (searchParams.get('max_price')) params.max_price = searchParams.get('max_price')!
    if (searchParams.get('min_beds')) params.min_beds = searchParams.get('min_beds')!
    fetchProperties(params)
  }, [searchParams])

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault()
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (type !== 'All') params.type = type
    if (listingType !== 'All') params.listing_type = listingType === 'For Sale' ? 'sale' : 'rent'
    if (minPrice) params.min_price = minPrice
    if (maxPrice) params.max_price = maxPrice
    if (minBeds) params.min_beds = minBeds
    setSearchParams(params)
  }

  const clearFilters = () => {
    setSearch('')
    setType('All')
    setListingType('All')
    setMinPrice('')
    setMaxPrice('')
    setMinBeds('')
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div style={{ background: '#16a34a' }} className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-green-200 text-xs font-bold uppercase tracking-widest mb-2">Browse</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">All Properties</h1>
          <p className="text-green-100 text-sm">Verified listings across Ibadan and Oyo State</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <form onSubmit={applyFilters} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search location or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-300 border border-gray-200 lg:col-span-2"
            />
            <select value={type} onChange={(e) => setType(e.target.value)} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-300 border border-gray-200">
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={listingType} onChange={(e) => setListingType(e.target.value)} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-300 border border-gray-200">
              {LISTING_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2.5 text-sm font-bold text-white rounded-lg transition-all hover:opacity-90" style={{ background: '#16a34a' }}>Search</button>
              <button type="button" onClick={clearFilters} className="px-3 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">✕</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Min ₦</span>
              <input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-32 text-sm bg-gray-50 rounded-lg px-3 py-2 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Beds</span>
              <select value={minBeds} onChange={(e) => setMinBeds(e.target.value)} className="text-sm bg-gray-50 rounded-lg px-3 py-2 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300">
                <option value="">Any</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Max ₦</span>
              <input type="number" placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-32 text-sm bg-gray-50 rounded-lg px-3 py-2 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300" />
            </div>
          </div>
        </form>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {loading ? 'Searching...' : <><strong className="text-gray-800">{properties.length}</strong> properties found</>}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl animate-pulse" style={{ height: '320px' }} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🏘️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No properties found</h3>
            <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search terms.</p>
            <button onClick={clearFilters} className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl" style={{ background: '#16a34a' }}>Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
