import db from './index.js'
import {
  roles, users, request_types, suppliers, supplier_items
} from './schema.js'
import bcrypt from 'bcrypt'
import { eq, and } from 'drizzle-orm'

// ─── helpers ────────────────────────────────────────────────────────────────

async function upsertRole(name) {
  const [existing] = await db.select().from(roles).where(eq(roles.name, name))
  if (existing) return existing
  const [row] = await db.insert(roles).values({ name }).returning()
  return row
}

async function upsertRequestType(name) {
  const [existing] = await db.select().from(request_types).where(eq(request_types.name, name))
  if (existing) return existing
  const [row] = await db.insert(request_types).values({ name }).returning()
  return row
}

async function upsertSupplier(name, request_type_id) {
  const [existing] = await db.select().from(suppliers)
    .where(and(eq(suppliers.name, name), eq(suppliers.request_type_id, request_type_id)))
  if (existing) return existing
  const [row] = await db.insert(suppliers).values({ name, request_type_id }).returning()
  return row
}

async function upsertSupplierItem(supplier_id, item_code, name, unit, price_per_unit) {
  const [existing] = await db.select().from(supplier_items)
    .where(and(eq(supplier_items.item_code, item_code), eq(supplier_items.supplier_id, supplier_id)))
  if (existing) return existing
  const [row] = await db.insert(supplier_items)
    .values({ supplier_id, item_code, name, unit, price_per_unit })
    .returning()
  return row
}

async function upsertUser(username, plainPassword, role_id, department) {
  const [existing] = await db.select().from(users).where(eq(users.username, username))
  if (existing) {
    console.log(`  ↳ skipped (already exists): ${username}`)
    return existing
  }
  const password = await bcrypt.hash(plainPassword, 10)
  const [row] = await db.insert(users).values({ username, password, role_id, department }).returning()
  return row
}

