import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import postgres from "npm:postgres";

const app = new Hono();

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/make-server-ec1238cf/health", (c) => c.json({ status: "ok" }));

// ── Seed / setup ──────────────────────────────────────────────────────────────
app.post("/make-server-ec1238cf/seed", async (c) => {
  const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!);

  await sql`
    CREATE TABLE IF NOT EXISTS agents (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      phone text,
      email text,
      bio text,
      avatar_initials text,
      verified boolean DEFAULT true,
      specialization text,
      listings_count integer DEFAULT 0,
      created_at timestamptz DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS properties (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      type text NOT NULL,
      listing_type text NOT NULL,
      price bigint NOT NULL,
      price_display text NOT NULL,
      location text NOT NULL,
      neighborhood text NOT NULL,
      beds integer DEFAULT 0,
      baths integer DEFAULT 0,
      sqft text,
      images text[],
      description text,
      featured boolean DEFAULT false,
      agent_id uuid REFERENCES agents(id),
      created_at timestamptz DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS inquiries (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      email text NOT NULL,
      phone text,
      message text NOT NULL,
      property_id uuid REFERENCES properties(id),
      created_at timestamptz DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      email text NOT NULL,
      phone text,
      subject text,
      message text NOT NULL,
      created_at timestamptz DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name text,
      phone text,
      role text NOT NULL DEFAULT 'seeker',
      company_name text,
      created_at timestamptz DEFAULT now()
    )
  `;

  await sql.end();

  // Seed agents
  const { data: existingAgents } = await supabase.from("agents").select("id").limit(1);
  if (!existingAgents?.length) {
    await supabase.from("agents").insert([
      { name: "Adeola Bakare", phone: "+234 802 111 2233", email: "adeola@oyoproperties.ng", bio: "Top-rated agent with 8 years experience in Ibadan residential and commercial markets.", avatar_initials: "AB", verified: true, specialization: "Residential Sales", listings_count: 24 },
      { name: "Chukwuemeka Obi", phone: "+234 803 222 3344", email: "emeka@oyoproperties.ng", bio: "Specialist in luxury properties and investment real estate across GRA and Oluyole Estate.", avatar_initials: "CO", verified: true, specialization: "Luxury & Investment", listings_count: 18 },
      { name: "Fatimah Lawal", phone: "+234 705 333 4455", email: "fatimah@oyoproperties.ng", bio: "Expert in rental properties and student accommodation around UI Road and Bodija.", avatar_initials: "FL", verified: true, specialization: "Rentals", listings_count: 31 },
      { name: "Biodun Adeyemi", phone: "+234 810 444 5566", email: "biodun@oyoproperties.ng", bio: "Commercial property expert helping businesses find the right space in Ibadan.", avatar_initials: "BA", verified: true, specialization: "Commercial", listings_count: 12 },
    ]);
  }

  const { data: agents } = await supabase.from("agents").select("id");
  const ids = (agents ?? []).map((a: { id: string }) => a.id);

  const { data: existingProps } = await supabase.from("properties").select("id").limit(1);
  if (!existingProps?.length && ids.length >= 4) {
    await supabase.from("properties").insert([
      { title: "3 Bedroom Apartment", type: "Apartment", listing_type: "sale", price: 12500000, price_display: "₦12,500,000", location: "Jericho, Ibadan", neighborhood: "Jericho", beds: 3, baths: 2, sqft: "1,200 sqft", images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop&auto=format"], description: "A beautifully finished 3-bedroom apartment in the heart of Jericho. Features modern kitchen, ample parking, and 24/7 security. Close to shopping centres and schools.", featured: true, agent_id: ids[0] },
      { title: "3 Bedroom Bungalow", type: "Bungalow", listing_type: "sale", price: 18000000, price_display: "₦18,000,000", location: "UI Road, Ibadan", neighborhood: "UI Road", beds: 3, baths: 3, sqft: "1,800 sqft", images: ["https://images.unsplash.com/photo-1628144688607-c373d8e3f31b?w=600&h=400&fit=crop&auto=format"], description: "Spacious bungalow on a quiet street off UI Road. Recently renovated with quality tiles throughout, large compound, and a borehole. Ideal for families.", featured: true, agent_id: ids[1] },
      { title: "5 Bedroom Semi-Detached", type: "Duplex", listing_type: "sale", price: 35000000, price_display: "₦35,000,000", location: "Onireke, Ibadan", neighborhood: "Onireke", beds: 5, baths: 4, sqft: "3,200 sqft", images: ["https://images.unsplash.com/photo-1721815693498-cc28507c0ba2?w=600&h=400&fit=crop&auto=format"], description: "Prestigious semi-detached duplex in serene Onireke GRA. American kitchen, servant quarter, swimming pool, and boys quarters. A statement of refined living.", featured: true, agent_id: ids[2] },
      { title: "Luxury 6 Bedroom Villa", type: "Villa", listing_type: "sale", price: 45000000, price_display: "₦45,000,000", location: "Oluyole Estate, Ibadan", neighborhood: "Oluyole Estate", beds: 6, baths: 5, sqft: "4,500 sqft", images: ["https://images.unsplash.com/photo-1670589953882-b94c9cb380f5?w=600&h=400&fit=crop&auto=format"], description: "Opulent 6-bedroom villa with panoramic views. Features a private pool, home theatre, gym, and smart home automation system. Gated community with 24/7 security.", featured: true, agent_id: ids[1] },
      { title: "2 Bedroom Flat", type: "Apartment", listing_type: "rent", price: 250000, price_display: "₦250,000/yr", location: "Bodija, Ibadan", neighborhood: "Bodija", beds: 2, baths: 2, sqft: "950 sqft", images: ["https://images.unsplash.com/photo-1748063578185-3d68121b11ff?w=600&h=400&fit=crop&auto=format"], description: "Modern self-contained flat in Bodija Estate. Well-maintained compound with borehole, prepaid meter, and parking. Close to Bodija Market and Cocoa House.", featured: true, agent_id: ids[2] },
      { title: "4 Bedroom Terrace Duplex", type: "Terrace", listing_type: "sale", price: 22000000, price_display: "₦22,000,000", location: "GRA, Ibadan", neighborhood: "GRA", beds: 4, baths: 4, sqft: "2,400 sqft", images: ["https://images.unsplash.com/photo-1628012209120-d9db7abf7eab?w=600&h=400&fit=crop&auto=format"], description: "Tastefully finished terrace duplex in the Government Reserved Area. Excellent road network, stable electricity, proximity to top schools and hospitals.", featured: true, agent_id: ids[0] },
      { title: "Commercial Plaza", type: "Commercial", listing_type: "sale", price: 85000000, price_display: "₦85,000,000", location: "Ring Road, Ibadan", neighborhood: "Ring Road", beds: 0, baths: 6, sqft: "6,000 sqft", images: ["https://images.unsplash.com/photo-1639774275491-71d62502a4e0?w=600&h=400&fit=crop&auto=format"], description: "A fully tenanted commercial plaza on Ring Road with 12 shop units and 4 office suites. Strong rental income yield. Strategic location with high foot traffic.", featured: false, agent_id: ids[3] },
      { title: "3 Bedroom Flat", type: "Apartment", listing_type: "rent", price: 350000, price_display: "₦350,000/yr", location: "Agodi GRA, Ibadan", neighborhood: "Agodi GRA", beds: 3, baths: 2, sqft: "1,400 sqft", images: ["https://images.unsplash.com/photo-1783260606348-bb2deaa215a3?w=600&h=400&fit=crop&auto=format"], description: "Newly renovated 3-bedroom flat in Agodi GRA. Spacious rooms, fitted wardrobes, and a well-manicured garden. Quiet, secure neighborhood perfect for families.", featured: false, agent_id: ids[2] },
      { title: "5 Bedroom Detached Duplex", type: "Duplex", listing_type: "sale", price: 55000000, price_display: "₦55,000,000", location: "Akobo, Ibadan", neighborhood: "Akobo", beds: 5, baths: 5, sqft: "3,800 sqft", images: ["https://images.unsplash.com/photo-1722421492323-eaf9c401befe?w=600&h=400&fit=crop&auto=format"], description: "Exquisite fully detached 5-bedroom home in Akobo Estate. Italian tiles, DSTV satellite, solar backup power, and a large compound. Ready for immediate occupancy.", featured: false, agent_id: ids[0] },
    ]);
  }

  return c.json({ success: true, message: "Database seeded" });
});

