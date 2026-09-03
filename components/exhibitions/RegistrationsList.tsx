'use client'

import { useEffect, useState, useMemo } from 'react'
import { calculateAge } from '@/lib/utils'

interface Cat {
  catId: string
  name: string
  breed: string
  birthDate: string
  isHouseCat: boolean
  class: string
  catalogNumber: number | null
}

interface Exhibitor {
  id: string
  name: string
  firstName: string
  lastName: string
  type: string
}

interface Registration {
  registrationId: string
  status: 'VALIDATED' | 'PENDING'
  exhibitor: Exhibitor
  cats: Cat[]
}

interface RegistrationsListProps {
  exhibitionId: string
}

const SORT_OPTIONS = [
  { value: 'recent', label: 'Récents' },
  { value: 'breed', label: 'Race' },
  { value: 'class', label: 'Classe' },
]

export default function RegistrationsList({ exhibitionId }: RegistrationsListProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBreed, setSelectedBreed] = useState<string>('')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    fetch(`/api/exhibitions/${exhibitionId}/registrations`)
      .then((res) => res.json())
      .then((data) => {
        setRegistrations(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching registrations:', error)
        setLoading(false)
      })
  }, [exhibitionId])

  const allBreeds = useMemo(() => {
    const breeds = new Set<string>()
    registrations.forEach((reg) =>
      reg.cats.forEach((cat) => {
        if (cat.breed) breeds.add(cat.breed)
      })
    )
    return Array.from(breeds).sort()
  }, [registrations])

  const allClasses = useMemo(() => {
    const classes = new Set<string>()
    registrations.forEach((reg) =>
      reg.cats.forEach((cat) => {
        if (cat.class) {
          cat.class.split(' / ').forEach((c) => classes.add(c.trim()))
        }
      })
    )
    return Array.from(classes).sort()
  }, [registrations])

  const filteredAndSorted = useMemo(() => {
    let filtered = registrations.flatMap((reg) =>
      reg.cats.map((cat) => ({ registration: reg, cat }))
    )

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.registration.exhibitor.name.toLowerCase().includes(term) ||
          item.registration.exhibitor.firstName.toLowerCase().includes(term) ||
          item.registration.exhibitor.lastName.toLowerCase().includes(term) ||
          item.cat.name.toLowerCase().includes(term)
      )
    }

    if (selectedBreed) {
      filtered = filtered.filter((item) => item.cat.breed === selectedBreed)
    }

    if (selectedClass) {
      filtered = filtered.filter((item) =>
        item.cat.class
          .split(' / ')
          .map((c) => c.trim())
          .includes(selectedClass)
      )
    }

    // Sort
    if (sortBy === 'breed') {
      filtered.sort((a, b) => (a.cat.breed || '').localeCompare(b.cat.breed || ''))
    } else if (sortBy === 'class') {
      filtered.sort((a, b) => (a.cat.class || '').localeCompare(b.cat.class || ''))
    }

    return filtered
  }, [registrations, searchTerm, selectedBreed, selectedClass, sortBy])

  const stats = useMemo(() => {
    const validated = registrations.filter((r) => r.status === 'VALIDATED').length
    const pending = registrations.filter((r) => r.status === 'PENDING').length
    const total = registrations.length
    return { validated, pending, total }
  }, [registrations])

  if (loading) {
    return (
      <div className="card text-center py-8">
        <p className="text-csf-muted">Chargement des inscrits...</p>
      </div>
    )
  }

  if (registrations.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-csf-muted">Aucune inscription pour cette exposition.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-csf-dark">{stats.total}</p>
          <p className="text-sm text-csf-muted">Total inscrits</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{stats.validated}</p>
          <p className="text-sm text-csf-muted">Validées</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
          <p className="text-sm text-csf-muted">En attente</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-csf-dark mb-2">
            Rechercher
          </label>
          <input
            type="text"
            placeholder="Exposant ou chat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-csf-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-csf-orange"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-csf-dark mb-2">
              Race
            </label>
            <select
              value={selectedBreed}
              onChange={(e) => setSelectedBreed(e.target.value)}
              className="w-full px-3 py-2 border border-csf-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-csf-orange"
            >
              <option value="">Toutes les races</option>
              {allBreeds.map((breed) => (
                <option key={breed} value={breed}>
                  {breed}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-csf-dark mb-2">
              Classe
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-csf-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-csf-orange"
            >
              <option value="">Toutes les classes</option>
              {allClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-csf-dark mb-2">
              Trier par
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-csf-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-csf-orange"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || selectedBreed || selectedClass) && (
          <div className="text-sm text-csf-muted">
            {filteredAndSorted.length} résultat{filteredAndSorted.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-csf-light">
              <th className="px-4 py-3 text-left font-bold text-csf-dark">Exposant</th>
              <th className="px-4 py-3 text-left font-bold text-csf-dark">Chat</th>
              <th className="px-4 py-3 text-left font-bold text-csf-dark">Race</th>
              <th className="px-4 py-3 text-left font-bold text-csf-dark">Âge</th>
              <th className="px-4 py-3 text-left font-bold text-csf-dark">Classe</th>
              <th className="px-4 py-3 text-center font-bold text-csf-dark">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-csf-light">
            {filteredAndSorted.map(({ registration, cat }, idx) => (
              <tr key={`${registration.registrationId}-${cat.catId}-${idx}`} className="hover:bg-csf-light-hover">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-csf-dark">{registration.exhibitor.name}</p>
                    <p className="text-xs text-csf-muted">
                      {registration.exhibitor.type}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-csf-dark">{cat.name}</td>
                <td className="px-4 py-3 text-csf-muted">{cat.breed || '—'}</td>
                <td className="px-4 py-3 text-csf-muted">
                  {calculateAge(new Date(cat.birthDate))}
                </td>
                <td className="px-4 py-3 text-csf-muted">{cat.class || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      registration.status === 'VALIDATED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {registration.status === 'VALIDATED' ? 'Validée' : 'En attente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
