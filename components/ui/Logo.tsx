import Link from 'next/link'
import Image from 'next/image'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-10 h-10 flex-shrink-0">
        <Image
          src="/images/logo-circle.png"
          alt="Chats Sans Frontières"
          fill
          className="object-contain"
          sizes="40px"
        />
      </div>
      <div className="leading-tight">
        <p className="font-bold text-sm text-csf-dark tracking-wide">Chats Sans Frontières</p>
        <p className="text-xs text-csf-muted italic">Association Féline</p>
      </div>
    </Link>
  )
}
