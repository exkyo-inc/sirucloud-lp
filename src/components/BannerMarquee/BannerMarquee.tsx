import './banner-marquee.css'

export interface MarqueeItem {
  image: string
  alt?: string
}

interface BannerMarqueeProps {
  items: MarqueeItem[]
  /** 1ループにかける秒数 */
  durationSec?: number
}

// バナー数が少ないとループ単位が画面幅より短くなり右端に空白が見えるため、
// 一式を繰り返してループ単位が最大想定幅(1920px)を確実に超えるようにする
const LOOP_REPEAT = 3

export default function BannerMarquee({ items, durationSec = 60 }: BannerMarqueeProps) {
  if (items.length === 0) return null
  const loopUnit = Array.from({ length: LOOP_REPEAT }, () => items).flat()
  return (
    <div className="banner-marquee-viewport">
      <div className="banner-marquee-track" style={{ animationDuration: `${durationSec}s` }}>
        {loopUnit.map((item, i) => (
          <div className="banner-marquee-card" key={`item-${i}`} aria-hidden={i >= items.length || undefined}>
            <img src={item.image} alt={i < items.length ? (item.alt ?? '') : ''} loading="lazy" decoding="async" />
          </div>
        ))}
        {/* 無限ループ用の複製(スクリーンリーダーには読ませない) */}
        {loopUnit.map((item, i) => (
          <div className="banner-marquee-card" key={`dup-${i}`} aria-hidden>
            <img src={item.image} alt="" loading="lazy" decoding="async" />
          </div>
        ))}
      </div>
    </div>
  )
}
