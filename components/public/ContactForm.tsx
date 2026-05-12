'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  category: z.string().min(1, 'Catégorie requise'),
  subject: z.string().min(3, 'Sujet requis'),
  message: z.string().min(10, 'Message trop court'),
})

type FormData = z.infer<typeof schema>

const categories = [
  { value: '', label: 'Sélectionnez une catégorie' },
  { value: 'general', label: 'Question générale' },
  { value: 'exposition', label: 'Expositions' },
  { value: 'inscription', label: 'Inscriptions' },
  { value: 'adhesion', label: 'Adhésion au club' },
  { value: 'partenariat', label: 'Partenariat / Sponsoring' },
  { value: 'presse', label: 'Presse / Média' },
  { value: 'autre', label: 'Autre' },
]

export function ContactForm() {
  const [sent, setSent] = useState(false)
  const [attachment, setAttachment] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email)
    formData.append('category', data.category)
    formData.append('subject', data.subject)
    formData.append('message', data.message)
    if (attachment) {
      formData.append('attachment', attachment)
    }

    // TODO: Envoyer à l'API quand elle sera configurée
    await new Promise((r) => setTimeout(r, 800))
    console.log('Contact form:', data, 'Attachment:', attachment?.name)
    setSent(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Limite à 10 MB
      if (file.size > 10 * 1024 * 1024) {
        alert('Le fichier ne doit pas dépasser 10 Mo')
        return
      }
      setAttachment(file)
    }
  }

  if (sent) {
    return (
      <div className="card text-center py-10">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-bold text-csf-dark text-lg mb-2">Message envoyé !</h3>
        <p className="text-csf-muted text-sm">Nous vous répondrons dans les plus brefs délais à contact@assocsf.fr.</p>
      </div>
    )
  }

  return (
    <form className="card space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="form-label">Nom complet <span className="text-red-500">*</span></label>
        <input {...register('name')} className="form-input" placeholder="Jean Dupont" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label className="form-label">Email <span className="text-red-500">*</span></label>
        <input {...register('email')} type="email" className="form-input" placeholder="jean@example.com" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="form-label">Catégorie <span className="text-red-500">*</span></label>
        <select {...register('category')} className="form-select">
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
      </div>
      <div>
        <label className="form-label">Sujet <span className="text-red-500">*</span></label>
        <input {...register('subject')} className="form-input" placeholder="Votre sujet..." />
        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
      </div>
      <div>
        <label className="form-label">Message <span className="text-red-500">*</span></label>
        <textarea {...register('message')} className="form-textarea" placeholder="Votre message..." rows={5} />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
      </div>

      {/* Pièce jointe */}
      <div>
        <label className="form-label">Pièce jointe (optionnel)</label>
        <div className="mt-1">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-csf-dark hover:bg-csf-cream transition-colors"
          >
            <svg className="w-4 h-4 text-csf-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            Joindre un fichier
          </button>
          {attachment && (
            <div className="mt-2 flex items-center gap-2 text-sm text-csf-muted">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{attachment.name}</span>
              <button type="button" onClick={() => setAttachment(null)} className="text-red-500 hover:text-red-700 text-xs">
                Supprimer
              </button>
            </div>
          )}
          <p className="text-xs text-csf-muted mt-1">PDF, images ou documents — max 10 Mo</p>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
      </button>
    </form>
  )
}
