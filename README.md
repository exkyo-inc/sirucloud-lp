# sirucloud-lp

シルクラウドのランディングページ(LP)単体プロジェクト。
`sirucloud-front` の `/`(LandingPage)を切り出したもので、**Cloudflare Pages でのホスティングを想定**しています。
アプリ本体(アカウントリサーチ等)は従来どおり GCP / Firebase Hosting 側で配信します。

## 構成

- Vite + React + TypeScript(react-router / firebase 依存なし)
- CTA ボタンはアプリ本体(`VITE_APP_URL`)の `/search` へ遷移
- コンテンツ(Hero 文言・ギャラリー画像・SEO)は **Sanity CMS** で管理(`studio/`)
- タレントギャラリーは Sanity 未登録時のフォールバックとして公開 API `GET {VITE_API_BASE_URL}/api/gallery` から取得

## 開発

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # 型チェック + dist/ へビルド
```

## Sanity CMS

- プロジェクトID: `cqjhux75` / データセット: `production`(公開読み取り)
- Studio(編集画面): https://sirucloud-lp.sanity.studio/
- 管理コンテンツ(LP設定シングルトン):
  - Hero: バッジ文言・キャッチコピー(改行反映)
  - タレントギャラリー画像: 登録するとAPI取得より優先して表示
  - SEO: meta title / description / OG画像
- CMS 取得に失敗してもコード内デフォルトで表示されるフォールバック設計

### Studio の開発・デプロイ

```bash
cd studio
npm install
npm run dev     # http://localhost:3333
npm run deploy  # https://sirucloud-lp.sanity.studio/ へ反映
```

Sanity 側の CORS 許可済みオリジン: `http://localhost:5173` / `http://localhost:5198` / `http://localhost:3333` / `https://www.sirucloud.jp`

## 環境変数

| 変数 | 既定値 | 用途 |
|------|--------|------|
| `VITE_APP_URL` | `https://sirucloud-tes.web.app` | CTA 遷移先のアプリ本体 URL |
| `VITE_API_BASE_URL` | `https://api.tes.sirucloud.jp` | ギャラリー取得 API(フォールバック) |
| `VITE_SANITY_PROJECT_ID` | `cqjhux75` | Sanity プロジェクトID |
| `VITE_SANITY_DATASET` | `production` | Sanity データセット |

本番デプロイ時は Cloudflare Pages の環境変数で本番 URL に上書きすること。

## Cloudflare Pages デプロイ

- Build command: `npm run build`
- Build output directory: `dist`
- または CLI: `npx wrangler pages deploy dist`

### カスタムドメイン(www.sirucloud.jp)

1. Cloudflare Pages のプロジェクトに custom domain `www.sirucloud.jp` を追加
2. GCP Cloud DNS の `sirucloud.jp` ゾーンに CNAME を追加:
   `www` → `<project>.pages.dev`
3. バックエンド(Cloud Run)の `CORS_ALLOWED_ORIGINS` に `https://www.sirucloud.jp` を追加
   (フォールバックのギャラリー API を新オリジンから呼ぶため)

NS は GCP Cloud DNS のままで問題ない(サブドメインの CNAME のみで完結)。
apex(`sirucloud.jp`)を Cloudflare に向けたい場合のみ NS 移管が必要。
