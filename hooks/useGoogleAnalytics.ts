export function useGoogleAnalytics() {
  const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      const consent = localStorage.getItem('ga-consent')
      if (consent === 'accepted') {
        window.gtag('event', eventName, eventData || {})
      }
    }
  }

  const trackPageView = (path: string, title?: string) => {
    trackEvent('page_view', {
      page_path: path,
      page_title: title,
    })
  }

  const trackFormSubmission = (formName: string, data?: Record<string, any>) => {
    trackEvent('form_submission', {
      form_name: formName,
      ...data,
    })
  }

  const trackRegistration = (registrationType: string, data?: Record<string, any>) => {
    trackEvent('registration', {
      registration_type: registrationType,
      ...data,
    })
  }

  const trackUserAction = (action: string, category: string, label?: string, value?: number) => {
    trackEvent('user_action', {
      action,
      category,
      label,
      value,
    })
  }

  return {
    trackEvent,
    trackPageView,
    trackFormSubmission,
    trackRegistration,
    trackUserAction,
  }
}
