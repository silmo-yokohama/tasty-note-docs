# Laravel バックエンド環境構築手順

## 1. 前提条件
- Docker Desktopがインストールされていること
- gitがインストールされていること
- WSL2（Windowsの場合）が設定されていること

## 2. 初期セットアップ

### 2.1 作業ディレクトリの作成
```bash
cd ~
mkdir tasty-note
cd tasty-note
```

### 2.2 Dockerの起動
```bash
# コンテナの停止（既存のコンテナがある場合）
docker compose down

# イメージのビルド
docker compose build php

# コンテナの起動
docker compose up -d
```

### 2.3 コンテナの起動確認
```bash
docker compose ps
```

## 3. Laravelのインストール

### 3.1 Laravelプロジェクトの作成
```bash
docker compose exec php bash
composer create-project laravel/laravel .
composer update
```

### 3.2 環境設定ファイルの編集
`.env`ファイルを以下の内容で編集：
```env
APP_NAME=TastyNote
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8080

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=tasty_note
DB_USERNAME=tasty_note
DB_PASSWORD=password

FILESYSTEM_DISK=local

MAIL_MAILER=log
MAIL_FROM_ADDRESS="noreply@tastynote.local"
MAIL_FROM_NAME="${APP_NAME}"

# Google API関連
GOOGLE_MAPS_API_KEY=your_api_key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# アップロード制限
MAX_UPLOAD_SIZE=1048576
MAX_PHOTOS_PER_STORE=5
```

### 3.3 必要なパッケージのインストール
```bash
# Sanctumのインストール（API認証用）
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# アプリケーションキーの生成
php artisan key:generate
```

## 4. ストレージの設定

### 4.1 ストレージディレクトリの作成
```bash
# 写真保存用ディレクトリの作成
mkdir -p storage/app/photos
chmod -R 775 storage bootstrap/cache
chmod -R 775 storage/app/photos

# ストレージのシンボリックリンク作成
php artisan storage:link
```

### 4.2 ファイルシステム設定の編集
`config/filesystems.php`を編集：
```php
'disks' => [
    'local' => [
        'driver' => 'local',
        'root' => storage_path('app/photos'),
        'permissions' => [
            'file' => [
                'public' => 0664,
                'private' => 0600,
            ],
            'dir' => [
                'public' => 0775,
                'private' => 0700,
            ],
        ],
    ],
]
```

## 5. データベースマイグレーション

### 5.1 マイグレーションファイルの作成
```bash
# 認証・ユーザー関連はLaravelが作成してくれるので、テーブルは作成しない
# users
# password_reset_tokens
# personal_access_tokens


# 基本テーブル
php artisan make:migration create_stores_table
php artisan make:migration create_folders_table

# リレーションテーブル
php artisan make:migration create_store_memos_table
php artisan make:migration create_store_photos_table
php artisan make:migration create_folder_stores_table
```

### 5.2 マイグレーションファイルの編集

#### users テーブル (yyyy_mm_dd_000001_create_users_table.php)
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            // 基本情報
            $table->string('name', 20)->comment('ニックネーム');
            $table->string('email')->unique()->comment('メールアドレス');
            $table->timestamp('email_verified_at')->nullable()->comment('メール認証日時');
            $table->string('password')->comment('パスワードハッシュ');

            // 認証関連
            $table->enum('auth_provider', ['email', 'google'])->default('email')->comment('認証プロバイダー');
            $table->string('provider_id', 255)->nullable()->comment('プロバイダーID');
            $table->string('remember_token', 100)->nullable()->comment('ログイン保持トークン');

            // セキュリティ
            $table->tinyInteger('login_attempts')->unsigned()->default(0)->comment('ログイン試行回数');
            $table->timestamp('locked_until')->nullable()->comment('アカウントロック期限');

            // ストレージ管理
            $table->bigInteger('storage_usage')->unsigned()->default(0)->comment('ストレージ使用量');

            // タイムスタンプ
            $table->timestamps();
            $table->softDeletes()->comment('論理削除用');

            // インデックス
            $table->index(['auth_provider', 'provider_id']);
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};

