import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Logo } from '@/components/shared/Logo'
import { PageMeta } from '@/components/shared/PageMeta'
import { APP_NAME } from '@/lib/app-config'

interface Props {
  title: string
  lastUpdated?: string
  canonicalPath: string
  children: ReactNode
}

/** Shared shell for the public legal pages (Terms, Privacy, Imprint). */
export function LegalLayout({ title, lastUpdated, canonicalPath, children }: Props) {
  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white antialiased">
      <PageMeta title={`${title} — ${APP_NAME}`} canonical={`https://distributionos.predivo.ch${canonicalPath}`} />

      {/* Nav */}
      <header className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="font-bold text-white text-sm tracking-tight">{APP_NAME}</span>
          </Link>
          <Link to="/pricing" className="inline-flex items-center min-h-[44px] text-sm text-slate-400 hover:text-white transition-colors px-3">
            Pricing
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-24">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">{title}</h1>
        {lastUpdated && <p className="text-slate-500 text-sm mb-12">{lastUpdated}</p>}
        <div className="space-y-8 text-sm leading-relaxed text-slate-400 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mb-3 [&_a]:text-indigo-400 [&_a:hover]:underline">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] bg-[#050508]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} Distribution OS by Predivo GmbH. All rights reserved.
            </p>
            <p className="text-xs text-slate-600 mt-1">Swiss-made</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/" className="px-2 min-h-[44px] inline-flex items-center text-slate-500 hover:text-slate-300 transition-colors">Home</Link>
            <Link to="/privacy" className="px-2 min-h-[44px] inline-flex items-center text-slate-500 hover:text-slate-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="px-2 min-h-[44px] inline-flex items-center text-slate-500 hover:text-slate-300 transition-colors">Terms</Link>
            <Link to="/imprint" className="px-2 min-h-[44px] inline-flex items-center text-slate-500 hover:text-slate-300 transition-colors">Imprint</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
