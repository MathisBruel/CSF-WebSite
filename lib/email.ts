import nodemailer from 'nodemailer'
import { prisma } from './prisma'

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const CONTACT = 'contact@assocsf.fr'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const APP_NAME = 'Chats Sans Frontières'

function from() {
  return `${APP_NAME} <${process.env.SMTP_FROM || 'no-reply@assocsf.fr'}>`
}

function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:30px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <tr>
        <td style="background:#C44B0C;padding:22px 32px;">
          <span style="color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:0.5px;">${APP_NAME}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;color:#1a1a1a;font-size:15px;line-height:1.65;">
          ${body}
        </td>
      </tr>
      <tr>
        <td style="background:#f8f8f8;padding:18px 32px;border-top:1px solid #e8e8e8;font-size:13px;color:#888888;">
          <p style="margin:0 0 4px;">Pour nous contacter : <a href="mailto:${CONTACT}" style="color:#C44B0C;text-decoration:none;">${CONTACT}</a></p>
          <p style="margin:0;">${APP_NAME} &mdash; <a href="${APP_URL}" style="color:#C44B0C;text-decoration:none;">${APP_URL}</a></p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

function btn(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:#C44B0C;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;margin-top:20px;">${label}</a>`
}

async function send(
  to: string | string[],
  subject: string,
  html: string,
  attachments?: { filename: string; content: string; contentType: string }[]
) {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn('[email] SMTP non configuré — email ignoré vers', to)
    return
  }
  try {
    await transporter.sendMail({ from: from(), to, subject, html, attachments })
  } catch (err) {
    console.error('[email] Échec envoi:', err)
  }
}

// ── Compte ──────────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(user: { name: string; email: string }) {
  const html = baseTemplate('Bienvenue', `
    <h2 style="color:#C44B0C;margin-top:0;">Bienvenue, ${user.name}&nbsp;!</h2>
    <p>Votre compte sur le site de <strong>${APP_NAME}</strong> a bien été créé.</p>
    <p>Vous pouvez désormais :</p>
    <ul style="padding-left:20px;line-height:2;">
      <li>Gérer vos chats et leurs documents</li>
      <li>Consulter les expositions à venir</li>
      <li>Demander votre adhésion au club depuis votre tableau de bord</li>
    </ul>
    ${btn(`${APP_URL}/membre/dashboard`, 'Accéder à mon espace')}
  `)
  await send(user.email, `Bienvenue chez ${APP_NAME} !`, html)
}

export async function sendVerificationEmail(user: { name: string; email: string }, token: string) {
  const url = `${APP_URL}/api/auth/verify-email?token=${token}`
  const html = baseTemplate('Confirmez votre email', `
    <h2 style="color:#C44B0C;margin-top:0;">Confirmez votre adresse email</h2>
    <p>Bonjour ${user.name},</p>
    <p>Merci pour votre inscription sur le site de <strong>${APP_NAME}</strong>.</p>
    <p>Cliquez sur le bouton ci-dessous pour activer votre compte :</p>
    ${btn(url, 'Confirmer mon email')}
    <p style="margin-top:20px;font-size:13px;color:#666;">Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.</p>
  `)
  await send(user.email, `Confirmez votre email — ${APP_NAME}`, html)
}

// ── Adhésion ─────────────────────────────────────────────────────────────────

export async function sendMembershipRequestReceivedEmail(user: { name: string; email: string }) {
  const html = baseTemplate("Demande d'adhésion reçue", `
    <h2 style="color:#C44B0C;margin-top:0;">Demande reçue</h2>
    <p>Bonjour ${user.name},</p>
    <p>Nous avons bien reçu votre demande d'adhésion à <strong>${APP_NAME}</strong>.</p>
    <p>Le bureau va l'examiner et vous répondra prochainement par email.</p>
    <p style="margin-top:24px;font-size:13px;color:#666;">Pour toute question : <a href="mailto:${CONTACT}" style="color:#C44B0C;">${CONTACT}</a></p>
  `)
  await send(user.email, "Demande d'adhésion reçue — " + APP_NAME, html)
}

