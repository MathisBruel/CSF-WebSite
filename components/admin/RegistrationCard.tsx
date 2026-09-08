'use client'

import { useState } from 'react'
import { formatDate, formatPrice, REGISTRATION_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/utils'
import { RegistrationActions } from '@/components/admin/RegistrationActions'
import { DocumentValidation } from '@/components/admin/DocumentValidation'

interface RegistrationCardProps {
  reg: any
}

export function RegistrationCard({ reg }: RegistrationCardProps) {
  const [expanded, setExpanded] = useState(false)

  const statusColors: Record<string, string> = {
    PENDING: 'badge-yellow',
    VALIDATED: 'badge-green',
    REJECTED: 'badge-red',
    WAITING_DOCS: 'badge-blue',
  }
  const payColors: Record<string, string> = {
    PENDING: 'badge-yellow',
    PAID: 'badge-green',
    REFUNDED: 'badge-blue',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div
        className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Registration header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <span className={`badge ${statusColors[reg.status]}`}>
                {REGISTRATION_STATUS_LABELS[reg.status]}
              </span>
              <span className={`badge ${payColors[reg.paymentStatus]}`}>
                {PAYMENT_STATUS_LABELS[reg.paymentStatus]}
              </span>
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="font-bold text-csf-dark text-sm">{reg.user.name}</h3>
              <span className="text-xs text-csf-muted">{reg.user.city || 'Ville non renseignée'}</span>
            </div>
            <p className="text-xs text-csf-muted">
              {reg.exhibition.title} · {formatDate(reg.exhibition.startDate)} ·{' '}
              <span className="font-medium text-csf-dark">
                {reg.cats.length} chat{reg.cats.length !== 1 ? 's' : ''} · {formatPrice(reg.totalAmount)}
              </span>
              {(reg.personalCages > 0 || reg.borrowedCages > 0) && (
                <span className="ml-1">
                  ·{' '}
                  {[
                    reg.personalCages > 0 &&
                      `${reg.personalCages} cage${reg.personalCages > 1 ? 's' : ''} perso`,
                    reg.borrowedCages > 0 &&
                      `${reg.borrowedCages} cage${reg.borrowedCages > 1 ? 's' : ''} club`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <RegistrationActions
              registrationId={reg.id}
              currentStatus={reg.status}
              currentPayment={reg.paymentStatus}
            />
            <div className="text-xs text-csf-muted">
              {expanded ? '▼ Détails' : '▶ Détails'}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 p-3 space-y-4 bg-gray-50">
          {/* User info */}
          <div className="bg-white rounded-lg p-3 space-y-2">
            <h4 className="font-semibold text-csf-dark text-sm">Informations inscrits</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-csf-muted">Nom:</p>
                <p className="font-medium text-csf-dark">{reg.user.name || <span className="text-gray-300">vide</span>}</p>
              </div>
              <div>
                <p className="text-csf-muted">Email:</p>
                <p className="font-medium text-csf-dark break-all">{reg.user.email || <span className="text-gray-300">vide</span>}</p>
              </div>
              <div>
                <p className="text-csf-muted">Ville:</p>
                <p className="font-medium text-csf-dark">{reg.user.city || <span className="text-gray-300">vide</span>}</p>
              </div>
              <div>
                <p className="text-csf-muted">Élevage:</p>
                <p className="font-medium text-csf-dark">{reg.user.breedingName || <span className="text-gray-300">vide</span>}</p>
              </div>
              <div>
                <p className="text-csf-muted">Statut:</p>
                <p className="font-medium text-csf-dark">{reg.status || <span className="text-gray-300">vide</span>}</p>
              </div>
              <div>
                <p className="text-csf-muted">Paiement:</p>
                <p className="font-medium text-csf-dark">{reg.paymentStatus || <span className="text-gray-300">vide</span>}</p>
              </div>
              <div>
                <p className="text-csf-muted">Frais inscription:</p>
                <p className="font-medium text-csf-dark">{reg.registrationFee ? formatPrice(reg.registrationFee) : <span className="text-gray-300">vide</span>}</p>
              </div>
              <div>
                <p className="text-csf-muted">Montant total:</p>
                <p className="font-medium text-csf-dark">{formatPrice(reg.totalAmount) || <span className="text-gray-300">vide</span>}</p>
              </div>
              <div>
                <p className="text-csf-muted">Payé à:</p>
                <p className="font-medium text-csf-dark">{reg.paidAt ? formatDate(reg.paidAt) : <span className="text-gray-300">vide</span>}</p>
              </div>
              <div>
                <p className="text-csf-muted">Cages perso:</p>
                <p className="font-medium text-csf-dark">{reg.personalCages > 0 ? reg.personalCages : <span className="text-gray-300">0</span>}</p>
              </div>
              <div>
                <p className="text-csf-muted">Cages club:</p>
                <p className="font-medium text-csf-dark">{reg.borrowedCages > 0 ? reg.borrowedCages : <span className="text-gray-300">0</span>}</p>
              </div>
              <div>
                <p className="text-csf-muted">Demande spéciale cages:</p>
                <p className="font-medium text-csf-dark">{reg.cageSpecialLengthRequest || <span className="text-gray-300">vide</span>}</p>
              </div>
              <div className="col-span-2">
                <p className="text-csf-muted">Placement préféré:</p>
                <p className="font-medium text-csf-dark">{reg.nextTo || <span className="text-gray-300">vide</span>}</p>
              </div>
              <div className="col-span-2">
                <p className="text-csf-muted">Commentaire inscrits:</p>
                <p className="font-medium text-csf-dark">{reg.comment || <span className="text-gray-300">vide</span>}</p>
              </div>
              <div className="col-span-2">
                <p className="text-csf-muted">Notes admin:</p>
                <p className="font-medium text-csf-dark">{reg.adminNotes || <span className="text-gray-300">vide</span>}</p>
              </div>
              <div className="col-span-2">
                <p className="text-csf-muted">Raison rejet:</p>
                <p className="font-medium text-csf-dark">{reg.rejectionReason || <span className="text-gray-300">vide</span>}</p>
              </div>
              <div className="col-span-2">
                <p className="text-csf-muted">URL convocation:</p>
                <p className="font-medium text-csf-dark break-all">{reg.convocationUrl ? <a href={reg.convocationUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{reg.convocationUrl}</a> : <span className="text-gray-300">vide</span>}</p>
              </div>
              <div>
                <p className="text-csf-muted">Convocation envoyée:</p>
                <p className="font-medium text-csf-dark">{reg.convocationSentAt ? formatDate(reg.convocationSentAt) : <span className="text-gray-300">vide</span>}</p>
              </div>
              <div>
                <p className="text-csf-muted">Date d&apos;inscription:</p>
                <p className="font-medium text-csf-dark">{formatDate(reg.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Per-cat details */}
          <div className="space-y-3">
            <h4 className="font-semibold text-csf-dark text-sm">Détails des chats ({reg.cats.length})</h4>
            {reg.cats.map((rc: any) => (
              <div key={rc.id} className="border border-gray-100 rounded-lg p-3 bg-white space-y-3">
                <div className="border-b border-gray-100 pb-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-csf-dark text-sm">{rc.cat.name}</p>
                    <span className="text-xs font-medium text-csf-dark">{formatPrice(rc.amount)}</span>
                  </div>
                  <p className="text-xs text-csf-muted">{rc.cat.breed}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-csf-muted">Jours participation:</p>
                    <p className="font-medium text-csf-dark">{rc.participationDays?.length > 0 ? rc.participationDays.join(', ') : <span className="text-gray-300">vide</span>}</p>
                  </div>
                  <div>
                    <p className="text-csf-muted">Classe samedi:</p>
                    <p className="font-medium text-csf-dark">{rc.traditionalClassSaturday || <span className="text-gray-300">vide</span>}</p>
                  </div>
                  <div>
                    <p className="text-csf-muted">Classe dimanche:</p>
                    <p className="font-medium text-csf-dark">{rc.traditionalClassSunday || <span className="text-gray-300">vide</span>}</p>
                  </div>
                  <div>
                    <p className="text-csf-muted">Classe autre:</p>
                    <p className="font-medium text-csf-dark">{rc.traditionalClassOther || <span className="text-gray-300">vide</span>}</p>
                  </div>
                  <div>
                    <p className="text-csf-muted">Conformité seule:</p>
                    <p className="font-medium text-csf-dark">{rc.isConformityOnly ? 'Oui' : 'Non'}</p>
                  </div>
                  <div>
                    <p className="text-csf-muted">Chat de maison:</p>
                    <p className="font-medium text-csf-dark">{rc.isHouseCat ? 'Oui' : 'Non'}</p>
                  </div>
                  <div>
                    <p className="text-csf-muted">Hors concours:</p>
                    <p className="font-medium text-csf-dark">{rc.isHorsConcours ? 'Oui' : 'Non'}</p>
                  </div>
                  <div>
                    <p className="text-csf-muted">Examen conformité:</p>
                    <p className="font-medium text-csf-dark">{rc.wantsComplianceExam ? 'Oui' : 'Non'}</p>
                  </div>
                  <div>
                    <p className="text-csf-muted">Veut diplôme:</p>
                    <p className="font-medium text-csf-dark">{rc.wantsDiploma ? 'Oui' : 'Non'}</p>
                  </div>
                  <div>
                    <p className="text-csf-muted">Participations spéciales:</p>
                    <p className="font-medium text-csf-dark">{rc.specialParticipations?.length > 0 ? rc.specialParticipations.join(', ') : <span className="text-gray-300">vide</span>}</p>
                  </div>
                  <div>
                    <p className="text-csf-muted">Notes vétérinaire:</p>
                    <p className="font-medium text-csf-dark">{rc.vetNotes || <span className="text-gray-300">vide</span>}</p>
                  </div>
                  <div>
                    <p className="text-csf-muted">Validé vét. à:</p>
                    <p className="font-medium text-csf-dark">{rc.vetValidatedAt ? formatDate(rc.vetValidatedAt) : <span className="text-gray-300">vide</span>}</p>
                  </div>
                </div>

                {rc.cat.catDocuments.length > 0 && (
                  <div className="border-t border-gray-100 pt-2">
                    <p className="text-xs text-csf-muted mb-1.5 font-medium">Documents:</p>
                    <div className="flex flex-wrap gap-2">
                      {rc.cat.catDocuments.map((doc: any) => (
                        <DocumentValidation key={doc.id} doc={doc} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