// ── User profile ──────────────────────────────────────────────────────────────
app.post("/make-server-ec1238cf/profiles", async (c) => {
  const body = await c.req.json();
  const { id, full_name, phone, role, company_name } = body;
  if (!id || !role) return c.json({ error: "id and role are required" }, 400);
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert({ id, full_name, phone, role, company_name })
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

app.get("/make-server-ec1238cf/profiles/:id", async (c) => {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", c.req.param("id"))
    .single();
  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// ── Properties ────────────────────────────────────────────────────────────────
app.get("/make-server-ec1238cf/properties/featured", async (c) => {
  const { data, error } = await supabase
    .from("properties")
    .select("*, agents(*)")
    .eq("featured", true)
    .order("created_at", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.get("/make-server-ec1238cf/properties/:id", async (c) => {
  const { data, error } = await supabase
    .from("properties")
    .select("*, agents(*)")
    .eq("id", c.req.param("id"))
    .single();
  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

app.get("/make-server-ec1238cf/properties", async (c) => {
  const { listing_type, type, min_price, max_price, neighborhood, search } = c.req.query();
  let q = supabase.from("properties").select("*, agents(*)");
  if (listing_type) q = q.eq("listing_type", listing_type);
  if (type) q = q.eq("type", type);
  if (min_price) q = q.gte("price", Number(min_price));
  if (max_price) q = q.lte("price", Number(max_price));
  if (neighborhood) q = q.ilike("neighborhood", `%${neighborhood}%`);
  if (search) q = q.or(`title.ilike.%${search}%,location.ilike.%${search}%`);
  q = q.order("created_at", { ascending: false });
  const { data, error } = await q;
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// ── Agents ────────────────────────────────────────────────────────────────────
app.get("/make-server-ec1238cf/agents", async (c) => {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("listings_count", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.get("/make-server-ec1238cf/agents/:id", async (c) => {
  const { data, error } = await supabase
    .from("agents")
    .select("*, properties(*)")
    .eq("id", c.req.param("id"))
    .single();
  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// ── Inquiries ────────────────────────────────────────────────────────────────
app.post("/make-server-ec1238cf/inquiries", async (c) => {
  const body = await c.req.json();
  const { name, email, phone, message, property_id } = body;
  if (!name || !email || !message) return c.json({ error: "name, email and message are required" }, 400);
  const { data, error } = await supabase
    .from("inquiries")
    .insert({ name, email, phone, message, property_id })
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// ── Contact ───────────────────────────────────────────────────────────────────
app.post("/make-server-ec1238cf/contact", async (c) => {
  const body = await c.req.json();
  const { name, email, phone, subject, message } = body;
  if (!name || !email || !message) return c.json({ error: "name, email and message are required" }, 400);
  const { data, error } = await supabase
    .from("contact_messages")
    .insert({ name, email, phone, subject, message })
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

Deno.serve(app.fetch);