export async function notifyAdminMembershipRequest(user: { name: string; email: string }) {
  const adminEmail = process.env.ADMIN_EMAIL || CONTACT
  const html = baseTemplate("Nouvelle demande d'adhésion", `
    <h2 style="color:#C44B0C;margin-top:0;">Nouvelle demande d'adhésion</h2>
    <p><strong>${user.name}</strong> (${user.email}) vient de soumettre une demande d'adhésion.</p>
    ${btn(`${APP_URL}/admin/membres`, 'Gérer les demandes')}
  `)
  await send(adminEmail, `Nouvelle demande d'adhésion — ${user.name}`, html)
}

export async function sendMembershipApprovedEmail(
  user: { name: string; email: string },
  payment: { price: string; iban: string; bic: string; holder: string; paypalLink: string }
) {
  const paypalRow = payment.paypalLink
    ? `<p style="margin-top:20px;"><strong>Via PayPal :</strong><br>
       <a href="${payment.paypalLink}" style="color:#C44B0C;">${payment.paypalLink}</a></p>`
    : ''

  const html = baseTemplate('Adhésion approuvée', `
    <h2 style="color:#C44B0C;margin-top:0;">Votre adhésion est approuvée !</h2>
    <p>Bonjour ${user.name},</p>
    <p>Le bureau a validé votre demande d'adhésion à <strong>${APP_NAME}</strong>. Félicitations !</p>
    <p>Pour finaliser votre adhésion, veuillez régler le montant de <strong>${payment.price}&nbsp;€</strong> selon l'une des modalités ci-dessous :</p>
    <div style="background:#fdf6f2;border-left:4px solid #C44B0C;padding:16px 20px;margin:20px 0;border-radius:0 6px 6px 0;">
      <p style="margin:0 0 6px;font-weight:bold;">Virement bancaire :</p>
      <p style="margin:0;font-family:monospace;font-size:14px;">IBAN : ${payment.iban}</p>
      <p style="margin:4px 0 0;font-family:monospace;font-size:14px;">BIC&nbsp;&nbsp;: ${payment.bic}</p>
      <p style="margin:4px 0 0;font-family:monospace;font-size:14px;">Titulaire : ${payment.holder}</p>
      <p style="margin:10px 0 0;font-size:13px;color:#888;">Référence à indiquer : Adhésion ${user.name}</p>
    </div>
    ${paypalRow}
    <p style="margin-top:24px;font-size:13px;color:#666;">Pour toute question : <a href="mailto:${CONTACT}" style="color:#C44B0C;">${CONTACT}</a></p>
  `)
  await send(user.email, `Adhésion approuvée — ${APP_NAME}`, html)
}

export async function sendMembershipRejectedEmail(user: { name: string; email: string }, reason: string) {
  const html = baseTemplate("Demande d'adhésion", `
    <h2 style="color:#C44B0C;margin-top:0;">Demande d'adhésion</h2>
    <p>Bonjour ${user.name},</p>
    <p>Après examen, le bureau n'a pas pu valider votre demande d'adhésion pour la raison suivante :</p>
    <div style="background:#fff5f5;border-left:4px solid #e53e3e;padding:16px 20px;margin:20px 0;border-radius:0 6px 6px 0;color:#c53030;">
      <p style="margin:0;">${reason}</p>
    </div>
    <p>Si vous souhaitez nous contacter ou soumettre une nouvelle demande :</p>
    <p><a href="mailto:${CONTACT}" style="color:#C44B0C;">${CONTACT}</a></p>
  `)
  await send(user.email, `Demande d'adhésion — ${APP_NAME}`, html)
}

// ── Inscriptions expo ────────────────────────────────────────────────────────

export async function sendRegistrationValidatedEmail(
  user: { name: string; email: string },
  exhibition: { title: string; startDate: Date; city: string }
) {
  const date = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(exhibition.startDate)
  const html = baseTemplate('Inscription validée', `
    <h2 style="color:#C44B0C;margin-top:0;">Inscription validée !</h2>
    <p>Bonjour ${user.name},</p>
    <p>Votre inscription à l'exposition <strong>${exhibition.title}</strong> (${exhibition.city}, ${date}) a été <strong style="color:#16a34a;">validée</strong>.</p>
    ${btn(`${APP_URL}/membre/inscriptions`, 'Voir mes inscriptions')}
  `)
  await send(user.email, `Inscription validée — ${exhibition.title}`, html)
}

