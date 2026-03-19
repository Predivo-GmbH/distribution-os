/* ============================================================
   Connector CRM — Lightweight Contact Tracker
   Stored per product in localStorage
   ============================================================ */

import { generateId } from '@/lib/storage'

const CRM_PREFIX = 'distribution-os-crm:'

export type ConnectorStatus = 'identified' | 'contacted' | 'responded' | 'active' | 'dormant'

export interface Connector {
  id: string
  name: string
  platform: string
  audienceSize?: string
  status: ConnectorStatus
  lastContactDate?: string
  commissionRate?: string
  revenue?: number
  notes: string
  followUpThresholdDays?: number
  createdAt: string
}

export function loadConnectorCRM(productId: string): Connector[] {
  try {
    const raw = localStorage.getItem(CRM_PREFIX + productId)
    if (!raw) return []
    return JSON.parse(raw) as Connector[]
  } catch {
    return []
  }
}

export function saveConnectorCRM(productId: string, connectors: Connector[]): void {
  localStorage.setItem(CRM_PREFIX + productId, JSON.stringify(connectors))
}

export function addConnector(productId: string, connector: Omit<Connector, 'id' | 'createdAt'>): Connector {
  const items = loadConnectorCRM(productId)
  const newItem: Connector = {
    ...connector,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  items.push(newItem)
  saveConnectorCRM(productId, items)
  return newItem
}

export function updateConnector(productId: string, id: string, updates: Partial<Connector>): void {
  const items = loadConnectorCRM(productId)
  const idx = items.findIndex(c => c.id === id)
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updates }
    saveConnectorCRM(productId, items)
  }
}

export function removeConnector(productId: string, id: string): void {
  const items = loadConnectorCRM(productId).filter(c => c.id !== id)
  saveConnectorCRM(productId, items)
}
