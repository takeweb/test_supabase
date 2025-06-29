# Step 1: ビルドステージ (開発依存関係と本番ビルド用)
# Node.jsの公式LTSイメージをベースにする
FROM node:20-bookworm-slim AS builder

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションのソースコードを全てコピー
COPY . .

# Viteで本番ビルドを実行
# buildコマンドがpackage.jsonのscriptsで定義されていることを前提とする
RUN npm run build

# Step 2: 本番ステージ (軽量なWebサーバーとビルドされたファイルのみ)
# Nginxの軽量イメージをベースにする
FROM nginx:alpine

# カスタムNginx設定ファイルをコピー
# Dockerfile と同じディレクトリに nginx-book_app.conf があることを前提
COPY ./nginx-book_app.conf /etc/nginx/conf.d/default.conf

# Nginxのデフォルト設定を使用する場合、以下は不要ですが、
# コンテナ起動時にNginxが/etc/nginx/conf.d/default.confを探すので、
# シンプルな設定を配置しておくと良いでしょう。
# もしViteのビルド出力が'dist'ディレクトリ以外に出る場合、
# Nginxの設定でrootパスを調整する必要があります。
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginxがリッスンするポートを公開
EXPOSE 80

# Nginxをフォアグラウンドで起動
CMD ["nginx", "-g", "daemon off;"]
