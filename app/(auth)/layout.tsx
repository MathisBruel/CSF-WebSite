import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-csf-dark relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 10% 50%, #d48342 0%, transparent 50%)'
        }} />
      </div>
      <div className="relative flex flex-col items-center px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="flex justify-center">
            <div className="w-16 h-16">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="#d48342" />
                <text x="20" y="26" fontFamily="Georgia, serif" fontSize="14" fontWeight="700"
                      fill="#1a3546" textAnchor="middle">CSF</text>
              </svg>
            </div>
          </Link>
          <p className="text-center text-csf-light/60 text-sm mt-2">Chats Sans Frontières</p>
        </div>
        <div className="w-full max-w-3xl">
          {children}
        </div>
      </div>
    </div>
  )
}
