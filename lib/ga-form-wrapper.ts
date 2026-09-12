import { GAEvents } from './ga-events'

export function trackFormSubmit(formName: string, data?: Record<string, any>) {
  GAEvents.formSubmit(formName)
}

export function createTrackedFormHandler(
  formName: string,
  onSubmit: (data: any) => void | Promise<void>,
  onSuccess?: () => void
) {
  return async (data: any) => {
    trackFormSubmit(formName)
    try {
      await Promise.resolve(onSubmit(data))
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      throw error
    }
  }
}
