'use client'

import { useState, useMemo } from 'react'
import { TinyMCEEditor } from '@/components/ui/TinyMCEEditor'

const APP_NAME = 'Chats Sans Frontières'
const CONTACT = 'contact@assocsf.fr'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const UNSUB_FOOTER = `
  <hr style="border:none;border-top:1px solid #e8e8e8;margin:32px 0 20px;">
  <p style="font-size:12px;color:#aaa;margin:0;">
    Vous recevez cet email car vous êtes abonné à la newsletter de ${APP_NAME}.<br>
    Pour vous désabonner : <a href="${APP_URL}/membre/profil" style="color:#C44B0C;">gérer mes préférences</a>.
  </p>`

function buildPreviewHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:30px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <tr>
        <td style="background:#C44B0C;padding:22px 32px;">
          <span style="color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:0.5px;">${APP_NAME}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;color:#1a1a1a;font-size:15px;line-height:1.65;">
          ${body || '<p style="color:#aaa;font-style:italic;">Le contenu de l\'email apparaîtra ici…</p>'}
        </td>
      </tr>
      <tr>
        <td style="background:#f8f8f8;padding:18px 32px;border-top:1px solid #e8e8e8;font-size:13px;color:#888888;">
          <p style="margin:0 0 4px;">Pour nous contacter : <a href="mailto:${CONTACT}" style="color:#C44B0C;text-decoration:none;">${CONTACT}</a></p>
          <p style="margin:0;">${APP_NAME} &mdash; <a href="${APP_URL}" style="color:#C44B0C;text-decoration:none;">${APP_URL}</a></p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

export function NewsletterForm() {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const previewHtml = useMemo(
    () => buildPreviewHtml(subject || 'Prévisualisation', content + UNSUB_FOOTER),
    [subject, content]
  )

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
    <div className="space-y-5">
      {message && (
        <div className={`p-3 rounded-lg text-sm border ${
          message.ok
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="form-label">Sujet</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="form-input"
          placeholder="Objet de l'email..."
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Editor */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <label className="form-label">Contenu</label>
          <TinyMCEEditor
            value={content}
            onChange={setContent}
            placeholder="<p>Bonjour !</p><p>Voici les dernières nouvelles…</p>"
            height={500}
          />
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <label className="form-label mb-0">Prévisualisation email</label>
            <span className="text-xs text-csf-muted bg-gray-100 px-2 py-0.5 rounded-full">live</span>
          </div>
          {subject && (
            <p className="text-xs text-csf-muted">
              <span className="font-medium text-csf-dark">Sujet :</span> {subject}
            </p>
          )}
          <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: 540 }}>
            <iframe
              srcDoc={previewHtml}
              title="Prévisualisation newsletter"
              className="w-full h-full"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
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
