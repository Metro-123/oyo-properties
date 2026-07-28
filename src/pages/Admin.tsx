import { useEffect, useState } from "react"
import { api } from "../lib/api"
import { supabase } from "../lib/supabase"

const blankForm = { title: "", type: "Apartment", listing_type: "sale", price: "", location: "", beds: "0", baths: "1", floor_count: "", sqft: "", description: "", featured: false }

export default function Admin() {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [form, setForm] = useState(blankForm)
  const [images, setImages] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState<"pending" | "published" | "rejected" | "all">("pending")
  const [section, setSection] = useState<"listings" | "inquiries" | "messages">("listings")
  const [inquiries, setInquiries] = useState<any[]>([])
  const [contactMessages, setContactMessages] = useState<any[]>([])

  const loadProperties = () => api.properties.list().then(setProperties).catch(() => setMessage("Could not load properties."))
  useEffect(() => {
    const checkAccess = async () => {
      const { data, error: userError } = await supabase.auth.getUser()
      if (userError || !data.user) { setMessage(userError?.message ?? "Please sign in with your administrator account."); return setAllowed(false) }
      try {
        const profile: any = await api.profiles.get(data.user.id)
        setAllowed(Boolean(profile.is_admin))
        if (profile.is_admin) {
          loadProperties()
          api.inquiries.list().then(setInquiries).catch(() => {})
          api.contact.list().then(setContactMessages).catch(() => {})
        }
        else setMessage("This signed-in account is not marked as an admin in the connected Supabase project.")
      } catch (error) { setMessage(error instanceof Error ? `Could not verify admin access: ${error.message}` : "Could not verify admin access."); setAllowed(false) }
    }
    checkAccess()
  }, [])

  const uploadImages = async (fileList?: FileList) => {
    const files = Array.from(fileList ?? [])
    if (!files.length) return
    setBusy(true); setMessage(`Uploading ${files.length} photo${files.length === 1 ? "" : "s"}...`)
    const uploadedUrls: string[] = []; const failures: string[] = []
    for (const [index, file] of files.entries()) {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-")
      const path = `properties/${Date.now()}-${index}-${cleanName}`
      const { error } = await supabase.storage.from("property-images").upload(path, file)
      if (error) failures.push(`${file.name}: ${error.message}`)
      else uploadedUrls.push(supabase.storage.from("property-images").getPublicUrl(path).data.publicUrl)
    }
    if (uploadedUrls.length) setImages(current => [...current, ...uploadedUrls])
    setMessage(failures.length ? `${uploadedUrls.length} uploaded. ${failures.join(" ")}` : `${uploadedUrls.length} photo${uploadedUrls.length === 1 ? "" : "s"} uploaded. You can add more or publish the listing.`)
    setBusy(false)
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage("")
    const price = Number(form.price)
    const input = { ...form, price, beds: Number(form.beds), baths: Number(form.baths), floor_count: form.floor_count ? Number(form.floor_count) : null, images, price_display: `\u20A6${new Intl.NumberFormat("en-NG").format(price)}${form.listing_type === "rent" ? "/yr" : ""}` }
    try { if (editingId) await api.properties.update(editingId, input); else await api.properties.create(input); setForm(blankForm); setImages([]); setEditingId(null); setMessage("Listing saved successfully."); loadProperties() }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not save listing.") }
    setBusy(false)
  }

  const edit = (property: any) => { setEditingId(property.id); setForm({ title: property.title, type: property.type, listing_type: property.listing_type, price: String(property.price), location: property.location, beds: String(property.beds), baths: String(property.baths), floor_count: property.floor_count ? String(property.floor_count) : "", sqft: property.sqft ?? "", description: property.description ?? "", featured: property.featured }); setImages(property.images ?? []); window.scrollTo({ top: 0, behavior: "smooth" }) }
  const remove = async (id: string) => { if (!window.confirm("Delete this listing?")) return; try { await api.properties.remove(id); loadProperties() } catch { setMessage("Could not delete the listing.") } }
  const setStatus = async (id: string, status: "published" | "rejected" | "pending") => {
    setBusy(true)
    try { await api.properties.setStatus(id, status); setMessage(status === "published" ? "Listing approved and published." : status === "rejected" ? "Listing rejected." : "Listing moved back to pending."); loadProperties() }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not update this listing's status.") }
    setBusy(false)
  }
  const fieldClass = "mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal"
  const statusStyles: Record<string, string> = { pending: "bg-amber-50 text-amber-700 border-amber-200", published: "bg-green-50 text-green-700 border-green-200", rejected: "bg-red-50 text-red-700 border-red-200" }
  const visibleProperties = tab === "all" ? properties : properties.filter(property => (property.status ?? "published") === tab)
  const counts = { pending: properties.filter(p => (p.status ?? "published") === "pending").length, published: properties.filter(p => (p.status ?? "published") === "published").length, rejected: properties.filter(p => (p.status ?? "published") === "rejected").length, all: properties.length }

  if (allowed === null) return <div className="py-24 text-center text-sm text-gray-500">Checking access...</div>
  if (!allowed) return <div className="max-w-xl mx-auto py-24 px-4 text-center"><h1 className="text-2xl font-black text-gray-900">Admin access required</h1><p className="mt-3 text-sm text-gray-500">{message || "Sign in with the account you marked as an admin in Supabase."}</p></div>

  return <div className="bg-gray-50 min-h-screen py-10"><div className="max-w-6xl mx-auto px-4 sm:px-6">
    <div className="mb-8"><p className="text-xs font-bold text-green-600 uppercase tracking-widest">Admin</p><h1 className="text-3xl font-black text-gray-900">Manage property listings</h1></div>
    <div className="mb-8 flex flex-wrap gap-2">
      {([["listings", "Listings"], ["inquiries", `Property Inquiries (${inquiries.length})`], ["messages", `Contact Messages (${contactMessages.length})`]] as const).map(([id, label]) => (
        <button key={id} onClick={() => setSection(id)} className={`rounded-full border px-4 py-2 text-xs font-bold ${section === id ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600"}`}>{label}</button>
      ))}
    </div>
    {section === "inquiries" && (
      <div className="grid gap-3 mb-10">
        {inquiries.length === 0 && <p className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-400">No property inquiries yet.</p>}
        {inquiries.map(inquiry => (
          <div key={inquiry.id} className="rounded-xl bg-white border border-gray-100 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-gray-900">{inquiry.name}</span>
              <span className="text-xs text-gray-400">{new Date(inquiry.created_at).toLocaleString()}</span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5">{inquiry.email}{inquiry.phone ? ` · ${inquiry.phone}` : ""}{inquiry.properties?.title ? ` · Re: ${inquiry.properties.title}` : ""}</div>
            <p className="text-sm text-gray-700 mt-2">{inquiry.message}</p>
          </div>
        ))}
      </div>
    )}
    {section === "messages" && (
      <div className="grid gap-3 mb-10">
        {contactMessages.length === 0 && <p className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-400">No contact messages yet.</p>}
        {contactMessages.map(msg => (
          <div key={msg.id} className="rounded-xl bg-white border border-gray-100 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-gray-900">{msg.name}{msg.subject ? ` — ${msg.subject}` : ""}</span>
              <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString()}</span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5">{msg.email}{msg.phone ? ` · ${msg.phone}` : ""}</div>
            <p className="text-sm text-gray-700 mt-2">{msg.message}</p>
          </div>
        ))}
      </div>
    )}
    {section === "listings" && <>
    <form onSubmit={save} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10 space-y-5">
      <h2 className="font-black text-gray-900">{editingId ? "Edit listing" : "Add a property"}</h2>
      {message && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm font-semibold text-gray-700">Property title<input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. 4-bedroom duplex in Bodija" className={fieldClass} /></label>
        <label className="text-sm font-semibold text-gray-700">Location<input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Bodija, Ibadan" className={fieldClass} /></label>
        <label className="text-sm font-semibold text-gray-700">Property type<select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={fieldClass}>{["Apartment", "Bungalow", "Duplex", "Terrace", "Villa", "Commercial"].map(type => <option key={type}>{type}</option>)}</select></label>
        <label className="text-sm font-semibold text-gray-700">Listing purpose<select value={form.listing_type} onChange={e => setForm({ ...form, listing_type: e.target.value })} className={fieldClass}><option value="sale">For sale</option><option value="rent">For rent</option></select></label>
        <label className="text-sm font-semibold text-gray-700">Price (Naira)<input required min="0" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 85000000" className={fieldClass} /></label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="text-sm font-semibold text-gray-700">Bedrooms<input min="0" type="number" value={form.beds} onChange={e => setForm({ ...form, beds: e.target.value })} className={fieldClass} /></label>
        <label className="text-sm font-semibold text-gray-700">Bathrooms<input min="0" type="number" value={form.baths} onChange={e => setForm({ ...form, baths: e.target.value })} className={fieldClass} /></label>
        <label className="text-sm font-semibold text-gray-700">Number of floors / storeys<input min="0" type="number" value={form.floor_count} onChange={e => setForm({ ...form, floor_count: e.target.value })} placeholder="e.g. 2" className={fieldClass} /></label>
        <label className="text-sm font-semibold text-gray-700">Property size / area<input value={form.sqft} onChange={e => setForm({ ...form, sqft: e.target.value })} placeholder="e.g. 650 sqm" className={fieldClass} /></label>
      </div>
      <label className="block text-sm font-semibold text-gray-700">Property description<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the property, its features and nearby landmarks" rows={4} className={fieldClass} /></label>
      <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Feature this property on the home page</label>
      <div><label className="block text-sm font-semibold text-gray-700 mb-1">Property photos</label><p className="text-xs text-gray-500 mb-2">Select as many photos as you need. The first photo is the cover image.</p><input type="file" accept="image/*" multiple onChange={e => { uploadImages(e.target.files); e.currentTarget.value = "" }} disabled={busy} className="block w-full text-sm" /><div className="flex flex-wrap gap-2 mt-3">{images.map((url, index) => <div key={url} className="relative"><img src={url} alt={`Property upload ${index + 1}`} className="w-24 h-16 object-cover rounded-lg" />{index === 0 && <span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-bold text-white">Cover</span>}<button type="button" onClick={() => setImages(images.filter(image => image !== url))} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white text-xs">x</button></div>)}</div></div>
      <div className="flex gap-3"><button disabled={busy} className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{busy ? "Working..." : editingId ? "Save changes" : "Publish listing"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(blankForm); setImages([]) }} className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600">Cancel</button>}</div>
    </form>
    <div className="mb-5 flex flex-wrap gap-2">
      {([["pending", "Pending review"], ["published", "Published"], ["rejected", "Rejected"], ["all", "All listings"]] as const).map(([id, label]) => (
        <button key={id} onClick={() => setTab(id)} className={`rounded-full border px-4 py-2 text-xs font-bold ${tab === id ? "border-green-600 bg-green-600 text-white" : "border-gray-200 bg-white text-gray-600"}`}>{label} ({counts[id]})</button>
      ))}
    </div>
    <div className="grid gap-3">
      {visibleProperties.length === 0 && <p className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-400">No listings in this category.</p>}
      {visibleProperties.map(property => {
        const status = property.status ?? "published"
        return (
          <div key={property.id} className="flex flex-col gap-3 rounded-xl bg-white border border-gray-100 p-4 sm:flex-row sm:items-center">
            <img src={property.images?.[0] || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200"} alt="" className="w-20 h-16 object-cover rounded-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-gray-900">{property.title}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusStyles[status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>{status}</span>
              </div>
              <div className="text-sm text-gray-500">{property.location} - {property.price_display}</div>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              {status === "pending" && <>
                <button disabled={busy} onClick={() => setStatus(property.id, "published")} className="text-sm font-bold text-green-700 disabled:opacity-50">Approve</button>
                <button disabled={busy} onClick={() => setStatus(property.id, "rejected")} className="text-sm font-bold text-red-600 disabled:opacity-50">Reject</button>
              </>}
              {status === "rejected" && <button disabled={busy} onClick={() => setStatus(property.id, "published")} className="text-sm font-bold text-green-700 disabled:opacity-50">Approve</button>}
              {status === "published" && <button disabled={busy} onClick={() => setStatus(property.id, "pending")} className="text-sm font-bold text-amber-600 disabled:opacity-50">Unpublish</button>}
              <button onClick={() => edit(property)} className="text-sm font-bold text-green-700">Edit</button>
              <button onClick={() => remove(property.id)} className="text-sm font-bold text-red-600">Delete</button>
            </div>
          </div>
        )
      })}
    </div>
    </>}
  </div></div>
}
