import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../lib/api"
import { supabase } from "../lib/supabase"

const TYPES = ["Apartment", "Bungalow", "Duplex", "Terrace", "Villa", "Commercial", "Land"]
const AMENITIES = ["Parking", "Security", "Furnished", "Serviced", "Generator", "Borehole", "Estate", "Balcony"]
const emptyForm = { title: "", type: "Apartment", listing_type: "rent", price: "", location: "", beds: "1", baths: "1", sqft: "", floor_count: "", description: "", availability_text: "Available now" }

export default function ListProperty() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [landlord, setLandlord] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState("")
  const [form, setForm] = useState(emptyForm)
  const [amenities, setAmenities] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const loadAccount = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { navigate("/login?next=/list-property"); return }
      setUserId(data.user.id)
      try {
        const profile: any = await api.profiles.get(data.user.id)
        setLandlord(profile.role === "landlord")
        setIsAdmin(Boolean(profile.is_admin))
      } catch { setLandlord(false) }
      setReady(true)
    }
    loadAccount()
  }, [navigate])

  const uploadImages = async (fileList?: FileList) => {
    const files = Array.from(fileList ?? [])
    if (!files.length) return
    const invalid = files.find(file => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)
    if (invalid) { setMessage("Each photo must be an image no larger than 5 MB."); return }
    if (images.length + files.length > 10) { setMessage("A listing can have up to 10 photos."); return }
    setBusy(true); setMessage(`Uploading ${files.length} photo${files.length === 1 ? "" : "s"}...`)
    const urls: string[] = []; const failed: string[] = []
    for (const [index, file] of files.entries()) {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-")
      const path = `${userId}/${Date.now()}-${index}-${cleanName}`
      const { error } = await supabase.storage.from("property-images").upload(path, file, { contentType: file.type })
      if (error) failed.push(file.name)
      else urls.push(supabase.storage.from("property-images").getPublicUrl(path).data.publicUrl)
    }
    setImages(current => [...current, ...urls])
    setMessage(failed.length ? `${urls.length} uploaded. Could not upload: ${failed.join(", ")}.` : `${urls.length} photo${urls.length === 1 ? "" : "s"} uploaded. The first image is the cover.`)
    setBusy(false)
  }

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const next = [...images]; [next[index], next[target]] = [next[target], next[index]]; setImages(next)
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!images.length) { setMessage("Please upload at least one property photo."); return }
    setBusy(true); setMessage("")
    const price = Number(form.price)
    try {
      await api.properties.create({
        ...form, price, beds: Number(form.beds), baths: Number(form.baths),
        floor_count: form.floor_count ? Number(form.floor_count) : null,
        price_display: `₦${new Intl.NumberFormat("en-NG").format(price)}${form.listing_type === "rent" ? "/yr" : ""}`,
        images, amenities, owner_id: userId, status: isAdmin ? "published" : "pending",
      })
      setMessage(isAdmin ? "Your listing has been published." : "Your listing has been submitted for review. We will publish it once verified.")
      setForm(emptyForm); setAmenities([]); setImages([])
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not submit your listing.") }
    setBusy(false)
  }

  const field = "mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-300"
  if (!ready) return <div className="py-24 text-center text-sm text-gray-500">Checking your account...</div>
  if (!landlord && !isAdmin) return <div className="max-w-xl mx-auto px-4 py-24 text-center"><div className="rounded-2xl border border-amber-100 bg-amber-50 p-8"><h1 className="text-2xl font-black text-gray-900">Landlord account required</h1><p className="mt-3 text-sm leading-relaxed text-gray-600">Only landlord or agent accounts can publish property listings. Create a landlord account to submit a property for review.</p><Link to="/register" className="mt-6 inline-block rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white">Create landlord account</Link></div></div>

  return <div className="min-h-screen bg-gray-50 py-10"><div className="max-w-4xl mx-auto px-4 sm:px-6">
    <div className="mb-8"><p className="text-xs font-bold uppercase tracking-widest text-green-600">{isAdmin ? "Admin" : "Landlord portal"}</p><h1 className="mt-1 text-3xl font-black text-gray-900">List your property</h1><p className="mt-2 text-sm text-gray-500">{isAdmin ? "As an admin, your listings publish immediately — no review needed." : "Add accurate details and photos. All new listings are reviewed before going live."}</p></div>
    <form onSubmit={submit} className="space-y-6">
      {message && <p className={`rounded-xl px-4 py-3 text-sm ${message.includes("submitted") || message.includes("published") ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{message}</p>}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><h2 className="font-black text-gray-900">Property details</h2><div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-gray-700">Listing title<input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Modern 3-bedroom apartment in Bodija" className={field} /></label>
        <label className="text-sm font-semibold text-gray-700">Location<input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Bodija, Ibadan" className={field} /></label>
        <label className="text-sm font-semibold text-gray-700">Property type<select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={field}>{TYPES.map(type => <option key={type}>{type}</option>)}</select></label>
        <label className="text-sm font-semibold text-gray-700">Purpose<select value={form.listing_type} onChange={e => setForm({ ...form, listing_type: e.target.value })} className={field}><option value="rent">For rent</option><option value="sale">For sale</option></select></label>
        <label className="text-sm font-semibold text-gray-700">Price (₦)<input required min="0" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 1500000" className={field} /></label>
        <label className="text-sm font-semibold text-gray-700">Availability<input value={form.availability_text} onChange={e => setForm({ ...form, availability_text: e.target.value })} placeholder="Available now" className={field} /></label>
      </div></section>
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><h2 className="font-black text-gray-900">Size and features</h2><div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        <label className="text-sm font-semibold text-gray-700">Bedrooms<input min="0" type="number" value={form.beds} onChange={e => setForm({ ...form, beds: e.target.value })} className={field} /></label>
        <label className="text-sm font-semibold text-gray-700">Bathrooms<input min="0" type="number" value={form.baths} onChange={e => setForm({ ...form, baths: e.target.value })} className={field} /></label>
        <label className="text-sm font-semibold text-gray-700">Storeys<input min="0" type="number" value={form.floor_count} onChange={e => setForm({ ...form, floor_count: e.target.value })} className={field} /></label>
        <label className="text-sm font-semibold text-gray-700">Area<input value={form.sqft} onChange={e => setForm({ ...form, sqft: e.target.value })} placeholder="e.g. 450 sqm" className={field} /></label>
      </div><p className="mt-5 text-sm font-semibold text-gray-700">Amenities</p><div className="mt-3 flex flex-wrap gap-2">{AMENITIES.map(item => <button key={item} type="button" onClick={() => setAmenities(current => current.includes(item) ? current.filter(a => a !== item) : [...current, item])} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${amenities.includes(item) ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 text-gray-600"}`}>{amenities.includes(item) ? "✓ " : ""}{item}</button>)}</div></section>
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><h2 className="font-black text-gray-900">Photos</h2><p className="mt-1 text-sm text-gray-500">Add 1–10 clear images. The first photo is used as the cover; use the arrows to change it.</p><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={e => { uploadImages(e.target.files); e.currentTarget.value = "" }} className="mt-4 block w-full text-sm" /><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((url, index) => <div key={url} className="relative overflow-hidden rounded-xl border border-gray-100"><img src={url} alt={`Upload ${index + 1}`} className="h-28 w-full object-cover" />{index === 0 && <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] font-bold text-white">Cover</span>}<div className="flex items-center justify-between p-2"><div className="flex gap-1"><button type="button" aria-label="Move image earlier" onClick={() => moveImage(index, -1)} disabled={index === 0} className="rounded px-1 text-gray-600 disabled:opacity-30">←</button><button type="button" aria-label="Move image later" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} className="rounded px-1 text-gray-600 disabled:opacity-30">→</button></div><button type="button" onClick={() => setImages(images.filter(image => image !== url))} className="text-xs font-bold text-red-600">Remove</button></div></div>)}</div></section>
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><label className="block text-sm font-semibold text-gray-700">Description<textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} placeholder="Describe the property, what is included, access roads, nearby landmarks and any important terms." className={field} /></label></section>
      <button disabled={busy} className="rounded-xl bg-green-600 px-6 py-3.5 text-sm font-bold text-white disabled:opacity-60">{busy ? "Working..." : isAdmin ? "Publish listing" : "Submit for review"}</button>
    </form>
  </div></div>
}
