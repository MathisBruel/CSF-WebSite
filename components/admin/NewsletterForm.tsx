'use client'

import { useState } from 'react'

export function NewsletterForm() {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const send = async (test: boolean) => {
    if (!subject.trim() || !content.trim()) {
      setMessage({ text: 'Sujet et contenu requis.', ok: false })
      return
    }
    setLoading(true)
    setMessage(null)
    const res = await fetch('/api/admin/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, content, test }),
    })
    const data = await res.json()
    setLoading(false)
    setMessage({ text: data.message || (res.ok ? 'Envoyé !' : 'Erreur'), ok: res.ok })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      {message && (
        <div className={`p-3 rounded-lg text-sm border ${
          message.ok
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div>
        <label className="form-label">Sujet</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="form-input"
          placeholder="Objet de l'email..."
        />
      </div>

      <div>
        <label className="form-label">Contenu</label>
        <p className="text-xs text-csf-muted mb-2">HTML supporté (balises <code>p</code>, <code>strong</code>, <code>a</code>, etc.)</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="form-input min-h-60 font-mono text-sm"
          placeholder="<p>Bonjour !</p><p>Voici les dernières nouvelles...</p>"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => send(false)}
          disabled={loading}
          className="btn-primary">
          {loading ? 'Envoi...' : 'Envoyer à tous les abonnés'}
        </button>
        <button
          onClick={() => send(true)}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-csf-dark">
          Envoyer un test (à moi)
        </button>
      </div>
    </div>
  )
}