export async function sendPaymentReminderEmail(
  user: { name: string; email: string },
  exhibition: { title: string; startDate: Date; city: string },
  totalAmount: number,
  payment?: { iban: string; bic: string; holder: string; paypalLink: string }
) {
  const date = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(exhibition.startDate)
  const amount = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalAmount)

  const paymentBlock = payment && (payment.iban || payment.paypalLink) ? `
    <div style="background:#fdf6f2;border-left:4px solid #C44B0C;padding:16px 20px;margin:20px 0;border-radius:0 6px 6px 0;">
      <p style="margin:0 0 8px;font-weight:bold;">Règlement par virement bancaire</p>
      ${payment.iban ? `<p style="margin:0 0 4px;font-family:monospace;font-size:14px;">IBAN : ${payment.iban}</p>` : ''}
      ${payment.bic ? `<p style="margin:4px 0;font-family:monospace;font-size:14px;">BIC&nbsp;&nbsp;: ${payment.bic}</p>` : ''}
      ${payment.holder ? `<p style="margin:4px 0;font-family:monospace;font-size:14px;">Titulaire : ${payment.holder}</p>` : ''}
      <p style="margin:12px 0 0;font-size:12px;color:#888;">Référence : Inscription ${exhibition.title} — ${user.name}</p>
    </div>
    ${payment.paypalLink ? `<p style="margin:16px 0;"><strong>Ou via PayPal :</strong> <a href="${payment.paypalLink}" style="color:#C44B0C;">${payment.paypalLink}</a></p>` : ''}
    <p style="font-size:12px;color:#888;margin-top:8px;">
      Retrouvez toujours les coordonnées à jour sur notre site : <a href="${APP_URL}/tarifs#paiement" style="color:#C44B0C;">page Tarifs — Modalités de paiement</a>
    </p>` : `
    <p style="font-size:13px;color:#666;">
      Retrouvez les coordonnées de paiement sur : <a href="${APP_URL}/tarifs#paiement" style="color:#C44B0C;">${APP_URL}/tarifs#paiement</a>
    </p>`

  const html = baseTemplate('Rappel de paiement', `
    <h2 style="color:#C44B0C;margin-top:0;">Rappel : paiement en attente</h2>
    <p>Bonjour ${user.name},</p>
    <p>Votre inscription à l'exposition <strong>${exhibition.title}</strong> (${exhibition.city}, ${date}) est enregistrée mais nous n'avons pas encore reçu votre règlement.</p>
    <div style="background:#fdf6f2;border-left:4px solid #C44B0C;padding:16px 20px;margin:20px 0;border-radius:0 6px 6px 0;">
      <p style="margin:0;font-weight:bold;">Montant à régler : ${amount}</p>
    </div>
    <p>Merci de procéder au règlement dès que possible afin de valider définitivement votre place.</p>
    ${paymentBlock}
    <p style="margin-top:24px;font-size:13px;color:#666;">Pour toute question : <a href="mailto:${CONTACT}" style="color:#C44B0C;">${CONTACT}</a></p>
    ${btn(`${APP_URL}/membre/inscriptions`, 'Voir mon inscription')}
  `)
  await send(user.email, `Rappel paiement — ${exhibition.title}`, html)
}

export async function sendRegistrationRejectedEmail(
  user: { name: string; email: string },
  exhibition: { title: string },
  reason: string
) {
  const html = baseTemplate('Inscription refusée', `
    <h2 style="color:#C44B0C;margin-top:0;">Inscription à ${exhibition.title}</h2>
    <p>Bonjour ${user.name},</p>
    <p>Votre inscription à l'exposition <strong>${exhibition.title}</strong> n'a pas pu être acceptée :</p>
    <div style="background:#fff5f5;border-left:4px solid #e53e3e;padding:16px 20px;margin:20px 0;border-radius:0 6px 6px 0;color:#c53030;">
      <p style="margin:0;">${reason}</p>
    </div>
    <p>Pour toute question : <a href="mailto:${CONTACT}" style="color:#C44B0C;">${CONTACT}</a></p>
  `)
  await send(user.email, `Inscription refusée — ${exhibition.title}`, html)
}

