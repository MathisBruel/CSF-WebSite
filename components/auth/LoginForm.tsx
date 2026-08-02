'use client'

import { useRef, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ReCAPTCHA from 'react-google-recaptcha'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')

    const recaptchaToken = recaptchaRef.current?.getValue()
    if (!recaptchaToken) {
      setError('Merci de valider le captcha.')
      return
    }

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      recaptchaToken,
      redirect: false,
    })

    recaptchaRef.current?.reset()

    if (result?.error) {
      if (result.error === 'EMAIL_NOT_VERIFIED') {
        setError('Votre email n\'est pas encore confirmé. Vérifiez votre boîte mail.')
      } else if (result.error === 'CAPTCHA_FAILED') {
        setError('Vérification captcha échouée. Merci de réessayer.')
      } else {
        setError('Email ou mot de passe incorrect.')
      }
      return
    }

    const callbackUrl = searchParams.get('callbackUrl') || '/membre/dashboard'
    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold font-serif text-csf-dark mb-1 text-center">Connexion</h1>
      <p className="text-center text-csf-muted text-sm mb-6">Accédez à votre espace membre</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="form-label">Adresse email</label>
          <input {...register('email')} type="email" className="form-input" placeholder="vous@exemple.fr" autoComplete="email" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="form-label">Mot de passe</label>
            <Link href="/forgot-password" className="text-xs text-csf-orange hover:text-csf-orange-dark font-medium">
              Mot de passe oublié ?
            </Link>
          </div>
          <input {...register('password')} type="password" className="form-input" placeholder="••••••••" autoComplete="current-password" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <div className="flex justify-center">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
          {isSubmitting ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <p className="text-center text-sm text-csf-muted mt-6">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-csf-orange hover:text-csf-orange-dark font-medium">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  )
}
