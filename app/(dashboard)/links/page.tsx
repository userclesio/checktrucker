'use client'

import { useState, useEffect, useCallback } from 'react'
import Modal from '@/components/Modal'
import LinkCard from '@/components/LinkCard'
import { useToast } from '@/components/Toast'
import type { Link, Event } from '@/lib/db'

interface LinkForm {
  name: string
  url: string
  pixelId: string
  fbToken: string
  value: string
  currency: string
}

const DEFAULT_FORM: LinkForm = {
  name: '',
  url: '',
  pixelId: '',
  fbToken: '',
  value: '',
  currency: 'BRL',
}

const CURRENCIES = ['BRL', 'USD', 'EUR', 'GBP', 'NGN', 'MXN', 'ARS', 'COP']

export default function LinksPage() {
  const [links, setLinks] = useState<Link[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [form, setForm] = useState<LinkForm>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    const [linksRes, eventsRes] = await Promise.all([
      fetch('/api/links').then((r) => r.json()),
      fetch('/api/events').then((r) => r.json()),
    ])
    setLinks(linksRes)
    setEvents(eventsRes.events ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openAdd = () => {
    setEditingLink(null)
    setForm(DEFAULT_FORM)
    setShowModal(true)
  }

  const openEdit = (link: Link) => {
    setEditingLink(link)
    setForm({
      name: link.name,
      url: link.url,
      pixelId: link.pixelId ?? '',
      fbToken: link.fbToken ?? '',
      value: link.value > 0 ? link.value.toString() : '',
      currency: link.currency,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingLink(null)
    setForm(DEFAULT_FORM)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.url.trim()) {
      showToast('Name and URL are required', 'error')
      return
    }
    setSaving(true)

    const method = editingLink ? 'PUT' : 'POST'
    const url = editingLink ? `/api/links/${editingLink.id}` : '/api/links'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        url: form.url.trim(),
        pixelId: form.pixelId.trim() || null,
        fbToken: form.fbToken.trim() || null,
        value: parseFloat(form.value) || 0,
        currency: form.currency,
      }),
    })

    setSaving(false)

    if (res.ok) {
      showToast(editingLink ? 'Link updated' : 'Link added', 'success')
      closeModal()
      load()
    } else {
      const err = await res.json()
      showToast(err.error || 'Failed to save link', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this link and all its events?')) return

    const res = await fetch(`/api/links/${id}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('Link deleted', 'success')
      load()
    } else {
      showToast('Failed to delete', 'error')
    }
  }

  const inputClass =
    'w-full bg-base border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-muted focus:outline-none focus:border-white/20 transition-colors'
  const labelClass = 'block text-xs font-medium text-muted mb-1.5 uppercase tracking-wide'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Links</h1>
          <p className="text-sm text-muted mt-1">
            {links.length} checkout link{links.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: '#b8f724', color: '#000' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Add Link
        </button>
      </div>

      {/* Links grid */}
      {loading ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-muted text-sm">Loading…</p>
        </div>
      ) : links.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(184,247,36,0.1)' }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M9.5 12.5a4 4 0 005.657 0l2-2a4 4 0 00-5.657-5.657l-1 1" stroke="#b8f724" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12.5 9.5a4 4 0 00-5.657 0l-2 2a4 4 0 005.657 5.657l1-1" stroke="#b8f724" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-primary font-medium mb-1">No links yet</p>
          <p className="text-sm text-muted mb-5">
            Add your first checkout link to start tracking
          </p>
          <button
            onClick={openAdd}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: '#b8f724', color: '#000' }}
          >
            Add your first link
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {links.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              events={events.filter((e) => e.linkId === link.id)}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={editingLink ? 'Edit Link' : 'Add Checkout Link'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              placeholder="e.g. Course Launch — VendBlue"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div>
            <label className={labelClass}>Checkout URL</label>
            <input
              className={inputClass}
              type="url"
              placeholder="https://checkout.example.com/product"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Value</label>
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <select
                className={inputClass}
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border pt-4">
            <p className="text-[11px] uppercase tracking-widest text-muted mb-3 font-semibold">
              Facebook Pixel (optional — overrides global)
            </p>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Pixel ID</label>
                <input
                  className={inputClass}
                  placeholder="Leave blank to use global pixel"
                  value={form.pixelId}
                  onChange={(e) => setForm((f) => ({ ...f, pixelId: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelClass}>Conversions API Token</label>
                <input
                  className={inputClass}
                  type="password"
                  placeholder="Leave blank to use global token"
                  value={form.fbToken}
                  onChange={(e) => setForm((f) => ({ ...f, fbToken: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-base border border-border text-muted hover:text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{ background: '#b8f724', color: '#000' }}
            >
              {saving ? 'Saving…' : editingLink ? 'Save Changes' : 'Add Link'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