```

#### password_reset_tokens テーブル (yyyy_mm_dd_000002_create_password_reset_tokens_table.php)
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
    }
};
```

#### personal_access_tokens テーブル (yyyy_mm_dd_000003_create_personal_access_tokens_table.php)
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
    }
};
```

#### stores テーブル (yyyy_mm_dd_000004_create_stores_table.php)
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->string('place_id')->unique()->comment('Google Places API ID');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};
```

#### folders テーブル (yyyy_mm_dd_000005_create_folders_table.php)
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name', 20)->comment('フォルダ名');
            $table->string('icon', 20)->comment('アイコン種別');
            $table->string('color', 7)->comment('カラーコード');
            $table->boolean('is_favorite')->default(false)->comment('お気に入り');
            $table->char('share_hash', 12)->nullable()->unique()->comment('共有用ハッシュ');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id', 'name', 'deleted_at']);
            $table->index('user_id');
            $table->index('share_hash');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('folders');
    }
};
```

#### store_memos テーブル (yyyy_mm_dd_000006_create_store_memos_table.php)
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_memos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('content', 500)->comment('メモ内容（最大500文字）');
            $table->timestamps();

            $table->unique(['store_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_memos');
    }
};
```

#### store_photos テーブル (yyyy_mm_dd_000007_create_store_photos_table.php)
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('file_path')->comment('画像ファイルパス');
            $table->string('file_name')->comment('オリジナルファイル名');
            $table->integer('file_size')->unsigned()->comment('ファイルサイズ');
            $table->string('mime_type')->comment('MIMEタイプ');
            $table->timestamps();

            $table->index('store_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_photos');
    }
};
```

#### folder_stores テーブル (yyyy_mm_dd_000008_create_folder_stores_table.php)
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('folder_stores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('folder_id')->constrained()->onDelete('cascade');
            $table->foreignId('store_id')->constrained()->onDelete('cascade');
            $table->timestamp('created_at')->nullable();

            $table->unique(['folder_id', 'store_id']);
            $table->index('folder_id');
            $table->index('store_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('folder_stores');
    }
};
```

### 5.3 マイグレーションの実行
```bash
php artisan migrate:fresh
```

### 5.4 マイグレーションの確認
```bash
php artisan migrate:status
```

## 6. 動作確認

### 6.1 アプリケーションの起動確認
ブラウザで http://localhost:8080 にアクセスし、Laravelのウェルカムページが表示されることを確認します。

### 6.2 データベース接続確認
```bash
# Tinkerの起動
php artisan tinker

# データベース接続テスト
DB::connection()->getPdo();

# テーブル一覧の確認
\Schema::getAllTables();
```

### 6.3 ストレージ設定の確認
```bash
# テストファイルの作成と削除
touch storage/app/photos/test.txt
rm storage/app/photos/test.txt

# シンボリックリンクの確認
ls -l public/storage
```

## 7. 初期設定の確認

### 7.1 必要なディレクトリとパーミッション
```bash
# ストレージディレクトリの確認
ls -la storage/app/photos
ls -la storage/framework/cache
ls -la storage/framework/sessions
ls -la storage/framework/views
ls -la storage/logs

# パーミッションの確認
stat storage/app/photos
stat bootstrap/cache
```

### 7.2 キャッシュのクリア
```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
php artisan clear-compiled
composer dump-autoload
```

### 7.3 設定ファイルの確認
```bash
# 設定ファイルの公開（必要な場合）
php artisan vendor:publish --tag=sanctum-config
php artisan vendor:publish --tag=cors

# 設定内容の確認
php artisan config:show
```

