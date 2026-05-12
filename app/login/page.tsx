'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  )
}

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', { email, password, redirect: false })

    setLoading(false)

    if (!result || result.error) {
      setError('E-mail ou senha inválidos')
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="tc-login">
      <aside className="tc-login__brand">
        <div className="tc-login__brandRow">
          <div className="tc-login__brandMark">T</div>
          <div>
            <div className="tc-login__brandText">TurboCloud</div>
            <div className="tc-login__brandSub mono">Help</div>
          </div>
        </div>

        <div className="tc-login__brandBody">
          <div className="tc-login__eyebrow">
            <span className="tc-login__eyebrowDot" />
            Base de conhecimento · v3.2
          </div>
          <h1 className="tc-login__title">
            Atendimento mais rápido,<br />
            com <span className="tc-login__accent">respostas certas</span>.
          </h1>
          <p className="tc-login__desc">
            Tudo que o time de suporte L1/L2 da TurboCloud precisa para resolver chamados:
            tutoriais, troubleshooting, políticas internas e procedimentos de escalada — em um só lugar.
          </p>
        </div>

        <div className="tc-login__brandFoot mono">
          <span>© 2026 TurboCloud · uso interno restrito</span>
        </div>
      </aside>

      <section className="tc-login__formPanel">
        <form className="tc-login__formCard" onSubmit={handleSubmit}>
          <div className="tc-login__restricted mono">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round">
              <path d="M12 3 4 6v6c0 4.5 3.5 8 8 9 4.5-1 8-4.5 8-9V6z" />
            </svg>
            Acesso restrito · time interno
          </div>

          <h2 className="tc-login__formTitle">Entrar na Base de Ajuda</h2>
          <p className="tc-login__formSub">Use seu e-mail corporativo TurboCloud.</p>

          <div className="tc-login__field">
            <label className="tc-login__label" htmlFor="email">E-mail corporativo</label>
            <div className="tc-login__inputWrap">
              <span className="tc-login__lead">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>
              <input
                className="tc-login__input"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="nome@turbocloud.com.br"
              />
            </div>
          </div>

          <div className="tc-login__field">
            <label className="tc-login__label" htmlFor="senha">Senha</label>
            <div className="tc-login__inputWrap">
              <span className="tc-login__lead">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="11" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </span>
              <input
                className="tc-login__input tc-login__input--hasTrail"
                id="senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••••"
              />
              <button
                type="button"
                className="tc-login__trail"
                onClick={() => setShowPassword((v) => !v)}
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="tc-login__error">
              {error}
            </div>
          )}

          <button className="tc-login__submit" type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
            {!loading && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            )}
          </button>

          <p className="tc-login__legal">
            Acesso restrito ao time interno da TurboCloud.<br />
            Atividades nesta plataforma são auditadas.
          </p>
        </form>
      </section>
    </div>
  )
}
