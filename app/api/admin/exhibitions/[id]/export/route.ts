import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

// CSF brand colours
const ORANGE = 'FFF97316'
const ORANGE_LIGHT = 'FFFFF7ED'
const DARK = 'FF111827'
const WHITE = 'FFFFFFFF'
const GREY_BORDER = 'FFD1D5DB'
const GREEN_LIGHT = 'FFF0FDF4'
const GREEN = 'FF16A34A'
const YELLOW_LIGHT = 'FFFEFCE8'

function headerFill(): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb: ORANGE } }
}
function altFill(even: boolean): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb: even ? 'FFFFFFFF' : ORANGE_LIGHT } }
}
function thinBorder(): Partial<ExcelJS.Borders> {
  const side: ExcelJS.BorderStyle = 'thin'
  const c = { style: side, color: { argb: GREY_BORDER } }
  return { top: c, bottom: c, left: c, right: c }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const expo = await prisma.exhibition.findUnique({ where: { id: params.id } })
  if (!expo) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const registrations = await prisma.registration.findMany({
    where: { exhibitionId: params.id },
    include: {
      user: { select: { name: true, email: true, phone: true, city: true } },
      cats: {
        orderBy: { catalogNumber: 'asc' },
        include: {
          cat: {
            select: {
              name: true, breed: true, gender: true,
              birthDate: true, icadNumber: true, pedigreeNumber: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Chats Sans Frontières'
  wb.created = new Date()

  // ── Sheet 1 : detail par chat ──────────────────────────────────────────────
  const s1 = wb.addWorksheet('Détail par chat', {
    views: [{ state: 'frozen', ySplit: 3 }],
  })

  const cols1: { header: string; key: string; width: number; numFmt?: string }[] = [
    { header: 'N° Cat.', key: 'cat_num', width: 9 },
    { header: 'Nom du chat', key: 'cat_name', width: 22 },
    { header: 'Race', key: 'breed', width: 20 },
    { header: 'Sexe', key: 'gender', width: 8 },
    { header: 'Naissance', key: 'birth', width: 13, numFmt: 'dd/mm/yyyy' },
    { header: 'I-CAD', key: 'icad', width: 16 },
    { header: 'Pedigree', key: 'pedigree', width: 16 },
    { header: 'Propriétaire', key: 'owner', width: 22 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Téléphone', key: 'phone', width: 14 },
    { header: 'Ville', key: 'city', width: 16 },
    { header: 'Statut', key: 'status', width: 14 },
    { header: 'Paiement', key: 'payment', width: 12 },
    { header: 'Cage club', key: 'cage', width: 12 },
    { header: 'Montant chat (€)', key: 'cat_amount', width: 16, numFmt: '#,##0.00' },
    { header: 'Jours', key: 'days', width: 16 },
    { header: 'Classe Samedi', key: 'class_sat', width: 20 },
    { header: 'Classe Dimanche', key: 'class_sun', width: 20 },
    { header: 'H.C.', key: 'hc', width: 7 },
    { header: 'Maison', key: 'house_cat', width: 9 },
    { header: 'Conformité', key: 'conform', width: 11 },
    { header: 'Diplôme', key: 'diploma', width: 10 },
    { header: 'Total inscription (€)', key: 'total', width: 18, numFmt: '#,##0.00' },
  ]

  s1.columns = cols1.map((c) => ({ key: c.key, width: c.width, numFmt: c.numFmt }))

  // Title row
  s1.insertRow(1, [expo.title])
  const titleRow = s1.getRow(1)
  s1.mergeCells(1, 1, 1, cols1.length)
  titleRow.height = 30
  titleRow.getCell(1).font = { bold: true, size: 14, color: { argb: WHITE } }
  titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DARK } }
  titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }

  // Sub-title row (expo dates + exported at)
  const exportedAt = new Date().toLocaleDateString('fr-FR')
  const dateRange = `${expo.startDate.toLocaleDateString('fr-FR')} — ${expo.endDate.toLocaleDateString('fr-FR')}  ·  Exporté le ${exportedAt}`
  s1.insertRow(2, [dateRange])
  const subRow = s1.getRow(2)
  s1.mergeCells(2, 1, 2, cols1.length)
  subRow.height = 18
  subRow.getCell(1).font = { italic: true, size: 10, color: { argb: 'FF6B7280' } }
  subRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }
  subRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }

  // Header row (row 3)
  const headerRow = s1.addRow(cols1.map((c) => c.header))
  headerRow.height = 22
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: WHITE }, size: 10 }
    cell.fill = headerFill()
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false }
    cell.border = thinBorder()
  })

  // Data rows
  let rowIdx = 0
  let grandTotal = 0
  for (const reg of registrations) {
    const isValidated = reg.status === 'VALIDATED'
    const isPaid = reg.paymentStatus === 'PAID'
    for (const rc of reg.cats) {
      rowIdx++
      const even = rowIdx % 2 === 0
      const dataRow = s1.addRow({
        cat_num: rc.catalogNumber ?? '',
        cat_name: rc.cat.name,
        breed: rc.cat.breed,
        gender: rc.cat.gender === 'MALE' ? 'Mâle' : 'Femelle',
        birth: rc.cat.birthDate,
        icad: rc.cat.icadNumber ?? '',
        pedigree: rc.cat.pedigreeNumber ?? '',
        owner: reg.user.name,
        email: reg.user.email,
        phone: reg.user.phone ?? '',
        city: reg.user.city ?? '',
        status: STATUS_LABELS[reg.status] ?? reg.status,
        payment: PAYMENT_LABELS[reg.paymentStatus] ?? reg.paymentStatus,
        cage: [reg.personalCages > 0 && `${reg.personalCages} perso`, reg.borrowedCages > 0 && `${reg.borrowedCages} club`].filter(Boolean).join(' + ') || '',
        cat_amount: rc.amount,
        days: rc.participationDays.join(' + '),
        class_sat: rc.traditionalClassSaturday ?? '',
        class_sun: rc.traditionalClassSunday ?? '',
        hc: rc.isHorsConcours ? 'Oui' : '',
        house_cat: rc.isHouseCat ? 'Oui' : '',
        conform: rc.wantsComplianceExam ? 'Oui' : '',
        diploma: rc.wantsDiploma ? 'Oui' : '',
        total: reg.totalAmount,
      })
      dataRow.height = 18
      dataRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
        cell.border = thinBorder()
        cell.alignment = { vertical: 'middle', wrapText: false }
        // Number columns: right-align
        const col = cols1[colNum - 1]
        if (col?.numFmt) {
          cell.numFmt = col.numFmt
          cell.alignment = { ...cell.alignment, horizontal: 'right' }
        }
        // Default fill, override for special states
        cell.fill = altFill(even)
      })
      // Highlight validated rows green
      if (isValidated) {
        const statusCell = dataRow.getCell('status')
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_LIGHT } }
        statusCell.font = { color: { argb: GREEN }, bold: true, size: 10 }
      }
      if (isPaid) {
        const payCell = dataRow.getCell('payment')
        payCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_LIGHT } }
        payCell.font = { color: { argb: GREEN }, bold: true, size: 10 }
      }
      grandTotal += rc.amount
    }
  }

  // Totals row
  if (rowIdx > 0) {
    const totalRow = s1.addRow({
      cat_name: `${rowIdx} chat${rowIdx > 1 ? 's' : ''}`,
      cat_amount: grandTotal,
    })
    totalRow.height = 20
    totalRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.font = { bold: true, size: 10 }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ORANGE_LIGHT } }
      cell.border = thinBorder()
      const col = cols1[colNum - 1]
      if (col?.numFmt) {
        cell.numFmt = col.numFmt
        cell.alignment = { horizontal: 'right', vertical: 'middle' }
      }
    })
    totalRow.getCell('cat_amount').numFmt = '#,##0.00'
    totalRow.getCell('cat_amount').font = { bold: true, color: { argb: ORANGE }, size: 11 }
  }

  // ── Sheet 2 : résumé par inscription ──────────────────────────────────────
  const s2 = wb.addWorksheet('Résumé par inscription', {
    views: [{ state: 'frozen', ySplit: 3 }],
  })

  const cols2: { header: string; key: string; width: number; numFmt?: string }[] = [
    { header: 'Propriétaire', key: 'owner', width: 24 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Téléphone', key: 'phone', width: 14 },
    { header: 'Ville', key: 'city', width: 16 },
    { header: 'Chats inscrits', key: 'cats', width: 40 },
    { header: 'Nb chats', key: 'nb_cats', width: 10 },
    { header: 'Cage club', key: 'cage', width: 12 },
    { header: 'Statut', key: 'status', width: 14 },
    { header: 'Paiement', key: 'payment', width: 12 },
    { header: 'Total (€)', key: 'total', width: 13, numFmt: '#,##0.00' },
  ]
  s2.columns = cols2.map((c) => ({ key: c.key, width: c.width, numFmt: c.numFmt }))

  // Title
  s2.insertRow(1, [expo.title])
  const t2 = s2.getRow(1)
  s2.mergeCells(1, 1, 1, cols2.length)
  t2.height = 30
  t2.getCell(1).font = { bold: true, size: 14, color: { argb: WHITE } }
  t2.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DARK } }
  t2.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }

  // Sub-title
  s2.insertRow(2, [dateRange])
  const st2 = s2.getRow(2)
  s2.mergeCells(2, 1, 2, cols2.length)
  st2.height = 18
  st2.getCell(1).font = { italic: true, size: 10, color: { argb: '6B7280' } }
  st2.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }
  st2.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }

  // Header
  const h2 = s2.addRow(cols2.map((c) => c.header))
  h2.height = 22
  h2.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: WHITE }, size: 10 }
    cell.fill = headerFill()
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = thinBorder()
  })

  // Data
  let regIdx = 0
  let grandTotalRegs = 0
  for (const reg of registrations) {
    regIdx++
    const even = regIdx % 2 === 0
    const isValidated = reg.status === 'VALIDATED'
    const isPaid = reg.paymentStatus === 'PAID'
    const catNames = reg.cats.map((rc) =>
      rc.catalogNumber ? `#${rc.catalogNumber} ${rc.cat.name}` : rc.cat.name
    ).join(', ')

    const dr = s2.addRow({
      owner: reg.user.name,
      email: reg.user.email,
      phone: reg.user.phone ?? '',
      city: reg.user.city ?? '',
      cats: catNames,
      nb_cats: reg.cats.length,
      cage: [reg.personalCages > 0 && `${reg.personalCages} perso`, reg.borrowedCages > 0 && `${reg.borrowedCages} club`].filter(Boolean).join(' + ') || '',
      status: STATUS_LABELS[reg.status] ?? reg.status,
      payment: PAYMENT_LABELS[reg.paymentStatus] ?? reg.paymentStatus,
      total: reg.totalAmount,
    })
    dr.height = 18
    dr.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.border = thinBorder()
      cell.alignment = { vertical: 'middle', wrapText: false }
      cell.fill = altFill(even)
      const col = cols2[colNum - 1]
      if (col?.numFmt) {
        cell.numFmt = col.numFmt
        cell.alignment = { ...cell.alignment, horizontal: 'right' }
      }
    })
    if (isValidated) {
      const sc = dr.getCell('status')
      sc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_LIGHT } }
      sc.font = { color: { argb: GREEN }, bold: true, size: 10 }
    }
    if (isPaid) {
      const pc = dr.getCell('payment')
      pc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_LIGHT } }
      pc.font = { color: { argb: GREEN }, bold: true, size: 10 }
    }
    grandTotalRegs += reg.totalAmount
  }

  // Totals
  if (regIdx > 0) {
    const tr2 = s2.addRow({
      owner: `${regIdx} inscription${regIdx > 1 ? 's' : ''}`,
      total: grandTotalRegs,
    })
    tr2.height = 20
    tr2.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.font = { bold: true, size: 10 }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ORANGE_LIGHT } }
      cell.border = thinBorder()
      const col = cols2[colNum - 1]
      if (col?.numFmt) {
        cell.numFmt = col.numFmt
        cell.alignment = { horizontal: 'right', vertical: 'middle' }
      }
    })
    tr2.getCell('total').numFmt = '#,##0.00'
    tr2.getCell('total').font = { bold: true, color: { argb: ORANGE }, size: 11 }
  }

  // Write to buffer
  const buffer = await wb.xlsx.writeBuffer()
  const filename = `inscrits-${expo.slug}-${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  VALIDATED: 'Validée',
  REJECTED: 'Refusée',
  WAITING_DOCS: 'Docs manquants',
}
const PAYMENT_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  PAID: 'Payé',
  REFUNDED: 'Remboursé',
}
