import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { API_BASE_URL, APP_SEARCH_URL } from './config'
import { getImageUrl, getLandingPage, type GalleryItem, type LandingPageContent } from './lib/sanity'
import { useIsMobile } from './hooks/useIsMobile'
import BannerMarquee, { type MarqueeItem } from './components/BannerMarquee/BannerMarquee'
import './landing.css'
import iconStar from './assets/icons/stat-star.svg'
import iconMegaphone from './assets/icons/stat-megaphone.svg'
import iconBuilding from './assets/icons/stat-building.svg'
import iconCheckCheck from './assets/icons/check-check.svg'
import iconArrowDown from './assets/icons/arrow-down-dash.svg'
import stepLightbulb from './assets/icons/step-lightbulb.svg'
import stepSmartphone from './assets/icons/step-smartphone.svg'
import stepBookAlert from './assets/icons/step-book-alert.svg'
import stepList from './assets/icons/step-list.svg'

const PixelBlast = lazy(() => import('./components/PixelBlast/PixelBlast'))

const Y = '#FFE135'
const B = '#5BC8DC'
const DARK = '#1A202C'
const GRAY = '#F7F8FC'

const PREFERS_REDUCED_MOTION =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const prefersReducedMotion = () => PREFERS_REDUCED_MOTION

/* ─── Scroll Reveal Hook ─────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) { el.classList.add('visible'); return }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.disconnect() } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

/* ─── CountUp ─────────────────────────────────────── */
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) { setVal(to); return }
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      const dur = 1600, start = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1)
        const ease = 1 - Math.pow(1 - p, 3)
        setVal(Math.floor(ease * to))
        if (p < 1) requestAnimationFrame(tick)
        else setVal(to)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [to])
  return <span ref={ref} aria-live="polite">{val.toLocaleString()}{suffix}</span>
}


/* ════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════ */
export default function LandingPage() {
  const go = useCallback(() => { window.location.assign(APP_SEARCH_URL) }, [])
  const [cms, setCms] = useState<LandingPageContent | null>(null)
  const [cmsReady, setCmsReady] = useState(false)

  useEffect(() => {
    getLandingPage()
      .then(setCms)
      .catch(() => {
        // CMS 取得失敗時はコード内のデフォルト文言・画像で表示する
      })
      .finally(() => setCmsReady(true))
  }, [])

  useEffect(() => {
    if (!cms?.seo) return
    if (cms.seo.metaTitle) document.title = cms.seo.metaTitle
    if (cms.seo.metaDescription) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', cms.seo.metaDescription)
    }
  }, [cms])

  return (
    <div style={{ fontFamily: "'Noto Sans JP', sans-serif", color: DARK, overflowX: 'hidden' }}>
      <NavBar onCta={go} />
      <Hero onCta={go} hero={cms?.hero} />
      <TalentGallery cmsItems={cms?.galleryItems} cmsReady={cmsReady} />
      <WhatIs />
      <Problem />
      <Features />
      <HowItWorks onCta={go} />
      <CostBenefit />
      <CtaBanner onCta={go} />
      <Footer />
    </div>
  )
}

/* ─── NAV ─────────────────────────────────────────── */
function NavBar({ onCta }: { onCta: () => void }) {
  const sp = useIsMobile()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      padding: sp ? '0 16px' : '0 40px', height: sp ? 56 : 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(255,255,255,0.88)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
      transition: prefersReducedMotion() ? 'none' : 'background 0.3s, backdrop-filter 0.3s, box-shadow 0.3s',
    }}>
      <div style={{ fontSize: sp ? 18 : 20, fontWeight: 900 }}>
        <span style={{ color: B }}>シル</span>
        <span style={{ color: '#E6B800' }}>クラウド</span>
        <span style={{ fontSize: 9, color: scrolled ? '#94A3B8' : 'rgba(255,255,255,0.5)', letterSpacing: 2, marginLeft: 6 }}>sirucloud</span>
      </div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: sp ? 12 : 28 }}>
        {!sp && ['#about', '#features', '#cost'].map((href, i) => (
          <a key={href} href={href} style={{ color: scrolled ? '#64748B' : 'rgba(255,255,255,0.85)', fontSize: 16, textDecoration: 'none', fontWeight: 500 }}>
            {['サービス概要', '機能', '導入効果'][i]}
          </a>
        ))}
        <button onClick={onCta} className="pulse-ring btn-lift btn-lift-yellow" style={{
          position: 'relative', background: Y, color: DARK,
          fontWeight: 600, padding: sp ? '8px 16px' : '9px 22px', borderRadius: 10,
          border: 'none', cursor: 'pointer', fontSize: sp ? 12 : 13, touchAction: 'manipulation',
        }}>
          無料で試す
        </button>
      </nav>
    </header>
  )
}

