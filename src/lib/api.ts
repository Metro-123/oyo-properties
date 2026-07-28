import { supabase } from "./supabase"

type PropertyInput = Record<string, unknown>

const contactEmailEndpoint = "https://formsubmit.co/ajax/info@oyoproperties.ng"
const contactCcRecipients = "enocholajire1@gmail.com"

async function sendEmail(input: PropertyInput, subject: string) {
  const response = await fetch(contactEmailEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      phone: input.phone,
      message: input.message,
      property_id: input.property_id,
      property_title: input.property_title,
      inquiry_type: input.inquiry_type,
      _subject: subject,
      _replyto: input.email,
      _cc: contactCcRecipients,
      _template: "table",
      _honey: "",
    }),
  })

  const result = await response.json().catch(() => null) as { success?: boolean; message?: string } | null
  if (!response.ok || !result?.success) {
    throw new Error(result?.message ?? "Unable to deliver your message")
  }

  return result
}

async function dataOrThrow<T>(request: PromiseLike<{ data: T; error: { message: string } | null }>) {
  const { data, error } = await request
  if (error) throw new Error(error.message)
  return data
}

export const api = {
  properties: {
    list: async (params: Record<string, string> = {}) => {
      let query = supabase.from("properties").select("*, agents(*)")
      if (params.search) query = query.or(`title.ilike.%${params.search}%,location.ilike.%${params.search}%`)
      if (params.type) query = query.eq("type", params.type)
      if (params.listing_type) query = query.eq("listing_type", params.listing_type)
      if (params.min_price) query = query.gte("price", Number(params.min_price))
      if (params.max_price) query = query.lte("price", Number(params.max_price))
      if (params.min_beds) query = query.gte("beds", Number(params.min_beds))
      return dataOrThrow(query.order("created_at", { ascending: false }))
    },
    get: (id: string) => dataOrThrow(supabase.from("properties").select("*, agents(*)").eq("id", id).single()),
    featured: () => dataOrThrow(supabase.from("properties").select("*, agents(*)").eq("featured", true).order("created_at", { ascending: false })),
    create: (input: PropertyInput) => dataOrThrow(supabase.from("properties").insert(input).select().single()),
    update: (id: string, input: PropertyInput) => dataOrThrow(supabase.from("properties").update(input).eq("id", id).select().single()),
    remove: (id: string) => dataOrThrow(supabase.from("properties").delete().eq("id", id).select().single()),
    setStatus: (id: string, status: "pending" | "published" | "rejected") => dataOrThrow(supabase.from("properties").update({ status }).eq("id", id).select().single()),
    mine: () => dataOrThrow(supabase.from("properties").select("*").order("created_at", { ascending: false })),
  },
  agents: {
    list: () => dataOrThrow(supabase.from("agents").select("*").order("listings_count", { ascending: false })),
    get: (id: string) => dataOrThrow(supabase.from("agents").select("*, properties(*)").eq("id", id).single()),
  },
  inquiries: {
    create: async (input: PropertyInput) => {
      const { data: { user } } = await supabase.auth.getUser()
      const [emailResult, dbResult] = await Promise.allSettled([
        sendEmail(input, "New Oyo Properties property enquiry"),
        supabase.from("inquiries").insert({
          property_id: input.property_id ?? null,
          user_id: user?.id ?? null,
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          message: input.message,
        }),
      ])
      if (dbResult.status === "rejected") console.error("Could not save inquiry to Supabase:", dbResult.reason)
      if (emailResult.status === "rejected") throw emailResult.reason
      return emailResult.value
    },
    list: () => dataOrThrow(supabase.from("inquiries").select("*, properties(title)").order("created_at", { ascending: false })),
    // Inquiries submitted by the current signed-in user, for their account page.
    mine: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      return dataOrThrow(supabase.from("inquiries").select("*, properties(title)").eq("user_id", user.id).order("created_at", { ascending: false }))
    },
  },
  contact: {
    send: async (input: PropertyInput) => {
      const [emailResult, dbResult] = await Promise.allSettled([
        sendEmail(input, `New Oyo Properties enquiry${input.subject ? `: ${input.subject}` : ""}`),
        supabase.from("contact_messages").insert({
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          subject: input.subject ?? null,
          message: input.message,
        }),
      ])
      if (dbResult.status === "rejected") console.error("Could not save contact message to Supabase:", dbResult.reason)
      if (emailResult.status === "rejected") throw emailResult.reason
      return emailResult.value
    },
    list: () => dataOrThrow(supabase.from("contact_messages").select("*").order("created_at", { ascending: false })),
  },
  profiles: {
    create: (input: PropertyInput) => dataOrThrow(supabase.from("user_profiles").upsert(input).select().single()),
    get: (id: string) => dataOrThrow(supabase.from("user_profiles").select("*").eq("id", id).single()),
  },
}