export async function notifyAdminNewRegistration(params: {
  registrationId: string
  user: {
    name: string
    email: string
    membershipActive: boolean
    membershipExpiry?: Date | null
    role?: string | null
    firstName?: string | null
    lastName?: string | null
    civilite?: string | null
    phone?: string | null
    phoneFixed?: string | null
    address?: string | null
    address2?: string | null
    city?: string | null
    postalCode?: string | null
    country?: string | null
    exposantType?: string | null
    certificatCapacite?: string | null
    affixe?: string | null
    breedingName?: string | null
    siret?: string | null
    website?: string | null
    otherClubs?: string | null
  }
  exhibition: { title: string; startDate: Date; city: string }
  cats: {
    name: string
    breed: string
    participationDays: string[]
    traditionalClass?: string | null
    traditionalClassOther?: string | null
    isHouseCat?: boolean
    wantsComplianceExam: boolean
    specialParticipations: string[]
    amount: number
  }[]
  registrationFee: number
  totalAmount: number
  personalCages: number
  borrowedCages: number
  cageSpecialLengthRequest?: string | null
  nextTo?: string | null
  comment?: string | null
}) {
  const inscriptionEmail = process.env.INSCRIPTION_EMAIL || 'inscription@assocsf.fr'
  const { registrationId, user, exhibition, cats, registrationFee, totalAmount, personalCages, borrowedCages, cageSpecialLengthRequest, nextTo, comment } = params
  const date = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(exhibition.startDate)
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

  const catRows = cats.map((cat, idx) => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">${idx + 1}. <strong>${cat.name}</strong> <span style="color:#888;">(${cat.breed})</span></td>
      <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555;">${cat.participationDays.join(', ') || '–'}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555;">${cat.traditionalClass || '–'}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555;">${[cat.wantsComplianceExam && 'Conformité', ...(cat.specialParticipations)].filter(Boolean).join(', ') || '–'}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold;">${fmt(cat.amount)}</td>
    </tr>`).join('')

  const html = baseTemplate('Nouvelle inscription', `
    <h2 style="color:#C44B0C;margin-top:0;">Nouvelle inscription reçue</h2>

    <div style="background:#f8f8f8;border-radius:6px;padding:14px 16px;margin-bottom:20px;">
      <p style="margin:0 0 4px;"><strong>Exposant :</strong> ${user.name} (${user.email})</p>
      <p style="margin:0 0 4px;"><strong>Ville :</strong> ${user.city || 'Non renseignée'}</p>
      <p style="margin:0 0 4px;"><strong>Statut :</strong> ${user.membershipActive ? 'Adhérent actif' : 'Non adhérent / cotisation non à jour'}</p>
      <p style="margin:0;font-size:12px;color:#888;">ID inscription : ${registrationId}</p>
    </div>

    <p><strong>Exposition :</strong> ${exhibition.title} — ${exhibition.city}, ${date}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #e8e8e8;border-radius:6px;overflow:hidden;font-size:14px;">
      <thead>
        <tr style="background:#f8f8f8;">
          <th style="padding:8px 10px;text-align:left;font-size:13px;color:#555;">Chat</th>
          <th style="padding:8px 10px;text-align:left;font-size:13px;color:#555;">Jours</th>
          <th style="padding:8px 10px;text-align:left;font-size:13px;color:#555;">Classe</th>
          <th style="padding:8px 10px;text-align:left;font-size:13px;color:#555;">Options</th>
          <th style="padding:8px 10px;text-align:right;font-size:13px;color:#555;">Montant</th>
        </tr>
      </thead>
      <tbody>
        ${catRows}
        <tr style="background:#fdf6f2;">
          <td colspan="4" style="padding:8px 10px;font-weight:600;color:#555;">Frais d'inscription</td>
          <td style="padding:8px 10px;text-align:right;font-weight:bold;">${fmt(registrationFee)}</td>
        </tr>
        <tr style="background:#fff3ed;">
          <td colspan="4" style="padding:10px;font-weight:bold;color:#C44B0C;">Total</td>
          <td style="padding:10px;text-align:right;font-weight:bold;color:#C44B0C;">${fmt(totalAmount)}</td>
        </tr>
      </tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
      <tr>
        <td style="padding:4px 0;color:#555;width:160px;">Cages personnelles :</td>
        <td style="padding:4px 0;font-weight:600;">${personalCages}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#555;">Cages empruntées :</td>
        <td style="padding:4px 0;font-weight:600;">${borrowedCages}</td>
      </tr>
      ${cageSpecialLengthRequest ? `<tr><td style="padding:4px 0;color:#555;">Cage spéciale :</td><td style="padding:4px 0;">${cageSpecialLengthRequest}</td></tr>` : ''}
      ${nextTo ? `<tr><td style="padding:4px 0;color:#555;">À côté de :</td><td style="padding:4px 0;">${nextTo}</td></tr>` : ''}
      ${comment ? `<tr><td style="padding:4px 0;color:#555;">Commentaire :</td><td style="padding:4px 0;">${comment}</td></tr>` : ''}
    </table>

    ${btn(`${APP_URL}/admin/inscriptions`, 'Voir dans l\'admin')}
  `)

  const json = JSON.stringify({
    id: registrationId,
    createdAt: new Date().toISOString(),
    exhibition: { title: exhibition.title, startDate: exhibition.startDate, city: exhibition.city },
    exposant: {
      nom: user.name,
      prenom: user.firstName || null,
      nom_de_famille: user.lastName || null,
      civilite: user.civilite || null,
      email: user.email,
      telephone_mobile: user.phone || null,
      telephone_fixe: user.phoneFixed || null,
      adresse: user.address || null,
      adresse2: user.address2 || null,
      ville: user.city || null,
      code_postal: user.postalCode || null,
      pays: user.country || 'France',
      type_exposant: user.exposantType || null,
      certificat_capacite: user.certificatCapacite || null,
      affixe: user.affixe || null,
      nom_elevage: user.breedingName || null,
      siret: user.siret || null,
      site_web: user.website || null,
      autres_clubs: user.otherClubs || null,
      adherent_actif: user.membershipActive,
      expiration_adhesion: user.membershipExpiry || null,
      role: user.role || null,
    },
    chats: cats.map((cat, idx) => ({
      position: idx + 1,
      nom: cat.name,
      race: cat.breed,
      chat_de_maison: cat.isHouseCat ?? false,
      jours_participation: cat.participationDays,
      classe: cat.traditionalClass || null,
      classe_autre: cat.traditionalClassOther || null,
      examen_conformite: cat.wantsComplianceExam,
      participations_speciales: cat.specialParticipations,
      montant: cat.amount,
    })),
    frais_inscription: registrationFee,
    total: totalAmount,
    cages: { personnelles: personalCages, empruntees: borrowedCages, demande_speciale: cageSpecialLengthRequest || null },
    a_cote_de: nextTo || null,
    commentaire: comment || null,
  }, null, 2)

  const safeTitle = exhibition.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const safeName = user.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  await send(
    inscriptionEmail,
    `Nouvelle inscription — ${exhibition.title} (${user.name})`,
    html,
    [{ filename: `inscription_${safeTitle}_${safeName}.json`, content: json, contentType: 'application/json' }]
  )
}

export async function sendRegistrationConfirmationEmail(params: {
  user: { name: string; email: string }
  exhibition: { title: string; startDate: Date; city: string }
  cats: { name: string; breed: string; participationDays: string[]; wantsComplianceExam: boolean; amount: number }[]
  registrationFee: number
  totalAmount: number
  iban: string
  bic: string
  holder: string
  paypalLink?: string
}) {
  const { user, exhibition, cats, registrationFee, totalAmount, iban, bic, holder, paypalLink } = params
  const date = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(exhibition.startDate)
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

  const catRows = cats.map((cat, idx) => {
    const days = cat.participationDays.length > 0 ? cat.participationDays.join(', ') : '–'
    const options = cat.wantsComplianceExam ? 'Conformité' : '–'
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">${idx + 1}. ${cat.name} <span style="color:#888;font-size:13px;">(${cat.breed})</span></td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;color:#555;font-size:13px;">${days}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;color:#555;font-size:13px;">${options}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold;">${fmt(cat.amount)}</td>
      </tr>`
  }).join('')

  const html = baseTemplate("Confirmation d'inscription", `
    <h2 style="color:#C44B0C;margin-top:0;">Inscription enregistrée !</h2>
    <p>Bonjour ${user.name},</p>
    <p>Votre inscription à l'exposition <strong>${exhibition.title}</strong> a bien été enregistrée.</p>
    <p><strong>Date :</strong> ${date} &mdash; <strong>Lieu :</strong> ${exhibition.city}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #e8e8e8;border-radius:6px;overflow:hidden;font-size:14px;">
      <thead>
        <tr style="background:#f8f8f8;">
          <th style="padding:10px 12px;text-align:left;font-weight:600;color:#555;">Chat</th>
          <th style="padding:10px 12px;text-align:center;font-weight:600;color:#555;">Jours</th>
          <th style="padding:10px 12px;text-align:center;font-weight:600;color:#555;">Options</th>
          <th style="padding:10px 12px;text-align:right;font-weight:600;color:#555;">Montant</th>
        </tr>
      </thead>
      <tbody>
        ${catRows}
        <tr style="background:#fdf6f2;">
          <td colspan="3" style="padding:10px 12px;font-weight:600;color:#555;">Frais d'inscription</td>
          <td style="padding:10px 12px;text-align:right;font-weight:bold;">${fmt(registrationFee)}</td>
        </tr>
        <tr style="background:#fff3ed;">
          <td colspan="3" style="padding:12px;font-size:16px;font-weight:bold;color:#C44B0C;">Total à régler</td>
          <td style="padding:12px;text-align:right;font-size:16px;font-weight:bold;color:#C44B0C;">${fmt(totalAmount)}</td>
        </tr>
      </tbody>
    </table>

    <div style="background:#fdf6f2;border-left:4px solid #C44B0C;padding:16px 20px;margin:24px 0;border-radius:0 6px 6px 0;">
      <p style="margin:0 0 8px;font-weight:bold;">Règlement par virement bancaire</p>
      <p style="margin:0 0 4px;font-family:monospace;font-size:14px;">IBAN : ${iban || 'Non configuré'}</p>
      <p style="margin:4px 0;font-family:monospace;font-size:14px;">BIC&nbsp;&nbsp;: ${bic || 'Non configuré'}</p>
      ${holder ? `<p style="margin:4px 0;font-family:monospace;font-size:14px;">Titulaire : ${holder}</p>` : ''}
      <p style="margin:12px 0 0;font-size:12px;color:#888;">Référence à indiquer : Inscription ${exhibition.title} — ${user.name}</p>
    </div>

    ${paypalLink ? `<p style="margin:0 0 16px;"><strong>Ou via PayPal :</strong> <a href="${paypalLink}" style="color:#C44B0C;">${paypalLink}</a></p>` : ''}

    <p style="font-size:12px;color:#888;margin:0 0 20px;">
      Vous pouvez vérifier que ces coordonnées sont toujours à jour sur notre site :
      <a href="${APP_URL}/tarifs#paiement" style="color:#C44B0C;">page Tarifs — Modalités de paiement</a>
    </p>

    <p style="font-size:13px;color:#666;">Le bureau validera votre inscription après réception du paiement. Pour toute question : <a href="mailto:${CONTACT}" style="color:#C44B0C;">${CONTACT}</a></p>
    ${btn(`${APP_URL}/membre/inscriptions`, 'Voir mon inscription')}
  `)
  await send(user.email, `Confirmation inscription — ${exhibition.title}`, html)
}