### 7.4 CORSの設定 (config/cors.php)
```php
<?php

return [
    // クロスオリジンリクエストを許可するパス
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // 許可するリクエストオリジン（開発環境とデプロイ環境）
    'allowed_origins' => [
        'http://localhost:3000',     // 開発環境のフロントエンド
        'http://localhost:8080',     // 開発環境のバックエンド
        'https://tastynote.vercel.app', // 本番環境（適宜変更）
    ],

    // 許可するHTTPメソッド
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // 許可するHTTPヘッダー
    'allowed_headers' => [
        'Accept',
        'Authorization',
        'Content-Type',
        'X-XSRF-TOKEN',
        'X-Requested-With',
    ],

    // レスポンスで公開するヘッダー
    'exposed_headers' => false,

    // 認証情報（Cookie等）を含むリクエストを許可
    'supports_credentials' => true,

    // プリフライトリクエストの結果をキャッシュする時間（秒）
    'max_age' => 86400,
];
```

### 7.5 Sanctumの設定 (config/sanctum.php)
```php
<?php

use Laravel\Sanctum\Sanctum;

return [
    // stateful の設定: 既存の設定を維持しつつ、必要なドメインを追加
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
        Sanctum::currentApplicationUrlWithPort()
    ))),

    // guard の設定: 既存のまま維持
    'guard' => ['web'],

    // expiration の設定: 30日に設定（仕様書の要件に基づく）
    'expiration' => 60 * 24 * 30, // 30 days

    // token_prefix の設定: 既存のまま維持
    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    // middleware の設定: 既存のまま維持
    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
    ],
];
```

### 7.6 .env ファイルに追加する設定
```
SANCTUM_STATEFUL_DOMAINS=localhost:3000,tastynote.vercel.app
SESSION_DOMAIN=localhost # 開発環境用
```

## 8. 開発環境の設定

### 8.1 VSCode設定
`.vscode/settings.json`を作成：
```json
{
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "[php]": {
        "editor.defaultFormatter": "junstyle.php-cs-fixer"
    },
    "php.validate.executablePath": "/usr/local/bin/php",
    "php.suggest.basic": false
}
```

### 8.2 PHPコードスタイル設定
php-cs-fixerをインストール
```
composer require --dev friendsofphp/php-cs-fixer
```

