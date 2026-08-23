import { getPayload } from 'payload'
import configPromise from './payload.config'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function seed() {
  console.log('Starting Allbirds Payload CMS seeding process...')
  const payload = await getPayload({ config: configPromise })

  // 1. Clear existing documents
  console.log('Clearing existing documents...')
  try {
    await payload.delete({ collection: 'reviews', where: {} })
    await payload.delete({ collection: 'products', where: {} })
    await payload.delete({ collection: 'categories', where: {} })
    await payload.delete({ collection: 'materials', where: {} })
    await payload.delete({ collection: 'promo-tiles', where: {} })
    await payload.delete({ collection: 'hero-blocks', where: {} })
    await payload.delete({ collection: 'media', where: {} })
    await payload.delete({ collection: 'users', where: {} })
  } catch (err) {
    console.error('Error during collection clearing:', err)
  }

  // Create default admin user
  console.log('Creating default admin user...')
  await payload.create({
    collection: 'users',
    data: {
      email: process.env.SEED_ADMIN_EMAIL || 'admin@allbirds.com',
      password: process.env.SEED_ADMIN_PASSWORD || 'adminpassword123',
    },
  })

  // 2. Upload media assets from F:/Allbirds/public
  console.log('Uploading media assets...')
  const mediaSourceDir = path.resolve(dirname, '../../public')
  const imageNames = [
    'allbirds-crop-top-left.png',
    'allbirds-crop-top-right.png',
    'allbirds-crop-bottom-left.png',
    'allbirds-crop-bottom-right.png',
    'allbirds-hero-linen.png',
    'allbirds-lifestyle-hero.png',
    'allbirds-material-texture.png',
    'allbirds-mvp-lifestyle.png',
    'allbirds-travel-promo.png',
  ]

  const mediaMap: Record<string, any> = {}

  for (const name of imageNames) {
    const filePath = path.join(mediaSourceDir, name)
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}, skipping media upload`)
      continue
    }

    const fileBuffer = fs.readFileSync(filePath)
    const mimeType = name.endsWith('.png') ? 'image/png' : 'image/jpeg'
    const altText = name.replace('allbirds-', '').replace('.png', '').replace(/-/g, ' ')

    const createdMedia = await payload.create({
      collection: 'media',
      data: {
        alt: altText,
      },
      file: {
        data: fileBuffer,
        name,
        mimetype: mimeType,
        size: fileBuffer.byteLength,
      },
    })
    mediaMap[name] = createdMedia.id as any
  }

  console.log('Uploaded Media Map:', mediaMap)


  // 3. Seed Categories
  console.log('Seeding categories...')
  const seededCategories: any[] = []
  const categoryData = [
    { name: "New Arrivals", cta: "Shop Men / Shop Women", swatch: "#c8d3d8", image: 'allbirds-crop-top-left.png' },
    { name: "Mens", cta: "Shop Men", swatch: "#4b4440", image: 'allbirds-lifestyle-hero.png' },
    { name: "Womens", cta: "Shop Women", swatch: "#6c504c", image: 'allbirds-mvp-lifestyle.png' },
    { name: "Best Sellers", cta: "Shop Men / Shop Women", swatch: "#536054", image: 'allbirds-travel-promo.png' },
  ]

  for (const cat of categoryData) {
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const createdCat = await payload.create({
      collection: 'categories',
      data: {
        name: cat.name,
        slug,
        cta: cat.cta,
        swatch: cat.swatch,
        image: mediaMap[cat.image],
      },
    })
    seededCategories.push(createdCat)
  }

  const getCategoryBySlug = (slug: string) => seededCategories.find(c => c.slug === slug)?.id

  // 4. Seed Products
  console.log('Seeding products...')
  const seededProducts: any[] = []
  const productData = [
    {
      name: "Men's Canvas Runner NZ",
      price: "$100",
      color: "Deep Navy Stripes",
      swatch: "#e0dacf",
      fit: "True to size",
      rating: 4.7,
      tags: ["Canvas", "Lightweight"],
      categorySlug: "mens",
      image: "allbirds-hero-linen.png",
      sizes: [8, 9, 10, 11, 12],
      gender: "men" as const,
      badge: "Best Seller",
      description: "Lightweight canvas upper meets our signature SweetFoam sole. Built for everyday comfort.",
    },
    {
      name: "Women's Tree Glider",
      price: "$140",
      color: "Burlwood",
      swatch: "#d4d9cf",
      fit: "Runs narrow",
      rating: 4.8,
      tags: ["Tree Fiber", "Breathable"],
      categorySlug: "womens",
      image: "allbirds-mvp-lifestyle.png",
      sizes: [6, 7, 8, 9, 10],
      gender: "women" as const,
      badge: "New",
      description: "Breathable tree-fiber knit designed for warm-weather commutes and weekend adventures.",
    },
    {
      name: "Men's Canvas Cruiser",
      price: "$75",
      color: "Sea Spray",
      swatch: "#c8d3d8",
      fit: "Relaxed fit",
      rating: 4.6,
      tags: ["Canvas", "Travel"],
      categorySlug: "mens",
      image: "allbirds-crop-bottom-left.png",
      sizes: [8, 9, 10, 11, 12],
      gender: "men" as const,
      description: "Laid-back canvas slip-on with a relaxed fit perfect for travel days.",
    },
    {
      name: "Women's Breezer Mary Jane",
      price: "$115",
      color: "Dusty Pink",
      swatch: "#d1b0a4",
      fit: "True to size",
      rating: 4.5,
      tags: ["Mary Jane", "Breezy"],
      categorySlug: "womens",
      image: "allbirds-crop-bottom-right.png",
      sizes: [6, 7, 8, 9, 10],
      gender: "women" as const,
      description: "Classic Mary Jane silhouette with an airy knit upper for all-day breathability.",
    },
    {
      name: "Men's Dasher NZ",
      price: "$140",
      color: "Seagrass",
      swatch: "#d4d9cf",
      fit: "Performance fit",
      rating: 4.9,
      tags: ["Running", "Cushioned"],
      categorySlug: "mens",
      image: "allbirds-lifestyle-hero.png",
      sizes: [8, 9, 10, 11, 12],
      gender: "men" as const,
      description: "Performance running shoe with extra cushioning and a supportive heel counter.",
    },
    {
      name: "Women's Varsity Strap",
      price: "$115",
      color: "Burlwood",
      swatch: "#e0dacf",
      fit: "Adjustable strap",
      rating: 4.6,
      tags: ["Retro", "Everyday"],
      categorySlug: "womens",
      image: "allbirds-mvp-lifestyle.png",
      sizes: [6, 7, 8, 9, 10],
      gender: "women" as const,
      description: "Retro-inspired strap sneaker with an adjustable fit for everyday wear.",
    },
    {
      name: "Men's Cruiser Slip On Terry",
      price: "$110",
      color: "Ochre / Warm White",
      swatch: "#d1b0a4",
      fit: "Easy slip-on",
      rating: 4.7,
      tags: ["Terry", "Travel"],
      categorySlug: "mens",
      image: "allbirds-crop-bottom-right.png",
      sizes: [8, 9, 10, 11, 12],
      gender: "men" as const,
      description: "Soft terry-cloth lining meets a slip-on silhouette for effortless style.",
    },
    {
      name: "Women's Canvas Cruiser",
      price: "$75",
      color: "Stormy Lilac",
      swatch: "#c8d3d8",
      fit: "Relaxed fit",
      rating: 4.5,
      tags: ["Canvas", "Low Profile"],
      categorySlug: "womens",
      image: "allbirds-crop-bottom-left.png",
      sizes: [6, 7, 8, 9, 10],
      gender: "women" as const,
      description: "Low-profile canvas sneaker in fresh seasonal colorways.",
    },
  ]

  for (const prod of productData) {
    const categoryId = getCategoryBySlug(prod.categorySlug)
    if (!categoryId) {
      console.warn(`Category slug ${prod.categorySlug} not found, skipping product ${prod.name}`)
      continue
    }

    const createdProd = await payload.create({
      collection: 'products',
      data: {
        name: prod.name,
        price: prod.price,
        fit: prod.fit,
        rating: prod.rating,
        tags: prod.tags.map(t => ({ tag: t })),
        sizes: prod.sizes.map(s => ({ size: s })),
        category: categoryId,
        colorways: [
          {
            color: prod.color,
            swatch: prod.swatch,
            image: mediaMap[prod.image] || mediaMap['allbirds-crop-top-left.png']
          }
        ],
        gender: prod.gender,
        description: prod.description,
        ...(prod.badge ? { badge: prod.badge } : {}),
      }
    })
    seededProducts.push(createdProd)
  }

  const getProductByName = (name: string) => seededProducts.find(p => p.name === name)?.id

  // 5. Seed Materials
  console.log('Seeding materials...')
  const materialData = [
    {
      name: "Sugarcane SweetFoam®",
      impactNote: "Materials, transport, and packaging are selected with lower impact in mind.",
      textureImage: 'allbirds-material-texture.png',
      sourceRegion: 'Brazil'
    },
    {
      name: "Trino® (Wool + Tree)",
      impactNote: "Sugarcane SweetFoam® replaces petroleum-based synthetics where possible.",
      textureImage: 'allbirds-material-texture.png',
      sourceRegion: 'South Africa / New Zealand'
    }
  ]

  for (const mat of materialData) {
    await payload.create({
      collection: 'materials',
      data: {
        name: mat.name,
        impactNote: mat.impactNote,
        textureImage: mediaMap[mat.textureImage],
        sourceRegion: mat.sourceRegion
      }
    })
  }

  // 6. Seed Reviews
  console.log('Seeding reviews...')
  const reviewData = [
    {
      productName: "Women's Tree Glider",
      quote: "The lightest shoe I packed for a two-week trip. It still looked clean by the flight home.",
      customerName: "Maya R.",
      detail: "Tree Glider, Burlwood",
    },
    {
      productName: "Men's Canvas Runner NZ",
      quote: "Soft enough for errands, structured enough for the office commute.",
      customerName: "Daniel K.",
      detail: "Canvas Runner NZ",
    },
    {
      productName: "Men's Canvas Cruiser",
      quote: "The colorways feel grown up. Easy to wear with everything.",
      customerName: "Nina P.",
      detail: "Canvas Cruiser",
    }
  ]

  for (const rev of reviewData) {
    const prodId = getProductByName(rev.productName)
    if (!prodId) {
      console.warn(`Product ${rev.productName} not found for review, skipping`)
      continue
    }

    await payload.create({
      collection: 'reviews',
      data: {
        product: prodId,
        quote: rev.quote,
        customerName: rev.customerName,
        detail: rev.detail
      }
    })
  }

  // 7. Seed Promo Tiles
  console.log('Seeding promo tiles...')
  const promoData = [
    { title: "Spring Travel Essentials", swatch: "#e0dacf", image: "allbirds-travel-promo.png" },
    { title: "New Arrivals", swatch: "#d4d9cf", image: "allbirds-mvp-lifestyle.png" },
    { title: "Fresh Colors For Spring", swatch: "#c8d3d8", image: "allbirds-crop-top-left.png" },
  ]

  for (const promo of promoData) {
    await payload.create({
      collection: 'promo-tiles',
      data: {
        title: promo.title,
        swatch: promo.swatch,
        image: mediaMap[promo.image]
      }
    })
  }

  // 8. Seed Hero Blocks
  console.log('Seeding hero blocks...')
  await payload.create({
    collection: 'hero-blocks',
    data: {
      headline: "Wildly Comfortable. Super Natural.",
      body: "All New Dasher NZ Collection",
      ctaLabel: "Shop Men / Shop Women",
      media: mediaMap['allbirds-lifestyle-hero.png'],
      themeSwatch: "#4b4440"
    }
  })

  console.log('Database successfully seeded!')
}

seed()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error('Seeding failed:', JSON.stringify(err, null, 2) || err)
    process.exit(1)
  })
