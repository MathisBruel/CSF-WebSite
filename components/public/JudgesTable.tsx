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
  const [hoveredJudgeId, setHoveredJudgeId] = useState<string | null>(null)

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
            <tr
              key={j.id}
              className="relative hover:bg-gray-50 transition-colors"
              onMouseEnter={() => setHoveredJudgeId(j.id)}
              onMouseLeave={() => setHoveredJudgeId(null)}
            >
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
                <div className="flex items-center gap-2">
                  {j.breeds ? (
                    <>
                      <span className="cursor-help inline-flex items-center gap-1 text-xs text-csf-orange font-medium">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                          <circle cx="8" cy="3" r="1.5" />
                          <circle cx="8" cy="8" r="1.5" />
                          <circle cx="8" cy="13" r="1.5" />
                        </svg>
                        Voir races
                      </span>
                      {hoveredJudgeId === j.id && (
                        <div className="absolute z-50 left-0 right-0 bottom-full mb-2 p-3 bg-white border border-gray-300 rounded-lg shadow-lg text-csf-muted text-xs max-w-sm pointer-events-none">
                          <p className="font-medium text-csf-dark mb-1">Races jugées :</p>
                          <p className="leading-relaxed whitespace-normal">{j.breeds}</p>
                          <div className="absolute bottom-0 left-8 w-2 h-2 bg-white border-r border-b border-gray-300 transform rotate-45 translate-y-1"></div>
                        </div>
                      )}
                    </>
                  ) : (
                    <span>—</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