`.php-cs-fixer.php`を作成：
```php
<?php

use PhpCsFixer\Config;
use PhpCsFixer\Finder;

$config = new Config();
return $config
    ->setRules([
        // 基本的なPSR系ルールは無効化（インデントサイズの制御のため）
        '@PSR2' => false,

        // 基本的なコードスタイル
        'array_syntax' => ['syntax' => 'short'],
        'binary_operator_spaces' => true,
        'blank_line_after_namespace' => true,
        'blank_line_after_opening_tag' => true,
        'blank_line_before_statement' => [
            'statements' => ['return']
        ],
        'braces' => true,
        'cast_spaces' => true,
        'class_attributes_separation' => [
            'elements' => ['method' => 'one']
        ],
        'class_definition' => true,
        'concat_space' => [
            'spacing' => 'none'
        ],
        'declare_equal_normalize' => true,
        'elseif' => true,
        'encoding' => true,
        'full_opening_tag' => true,
        'function_declaration' => true,
        'function_typehint_space' => true,
        'single_line_comment_style' => [
            'comment_types' => ['hash']
        ],
        'heredoc_to_nowdoc' => true,
        'include' => true,

        // インデント関連の設定
        'indentation_type' => true,
        'php_unit_method_casing' => ['case' => 'snake_case'],
        'method_argument_space' => [
            'on_multiline' => 'ensure_fully_multiline',
            'keep_multiple_spaces_after_comma' => false
        ],
        'line_ending' => true,

        // インポート文の整列
        'ordered_imports' => ['sort_algorithm' => 'alpha'],
        'list_syntax' => ['syntax' => 'short'],

        // キーワードと定数の設定
        'lowercase_cast' => true,
        'constant_case' => ['case' => 'lower'],
        'lowercase_keywords' => true,
        'magic_constant_casing' => true,

        // スペースと配置の設定
        'method_argument_space' => [
            'on_multiline' => 'ensure_fully_multiline',
            'keep_multiple_spaces_after_comma' => false
        ],
        'native_function_casing' => true,
        'no_blank_lines_after_class_opening' => true,
        'no_blank_lines_after_phpdoc' => true,
        'no_closing_tag' => true,
        'no_empty_phpdoc' => true,
        'no_empty_statement' => true,
        'no_leading_import_slash' => true,
        'no_leading_namespace_whitespace' => true,
        'no_mixed_echo_print' => [
            'use' => 'echo'
        ],
        'no_multiline_whitespace_around_double_arrow' => true,
        'multiline_whitespace_before_semicolons' => [
            'strategy' => 'no_multi_line'
        ],
        'no_short_bool_cast' => true,
        'no_singleline_whitespace_before_semicolons' => true,
        'no_spaces_after_function_name' => true,
        'no_spaces_around_offset' => true,
        'no_spaces_inside_parenthesis' => true,
        'no_trailing_comma_in_singleline' => true,
        'no_trailing_whitespace' => true,
        'no_trailing_whitespace_in_comment' => true,
        'no_unneeded_control_parentheses' => true,
        'no_unreachable_default_argument_value' => true,
        'no_useless_return' => true,
        'no_whitespace_before_comma_in_array' => true,
        'no_whitespace_in_blank_line' => true,
        'normalize_index_brace' => true,
        'not_operator_with_successor_space' => true,
        'object_operator_without_whitespace' => true,

        // PHPDoc関連の設定
        'phpdoc_indent' => true,
        'phpdoc_inline_tag_normalizer' => true,
        'phpdoc_no_access' => true,
        'phpdoc_no_package' => true,
        'phpdoc_no_useless_inheritdoc' => true,
        'phpdoc_scalar' => true,
        'phpdoc_single_line_var_spacing' => true,
        'phpdoc_summary' => true,
        'phpdoc_trim' => true,
        'phpdoc_types' => true,
        'phpdoc_var_without_name' => true,

        // その他の整形ルール
        'self_accessor' => true,
        'short_scalar_cast' => true,
        'simplified_null_return' => false,
        'single_blank_line_at_eof' => true,
        'single_blank_line_before_namespace' => true,
        'single_class_element_per_statement' => true,
        'single_import_per_statement' => true,
        'single_line_after_imports' => true,
        'single_quote' => true,
        'space_after_semicolon' => true,
        'standardize_not_equals' => true,
        'switch_case_semicolon_to_colon' => true,
        'switch_case_space' => true,
        'ternary_operator_spaces' => true,
        'trim_array_spaces' => true,
        'unary_operator_spaces' => true,
        'visibility_required' => [
            'elements' => ['method', 'property']
        ],
        'whitespace_after_comma_in_array' => true
    ])
    ->setIndent("  ")
    ->setLineEnding("\n")
    ->setFinder(
        Finder::create()
            ->in([
        __DIR__ . '/app',
        __DIR__ . '/config',
        __DIR__ . '/database',
        __DIR__ . '/resources',
        __DIR__ . '/routes',
        __DIR__ . '/tests',
        __DIR__ . '/public',
        __DIR__ . '/bootstrap',

            ])
            ->name('*.php')
            ->notName('*.blade.php')
            ->ignoreDotFiles(true)
            ->ignoreVCS(true)
    )
;
```

composer.jsonに以下を追加
```json
"scripts": {
    "format": "php-cs-fixer fix --allow-risky=yes",
    "format-check": "php-cs-fixer fix --dry-run --diff --allow-risky=yes"
}
```

## 9. 開発時の注意点