// ── Newsletter ───────────────────────────────────────────────────────────────

const unsubFooter = `
  <hr style="border:none;border-top:1px solid #e8e8e8;margin:32px 0 20px;">
  <p style="font-size:12px;color:#aaa;margin:0;">
    Vous recevez cet email car vous êtes abonné à la newsletter de ${APP_NAME}.<br>
    Pour vous désabonner : <a href="${APP_URL}/membre/profil" style="color:#C44B0C;">gérer mes préférences</a>.
  </p>`

export async function sendNewsletterToSubscribers(
  subject: string,
  content: string,
  options?: { testEmail?: string }
) {
  if (options?.testEmail) {
    const html = baseTemplate(subject, content + `
      <div style="margin-top:24px;padding:12px 16px;background:#fffbeb;border:1px solid #fbbf24;border-radius:6px;font-size:13px;color:#92400e;">
        <strong>Email de test</strong> — cet email n'a été envoyé qu'à vous, pas aux abonnés.
      </div>`)
    await send(options.testEmail, `[TEST] ${subject}`, html)
    return
  }

  const subscribers = await prisma.user.findMany({
    where: { newsletterSubscribed: true },
    select: { email: true },
  })

  if (subscribers.length === 0) return

  const html = baseTemplate(subject, content + unsubFooter)
  await Promise.allSettled(subscribers.map((s) => send(s.email, subject, html)))
}

