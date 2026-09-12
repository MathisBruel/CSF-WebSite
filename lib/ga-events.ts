const GA_CLIENT_ID_STORAGE = '_ga_client_id'

export function getOrCreateClientId(): string {
  if (typeof window === 'undefined') return ''

  let clientId = localStorage.getItem(GA_CLIENT_ID_STORAGE)
  if (!clientId) {
    clientId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem(GA_CLIENT_ID_STORAGE, clientId)
  }
  return clientId
}

export async function trackEventToGA(
  eventName: string,
  eventData?: Record<string, any>
) {
  if (typeof window === 'undefined') return

  const consent = localStorage.getItem('ga-consent')
  if (consent !== 'accepted') return

  const clientId = getOrCreateClientId()

  try {
    await fetch('/api/events/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        eventData: {
          page_title: document.title,
          page_location: window.location.href,
          ...eventData,
        },
        clientId,
      }),
    })
  } catch (error) {
    console.error('Error tracking event:', error)
  }
}

export const GAEvents = {
  registration: (exhibitionId: string) =>
    trackEventToGA('registration', { exhibition_id: exhibitionId }),

  catRegistration: (catId: string, exhibitionId: string) =>
    trackEventToGA('cat_registration', { cat_id: catId, exhibition_id: exhibitionId }),

  formSubmit: (formName: string) =>
    trackEventToGA('form_submit', { form_name: formName }),

  documentUpload: (documentType: string) =>
    trackEventToGA('document_upload', { document_type: documentType }),

  profileUpdate: () => trackEventToGA('profile_update'),

  catAdd: () => trackEventToGA('cat_added'),

  exhibitionView: (exhibitionId: string) =>
    trackEventToGA('exhibition_view', { exhibition_id: exhibitionId }),

  newsArticleView: (articleId: string) =>
    trackEventToGA('news_article_view', { article_id: articleId }),

  download: (filename: string) =>
    trackEventToGA('file_download', { file_name: filename }),
}
