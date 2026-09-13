'use client'

import { useState } from 'react'

interface Judge {
  id: string
  firstName: string
  lastName: string
  role?: string | null
  photoUrl?: string | null
  region?: string | null
  breeds?: string | null
}

interface JudgesTableProps {
  judges: Judge[]
}

export function JudgesTable({ judges }: JudgesTableProps) {
  const [hoveredBreedId, setHoveredBreedId] = useState<string | null>(null)

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="pb-2 text-left text-xs font-medium text-csf-muted uppercase tracking-wide">Juge</th>
            <th className="pb-2 text-left text-xs font-medium text-csf-muted uppercase tracking-wide">Région</th>
            <th className="pb-2 text-left text-xs font-medium text-csf-muted uppercase tracking-wide">Races</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {judges.map((j) => (
            <tr key={j.id} className="relative">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2.5">
                  {j.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={j.photoUrl}
                      alt={`${j.firstName} ${j.lastName}`}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-csf-dark">{j.firstName} {j.lastName}</p>
                    {j.role && <p className="text-xs text-csf-muted">{j.role}</p>}
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4 text-csf-muted text-sm">{j.region ?? '—'}</td>
              <td className="py-3 text-csf-muted text-xs">
                {j.breeds ? (
                  <span
                    className="cursor-help inline-flex items-center gap-1 text-xs text-csf-orange font-medium relative"
                    onMouseEnter={() => setHoveredBreedId(j.id)}
                    onMouseLeave={() => setHoveredBreedId(null)}
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                      <circle cx="8" cy="3" r="1.5" />
                      <circle cx="8" cy="8" r="1.5" />
                      <circle cx="8" cy="13" r="1.5" />
                    </svg>
                    Voir races
                    {hoveredBreedId === j.id && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-[9999] p-3 bg-white border border-gray-300 rounded-lg shadow-2xl text-csf-muted text-xs whitespace-nowrap">
                        <p className="font-medium text-csf-dark mb-1">Races jugées :</p>
                        <p className="text-left max-w-xs">{j.breeds}</p>
                        <div className="absolute top-full left-1/2 w-2 h-2 bg-white border-r border-b border-gray-300 transform -translate-x-1/2 rotate-45"></div>
                      </div>
                    )}
                  </span>
                ) : (
                  <span>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
