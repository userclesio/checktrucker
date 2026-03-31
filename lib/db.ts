import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'db.json')

export interface Link {
  id: string
  slug: string
  name: string
  url: string
  pixelId?: string
  fbToken?: string
  value: number
  currency: string
  createdAt: string
}

export interface Event {
  id: string
  linkId: string
  type: 'PageView' | 'InitiateCheckout' | 'Purchase'
  source?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface Settings {
  pixelId: string
  fbToken: string
}

export interface DB {
  links: Link[]
  events: Event[]
  settings: Settings
}

const defaultDB: DB = {
  links: [],
  events: [],
  settings: { pixelId: '', fbToken: '' },
}

export function readDB(): DB {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2))
      return JSON.parse(JSON.stringify(defaultDB))
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8')
    return JSON.parse(raw) as DB
  } catch {
    return JSON.parse(JSON.stringify(defaultDB))
  }
}

export function writeDB(db: DB): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}
