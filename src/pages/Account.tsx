import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import PropertyCard from "../components/PropertyCard"
import { getFavoriteIds } from "../lib/favorites"
import { api } from "../lib/api"

const statusStyles: Record<string, string> = {
  new: "bg-amber-50 text-amber-700 border-amber-200",
  contacted: "bg-blue-50 text-blue-700 border-blue-200",
  closed: "bg-green-50 text-green-700 border-green-200",
}

export default function Account() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get("tab") === "inquiries" ? "inquiries" : "saved"

  const [saved, setSaved] = useState<any[]>([])
  const [savedLoading, setSavedLoading] = useState(true)
  const [inquiries, setInquiries] = useState<any[]>([])
  const [inquiriesLoading, setInquiriesLoading] = useState(true)

  useEffect(() => {
    api.properties.list()
      .then((items: any[]) => setSaved(items.filter((item) => getFavoriteIds().includes(item.id))))
      .catch(() => {})
      .finally(() => setSavedLoading(false))
  }, [])

  useEffect(() => {
    api.inquiries.mine()
      .then(setInquiries)
      .catch(() => {})
      .finally(() => setInquiriesLoading(false))
  }, [])

  const setTab = (next: "saved" | "inquiries") => setSearchParams(next === "saved" ? {} : { tab: next })

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Your Account</p>
        <h1 className="text-3xl font-black text-gray-900 mb-8">Saved Properties &amp; Inquiries</h1>

        <div className="mb-8 flex flex-wrap gap-2">
          {([
            ["saved", `Saved Properties (${saved.length})`],
            ["inquiries", `My Inquiries (${inquiries.length})`],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                tab === id ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "saved" && (
          savedLoading ? (
            <p className="text-sm text-gray-400">Loading saved properties...</p>
          ) : saved.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {saved.map((property) => <PropertyCard key={property.id} p={property} />)}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <h2 className="text-xl font-bold text-gray-900">No saved properties yet</h2>
              <p className="text-sm text-gray-400 mt-2 mb-6">Tap the heart on a listing to add it to your shortlist.</p>
              <Link to="/properties" className="inline-block rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white">Browse properties</Link>
            </div>
          )
        )}

        {tab === "inquiries" && (
          inquiriesLoading ? (
            <p className="text-sm text-gray-400">Loading your inquiries...</p>
          ) : inquiries.length ? (
            <div className="grid gap-3">
              {inquiries.map((inquiry) => (
                <div key={inquiry.id} className="rounded-xl bg-white border border-gray-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link to={inquiry.property_id ? `/properties/${inquiry.property_id}` : "#"} className="font-bold text-gray-900 hover:text-green-700">
                      {inquiry.properties?.title ?? "Property inquiry"}
                    </Link>
                    <span className="text-xs text-gray-400">{new Date(inquiry.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{inquiry.message}</p>
                  <span className={`inline-block mt-3 text-xs font-bold px-2.5 py-1 rounded-full border ${statusStyles[inquiry.status] ?? statusStyles.new}`}>
                    {inquiry.status ?? "new"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <h2 className="text-xl font-bold text-gray-900">No inquiries yet</h2>
              <p className="text-sm text-gray-400 mt-2 mb-6">When you contact an agent about a property, it'll show up here.</p>
              <Link to="/properties" className="inline-block rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white">Browse properties</Link>
            </div>
          )
        )}
      </div>
    </div>
  )
}
