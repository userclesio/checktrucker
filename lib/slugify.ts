import { randomBytes } from 'crypto'

export function generateSlug(): string {
  return randomBytes(4).toString('hex') // 8 char hex slug
}

export function generateId(): string {
  return randomBytes(6).toString('hex') // 12 char hex id
}
