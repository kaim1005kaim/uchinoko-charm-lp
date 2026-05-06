# うちのこチャーム LP

「うちのこチャーム」のランディングページ。Next.js 16 + Tailwind v4 +
React Three Fiber で構築。

## 主要構成

- **Hero**: 青ストライプ背景、ロゴ + 犬猫 4 アイコン
- **About**: ポエトリックコピー
- **ScrollAssemble**: Apple 風スクロール演出。`pinned scroll` (sticky)
  + `framer-motion useScroll` で進捗を取得し、`@react-three/fiber` で
  GLB パーツを位置 / 回転補間してドッキング、最後に Y 軸 360° 回転
- **PhotoSection / Cases / Lineup / CTA / Footer**

## アセット

- `public/glb/` — シュナウザーパーツ (`shuna_face_base / left_ear / right_ear / nose / mouth`) と全体 (`shuna_ALL`)
- `public/images/` — LP 用の写真・アイコン

## ローカル開発

```sh
pnpm install
pnpm dev
```

http://localhost:3000

## デプロイ

Vercel に新規プロジェクトとして接続。ドメインは `uchinoko.raiose.com` を予定。
