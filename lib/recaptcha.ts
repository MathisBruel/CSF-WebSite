const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

export async function verifyRecaptcha(token: string | undefined | null): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) return false
  if (!token) return false

  const res = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  })

  const data = (await res.json()) as { success: boolean }
  return data.success === true
}