/* ─── HERO ─────────────────────────────────────────── */
const HERO_BADGE_DEFAULT = 'キャスティングの最適化！数値分析プラットフォーム'
const HERO_HEADLINE_DEFAULT = 'シルクラウドで\nインフルエンサー選定を\nデータドリブンに'

function MultilineText({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => (
        <span key={`${i}-${line}`}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  )
}

function Hero({ onCta, hero }: { onCta: () => void; hero?: LandingPageContent['hero'] }) {
  const sp = useIsMobile()
  return (
    <section style={{ minHeight: '100vh', background: '#07111f', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: sp ? '88px 20px 64px' : '100px 24px 80px', fontFamily: "'IBM Plex Sans JP', sans-serif" }}>
      {/* PixelBlast background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Suspense fallback={null}>
          <PixelBlast
            variant="circle"
            color="#2fd3c4"
            patternScale={4}
            patternDensity={1.05}
            pixelSizeJitter={2}
            speed={1}
            edgeFade={0.26}
            enableRipples={false}
          />
        </Suspense>
      </div>
      <div style={{ maxWidth: 820, textAlign: 'center', position: 'relative', zIndex: 2 }}>
        {/* Badge */}
        <div className="fade-up" style={{
          display: 'inline-flex', alignItems: 'center', background: '#2fd3c4', borderRadius: 99,
          padding: sp ? '8px 18px' : '10px 32px', fontSize: sp ? 12 : 14, fontWeight: 500, color: DARK, marginBottom: 36,
          ...(sp ? { lineHeight: 1.6 } : {}),
        }}>
          {hero?.badge || HERO_BADGE_DEFAULT}
        </div>

        {/* Headline */}
        <h1 className="fade-up delay-1" style={{ fontSize: sp ? 'clamp(24px, 8vw, 30px)' : 'clamp(36px, 5.5vw, 64px)', fontWeight: 700, lineHeight: 1.4, marginBottom: 32, color: 'white' }}>
          <MultilineText text={hero?.headline || HERO_HEADLINE_DEFAULT} />
        </h1>

        <p className="fade-up delay-2" style={{ fontSize: sp ? 14 : 'clamp(15px, 1.8vw, 18px)', lineHeight: 1.9, marginBottom: 52, maxWidth: 600, margin: '0 auto 52px' }}>
          <span style={{ color: 'rgba(255,255,255,0.8)' }}>SNSや各種メディアデータを</span>
          <strong style={{ color: Y, fontWeight: 700 }}>一元管理。</strong><br />
          <span style={{ color: 'rgba(255,255,255,0.8)' }}>根拠のあるキャスティングで</span>
          <strong style={{ color: '#5bc8dc', fontWeight: 700 }}>広告効果を最大化。</strong>
        </p>

        {/* CTAs */}
        <div className="fade-up delay-3" style={{
          display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap',
          ...(sp ? { flexDirection: 'column' as const, alignItems: 'center' as const } : {}),
        }}>
          <button onClick={onCta} className="btn-lift btn-lift-orange" style={{
            background: '#f97316', color: 'white',
            fontWeight: 700, padding: sp ? '18px 32px' : '20px 44px',
            borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: sp ? 16 : 18,
            fontFamily: "'IBM Plex Sans JP', sans-serif",
            boxShadow: '0 4px 24px rgba(249,115,22,0.4)', touchAction: 'manipulation',
            ...(sp ? { width: '100%', maxWidth: 320 } : {}),
          }}>
            無料でアカウントリサーチ
          </button>
          <a href="#about" style={{
            display: 'inline-flex', alignItems: 'center',
            background: '#5bc8dc', color: 'white', fontWeight: 700,
            padding: sp ? '16px 32px' : '20px 40px', borderRadius: 20,
            textDecoration: 'none', fontSize: sp ? 16 : 18,
            fontFamily: "'IBM Plex Sans JP', sans-serif",
            boxShadow: '0 4px 24px rgba(91,200,220,0.3)',
            ...(sp ? { width: '100%', maxWidth: 320, justifyContent: 'center' as const, boxSizing: 'border-box' as const } : {}),
          }}>
            サービスを詳しく見る
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── TALENT GALLERY ─────────────────────────────── */
const talentStats = [
  { val: 10000, suffix: '+', label: '芸能人・文化人', color: '#fff3e8', textColor: '#f97316', icon: iconStar },
  { val: 100000, suffix: '+', label: 'インフルエンサー', color: '#eef7ff', textColor: '#5bc8dc', icon: iconMegaphone },
  { val: 300, suffix: '+', label: '芸能事務所', color: 'rgba(47,211,196,0.15)', textColor: '#2fd3c4', icon: iconBuilding },
]

const GALLERY_IMAGE_WIDTH = 400

function TalentGallery({ cmsItems, cmsReady }: { cmsItems?: GalleryItem[]; cmsReady: boolean }) {
  const sp = useIsMobile()
  const ref = useReveal()
  const statsRef = useReveal()
  const [items, setItems] = useState<MarqueeItem[]>([])

  useEffect(() => {
    // CMS(Sanity)の取得完了を待ち、ギャラリー画像が登録されていればそちらを優先。
    // 未登録なら従来どおり公開 API から取得する。
    if (!cmsReady) return

    if (cmsItems && cmsItems.length > 0) {
      const data = cmsItems.flatMap(item => {
        const image = getImageUrl(item.photo, GALLERY_IMAGE_WIDTH)
        if (!image) return []
        // CMS ギャラリーの name は画面に表示せず alt テキストとしてのみ使う
        return [{ image, alt: item.name }]
      })
      setItems(data)
      return
    }

    // /api/gallery は未認証ページ向け公開エンドポイントのためトークン不要
    interface GalleryTalent { profile_image_url: string | null; name: string; max_followers: number | null }
    interface GalleryResponse { data: GalleryTalent[] }
    fetch(`${API_BASE_URL}/api/gallery`)
      .then<GalleryResponse>(r => r.json())
      .then(res => {
        const data = (res.data || []).map((t, i) => ({
          image: t.profile_image_url || `https://picsum.photos/seed/${100 + i}/400/600`,
          alt: t.name,
        }))
        setItems(data)
      })
      .catch(() => {
        // ギャラリー取得失敗時は空表示（LP なので致命的でない）
      })
  }, [cmsItems, cmsReady])

  return (
    <section style={{ background: 'white', padding: sp ? '64px 0 48px' : '80px 0 60px', fontFamily: "'IBM Plex Sans JP', sans-serif" }}>
      {/* Header */}
      <div ref={ref} className="reveal" style={{ textAlign: 'center', marginBottom: 40, padding: sp ? '0 20px' : '0 40px' }}>
        <Chip color={Y} textColor={DARK} solid>TALENTS</Chip>
        <h2 style={{ ...h2, fontWeight: 500, ...(sp ? { fontSize: 20 } : {}) }}>登録タレント・インフルエンサー</h2>
        <p style={{ fontSize: 16, color: '#64748B', marginTop: 10 }}>
          10,000人以上の芸能人・文化人データを収録
        </p>
      </div>

      {/* Gallery */}
      <div style={{ width: '100%', height: sp ? 300 : 400, marginBottom: sp ? 40 : 60 }}>
        {items.length > 0 ? <BannerMarquee items={items} /> : null}
      </div>

      {/* Stats cards */}
      <div ref={statsRef} className="reveal" style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: sp ? 12 : 20, padding: sp ? '0 20px' : '0 40px' }}>
        {talentStats.map((s, i) => (
          <div key={s.label} style={{
            background: s.color, borderRadius: 16, padding: '20px 16px', textAlign: 'center',
            border: '1px solid #e6ecf2', transitionDelay: `${i * 0.1}s`,
          }}>
            <div style={{ marginBottom: 8 }}>
              <img src={s.icon} alt={s.label} width={40} height={40} style={{ display: 'inline-block' }} />
            </div>
            <div style={{ fontSize: 13, color: s.textColor, fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.textColor }}>
              <CountUp to={s.val} suffix={s.suffix} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── PROBLEM ─────────────────────────────────────── */
const problems = [
  '起用アイディアが思い浮かばない',
  '本当にこの人でいいのかな…？',
  '情報が多すぎで適した人物が分からない',
  '知名度だけで選んで効果が出るか不安',
  'タレントに詳しくないので選定の根拠が説明できない',
  '候補リスト作成に時間がかかりすぎる',
]

function Problem() {
  const sp = useIsMobile()
  const ref = useReveal()
  const cardsRef = useReveal()
  const solveRef = useReveal()
  return (
    <section style={{ background: 'white', padding: sp ? '64px 20px' : '80px 40px', fontFamily: "'IBM Plex Sans JP', sans-serif" }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        {/* Header */}
        <div ref={ref} className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <Chip color={Y} textColor={DARK} solid>PROBLEM</Chip>
          <h2 style={{ ...h2, fontWeight: 500 }}>こんなお悩みありませんか？</h2>
        </div>

        {/* Problem cards */}
        <div ref={cardsRef} className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 40 }}>
          {problems.map((text) => (
            <div key={text} style={{
              background: 'rgba(91,200,220,0.15)', border: '3px solid #5bc8dc',
              borderRadius: 20, padding: '20px 20px 20px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <img src={iconCheckCheck} alt="" width={32} height={32} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 15, fontWeight: 500, color: DARK, lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Arrow */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src={iconArrowDown} alt="" width={sp ? 44 : 56} height={sp ? 44 : 56} style={{ display: 'inline-block' }} />
        </div>

        {/* Solution card */}
        <div ref={solveRef} className="reveal" style={{
          background: '#07245f', border: '4px solid #5bc8dc',
          borderRadius: 20, padding: sp ? '32px 20px' : '48px 40px', textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        }}>
          <div style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, marginBottom: 24 }}>
            <span style={{ color: Y }}>シル</span>
            <span style={{ color: '#5bc8dc' }}>クラウド</span>
            <span style={{ color: 'white' }}>が解決！</span>
          </div>
          <p style={{ color: 'white', fontSize: 'clamp(14px, 1.8vw, 20px)', lineHeight: 2, margin: 0 }}>
            インフルエンス力を可視化できるので<br />
            施策や商品サービスとの相性がすぐに分かります。<br />
            適切なデータをリスト化し、業務スピードが劇的に改善。
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─── WHAT IS ─────────────────────────────────────── */
const whatIsItems = [
  { title: 'キャスティングのDX化', body: 'マーケティング施策・キャスティングに関わる全ての人の業務をデジタル化。手作業の数式がボタン一つで一覧に。' },
  { title: '情報の可視化', body: '効果検証の改善、共通言語化や情報の可視化を実現。使う人に負担がなく、経験が短くても使える設計。' },
  { title: '生データを自動収集', body: '意思決定に必要な最新データをシステムで自動収集。費用対効果の改善を実感できる情報分析を提供。' },
]

function WhatIs() {
  const sp = useIsMobile()
  const ref = useReveal()
  const cardsRef = useReveal()
  return (
    <section id="about" style={{ background: '#1a202c', padding: sp ? '64px 20px' : '80px 40px', overflow: 'hidden', fontFamily: "'IBM Plex Sans JP', sans-serif" }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div ref={ref} className="reveal" style={{ textAlign: 'center', marginBottom: 52 }}>
          <Chip color={Y} textColor={DARK} solid>ABOUT</Chip>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 64px)', fontWeight: 700, lineHeight: 1.3, marginTop: 16, color: 'white' }}>
            <span style={{ whiteSpace: 'nowrap' }}>
              <span style={{ color: Y }}>知る</span>
              {' + '}
              <span style={{ color: B }}>クラウド</span>
            </span>
            {/* SP では「シル/クラウド」の途中で折り返さないよう = の前で改行する */}
            {sp ? <br /> : ' '}
            <span style={{ whiteSpace: 'nowrap' }}>
              {'= '}
              <span style={{ color: Y }}>シル</span>
              <span style={{ color: B }}>クラウド</span>
            </span>
          </h2>
        </div>

        <div ref={cardsRef} className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: sp ? 20 : 50, marginTop: sp ? 40 : 70 }}>
          {whatIsItems.map((item) => (
            <div key={item.title} style={{
              background: 'rgba(238,247,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 20, padding: sp ? '32px 24px' : '48px 32px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 16 }}>{item.title}</div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── FEATURES ────────────────────────────────────── */
const feats = [
  {
    num: '01',
    title: 'より正確な数値分析',
    body: '各SNSや提供情報を元にシルクラウド内でのみ閲覧できるデータを提供。フォロワー数・年齢・性別・属性・興味関心など、アカウントが持つフォロワーの性質がひと目でわかります。',
    tags: ['フォロワー分析', 'エンゲージメント率', '属性データ'],
    bg: '#fff3e8', accent: '#f97316',
  },
  {
    num: '02',
    title: '効果的なリストアップ',
    body: '起用アイデアに関連するカテゴリをセグメント。商品やサービスのターゲット情報を入力するだけで適したデータを一覧表示。X・Instagram・YouTube・TikTok・Threadsから一括検索。',
    tags: ['プラットフォーム横断', 'フィルタリング', '一括リスト出力'],
    bg: '#eef7ff', accent: '#5bc8dc',
  },
  {
    num: '03',
    title: '豊富なタレントデータ',
    body: '事務所一覧・所属社一覧のほか、年間契約を含む各種依頼時の費用や競合情報など最新情報を掲載。タレントの競合状況や費用感などがすぐわかり、事務所へ問い合わせが可能。',
    tags: ['芸能事務所DB', '費用情報', '競合分析'],
    bg: 'rgba(47,211,196,0.2)', accent: '#2fd3c4',
  },
]

function FeatureCard({ f }: { f: typeof feats[0] }) {
  const sp = useIsMobile()
  const r = useReveal()
  return (
    <div ref={r} className="reveal" style={{
      background: f.bg, borderRadius: 20, border: '1px solid #e6ecf2',
      display: 'flex', alignItems: 'center', gap: 0, overflow: 'hidden',
      ...(sp ? { flexDirection: 'column' as const, alignItems: 'stretch' as const } : {}),
    }}>
      {/* Big number */}
      <div style={{
        flexShrink: 0, width: sp ? 'auto' : 160, textAlign: sp ? 'left' as const : 'center' as const,
        fontSize: sp ? 56 : 96, fontWeight: 700, color: f.accent, lineHeight: 1,
        padding: sp ? '20px 24px 0' : '32px 0', fontFamily: "'IBM Plex Sans JP', sans-serif",
      }}>
        {f.num}
      </div>
      {/* Text */}
      <div style={{ flex: 1, padding: sp ? '4px 24px 28px' : '32px 40px 32px 0' }}>
        <h3 style={{ fontSize: sp ? 19 : 22, fontWeight: 700, color: DARK, marginBottom: 12, fontFamily: "'IBM Plex Sans JP', sans-serif" }}>{f.title}</h3>
        <p style={{ fontSize: sp ? 14 : 15, color: '#374151', lineHeight: 1.85, marginBottom: 16, fontFamily: "'IBM Plex Sans JP', sans-serif", fontWeight: 300 }}>{f.body}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {f.tags.map(t => (
            <span key={t} style={{ background: f.accent, color: DARK, fontSize: 13, fontWeight: 400, padding: '6px 16px', borderRadius: 20, fontFamily: "'IBM Plex Sans JP', sans-serif" }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Features() {
  const sp = useIsMobile()
  const ref = useReveal()
  return (
    <section id="features" style={{ background: GRAY, padding: sp ? '64px 20px' : '80px 40px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div ref={ref} className="reveal" style={{ textAlign: 'center', marginBottom: 52 }}>
          <Chip color={Y} textColor={DARK} solid>FEATURES</Chip>
          <h2 style={{ ...h2, fontWeight: 500 }}>シルクラウドでできること</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {feats.map((f) => <FeatureCard key={f.num} f={f} />)}
        </div>
      </div>
    </section>
  )
}

/* ─── HOW IT WORKS ────────────────────────────────── */
const steps = [
  { n: '01', title: '企画・ターゲット設定', desc: '商品やサービスのターゲットを設定', icon: stepLightbulb },
  { n: '02', title: 'プラットフォーム選択', desc: 'X・Instagram・YouTube・TikTokから選択', icon: stepSmartphone },
  { n: '03', title: 'フィルタリング', desc: 'フォロワー数・年齢層・エンゲージメントで絞り込み', icon: stepBookAlert },
  { n: '04', title: 'リスト化・選定', desc: '適した人材をリスト化して根拠ある選定を実現', icon: stepList },
]

function HowItWorks({ onCta }: { onCta: () => void }) {
  const sp = useIsMobile()
  const ref = useReveal()
  const cardsRef = useReveal()
  return (
    <section style={{ background: 'white', padding: sp ? '64px 20px' : '80px 40px', fontFamily: "'IBM Plex Sans JP', sans-serif" }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div ref={ref} className="reveal" style={{ textAlign: 'center', marginBottom: 52 }}>
          <Chip color={Y} textColor={DARK} solid>HOW IT WORKS</Chip>
          <h2 style={{ ...h2, fontWeight: 500 }}>使い方はとってもシンプル</h2>
        </div>

        <div ref={cardsRef} className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: sp ? 28 : 40, marginBottom: sp ? 40 : 52 }}>
          {steps.map((s) => (
            <div key={s.n} style={{ textAlign: 'center' }}>
              {/* Card */}
              <div style={{ position: 'relative', background: 'linear-gradient(135deg, #fff3e8, #e0f7fa, rgba(47,211,196,0.2))', border: '1px solid #64748b', borderRadius: 20, padding: '24px 16px 20px', marginBottom: 16 }}>
                {/* Number badge */}
                <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'white', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#f97316' }}>
                  {s.n}
                </div>
                <img src={s.icon} alt={s.title} width={80} height={80} style={{ display: 'inline-block', marginTop: 8 }} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: DARK, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={onCta} className="btn-lift btn-lift-teal" style={{
            background: '#2fd3c4', color: 'white', fontWeight: 700,
            padding: sp ? '18px 40px' : '24px 60px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontSize: sp ? 17 : 20, fontFamily: "'IBM Plex Sans JP', sans-serif", touchAction: 'manipulation',
            ...(sp ? { width: '100%', maxWidth: 320 } : {}),
          }}>
            今すぐ試してみる
          </button>
        </div>
      </div>
    </section>
  )
}

/* ─── COST BENEFIT ────────────────────────────────── */
const costItems = [
  { val: 40, suffix: '%削減', label: '作業時間', sub: '月間コスト 10.8万円/1人節約', color: '#f97316' },
  { val: 1950, suffix: '万円', label: '年間コスト', sub: '約4,860万円 → 約1,950万円', color: '#5bc8dc' },
  { val: 6, suffix: '行程完結', label: 'シルクラウドで', sub: '企画〜公開まですべて一元管理', color: '#2fd3c4' },
]

function CostBenefit() {
  const sp = useIsMobile()
  const ref = useReveal()
  const cardsRef = useReveal()
  return (
    <section id="cost" style={{ background: '#1a202c', padding: sp ? '64px 20px' : '80px 40px', fontFamily: "'IBM Plex Sans JP', sans-serif" }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div ref={ref} className="reveal" style={{ textAlign: 'center', marginBottom: 52 }}>
          <Chip color={Y} textColor={DARK} solid>COST BENEFIT</Chip>
          <h2 style={{ ...h2, color: 'white', fontWeight: 700 }}>時間とコストを大幅カット！</h2>
        </div>

        <div ref={cardsRef} className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: sp ? 14 : 20, marginBottom: sp ? 36 : 52 }}>
          {costItems.map((item) => (
            <div key={item.label} style={{
              background: 'rgba(238,247,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 20, padding: sp ? '24px 20px' : '32px 24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 12 }}>{item.label}</div>
              <div style={{ fontSize: sp ? 32 : 40, fontWeight: 700, color: item.color, marginBottom: 12 }}>
                <CountUp to={item.val} suffix={item.suffix} />
              </div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)' }}>{item.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'white', fontSize: 'clamp(14px, 1.6vw, 20px)', lineHeight: 1.9, margin: 0 }}>
            シルクラウドを活用することでキャスティングの作業工数が大幅に改善。<br />
            インフルエンサーや商品・媒体とのマッチング度を可視化することにより売上UPに貢献！
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─── CTA BANNER ──────────────────────────────────── */
function CtaBanner({ onCta }: { onCta: () => void }) {
  const sp = useIsMobile()
  const ref = useReveal()
  return (
    <section style={{ background: 'linear-gradient(135deg, #ffd4a8 0%, #c8e8ff 50%, #7ee8df 100%)', padding: sp ? '64px 24px' : '100px 40px', textAlign: 'center', fontFamily: "'IBM Plex Sans JP', sans-serif" }}>
      <div ref={ref} className="reveal" style={{ maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontSize: sp ? 18 : 'clamp(20px, 2.5vw, 36px)', fontWeight: 700, color: DARK, lineHeight: 1.6, marginBottom: sp ? 32 : 48 }}>
          まずは無料で<br />
          アカウントリサーチを試してみよう！
        </h2>
        <button onClick={onCta} className="btn-lift btn-lift-orange" style={{
          background: '#f97316', color: 'white',
          fontWeight: 700, padding: sp ? '18px 40px' : '24px 60px',
          borderRadius: 20, border: 'none', cursor: 'pointer',
          fontSize: sp ? 17 : 20, fontFamily: "'IBM Plex Sans JP', sans-serif",
          boxShadow: '0 4px 24px rgba(249,115,22,0.35)', touchAction: 'manipulation',
          ...(sp ? { width: '100%', maxWidth: 320 } : {}),
        }}>
          無料でアカウントリサーチ
        </button>
      </div>
    </section>
  )
}

/* ─── FOOTER ──────────────────────────────────────── */
function Footer() {
  const sp = useIsMobile()
  return (
    <footer style={{ background: '#020b18', padding: sp ? '48px 20px 40px' : '64px 40px 48px', textAlign: 'center', fontFamily: "'IBM Plex Sans JP', sans-serif" }}>
      <div style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 900, marginBottom: 16, fontFamily: "'Noto Sans JP', sans-serif" }}>
        <span style={{ color: '#5bc8dc' }}>シル</span><span style={{ color: Y }}>クラウド</span>
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: 3, marginBottom: 32 }}>sirucloud by Wonder Works</div>
      <div style={{ fontSize: sp ? 11 : 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>株式会社Wonder Works 代表取締役 菅谷 亮人</div>
      <div style={{ fontSize: sp ? 11 : 12, color: 'rgba(255,255,255,0.7)', marginBottom: 32 }}>東京都渋谷区桜丘町30-4 渋谷アジアマンション206</div>
      <div style={{
        display: 'flex', gap: sp ? '12px 24px' : 32, justifyContent: 'center', marginBottom: 32,
        ...(sp ? { flexWrap: 'wrap' as const } : {}),
      }}>
        {['利用規約', 'プライバシーポリシー', 'お問い合わせ'].map(l => (
          <a key={l} href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{l}</a>
        ))}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>© Wonder Works All Rights Reserved</div>
    </footer>
  )
}

/* ─── SHARED ──────────────────────────────────────── */
const h2: React.CSSProperties = {
  fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 900,
  color: DARK, lineHeight: 1.3, marginBottom: 0, marginTop: 10,
}

function Chip({ children, color, textColor, dark, solid }: { children: React.ReactNode; color: string; textColor?: string; dark?: boolean; solid?: boolean }) {
  return (
    <div style={{
      display: 'inline-block',
      background: solid ? color : dark ? `${color}22` : `${color}20`,
      border: solid ? 'none' : `1.5px solid ${color}55`,
      borderRadius: 30, padding: '5px 18px',
      fontSize: 11, fontWeight: 800, letterSpacing: 2,
      color: textColor ?? color, marginBottom: 14,
    }}>
      {children}
    </div>
  )
}
