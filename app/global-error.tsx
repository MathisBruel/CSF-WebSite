'use client'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <head>
        <title>Erreur — Chats Sans Frontières</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, -apple-system, sans-serif; background: #faf9f7; color: #1a1a2e; }
          .container { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; }
          .icon { width: 72px; height: 72px; background: #fff3e0; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2rem; }
          h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; color: #1a1a2e; }
          p { color: #6b7280; line-height: 1.6; margin-bottom: 0.5rem; max-width: 480px; }
          a { color: #e67e22; text-decoration: underline; }
          .btn { display: inline-block; margin-top: 1.5rem; padding: 0.625rem 1.25rem; background: #e67e22; color: #fff; border: none; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; text-decoration: none; }
          .badge { display: inline-block; margin-top: 1rem; font-size: 0.75rem; color: #9ca3af; background: #f3f4f6; border-radius: 0.375rem; padding: 0.25rem 0.625rem; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <img src="/images/logo-full.png" alt="Chats Sans Frontières" style={{height:'64px',objectFit:'contain',marginBottom:'1.5rem'}} />
          <div className="icon">🐾</div>
          <h1>Le site rencontre une erreur</h1>
          <p>
            Nous sommes au courant du problème et travaillons à le résoudre.
            Le site sera rétabli dans les plus brefs délais.
          </p>
          <p>
            Si le problème persiste, n&apos;hésitez pas à nous contacter à{' '}
            <a href="mailto:contact@assocsf.fr">contact@assocsf.fr</a>
          </p>
          <button className="btn" onClick={reset}>Réessayer</button>
          <span className="badge">Chats Sans Frontières — Association Féline</span>
        </div>
      </body>
    </html>
  )
}