### 9.1 作業場所の使い分け
- **ホスト側で行うこと**
  - ソースコードの編集（PHP, HTML, CSS, JavaScript など）
  - 設定ファイルの編集
  - Gitによるバージョン管理
  - ドキュメントの作成・編集

- **コンテナ内で行うこと**
  - artisanコマンドの実行
  - データベース操作
  - composerコマンドの実行
  - その他PHPやMySQLに関連する操作

### 9.2 コマンド実行方法
```bash
# artisanコマンド
docker compose exec php php artisan {command}

# composerコマンド
docker compose exec php composer {command}

# データベース操作
docker compose exec mysql mysql -u tasty_note -p

# コンテナのログ確認
docker compose logs -f [サービス名]
```

### 9.3 Git管理時の注意
`.gitignore`に以下を追加：
```gitignore
/storage/app/photos/*
!storage/app/photos/.gitkeep
.php-cs-fixer.cache
```

## 10. トラブルシューティング

### 10.1 一般的な問題と解決方法

#### パーミッション関連
```bash
# ストレージディレクトリの権限修正
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# 所有者の変更
chown -R www-data:www-data storage
chown -R www-data:www-data bootstrap/cache
```

#### データベース接続エラー
```bash
# MySQLコンテナの状態確認
docker compose ps
docker compose logs mysql

# データベース接続テスト
docker compose exec php php artisan tinker
DB::connection()->getPdo();
```

#### コンテナ関連
```bash
# コンテナの再起動
docker compose restart

# コンテナの再構築
docker compose down
docker compose build --no-cache
docker compose up -d
```

### 10.2 Laravelログの確認
```bash
# ログファイルの確認
tail -f storage/logs/laravel.log

# ログレベルの変更（.env）
LOG_LEVEL=debug
```

### 10.3 環境固有の問題

#### WSL2環境での注意点
- ファイル権限の問題が発生した場合は、WSL2のマウントオプションを確認
- パフォーマンスの問題がある場合は、プロジェクトをWSL2のファイルシステム内に配置

#### Macでの注意点
- Docker Desktopのリソース設定を確認
- 必要に応じてパフォーマンスチューニングを実施

## 11. バックアップと運用

### 11.1 バックアップ対象
- データベース
- 画像ファイル（storage/app/photos/）
- 環境設定ファイル（.env）

### 11.2 バックアップスクリプト例
`backup.sh`を作成：
```bash
#!/bin/bash

# バックアップ先ディレクトリ
BACKUP_DIR=~/tasty-note/backups
DATETIME=$(date +%Y%m%d_%H%M%S)

# ディレクトリが存在しない場合は作成
mkdir -p $BACKUP_DIR

# データベースのバックアップ
docker compose exec -T mysql mysqldump -u tasty_note -p tasty_note > $BACKUP_DIR/db_$DATETIME.sql

# 画像ファイルのバックアップ
tar -czf $BACKUP_DIR/photos_$DATETIME.tar.gz storage/app/photos/

# 環境設定ファイルのバックアップ
cp .env $BACKUP_DIR/env_$DATETIME

# 古いバックアップの削除（7日以上前のものを削除）
find $BACKUP_DIR -mtime +7 -type f -delete
```

### 11.3 定期的な確認事項
- ログファイルのローテーション
- ストレージ使用量の監視
- バックアップの正常性確認
- セキュリティアップデートの適用

## 12. セキュリティ設定

### 12.1 基本的なセキュリティ設定
```bash
# アプリケーションキーの確認
php artisan key:status

# 設定キャッシュの作成（本番環境用）
php artisan config:cache

# ルートキャッシュの作成（本番環境用）
php artisan route:cache

# composerの最適化（本番環境用）
composer install --optimize-autoloader --no-dev
```

### 12.2 環境変数の確認
```bash
# 必要な環境変数が設定されているか確認
php artisan env:check

# セキュリティ関連の設定を確認
php artisan security:check
```

これで環境構築は完了です。実際の開発作業を開始できます。