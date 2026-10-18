import { db } from '../src/lib/db'
import { hashPassword } from '../src/lib/auth'
import { readFileSync } from 'fs'

const IMG: Record<string, string[]> = JSON.parse(
  readFileSync(__dirname + '/../seed-images.json', 'utf-8')
)

function img(key: string): string[] {
  return IMG[key] && IMG[key].length ? IMG[key] : []
}

async function main() {
  console.log('Seeding Gucchu Test…')

  // ---- Admin ----
  const adminHash = await hashPassword('Admin@123456')
  const admin = await db.account.upsert({
    where: { email: 'admin@gucchutest.com' },
    update: {},
    create: {
      email: 'admin@gucchutest.com',
      passwordHash: adminHash,
      role: 'admin',
      name: 'Platform Admin',
      phone: '+919999900000',
      status: 'active',
    },
  })
  console.log('admin:', admin.email)

  // ---- Vendors (some exclusive = onboarded personally) ----
  async function makeVendor(
    email: string,
    name: string,
    businessName: string,
    market: string,
    exclusive: boolean,
    verified: boolean,
    rating: number,
    gstin: string
  ) {
    const hash = await hashPassword('Vendor@123456')
    const acc = await db.account.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hash,
        role: 'vendor',
        name,
        phone: '+9198' + Math.floor(10000000 + Math.random() * 89999999),
        status: 'active',
      },
    })
    return db.vendorProfile.upsert({
      where: { accountId: acc.id },
      update: {},
      create: {
        accountId: acc.id,
        businessName,
        market,
        exclusive,
        verified,
        rating,
        gstin,
        address: `${businessName}, ${market} Wholesale Market, Delhi`,
      },
    })
  }

  const v1 = await makeVendor('rajesh@delhifurniture.in', 'Rajesh Kumar', 'Delhi Furniture House', 'Delhi', true, true, 4.8, '07AAAAA1111B1Z5')
  const v2 = await makeVendor('lightworks@delhilights.in', 'LightWorks Electricals', 'LightWorks Electricals', 'Delhi', true, true, 4.7, '07BBBBB2222C1Z6')
  const v3 = await makeVendor('decorcentral@gmail.com', 'Sunita Devi', 'Decor Central', 'Delhi', true, true, 4.6, '07CCCCC3333D1Z7')
  const v4 = await makeVendor('bulksteel@gmail.com', 'Mohammed Ali', 'BulkSteel Traders', 'Delhi', false, true, 4.2, '07DDDDD4444E1Z8')
  const v5 = await makeVendor('homeplus@gmail.com', 'Priya Sharma', 'HomePlus Interiors', 'Delhi', false, false, 4.0, '07EEEEE5555F1Z9')

  // ---- Transport companies (some exclusive) ----
  async function makeTransport(
    email: string,
    name: string,
    company: string,
    exclusive: boolean,
    vehicles: string[],
    coverage: string[],
    baseRate: number,
    rating: number
  ) {
    const hash = await hashPassword('Transport@123456')
    const acc = await db.account.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hash,
        role: 'transport',
        name,
        phone: '+9197' + Math.floor(10000000 + Math.random() * 89999999),
        status: 'active',
      },
    })
    return db.transportProfile.upsert({
      where: { accountId: acc.id },
      update: {},
      create: {
        accountId: acc.id,
        companyName: company,
        vehicleTypes: JSON.stringify(vehicles),
        coverageAreas: JSON.stringify(coverage),
        exclusive,
        verified: true,
        baseRate,
        rating,
      },
    })
  }

  const t1 = await makeTransport('cargo@fastmove.in', 'Vikram Singh', 'FastMove Cargo', true, ['Truck (3.5T)', 'Truck (7T)', 'Container'], ['Delhi NCR', 'Haryana', 'Punjab', 'UP', 'Rajasthan'], 18, 4.7)
  const t2 = await makeTransport('dispatch@nationalmovers.in', 'Anil Mehta', 'National Movers', true, ['Truck (7T)', 'Trailer'], ['Pan India'], 22, 4.6)
  const t3 = await makeTransport('local@citylink.in', 'Ramesh Yadav', 'CityLink Logistics', false, ['Tempo', 'Mini Truck'], ['Delhi NCR'], 15, 4.1)

  // ---- Sales person ----
  const salesHash = await hashPassword('Sales@123456')
  const salesAcc = await db.account.upsert({
    where: { email: 'arjun@sales.gucchutest.com' },
    update: {},
    create: {
      email: 'arjun@sales.gucchutest.com',
      passwordHash: salesHash,
      role: 'sales',
      name: 'Arjun Verma',
      phone: '+919612345678',
      status: 'active',
    },
  })
  const sales = await db.salesProfile.upsert({
    where: { accountId: salesAcc.id },
    update: {},
    create: {
      accountId: salesAcc.id,
      region: 'Delhi NCR',
      commissionPct: 5,
      totalEarned: 0,
      status: 'active',
    },
  })
  console.log('sales:', salesAcc.email)

  // ---- Buyer demo ----
  const buyerHash = await hashPassword('Buyer@123456')
  const buyer = await db.account.upsert({
    where: { email: 'buyer@demo.com' },
    update: {},
    create: {
      email: 'buyer@demo.com',
      passwordHash: buyerHash,
      role: 'buyer',
      name: 'Demo Buyer',
      phone: '+919876543210',
      status: 'active',
    },
  })
  console.log('buyer:', buyer.email)

  // ---- Categories ----
  const cats = [
    { name: 'Furniture', slug: 'furniture', icon: 'sofa' },
    { name: 'Lighting & Electrical', slug: 'lighting-electrical', icon: 'lightbulb' },
    { name: 'Home Decor', slug: 'home-decor', icon: 'frame' },
    { name: 'Kitchen & Cookware', slug: 'kitchen-cookware', icon: 'utensils' },
    { name: 'Building & Hardware', slug: 'building-hardware', icon: 'hammer' },
  ]
  const catMap: Record<string, { id: string }> = {}
  for (const c of cats) {
    const cat = await db.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    })
    catMap[c.slug] = cat
  }
  console.log('categories:', Object.keys(catMap).length)

  // ---- Markets ----
  const markets = [
    { name: 'Delhi Wholesale Market', region: 'Delhi NCR', description: 'The largest organised wholesale hub in India — furniture, electricals, decor, hardware and more, all under one verified network.', active: true },
    { name: 'Mumbai Market', region: 'Mumbai', description: 'Coming soon — connecting Maharashtra wholesalers.', active: false },
    { name: 'Bengaluru Market', region: 'Karnataka', description: 'Coming soon — South India wholesale network.', active: false },
    { name: 'Kolkata Market', region: 'West Bengal', description: 'Coming soon — East India wholesale network.', active: false },
  ]
  await db.market.deleteMany({})
  for (const m of markets) {
    await db.market.create({ data: m })
  }

  // ---- Products (16) ----
  type P = {
    key: string
    name: string
    slug: string
    vendor: string
    cat: string
    desc: string
    unit: string
    moq: number
    price: number
    bulk: { minQty: number; pricePerUnit: number }[]
    stock: number
    specs: { label: string; value: string }[]
    featured?: boolean
  }

  const products: P[] = [
    // Group A
    { key: 'wooden-dining-chair', name: 'Sheesham Wood Dining Chair', slug: 'sheesham-wood-dining-chair', vendor: v1.id, cat: 'furniture', desc: 'Handcrafted sheesham (Indian rosewood) dining chair with a natural finish and sturdy mortise-and-tenon joinery. Sold in sets of 4. Ideal for restaurants, banquets and bulk home furnishing.', unit: 'set of 4', moq: 2, price: 6800, bulk: [{ minQty: 5, pricePerUnit: 6200 }, { minQty: 10, pricePerUnit: 5600 }], stock: 320, specs: [{ label: 'Material', value: 'Sheesham Wood' }, { label: 'Finish', value: 'Natural Matte' }, { label: 'Weight (per chair)', value: '7.5 kg' }, { label: 'Warranty', value: '12 months' }], featured: true },
    { key: 'king-size-bed', name: 'King Size Storage Bed', slug: 'king-size-storage-bed', vendor: v1.id, cat: 'furniture', desc: 'Engineered wood king-size bed with hydraulic box storage. Premium laminate finish, anti-scratch surface. Perfect for hotel and resort projects.', unit: 'piece', moq: 1, price: 24500, bulk: [{ minQty: 3, pricePerUnit: 22500 }, { minQty: 8, pricePerUnit: 20500 }], stock: 60, specs: [{ label: 'Size', value: '78 x 72 inches' }, { label: 'Material', value: 'Engineered Wood' }, { label: 'Storage', value: 'Hydraulic Box' }, { label: 'Warranty', value: '24 months' }], featured: true },
    { key: 'crystal-chandelier', name: 'Crystal LED Chandelier', slug: 'crystal-led-chandelier', vendor: v2.id, cat: 'lighting-electrical', desc: '8-light K9 crystal chandelier with warm-white LED bulbs. Polished chrome frame. A statement piece for lobbies, halls and dining spaces.', unit: 'piece', moq: 1, price: 18500, bulk: [{ minQty: 3, pricePerUnit: 16800 }, { minQty: 6, pricePerUnit: 15000 }], stock: 45, specs: [{ label: 'Lights', value: '8 E14 LED' }, { label: 'Crystal', value: 'K9 Grade' }, { label: 'Frame', value: 'Polished Chrome' }, { label: 'Diameter', value: '60 cm' }], featured: true },
    { key: 'electric-switch-board', name: 'Modular Switch Board (8 Module)', slug: 'modular-switch-board-8-module', vendor: v2.id, cat: 'lighting-electrical', desc: 'ISI-marked modular switch board with 8 modules. Fire-retardant polycarbonate, silver-alloy contacts. Bulk pack for electricians and builders.', unit: 'box of 20', moq: 5, price: 4200, bulk: [{ minQty: 10, pricePerUnit: 3800 }, { minQty: 25, pricePerUnit: 3400 }], stock: 800, specs: [{ label: 'Modules', value: '8' }, { label: 'Certification', value: 'ISI' }, { label: 'Material', value: 'Polycarbonate' }, { label: 'Current', value: '10A' }], featured: false },
    { key: 'led-ceiling-panel', name: 'LED Ceiling Light Panel (24W)', slug: 'led-ceiling-light-panel-24w', vendor: v2.id, cat: 'lighting-electrical', desc: 'Square 24W LED ceiling panel with cool-daylight output. Slim recessed design, 50,000 hour life. For offices, showrooms and commercial spaces.', unit: 'box of 10', moq: 3, price: 3500, bulk: [{ minQty: 10, pricePerUnit: 3000 }, { minQty: 30, pricePerUnit: 2600 }], stock: 540, specs: [{ label: 'Power', value: '24W' }, { label: 'Colour', value: 'Cool Daylight 6500K' }, { label: 'Size', value: '30 x 30 cm' }, { label: 'Life', value: '50,000 hrs' }], featured: false },
    { key: 'wall-mirror', name: 'Decorative Round Wall Mirror', slug: 'decorative-round-wall-mirror', vendor: v3.id, cat: 'home-decor', desc: 'Metal-framed round wall mirror with antique brass finish. 60cm diameter. For interiors, hotels and retail decor.', unit: 'piece', moq: 2, price: 2400, bulk: [{ minQty: 6, pricePerUnit: 2100 }, { minQty: 15, pricePerUnit: 1850 }], stock: 210, specs: [{ label: 'Diameter', value: '60 cm' }, { label: 'Frame', value: 'Metal Antique Brass' }, { label: 'Glass', value: '5mm Float' }, { label: 'Mounting', value: 'Wall Mount' }], featured: true },
    { key: 'cookware-set', name: 'Stainless Steel Cookware Set (7 pc)', slug: 'stainless-steel-cookware-set-7pc', vendor: v5.id, cat: 'kitchen-cookware', desc: '7-piece stainless steel cookware set — saucepans, kadhai, frying pan with glass lids. Food-grade SS304. For hostels, canteens and reselling.', unit: 'set', moq: 5, price: 2900, bulk: [{ minQty: 15, pricePerUnit: 2500 }, { minQty: 40, pricePerUnit: 2200 }], stock: 380, specs: [{ label: 'Pieces', value: '7' }, { label: 'Material', value: 'SS304' }, { label: 'Lids', value: 'Glass' }, { label: 'Base', value: 'Encapsulated' }], featured: false },
    { key: 'ceiling-fan', name: 'High-Speed Ceiling Fan (1200mm)', slug: 'high-speed-ceiling-fan-1200mm', vendor: v2.id, cat: 'lighting-electrical', desc: '1200mm high-speed ceiling fan with copper motor, 5-star rated. Pull-cord regulator. Bulk carton for builders and contractors.', unit: 'carton of 6', moq: 2, price: 7800, bulk: [{ minQty: 5, pricePerUnit: 7200 }, { minQty: 12, pricePerUnit: 6600 }], stock: 250, specs: [{ label: 'Sweep', value: '1200 mm' }, { label: 'Rating', value: '5 Star' }, { label: 'Motor', value: 'Copper' }, { label: 'Speed', value: '350 RPM' }], featured: false },

    // Group B
    { key: 'office-chair', name: 'Executive Office Chair', slug: 'executive-office-chair', vendor: v4.id, cat: 'furniture', desc: 'High-back executive office chair with lumbar support, padded armrests and 360-degree swivel. Breathable mesh back. For corporate fitouts and BPO setups.', unit: 'piece', moq: 5, price: 4600, bulk: [{ minQty: 15, pricePerUnit: 4100 }, { minQty: 40, pricePerUnit: 3700 }], stock: 600, specs: [{ label: 'Back', value: 'High-back Mesh' }, { label: 'Armrest', value: 'Padded' }, { label: 'Base', value: 'Nylon 5-star' }, { label: 'Warranty', value: '12 months' }], featured: true },
    { key: 'coffee-table', name: 'Solid Wood Coffee Table', slug: 'solid-wood-coffee-table', vendor: v1.id, cat: 'furniture', desc: 'Solid mango wood coffee table with a lower shelf. Natural grain finish. For lounges, cafes and home interiors.', unit: 'piece', moq: 2, price: 5200, bulk: [{ minQty: 6, pricePerUnit: 4700 }, { minQty: 15, pricePerUnit: 4300 }], stock: 140, specs: [{ label: 'Material', value: 'Mango Wood' }, { label: 'Dimensions', value: '110 x 60 cm' }, { label: 'Finish', value: 'Natural' }, { label: 'Shelf', value: 'Yes' }], featured: false },
    { key: 'curtain-fabric', name: 'Blackout Curtain Fabric Roll', slug: 'blackout-curtain-fabric-roll', vendor: v3.id, cat: 'home-decor', desc: '100% polyester blackout curtain fabric, 280cm width, sold per meter. Blocks 99% light. For hotels and commercial interiors.', unit: 'per meter', moq: 20, price: 320, bulk: [{ minQty: 100, pricePerUnit: 280 }, { minQty: 300, pricePerUnit: 245 }], stock: 5000, specs: [{ label: 'Width', value: '280 cm' }, { label: 'Material', value: 'Polyester' }, { label: 'Light Block', value: '99%' }, { label: 'Care', value: 'Machine Wash' }], featured: false },
    { key: 'led-strip-light', name: 'LED Strip Light (5m Roll, RGB)', slug: 'led-strip-light-5m-rgb', vendor: v2.id, cat: 'lighting-electrical', desc: '5-meter RGB LED strip with remote and 44-key controller. Self-adhesive backing. For accent lighting, retail displays and events.', unit: 'box of 10', moq: 5, price: 3800, bulk: [{ minQty: 15, pricePerUnit: 3300 }, { minQty: 40, pricePerUnit: 2900 }], stock: 700, specs: [{ label: 'Length', value: '5 m / roll' }, { label: 'Colour', value: 'RGB' }, { label: 'Voltage', value: '12V' }, { label: 'Remote', value: '44-key' }], featured: false },
    { key: 'granite-tiles', name: 'Polished Granite Floor Tiles', slug: 'polished-granite-floor-tiles', vendor: v4.id, cat: 'building-hardware', desc: 'Polished granite floor tiles, 2x2 ft, 18mm thickness. Premium black galaxy finish. For lobbies, commercial flooring and villas.', unit: 'box of 4 (16 sqft)', moq: 10, price: 2600, bulk: [{ minQty: 30, pricePerUnit: 2300 }, { minQty: 80, pricePerUnit: 2050 }], stock: 900, specs: [{ label: 'Size', value: '2 x 2 ft' }, { label: 'Thickness', value: '18 mm' }, { label: 'Finish', value: 'Polished' }, { label: 'Grade', value: 'Premium' }], featured: false },
    { key: 'door-handles', name: 'Brass Door Handle Set', slug: 'brass-door-handle-set', vendor: v4.id, cat: 'building-hardware', desc: 'Solid brass door handle set with latch and keys. Antique finish. Sold as complete door sets. For hotels, offices and bulk residential.', unit: 'set', moq: 10, price: 980, bulk: [{ minQty: 30, pricePerUnit: 850 }, { minQty: 80, pricePerUnit: 750 }], stock: 1200, specs: [{ label: 'Material', value: 'Solid Brass' }, { label: 'Finish', value: 'Antique' }, { label: 'Includes', value: 'Handle + Latch + Keys' }, { label: 'Warranty', value: '24 months' }], featured: false },
    { key: 'glass-dining-set', name: 'Glass Top Dining Table Set (6 Seater)', slug: 'glass-top-dining-table-set-6-seater', vendor: v1.id, cat: 'furniture', desc: '6-seater dining set with 8mm tempered glass top and 6 upholstered chairs. Stainless steel frame. For dining halls and banquets.', unit: 'set', moq: 1, price: 19800, bulk: [{ minQty: 3, pricePerUnit: 18000 }, { minQty: 8, pricePerUnit: 16500 }], stock: 40, specs: [{ label: 'Seater', value: '6' }, { label: 'Top', value: '8mm Tempered Glass' }, { label: 'Frame', value: 'Stainless Steel' }, { label: 'Warranty', value: '12 months' }], featured: true },
    { key: 'extension-strip', name: 'Power Extension Strip (6 Socket)', slug: 'power-extension-strip-6-socket', vendor: v2.id, cat: 'lighting-electrical', desc: '6-socket power extension strip with master switch, individual indicators and 3-meter cord. Surge protected. For offices and IT setups.', unit: 'box of 12', moq: 5, price: 3600, bulk: [{ minQty: 15, pricePerUnit: 3100 }, { minQty: 40, pricePerUnit: 2750 }], stock: 650, specs: [{ label: 'Sockets', value: '6' }, { label: 'Cord', value: '3 meter' }, { label: 'Protection', value: 'Surge + Fuse' }, { label: 'Switch', value: 'Master + Individual' }], featured: false },
  ]

  // delete existing products first (idempotent re-seed)
  await db.product.deleteMany({})
  await db.deal.deleteMany({})

  const productMap: Record<string, string> = {}
  for (const p of products) {
    const created = await db.product.create({
      data: {
        vendorId: p.vendor,
        name: p.name,
        slug: p.slug,
        description: p.desc,
        categoryId: catMap[p.cat].id,
        categoryName: cats.find((c) => c.slug === p.cat)!.name,
        images: JSON.stringify(img(p.key)),
        unit: p.unit,
        moq: p.moq,
        pricePerUnit: p.price,
        bulkTiers: JSON.stringify(p.bulk),
        stock: p.stock,
        specs: JSON.stringify(p.specs),
        rating: 4.3 + Math.random() * 0.6,
        featured: !!p.featured,
        status: 'active',
      },
    })
    productMap[p.key] = created.id
  }
  console.log('products:', products.length)

  // ---- Deals ----
  const deals = [
    { key: 'crystal-chandelier', title: 'Festive Lighting Bonanza', discountPct: 18, featured: true },
    { key: 'office-chair', title: 'Corporate Fitout Special', discountPct: 15, featured: true },
    { key: 'wooden-dining-chair', title: 'Bulk Furniture Deal', discountPct: 12, featured: true },
    { key: 'wall-mirror', title: 'Interior Decor Steal', discountPct: 10, featured: false },
    { key: 'led-strip-light', title: 'Flash Electronics Sale', discountPct: 20, featured: false },
  ]
  for (const d of deals) {
    const pid = productMap[d.key]
    if (!pid) continue
    await db.deal.create({
      data: {
        productId: pid,
        title: d.title,
        discountPct: d.discountPct,
        active: true,
        featured: d.featured,
      },
    })
  }
  console.log('deals:', deals.length)

  // ---- A couple of sample reviews ----
  await db.review.deleteMany({})
  await db.review.createMany({
    data: [
      { productId: productMap['wooden-dining-chair'], buyerId: buyer.id, rating: 5, comment: 'Excellent build quality, delivered on time in bulk.' },
      { productId: productMap['crystal-chandelier'], buyerId: buyer.id, rating: 4, comment: 'Beautiful design, packaging could be better.' },
      { productId: productMap['office-chair'], buyerId: buyer.id, rating: 5, comment: 'Comfortable and sturdy, great for our office.' },
    ],
  })

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
