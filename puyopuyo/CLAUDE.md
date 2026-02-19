# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Goal

モダンで先進的なUI/UXのぷよぷよ（落ちものパズルゲーム）アプリ。Next.js App Router + TypeScript + Tailwind CSS で構築する。

## Commands

```bash
npm run dev      # 開発サーバー起動 (Turbopack, localhost:3000)
npm run build    # プロダクションビルド
npm run start    # プロダクションサーバー起動
npm run lint     # ESLint 実行
```

## Architecture

- **フレームワーク**: Next.js 16 (App Router) + React 19
- **言語**: TypeScript 5 (strict モード)
- **スタイリング**: Tailwind CSS 4 (`@tailwindcss/postcss`)
- **バンドラー**: Turbopack（`next.config.ts` で `turbopack.root` を明示指定済み）

### ディレクトリ規則

- `app/` — App Router のページ・レイアウト。`layout.tsx` がルートレイアウト（Geist フォント設定済み）
- `app/globals.css` — グローバルスタイル（Tailwind のエントリーポイント）
- `public/` — 静的アセット
- パスエイリアス `@/*` → プロジェクトルート直下

### スタイリング

Tailwind CSS v4 を使用。`tailwind.config` は不要（v4 はゼロコンフィグ）。`postcss.config.mjs` に `@tailwindcss/postcss` を設定済み。

### ゲーム実装の指針

- ゲームロジック（ボード状態・落下・連鎖判定）は `app/` 外の純粋な TypeScript モジュールとして分離し、React から `useReducer` / `useEffect` でつなぐ
- アニメーションは CSS アニメーションまたは Framer Motion を優先（Canvas は最終手段）
- キーボード操作（矢印キー・Z/X）とタッチ操作の両対応を想定

---

## 要件定義

### 1. ゲームの概要

落ちものパズルゲーム「ぷよぷよ」のWebブラウザ実装。2つ組のぷよをフィールドに積み上げ、同色4つ以上を繋げて消す。連鎖によるスコア倍率あり。

---

### 2. 機能要件

#### 2-1. ゲームフィールド

| 項目 | 仕様 |
|------|------|
| フィールドサイズ | 横6列 × 縦12行（隠し行1行を含む13行） |
| ぷよの色 | 赤・青・緑・黄・紫 の5色 |
| 操作ぷよ | 2つ組（軸ぷよ＋子ぷよ）が上部中央から出現 |

#### 2-2. 操作

| 操作 | キーボード | タッチ |
|------|-----------|--------|
| 左移動 | ← | 左スワイプ |
| 右移動 | → | 右スワイプ |
| 右回転 | Z または X | タップ |
| 左回転 | Z または X（逆） | 2本指タップ |
| 高速落下（ソフトドロップ） | ↓ | 下スワイプ |
| 即座に落下（ハードドロップ） | ↑ または Space | — |
| 一時停止 | Escape または P | — |

#### 2-3. ゲームロジック

- **落下**: 一定間隔（初期1000ms、レベル上昇で短縮）でぷよが1行ずつ落下
- **接地判定**: 最下行またはぷよの上に乗った場合に接地。接地後 500ms 以内に移動・回転で接地解除可能
- **消去判定**: 同色4つ以上が上下左右に連結した場合に消去
- **連鎖**: 消去後に残りのぷよが落下し、再度消去条件を満たした場合に連鎖カウント増加
- **壁蹴り**: 回転時にフィールド端やぷよに当たった場合、可能であれば横に1マスずらす
- **ゲームオーバー**: 隠し行にぷよが残った状態で次のぷよが出現した時

#### 2-4. スコアシステム

| 項目 | 仕様 |
|------|------|
| 基本スコア | 消去ぷよ数 × 10 |
| 連鎖ボーナス | 連鎖数に応じた倍率（1連鎖=×1, 2連鎖=×3, 3連鎖=×6 …） |
| 色ボーナス | 同時に消した色数に応じた加算 |
| ハードドロップボーナス | 落下行数 × 2 |
| レベルアップ | 消去ぷよ累計が閾値を超えるごとにレベル+1（最大15） |

#### 2-5. 画面構成

- **メインフィールド**: ゲームボード（中央）
- **NEXT表示**: 次の2つ組ぷよを2個先まで表示（右側）
- **スコア・レベル・連鎖数**: リアルタイム表示（右側）
- **一時停止オーバーレイ**: Escape でフィールドをブラー＋メニュー表示
- **ゲームオーバー画面**: スコア・最高スコア・リトライボタン

#### 2-6. データ永続化

- ハイスコアを `localStorage` に保存（上位5件）
- 設定（音量・ゴーストぷよ表示ON/OFF）を `localStorage` に保存

---

### 3. 非機能要件

| 項目 | 目標値 |
|------|--------|
| フレームレート | 60fps（`requestAnimationFrame` ベース） |
| レスポンシブ | スマートフォン縦持ちで全操作可能 |
| ブラウザ対応 | Chrome / Firefox / Safari / Edge 最新版 |
| アクセシビリティ | キーボードのみで全操作可能、色覚多様性を考慮した色選択 |

---

### 4. UI/UX 要件

- **ビジュアル**: グラスモーフィズム or ネオモーフィズムを基調としたモダンデザイン
- **ぷよの見た目**: 丸みのあるブロック、接続方向に応じて形状変化（スライム状）
- **アニメーション**:
  - 落下: スムーズな補間アニメーション
  - 消去: バースト → フェードアウト
  - 連鎖: 連鎖数に応じたエフェクト（パーティクル等）
  - レベルアップ: フラッシュ演出
- **ゴーストぷよ**: 落下先をゴースト表示（設定でON/OFF）
- **BGM/SE**: Web Audio API による効果音（落下音・消去音・連鎖音）、BGMはオプション

---

### 5. ファイル構成（実装時の目安）

```
app/
  page.tsx              # ゲーム画面エントリー
  layout.tsx            # ルートレイアウト

lib/
  game/
    types.ts            # 型定義（Board, Puyo, PuyoPair, GameState 等）
    board.ts            # ボード操作（配置・消去・落下）
    chain.ts            # 連鎖・消去判定
    score.ts            # スコア計算
    generator.ts        # ぷよ生成（色ランダム）
  constants.ts          # BOARD_WIDTH, COLORS, LEVEL_THRESHOLDS 等

hooks/
  useGame.ts            # ゲームループ・状態管理（useReducer + useEffect）
  useKeyboard.ts        # キーボード入力ハンドリング
  useTouch.ts           # タッチ入力ハンドリング

components/
  Board.tsx             # フィールド描画
  PuyoCell.tsx          # 個々のぷよセル
  NextPuyo.tsx          # NEXT表示
  ScorePanel.tsx        # スコア・レベル表示
  GameOverlay.tsx       # 一時停止・ゲームオーバー画面
```
