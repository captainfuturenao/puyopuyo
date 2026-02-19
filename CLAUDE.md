# My Claud Code — ワークスペース

このディレクトリは複数プロジェクトを管理するワークスペースルートです。

## ディレクトリ構成

```
My Claud Code/
  puyopuyo/       # ぷよぷよゲーム (Next.js)
                  #   GitHub: https://github.com/captainfuturenao/puyopuyo
                  #   Vercel: https://puyopuyo-alpha.vercel.app
  <新プロジェクト>/  # 今後追加されるプロジェクトはここに
  CLAUDE.md       # このファイル（ワークスペース共通指示）
```

## 新しいプロジェクトを始めるとき

1. このディレクトリ配下に新フォルダを作成する（例: `my-new-app/`）
2. そのフォルダ内で `npx create-next-app@latest .` などで初期化
3. フォルダ内に `CLAUDE.md` を置いてプロジェクト固有の指示を記述する
4. GitHub リポジトリを作成し、`git remote add origin <url>` で連携
5. `vercel --yes` でデプロイ（プロジェクトフォルダ内から実行）

## 共通環境情報

- **OS**: Windows 11 / Shell: Git Bash
- **Node.js**: npm を使用
- **デプロイ**: Vercel CLI (`vercel --yes --name <project-name>`)
- **GitHub**: `gh` CLI 認証済み（アカウント: captainfuturenao）
- **Vercel**: CLI 認証済み（アカウント: captainfuturenao）

## 注意事項

- 各プロジェクトの `node_modules/` はプロジェクトフォルダ内に置く
- `.vercel/` フォルダはプロジェクトフォルダ内に置く
- プロジェクト名に日本語・スペースを含めると Vercel がエラーになるため英数字で命名する
