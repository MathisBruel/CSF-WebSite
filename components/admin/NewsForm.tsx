'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import Link from 'next/link'
import { slugify } from '@/lib/utils'
import { TinyMCEEditor } from '@/components/ui/TinyMCEEditor'

type FormData = {
  title: string
  content: string
  excerpt: string
  published: boolean
}

export function NewsForm({
  newsId,
  defaultValues,
}: {
  newsId?: string
  defaultValues?: Partial<FormData>
}) {
  const router = useRouter()
  const [error, setError] = useState('')
  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      published: false,
      excerpt: '',
      ...defaultValues,
    },
  })

  const title = watch('title', '')

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const payload = {
        ...data,
        slug: slugify(data.title),
      }
      const res = await fetch(newsId ? `/api/admin/news/${newsId}` : '/api/admin/news', {
        method: newsId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error || 'Erreur lors de la sauvegarde')
        return
      }
      router.push('/admin/contenu')
      router.refresh()
    } catch (err) {
      setError('Erreur réseau')
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-bold text-csf-dark">Informations</h2>
        <div>
          <label className="form-label">Titre <span className="text-red-500">*</span></label>
          <input
            {...register('title', { required: 'Titre requis' })}
            className="form-input"
            placeholder="Titre de l&apos;actualité"
          />
          {title && <p className="text-xs text-csf-muted mt-1">Slug: {slugify(title)}</p>}
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="form-label">Résumé</label>
          <textarea
            {...register('excerpt')}
            className="form-textarea"
            rows={2}
            placeholder="Courte description de l&apos;actualité..."
          />
        </div>
        <div>
          <label className="form-label">Contenu <span className="text-red-500">*</span></label>
          <Controller
            name="content"
            control={control}
            rules={{ required: 'Contenu requis' }}
            render={({ field }) => (
              <TinyMCEEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Contenu de l&apos;actualité..."
                height={500}
                maxWords={5000}
              />
            )}
          />
          {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input
              {...register('published')}
              type="checkbox"
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-csf-dark">Publié</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/admin/contenu" className="btn-secondary flex-1 text-center">
          Annuler
        </Link>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
          {isSubmitting ? 'Sauvegarde...' : newsId ? 'Mettre à jour' : 'Créer l&apos;article'}
        </button>
      </div>
    </form>
  )
}