export async function notifyAdminRegistrationCancelled(
  user: { name: string; email: string },
  exhibition: { id: string; title: string; startDate: Date; city: string }
) {
  const adminEmail = process.env.ADMIN_EMAIL || CONTACT
  const date = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(exhibition.startDate)
  const html = baseTemplate('Annulation inscription', `
    <h2 style="color:#C44B0C;margin-top:0;">Inscription annulée</h2>
    <p><strong>${user.name}</strong> (${user.email}) vient d'annuler son inscription à l'exposition suivante :</p>
    <p style="margin:16px 0;padding:12px 16px;background:#f8f8f8;border-left:3px solid #C44B0C;border-radius:4px;">
      <strong>${exhibition.title}</strong><br>
      ${date} — ${exhibition.city}
    </p>
    ${btn(`${APP_URL}/admin/expositions/${exhibition.id}`, "Voir l'exposition")}
  `)
  await send(adminEmail, `Inscription annulée — ${user.name} / ${exhibition.title}`, html)
}

export async function sendExhibitionMailing(
  exhibitionId: string,
  subject: string,
  content: string,
  options?: { testEmail?: string }
) {
  if (options?.testEmail) {
    const html = baseTemplate(subject, content + `
      <div style="margin-top:24px;padding:12px 16px;background:#fffbeb;border:1px solid #fbbf24;border-radius:6px;font-size:13px;color:#92400e;">
        <strong>Email de test</strong> — cet email n'a été envoyé qu'à vous, pas aux inscrits.
      </div>`)
    await send(options.testEmail, `[TEST] ${subject}`, html)
    return
  }

  const registrations = await prisma.registration.findMany({
    where: { exhibitionId, status: 'VALIDATED' },
    select: { user: { select: { email: true } } },
  })

  const emails = [...new Set(registrations.map((r) => r.user.email))]
  if (emails.length === 0) return

  const html = baseTemplate(subject, content)
  await Promise.allSettled(emails.map((email) => send(email, subject, html)))
}

