export interface GtagEvent {
  [key: string]: any
}

declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void
    dataLayer: any[]
  }
}
