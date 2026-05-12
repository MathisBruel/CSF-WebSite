'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

export function ImageUpload({
  value,
  onChange,
  category = 'general',
  label = 'Image',
}: {
  value?: string
  onChange: (url: string) => void
  category?: 'team' | 'exhibition' | 'general'
  label?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erreur lors du téléchargement')
        return
      }

      const data = await res.json()
      onChange(data.location)
      setPreview(data.location)
    } catch (err) {
      setError('Erreur réseau')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-2">
      <label className="form-label">{label}</label>

      {preview && (
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => {
              setPreview(undefined)
              onChange('')
            }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-csf-orange hover:bg-orange-50 transition-colors cursor-pointer"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />

        {uploading ? (
          <div>
            <p className="font-medium text-csf-dark">Téléchargement...</p>
            <p className="text-sm text-csf-muted mt-1">Veuillez patienter</p>
          </div>
        ) : (
          <div>
            <p className="font-medium text-csf-dark">📸 Cliquez pour télécharger</p>
            <p className="text-sm text-csf-muted mt-1">ou glissez-déposez une image</p>
            <p className="text-xs text-csf-muted mt-2">JPG, PNG, GIF, WebP (max 10MB)</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