// ─── seed ───────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱 Seeding database...\n')

  // ── 1. Roles ──────────────────────────────────────────────────────────────
  console.log('1. Roles')
  const roleRequester      = await upsertRole('Requester')
  const roleApprover       = await upsertRole('Approver')
  const roleProcureManager = await upsertRole('Procure Manager')
  const roleAdmin          = await upsertRole('Admin')
  console.log('   ✓ Requester, Approver, Procure Manager, Admin\n')

  // ── 2. Request Types ──────────────────────────────────────────────────────
  console.log('2. Request Types')
  const typeEquipment      = await upsertRequestType('Equipment')
  const typeSoftware       = await upsertRequestType('Software')
  const typeOfficeSupplies = await upsertRequestType('Office Supplies')
  const typeFurniture      = await upsertRequestType('Furniture')
  const typeComponents     = await upsertRequestType('Components')
  console.log('   ✓ Equipment, Software, Office Supplies, Furniture, Components\n')

  // ── 3. Suppliers ──────────────────────────────────────────────────────────
  console.log('3. Suppliers')

  // Equipment
  const dell  = await upsertSupplier('Dell',    typeEquipment.id)
  const hp    = await upsertSupplier('HP',      typeEquipment.id)
  const apple = await upsertSupplier('Apple',   typeEquipment.id)

  // Software
  const microsoft = await upsertSupplier('Microsoft', typeSoftware.id)
  const adobe     = await upsertSupplier('Adobe',     typeSoftware.id)

  // Office Supplies
  const staples = await upsertSupplier('Staples', typeOfficeSupplies.id)

  // Furniture
  const ikea = await upsertSupplier('IKEA', typeFurniture.id)

  // Components
  const micron      = await upsertSupplier('Micron',      typeComponents.id)
  const sandisk     = await upsertSupplier('SanDisk',     typeComponents.id)
  const bestbuy     = await upsertSupplier('BestBuy',     typeComponents.id)
  const microcenter = await upsertSupplier('MicroCenter', typeComponents.id)

  console.log('   ✓ Dell, HP, Apple, Microsoft, Adobe, Staples, IKEA, Micron, SanDisk, BestBuy, MicroCenter\n')

  // ── 4. Supplier Items ─────────────────────────────────────────────────────
  console.log('4. Supplier Items')

  // Dell
  await upsertSupplierItem(dell.id, 'DELL-LAP-001', 'Dell Latitude 15 Laptop',        'unit', null)
  await upsertSupplierItem(dell.id, 'DELL-LAP-002', 'Dell XPS 15 Laptop',             'unit', null)
  await upsertSupplierItem(dell.id, 'DELL-MON-001', 'Dell 27" 4K Monitor',            'unit', null)
  await upsertSupplierItem(dell.id, 'DELL-MON-002', 'Dell 24" FHD Monitor',           'unit', null)
  await upsertSupplierItem(dell.id, 'DELL-DOC-001', 'Dell Docking Station',           'unit', null)
  await upsertSupplierItem(dell.id, 'DELL-KBD-001', 'Dell Wireless Keyboard & Mouse', 'set',  null)

  // HP
  await upsertSupplierItem(hp.id, 'HP-LAP-001', 'HP EliteBook 840 Laptop',   'unit', null)
  await upsertSupplierItem(hp.id, 'HP-LAP-002', 'HP ProBook 450 Laptop',     'unit', null)
  await upsertSupplierItem(hp.id, 'HP-PRN-001', 'HP LaserJet Pro Printer',   'unit', null)
  await upsertSupplierItem(hp.id, 'HP-PRN-002', 'HP OfficeJet Pro Printer',  'unit', null)
  await upsertSupplierItem(hp.id, 'HP-MON-001', 'HP 27" QHD Monitor',        'unit', null)
  await upsertSupplierItem(hp.id, 'HP-INK-001', 'HP Printer Ink Cartridge',  'unit', null)

  // Apple
  await upsertSupplierItem(apple.id, 'APL-MBP-001', 'MacBook Pro 14"',        'unit', null)
  await upsertSupplierItem(apple.id, 'APL-MBP-002', 'MacBook Pro 16"',        'unit', null)
  await upsertSupplierItem(apple.id, 'APL-MBA-001', 'MacBook Air M2',         'unit', null)
  await upsertSupplierItem(apple.id, 'APL-IPD-001', 'iPad Pro 12.9"',         'unit', null)
  await upsertSupplierItem(apple.id, 'APL-MON-001', 'Apple Studio Display',   'unit', null)
  await upsertSupplierItem(apple.id, 'APL-ACC-001', 'Apple Magic Keyboard',   'unit', null)

  // Microsoft
  await upsertSupplierItem(microsoft.id, 'MS-O365-001', 'Microsoft 365 Business Basic',    'license/year', null)
  await upsertSupplierItem(microsoft.id, 'MS-O365-002', 'Microsoft 365 Business Standard', 'license/year', null)
  await upsertSupplierItem(microsoft.id, 'MS-WIN-001',  'Windows 11 Pro License',          'license',      null)
  await upsertSupplierItem(microsoft.id, 'MS-AZR-001',  'Azure Cloud Subscription',        'license/year', null)
  await upsertSupplierItem(microsoft.id, 'MS-VIS-001',  'Microsoft Visio Plan 2',          'license/year', null)

  // Adobe
  await upsertSupplierItem(adobe.id, 'ADB-CC-001',  'Adobe Creative Cloud All Apps', 'license/year', null)
  await upsertSupplierItem(adobe.id, 'ADB-PS-001',  'Adobe Photoshop',               'license/year', null)
  await upsertSupplierItem(adobe.id, 'ADB-AI-001',  'Adobe Illustrator',             'license/year', null)
  await upsertSupplierItem(adobe.id, 'ADB-PDF-001', 'Adobe Acrobat Pro',             'license/year', null)
  await upsertSupplierItem(adobe.id, 'ADB-PR-001',  'Adobe Premiere Pro',            'license/year', null)

  // Staples
  await upsertSupplierItem(staples.id, 'STP-PAP-001', 'A4 Copy Paper (500 sheets)',     'ream',  null)
  await upsertSupplierItem(staples.id, 'STP-PAP-002', 'A4 Copy Paper (5 ream box)',     'box',   null)
  await upsertSupplierItem(staples.id, 'STP-PEN-001', 'Ballpoint Pen (box of 12)',      'box',   null)
  await upsertSupplierItem(staples.id, 'STP-MKR-001', 'Whiteboard Marker Set',         'set',   null)
  await upsertSupplierItem(staples.id, 'STP-FLD-001', 'Document Folder A4 (pack 10)',  'pack',  null)
  await upsertSupplierItem(staples.id, 'STP-STK-001', 'Sticky Notes 76x76 (pack 12)', 'pack',  null)
  await upsertSupplierItem(staples.id, 'STP-SCI-001', 'Office Scissors',              'unit',  null)
  await upsertSupplierItem(staples.id, 'STP-STP-001', 'Heavy Duty Stapler',           'unit',  null)

  // IKEA
  await upsertSupplierItem(ikea.id, 'IKA-DSK-001', 'BEKANT Sit/Stand Desk',         'unit', null)
  await upsertSupplierItem(ikea.id, 'IKA-DSK-002', 'LINNMON Corner Desk',           'unit', null)
  await upsertSupplierItem(ikea.id, 'IKA-CHR-001', 'MARKUS Office Chair',           'unit', null)
  await upsertSupplierItem(ikea.id, 'IKA-CHR-002', 'JÄRVFJÄLLET Ergonomic Chair',   'unit', null)
  await upsertSupplierItem(ikea.id, 'IKA-SHF-001', 'KALLAX Shelf Unit 4x2',        'unit', null)
  await upsertSupplierItem(ikea.id, 'IKA-CAB-001', 'ALEX Drawer Unit',             'unit', null)
  await upsertSupplierItem(ikea.id, 'IKA-MTG-001', 'TOMMARYD Conference Table',    'unit', null)

  // Micron
  await upsertSupplierItem(micron.id, 'MCR-RAM-001', 'Micron 16GB DDR5 RAM',         'unit', null)
  await upsertSupplierItem(micron.id, 'MCR-RAM-002', 'Micron 32GB DDR5 RAM',         'unit', null)
  await upsertSupplierItem(micron.id, 'MCR-SSD-001', 'Micron 1TB NVMe SSD',          'unit', null)
  await upsertSupplierItem(micron.id, 'MCR-SSD-002', 'Micron 2TB NVMe SSD',          'unit', null)

  // SanDisk
  await upsertSupplierItem(sandisk.id, 'SDK-USB-001', 'SanDisk 64GB USB 3.2 Flash Drive',   'unit', null)
  await upsertSupplierItem(sandisk.id, 'SDK-USB-002', 'SanDisk 256GB USB 3.2 Flash Drive',  'unit', null)
  await upsertSupplierItem(sandisk.id, 'SDK-SSD-001', 'SanDisk Extreme 1TB Portable SSD',   'unit', null)
  await upsertSupplierItem(sandisk.id, 'SDK-MSD-001', 'SanDisk 128GB MicroSD Card',         'unit', null)
  await upsertSupplierItem(sandisk.id, 'SDK-MSD-002', 'SanDisk 256GB MicroSD Card',         'unit', null)

  // BestBuy
  await upsertSupplierItem(bestbuy.id, 'BBY-CBL-001', 'USB-C to USB-A Cable 2m',       'unit', null)
  await upsertSupplierItem(bestbuy.id, 'BBY-CBL-002', 'HDMI 2.1 Cable 2m',             'unit', null)
  await upsertSupplierItem(bestbuy.id, 'BBY-HUB-001', 'USB-C 7-in-1 Hub',              'unit', null)
  await upsertSupplierItem(bestbuy.id, 'BBY-PWR-001', '65W USB-C Charger',             'unit', null)
  await upsertSupplierItem(bestbuy.id, 'BBY-PWR-002', 'Power Strip 6-outlet Surge',    'unit', null)

  // MicroCenter
  await upsertSupplierItem(microcenter.id, 'MCC-CPU-001', 'Intel Core i7-14700K',           'unit', null)
  await upsertSupplierItem(microcenter.id, 'MCC-CPU-002', 'AMD Ryzen 9 7900X',              'unit', null)
  await upsertSupplierItem(microcenter.id, 'MCC-GPU-001', 'NVIDIA RTX 4070 Super',          'unit', null)
  await upsertSupplierItem(microcenter.id, 'MCC-MBD-001', 'ASUS ROG Strix Z790-E Motherboard', 'unit', null)
  await upsertSupplierItem(microcenter.id, 'MCC-PSU-001', 'Corsair 850W 80+ Gold PSU',      'unit', null)
  await upsertSupplierItem(microcenter.id, 'MCC-CAS-001', 'Fractal Design North ATX Case',  'unit', null)

  console.log('   ✓ All supplier items seeded\n')

  // ── 5. Users ──────────────────────────────────────────────────────────────
  console.log('5. Users')
  await upsertUser('john_doe',  'password123', roleRequester.id,      'IT')
  await upsertUser('jane_doe',  'password123', roleApprover.id,       'IT')
  await upsertUser('bob_pm',    'password123', roleProcureManager.id, 'Procurement')
  await upsertUser('admin',     'password123', roleAdmin.id,          'IT')
  console.log('   ✓ john_doe, jane_doe, bob_pm, admin\n')

  console.log('✅ Seed complete!\n')
  console.log('Test credentials (all passwords: password123)')
  console.log('  Requester      → john_doe')
  console.log('  Approver       → jane_doe')
  console.log('  Procure Manager→ bob_pm')
  console.log('  Admin          → admin\n')

  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})