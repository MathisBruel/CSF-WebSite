import Script from 'next/script'
import { prisma } from '@/lib/prisma'

export async function GoogleAnalyticsScript() {
  let measurementId: string | null = null

  try {
    const config = await prisma.gAConfig.findFirst({
      where: { enabled: true },
    })
    measurementId = config?.measurementId || null
  } catch (error) {
    console.error('Error fetching GA config:', error)
  }

  if (!measurementId) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
          });`}
      </Script>
    </>
  )
}