export async function sendExhibitionCancelledEmail(
  user: { name: string; email: string },
  exhibition: { title: string; startDate: Date; city: string }
) {
  const date = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(exhibition.startDate)
  const html = baseTemplate("Exposition annulée", `
    <h2 style="color:#C44B0C;margin-top:0;">Exposition annulée</h2>
    <p>Bonjour ${user.name},</p>
    <p>Nous avons le regret de vous informer que l'exposition <strong>${exhibition.title}</strong> prévue le <strong>${date}</strong> à <strong>${exhibition.city}</strong> est annulée.</p>
    <p>Votre inscription est automatiquement annulée. Si vous avez déjà effectué un règlement, le bureau vous contactera pour le remboursement.</p>
    <p style="margin-top:24px;font-size:13px;color:#666;">Pour toute question : <a href="mailto:${CONTACT}" style="color:#C44B0C;">${CONTACT}</a></p>
    ${btn(`${APP_URL}/expositions`, 'Voir les expositions')}
  `)
  await send(user.email, `Exposition annulée — ${exhibition.title}`, html)
}

export async function sendExhibitionOpenNewsletter(exhibition: {
  id: string
  title: string
  city: string
  startDate: Date
}) {
  const date = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(exhibition.startDate)
  const content = `
    <h2 style="color:#C44B0C;margin-top:0;">Inscriptions ouvertes !</h2>
    <p>Les inscriptions pour l'exposition <strong>${exhibition.title}</strong> sont maintenant ouvertes.</p>
    <p><strong>Date :</strong> ${date}<br><strong>Lieu :</strong> ${exhibition.city}</p>
    ${btn(`${APP_URL}/membre/inscriptions/${exhibition.id}`, "S'inscrire maintenant")}`
  await sendNewsletterToSubscribers(`Inscriptions ouvertes — ${exhibition.title}`, content)
}

export async function sendNewsPublishedNewsletter(news: { title: string; excerpt: string | null; slug: string }) {
  const content = `
    <h2 style="color:#C44B0C;margin-top:0;">Nouvelle actualité</h2>
    <h3 style="margin:0 0 12px;">${news.title}</h3>
    ${news.excerpt ? `<p style="color:#555;">${news.excerpt}</p>` : ''}
    ${btn(`${APP_URL}/actualites/${news.slug}`, "Lire l'article")}`
  await sendNewsletterToSubscribers(news.title, content)
}
