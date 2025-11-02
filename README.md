# Haruve 開発環境

「Haruve」の開発を始めるための環境構築手順です。

## 技術スタック
- **バックエンド**: Ruby on Rails 8（API モード） / MySQL 8 / rack-cors / dotenv-rails
- **フロントエンド**: React 19（TypeScript + Vite） / Tailwind CSS / Axios
- **オーケストレーション**: Docker Compose（推奨）

## Docker でのセットアップ

1. 環境変数ファイルのテンプレートをコピーします。
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
   必要に応じて値を変更してください（例: LAN 経由でアクセスする場合など）。

2. 各コンテナをビルド・起動します。
   ```bash
   docker compose up --build
   ```

3. Rails が DB を準備して起動するまで待機し、以下で動作確認を行います。
   - Rails API: http://localhost:3000/health
   - React フロントエンド: http://localhost:5173  
     フロントエンド画面の「Call /health endpoint」ボタンで、CORS を介した API 通信を確認できます。

4. 停止する際は以下を実行します。
   ```bash
   docker compose down
   ```

### コンテナ内での Rails コマンド例
```bash
docker compose run --rm backend bundle exec rails db:create
docker compose run --rm backend bundle exec rails db:migrate
```

## ローカル（非 Docker）でのセットアップ

1. Ruby 3.2 以上（3.3 推奨）、Node.js 18 以上、MySQL 8 を用意します。
2. バックエンド:
   ```bash
   cd backend
   cp .env.example .env
   bundle install
   bin/rails db:create db:migrate
   bin/rails server
   ```
3. フロントエンド:
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```

## 設定上のポイント
- **CORS**: `backend/config/initializers/cors.rb` で `http://localhost:5173` を許可しています。複数のオリジンを許可したい場合は `.env` の `CORS_ORIGINS` にカンマ区切りで追加してください。
- **データベース**: `backend/config/database.yml` は `DB_HOST` や `DB_USERNAME` などの環境変数を参照します。Docker Compose は自動で値を渡します。
- **ヘルスチェック**: `GET /health` (`HealthController#show`) で `{ status: "ok" }` を返し、フロントエンドからの疎通確認に利用できます。
- **フロントエンドの API クライアント**: `frontend/src/App.tsx` は `VITE_API_BASE_URL`（デフォルトは `http://localhost:3000`）を参照して API 通信を行います。

## 今後の拡張候補
- JWT 認証や家計簿 API（/expenses）などのドメインロジックを実装する。
- 実装に合わせてリクエストスペックやフロントエンドのテストを追加する。
- 必要に応じて Docker Compose に他サービス（ワーカー等）を追加する。
