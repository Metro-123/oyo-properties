// Builds a randomized, non-identifying preview of a real property for logged-out
// visitors. The photo stays real (so the platform still feels credible), but every
// other field is replaced with a plausible-but-fake value seeded off the property id,
// so the same card always shows the same fake details during a session instead of
// flickering on every re-render — while never revealing the actual listing.

type RealProperty = {
  id: string
  images?: string[]
  listing_type?: string
}

const LOCATIONS = ['Bodija', 'Jericho', 'GRA', 'Oluyole', 'Ring Road', 'Akobo', 'Iyaganku', 'Sango', 'Ojoo', 'Agodi']
const TYPES = ['Apartment', 'Bungalow', 'Duplex', 'Terrace', 'Villa']
const ADJECTIVES = ['Elegant', 'Modern', 'Spacious', 'Charming', 'Cozy', 'Executive', 'Classic', 'Stylish']

// Small string hash -> seeded PRNG, so output is stable per id but not derived
// from (and doesn't leak) the real property's actual field values.
function hashSeed(input: string): number {
  let h = 1779033703 ^ input.length
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  let a = seed
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

export function buildTeaser(p: RealProperty) {
  const rand = mulberry32(hashSeed(String(p.id)))
  const type = pick(rand, TYPES)
  const location = pick(rand, LOCATIONS)
  const beds = 1 + Math.floor(rand() * 5)
  const baths = 1 + Math.floor(rand() * 4)
  const sqft = 800 + Math.floor(rand() * 3200)
  const listingType = rand() > 0.7 ? 'rent' : 'sale'
  const priceM = 5 + Math.floor(rand() * 60)

  return {
    id: p.id,
    title: `${pick(rand, ADJECTIVES)} ${type} in ${location}`,
    type,
    listing_type: listingType,
    location: `${location}, Ibadan`,
    beds,
    baths,
    sqft: `${sqft.toLocaleString()} sqft`,
    price_display: listingType === 'rent' ? `₦${(priceM * 100).toLocaleString()},000/year` : `₦${priceM}M`,
    images: p.images?.length ? [p.images[0]] : [],
    featured: false,
  }
}
