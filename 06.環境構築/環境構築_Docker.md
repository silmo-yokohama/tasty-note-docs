# TastyNote 環境構築手順

## 1. 前提条件
- Windows 11 with WSL2
- Docker Desktop for Windows
- Git

## 2. 作業ディレクトリの準備

1. ホームディレクトリに作業スペースを作成
```bash
cd ~
mkdir tasty-note
cd tasty-note
```

2. GitHubからリポジトリをクローン
```bash
git clone git@github.com:silmo-yokohama/tasty-note-docker.git
git clone git@github.com:silmo-yokohama/tasty-note-frontend.git
git clone git@github.com:silmo-yokohama/tasty-note-backend.git
```

## 3. Dockerの設定ファイル作成

### 3-1. PHPコンテナの設定
tasty-note-docker/php/Dockerfile を作成：
```dockerfile
FROM php:8.1.29-fpm

# システムの依存パッケージをインストール
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    # ImageMagick関連パッケージを追加
    imagemagick \
    libmagickwand-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd \
    # ImageMagick PHP拡張のインストール
    && pecl install imagick \
    && docker-php-ext-enable imagick

# Composerのインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 作業ディレクトリの設定
WORKDIR /var/www/html

# ユーザーを作成
RUN groupadd -g 1000 www
RUN useradd -u 1000 -ms /bin/bash -g www www

# パーミッションの設定
RUN chown -R www:www /var/www

# ユーザーの切り替え
USER www

# コンテナ起動時のコマンド
CMD ["php-fpm"]

EXPOSE 9000
```

### 3-2. Apacheコンテナの設定
tasty-note-docker/apache/Dockerfile を作成：
```dockerfile
FROM httpd:2.4

# 必要なモジュールをインストール
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Apache モジュールを有効化
RUN sed -i \
    -e 's/^#\(LoadModule .*mod_proxy.so\)/\1/' \
    -e 's/^#\(LoadModule .*mod_proxy_fcgi.so\)/\1/' \
    -e 's/^#\(LoadModule .*mod_rewrite.so\)/\1/' \
    /usr/local/apache2/conf/httpd.conf

# デフォルトのconfをバックアップ
RUN cp /usr/local/apache2/conf/httpd.conf /usr/local/apache2/conf/httpd.conf.orig

# DocumentRootディレクトリの作成
RUN mkdir -p /var/www/html/public

# PHP-FPMとの連携設定
RUN echo "<FilesMatch \.php$>" >> /usr/local/apache2/conf/httpd.conf \
    && echo "    SetHandler \"proxy:fcgi://php:9000\"" >> /usr/local/apache2/conf/httpd.conf \
    && echo "</FilesMatch>" >> /usr/local/apache2/conf/httpd.conf

# DocumentRootの設定
RUN sed -i 's|/usr/local/apache2/htdocs|/var/www/html/public|' /usr/local/apache2/conf/httpd.conf

# DirectoryIndexにindex.phpを追加
RUN sed -i 's|DirectoryIndex index.html|DirectoryIndex index.php index.html|' /usr/local/apache2/conf/httpd.conf

# AllowOverrideをAllに設定（.htaccessを有効化）
RUN sed -i 's|AllowOverride None|AllowOverride All|' /usr/local/apache2/conf/httpd.conf

EXPOSE 80
```

### 3-3. MySQLコンテナの設定
tasty-note-docker/mysql/Dockerfile を作成：
```dockerfile
FROM mysql:5.7

# 環境変数の設定
ENV TZ=Asia/Tokyo

# MySQLのカスタム設定
RUN echo "[mysqld]" > /etc/mysql/conf.d/custom.cnf \
    && echo "character-set-server = utf8mb4" >> /etc/mysql/conf.d/custom.cnf \
    && echo "collation-server = utf8mb4_unicode_ci" >> /etc/mysql/conf.d/custom.cnf \
    && echo "default-storage-engine = InnoDB" >> /etc/mysql/conf.d/custom.cnf \
    && echo "innodb_buffer_pool_size = 128M" >> /etc/mysql/conf.d/custom.cnf \
    && echo "max_connections = 100" >> /etc/mysql/conf.d/custom.cnf \
    && echo "sql_mode = STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION" >> /etc/mysql/conf.d/custom.cnf

# クライアント設定
RUN echo "[client]" >> /etc/mysql/conf.d/custom.cnf \
    && echo "default-character-set = utf8mb4" >> /etc/mysql/conf.d/custom.cnf

EXPOSE 3306
```

### 3-4. MySQL初期化スクリプトの作成
tasty-note-docker/mysql/init.sql を作成：
```sql
-- データベースの作成
CREATE DATABASE IF NOT EXISTS tasty_note;
CREATE DATABASE IF NOT EXISTS tasty_note_testing;

-- 文字コードの設定
ALTER DATABASE tasty_note CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER DATABASE tasty_note_testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ユーザーの作成と権限付与
CREATE USER IF NOT EXISTS 'tasty_note'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON tasty_note.* TO 'tasty_note'@'%';
GRANT ALL PRIVILEGES ON tasty_note_testing.* TO 'tasty_note'@'%';
FLUSH PRIVILEGES;
```


