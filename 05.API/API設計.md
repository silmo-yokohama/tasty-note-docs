# TastyNote API設計書

## 1. エンドポイント一覧

### 認証関連 (/api/v1/auth)
| メソッド | エンドポイント | 説明 |
|---------|----------------|------|
| POST    | /register      | ユーザー登録 |
| POST    | /login         | ログイン |
| POST    | /logout        | ログアウト |
| POST    | /refresh       | トークンリフレッシュ |
| POST    | /verify-email  | メール認証 |
| POST    | /forgot-password | パスワードリセットメール送信 |
| POST    | /reset-password  | パスワードリセット実行 |

### ユーザー関連 (/api/v1/users)
| メソッド | エンドポイント | 説明 |
|---------|----------------|------|
| GET     | /me            | ログインユーザー情報取得 |
| PUT     | /me            | ユーザー情報更新 |
| DELETE  | /me            | アカウント削除 |

### フォルダ関連 (/api/v1/folders)
| メソッド | エンドポイント | 説明 |
|---------|----------------|------|
| GET     | /              | フォルダ一覧取得 |
| POST    | /              | フォルダ作成 |
| GET     | /{folder_id}   | フォルダ詳細取得 |
| PUT     | /{folder_id}   | フォルダ更新 |
| DELETE  | /{folder_id}   | フォルダ削除 |
| POST    | /{folder_id}/share | 共有設定の更新 |
| GET     | /shared/{share_hash} | 共有フォルダの取得 |

### 店舗関連 (/api/v1/stores)
| メソッド | エンドポイント | 説明 |
|---------|----------------|------|
| GET     | /              | 店舗一覧取得 |
| POST    | /              | 店舗登録 |
| GET     | /{store_id}    | 店舗詳細取得 |
| DELETE  | /{store_id}    | 店舗削除 |

### フォルダ内店舗管理 (/api/v1/folders/{folder_id}/stores)
| メソッド | エンドポイント | 説明 |
|---------|----------------|------|
| GET     | /              | フォルダ内店舗一覧取得 |
| POST    | /              | フォルダに店舗を追加 |
| DELETE  | /{store_id}    | フォルダから店舗を削除 |

### メモ関連 (/api/v1/stores/{store_id}/memo)
| メソッド | エンドポイント | 説明 |
|---------|----------------|------|
| GET     | /              | メモ取得 |
| POST    | /              | メモ作成・更新 |
| DELETE  | /              | メモ削除 |

### 写真関連 (/api/v1/stores/{store_id}/photos)
| メソッド | エンドポイント | 説明 |
|---------|----------------|------|
| GET     | /              | 写真一覧取得 |
| POST    | /              | 写真アップロード |
| DELETE  | /{photo_id}    | 写真削除 |

### 地図関連 (/api/v1/maps)
| メソッド | エンドポイント | 説明 |
|---------|----------------|------|
| GET     | /key           | Maps APIキーの取得（制限付き） |
| GET     | /places/search | 店舗検索（Places API Proxy） |
| GET     | /places/{place_id} | 店舗詳細取得（Places Details API Proxy） |
| GET     | /places/{place_id}/photos | 店舗写真一覧取得（Places Photos API Proxy） |
| GET     | /geocode       | 住所・座標の変換（Geocoding API Proxy） |

### 外部API利用情報

#### Google Maps Platform APIs
以下のAPIは、フロントエンドから直接アクセスします：

1. Maps JavaScript API
   - 用途：地図の表示
   - 制限：
     - ドメイン制限あり
     - 利用量制限：1日あたり100,000回

2. Places API
   - 用途：店舗検索、詳細情報取得
   - エンドポイント：
     - Nearby Search: `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
     - Text Search: `https://maps.googleapis.com/maps/api/place/textsearch/json`
     - Place Details: `https://maps.googleapis.com/maps/api/place/details/json`
   - 制限：
     - 1日あたり10,000リクエスト
     - 1秒あたり10リクエスト

3. Geocoding API
   - 用途：住所⇔座標の変換
   - エンドポイント：`https://maps.googleapis.com/maps/api/geocode/json`
   - 制限：
     - 1日あたり2,500リクエスト
     - 1秒あたり5リクエスト

#### API利用時の注意事項
1. レート制限対策
   - バックエンドでのキャッシュ実装
   - リトライ処理の実装
   - クォータ監視と警告システム

2. エラーハンドリング
   - OVER_QUERY_LIMIT: クォータ超過
   - ZERO_RESULTS: 検索結果なし
   - REQUEST_DENIED: APIキー無効
   - INVALID_REQUEST: パラメータ不正

3. セキュリティ対策
   - APIキーの制限設定
     - HTTP リファラー
     - IP アドレス
     - アプリケーション制限
   - プロキシ経由でのアクセス
   - レスポンスのサニタイズ

4. パフォーマンス最適化
   - 必要最小限のフィールド指定
   - 適切なキャッシュ戦略
   - バッチ処理の活用
