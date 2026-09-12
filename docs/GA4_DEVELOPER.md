# Google Analytics 4 - Guide Développeur

## Architecture

GA4 est configuré avec :
- **Script gtag** injecté via `next/script` dans le layout
- **Cookie consent** RGPD avant tracking
- **Server-side events** via Measurement Protocol
- **Client-side events** via gtag
- **Custom events** pour actions métier importantes

## Utilisation

### 1. Tracking via hook (Client Components)

```tsx
'use client'

import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics'

export function MyComponent() {
  const { trackEvent, trackFormSubmission } = useGoogleAnalytics()

  const handleSubmit = async (data) => {
    trackFormSubmission('registration_form', { cat_count: data.cats.length })
    // Submit form...
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### 2. Tracking via GAEvents utility

```tsx
'use client'

import { GAEvents } from '@/lib/ga-events'

export function ExhibitionCard({ exhibitionId }) {
  return (
    <button
      onClick={() => {
        GAEvents.exhibitionView(exhibitionId)
        // Navigate to exhibition
      }}
    >
      View Exhibition
    </button>
  )
}
```

### 3. Événements prédéfinis

```tsx
import { GAEvents } from '@/lib/ga-events'

// Registrations
GAEvents.registration('expo-123')
GAEvents.catRegistration('cat-456', 'expo-123')

// Documents
GAEvents.documentUpload('PEDIGREE')

// User actions
GAEvents.profileUpdate()
GAEvents.catAdd()

// Content views
GAEvents.exhibitionView('expo-123')
GAEvents.newsArticleView('article-789')

// Downloads
GAEvents.download('contract.pdf')

// Custom events
GAEvents.formSubmit('contact_form')
```

### 4. Tracking form submissions avec React Hook Form

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { trackFormSubmit } from '@/lib/ga-form-wrapper'

export function ContactForm() {
  const { handleSubmit, register } = useForm()

  const onSubmit = async (data) => {
    trackFormSubmit('contact_form')
    // Submit...
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      <button type="submit">Send</button>
    </form>
  )
}
```

### 5. Custom events

```tsx
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics'

const { trackEvent } = useGoogleAnalytics()

// Custom event
trackEvent('cat_search', {
  search_term: 'siamese',
  results_count: 42,
  filters_applied: true
})
```

## Fonctions disponibles

### Hook `useGoogleAnalytics()`

```tsx
const {
  trackEvent,          // (eventName, eventData?) => void
  trackPageView,       // (path, title?) => void
  trackFormSubmission, // (formName, data?) => void
  trackRegistration,   // (registrationType, data?) => void
  trackUserAction,     // (action, category, label?, value?) => void
} = useGoogleAnalytics()
```

### Utility `GAEvents`

```tsx
GAEvents.registration(exhibitionId)
GAEvents.catRegistration(catId, exhibitionId)
GAEvents.formSubmit(formName)
GAEvents.documentUpload(documentType)
GAEvents.profileUpdate()
GAEvents.catAdd()
GAEvents.exhibitionView(exhibitionId)
GAEvents.newsArticleView(articleId)
GAEvents.download(filename)
```

## Structure des événements

Tous les événements incluent automatiquement :
- `page_title` : titre de la page
- `page_location` : URL complète
- Client ID unique
- Timestamp

## Consentement

GA ne track que si `localStorage.getItem('ga-consent') === 'accepted'`.

Le banner CookieConsent gère automatiquement :
- Affichage au premier visit
- Stockage du choix en localStorage
- Communication du consentement à GA via `window.gtag('consent', 'update', ...)`

## Server-side Tracking

Pour tracker des événements côté serveur (ex: validations de registration) :

```ts
// app/api/registrations/validate/route.ts
import { trackEventToGA } from '@/lib/ga-events'

export async function POST(req: Request) {
  const { exhibitionId } = await req.json()
  
  // Votre logique...
  
  // Track server-side
  await trackEventToGA('registration_validated', {
    exhibition_id: exhibitionId,
  })
  
  return Response.json({ success: true })
}
```

## Dashboard GA4

Accédez aux analytics :
1. [Google Analytics](https://analytics.google.com/)
2. Sélectionnez la propriété CSF
3. Voyez les rapports en temps réel et les événements personnalisés

## Events à considérer

Le site track déjà :
- ✓ Page views (automatique)
- ✓ User sessions (automatique)
- ✓ Device/browser/location (automatique)

Événements métier ajoutés :
- Registration aux expositions
- Uploads de documents
- Profile updates
- Cat additions
- Article views
- Form submissions

Pour ajouter d'autres événements, utilisez `trackEvent(name, data)`.

## Notes importantes

1. **Consentement** : Toujours vérifier que l'utilisateur a accepté avant de tracker
2. **Performance** : Les tracking est asynchrone (non-blocking)
3. **Privacy** : Les IPs sont anonymisées, pas de données PII trackées
4. **Délai** : GA4 prend ~24h pour afficher les données

## Dépannage

### Événements n'apparaissent pas dans GA4
- Vérifiez le consentement : `localStorage.getItem('ga-consent')`
- Vérifiez la console pour les erreurs
- Attendez 24h pour que GA4 les affiche
- Vérifiez que GA est activé dans Admin

### Trop d'événements / Hit limit
- GA4 a une limite de 500 hits/sec
- Limitez le tracking d'événements custom
- Évitez de tracker à chaque keystroke

### GDPR concerns
- ✓ Consentement mis en place
- ✓ IPs anonymisées
- ✓ Pas de PII trackées
- ✓ Utilisateurs peuvent refuser