### 3-5. Nodeコンテナの設定
tasty-note-docker/node/Dockerfile を作成：
```dockerfile
FROM node:20-slim

# システムの更新とタイムゾーン設定
RUN apt-get update && apt-get install -y \
    git \
    curl \
    tzdata \
    && rm -rf /var/lib/apt/lists/* \
    && cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime

# 作業ディレクトリの設定
WORKDIR /app

# デフォルトのnodeユーザーを使用
USER node

# Nuxt.js開発サーバーのポート
EXPOSE 3000

# 開発サーバー起動コマンド
CMD ["sh", "-c", "npm install && npm run dev"]
```

### 3-6. Docker Compose設定
tasty-note-docker/docker-compose.yml を作成：
```yaml
version: '3.8'

services:
  apache:
    build:
      context: ./apache
      dockerfile: Dockerfile
    ports:
      - "8080:80"
    volumes:
      - ../tasty-note-backend:/var/www/html
    depends_on:
      - php
    networks:
      - tasty-note-network

  php:
    build:
      context: ./php
      dockerfile: Dockerfile
    volumes:
      - ../tasty-note-backend:/var/www/html
    depends_on:
      - mysql
    networks:
      - tasty-note-network

  mysql:
    build:
      context: ./mysql
      dockerfile: Dockerfile
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: tasty_note
      MYSQL_USER: tasty_note
      MYSQL_PASSWORD: password
      TZ: Asia/Tokyo
    networks:
      - tasty-note-network

  node:
    build:
      context: ./node
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ../tasty-note-frontend:/app
    environment:
      - NODE_ENV=development
    networks:
      - tasty-note-network

networks:
  tasty-note-network:
    driver: bridge

volumes:
  mysql_data:
    driver: local
```

### 3-7. 環境変数の設定
tasty-note-docker/.env を作成：
```env
# Application
APP_NAME=TastyNote
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8080

# Database
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=tasty_note
DB_USERNAME=tasty_note
DB_PASSWORD=password

# Mail
MAIL_MAILER=log
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@tastynote.local"
MAIL_FROM_NAME="${APP_NAME}"

# Frontend
NUXT_PUBLIC_API_URL=http://localhost:8080/api
NUXT_PUBLIC_APP_NAME="${APP_NAME}"

# Storage
FILESYSTEM_DISK=local
```

## 4. 環境の構築と起動

### 4-1. Dockerイメージのビルド
```bash
cd ~/tasty-note/tasty-note-docker
docker-compose build
```

### 4-2. コンテナの起動
```bash
docker-compose up -d
```

### 4-3. フロントエンド（Nuxt.js）の初期設定
```bash
# フロントエンドディレクトリに移動
cd ~/tasty-note/tasty-note-frontend

# 既存ファイルのバックアップ（必要な場合）
mv README.md README.md.bak
mv .git ../

# Nuxtプロジェクトの作成
docker-compose -f ../tasty-note-docker/docker-compose.yml run --rm node sh -c "npx nuxi init ."

# パッケージマネージャーの選択: npm を選択

# .gitディレクトリを戻す
mv ../.git .

# バックアップしたREADMEを戻す
mv ../README.md.bak README.md
```

### 4-4. 動作確認

1. **Apacheの確認**
```bash
curl http://localhost:8080
```

2. **MySQLの接続確認**
```bash
docker-compose exec mysql mysql -u tasty_note -p
# パスワード: password
```

3. **Nuxt開発サーバーの確認**
```bash
# Nodeコンテナの再起動
docker-compose restart node

# ブラウザで確認
http://localhost:3000
```

### 4-5. 確認ポイント
- Apache (バックエンド): http://localhost:8080
- Nuxt.js (フロントエンド): http://localhost:3000
- MySQL: localhost:3306
  - Database: tasty_note
  - Username: tasty_note
  - Password: password

## 5. トラブルシューティング

### 5-1. コンテナの状態確認
```bash
# コンテナの状態確認
docker-compose ps

# ログの確認
docker-compose logs

# 特定のサービスのログ確認
docker-compose logs [service_name]
```

### 5-2. よくある問題と解決方法
1. ポートの競合
   - 8080, 3000, 3306が既に使用されていないか確認
   - 必要に応じてポート番号を変更

2. パーミッションエラー
   - ボリュームマウントしているディレクトリの権限を確認
   - 必要に応じて chmod/chown を実行

3. コンテナの起動失敗
   - ログを確認
   - コンテナを再ビルド: `docker-compose build [service_name]`
   - キャッシュを無視してビルド: `docker-compose build --no-cache`

