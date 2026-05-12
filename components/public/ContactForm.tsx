'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(3, 'Sujet requis'),
  message: z.string().min(10, 'Message trop court'),
})

type FormData = z.infer<typeof schema>

export function ContactForm() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 800))
    console.log('Contact form:', data)
    setSent(true)
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
        <p className="text-csf-muted text-sm">Nous vous répondrons dans les plus brefs délais.</p>
      </div>
    )
  }

  return (
    <form className="card space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="form-label">Nom complet</label>
        <input {...register('name')} className="form-input" placeholder="Jean Dupont" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label className="form-label">Email</label>
        <input {...register('email')} type="email" className="form-input" placeholder="jean@example.com" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="form-label">Sujet</label>
        <input {...register('subject')} className="form-input" placeholder="Votre sujet..." />
        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
      </div>
      <div>
        <label className="form-label">Message</label>
        <textarea {...register('message')} className="form-textarea" placeholder="Votre message..." rows={5} />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
      </button>
    </form>
  )
}
