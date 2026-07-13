const stripTrailingSlash = (url: string): string => url.replace(/\/+$/, '')

/** sirucloud アプリ本体(GCP / Firebase Hosting)の URL */
export const APP_URL = stripTrailingSlash(
  import.meta.env.VITE_APP_URL?.trim() || 'https://sirucloud-tes.web.app',
)

/** CTA の遷移先(無料アカウントリサーチ) */
export const APP_SEARCH_URL = `${APP_URL}/search`

/** 公開 API(タレントギャラリー取得)のベース URL */
export const API_BASE_URL = stripTrailingSlash(
  import.meta.env.VITE_API_BASE_URL?.trim() || 'https://api.tes.sirucloud.jp',
)
