# TastyNote API詳細設計書

## 1. 認証関連エンドポイント

### 1.1 ユーザー登録 (/api/v1/auth/register)
- **メソッド**: POST
- **リクエストボディ**:  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "User Name"
  }  ```
- **レスポンス**:
  - **成功時**: 201 Created    ```json
    {
      "message": "ユーザー登録が成功しました。",
      "user_id": "12345"
    }    ```
  - **エラー時**: 400 Bad Request    ```json
    {
      "status": "error",
      "code": "VALIDATION_ERROR",
      "message": "入力データが不正です。",
      "details": {
        "field": "エラーの詳細情報"
      }
    }    ```

### 1.2 ログイン (/api/v1/auth/login)
- **メソッド**: POST
- **リクエストボディ**:  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }  ```
- **レスポンス**:
  - **成功時**: 200 OK    ```json
    {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token"
    }    ```
  - **エラー時**: 401 Unauthorized    ```json
    {
      "status": "error",
      "code": "AUTHENTICATION_FAILED",
      "message": "メールアドレスまたはパスワードが間違っています。"
    }    ```

## 2. ユーザー関連エンドポイント

### 2.1 ログインユーザー情報取得 (/api/v1/users/me)
- **メソッド**: GET
- **認証**: Bearerトークン
- **レスポンス**:
  - **成功時**: 200 OK    ```json
    {
      "user_id": "12345",
      "email": "user@example.com",
      "name": "User Name",
      "created_at": "2023-01-01T00:00:00Z"
    }    ```
  - **エラー時**: 401 Unauthorized    ```json
    {
      "status": "error",
      "code": "UNAUTHORIZED",
      "message": "認証が必要です。"
    }    ```

## 3. フォルダ関連エンドポイント

### 3.1 フォルダ一覧取得 (/api/v1/folders)
- **メソッド**: GET
- **認証**: Bearerトークン
- **レスポンス**:
  - **成功時**: 200 OK    ```json
    {
      "folders": [
        {
          "folder_id": "1",
          "name": "お気に入り",
          "created_at": "2023-01-01T00:00:00Z"
        },
        {
          "folder_id": "2",
          "name": "行きたい店",
          "created_at": "2023-01-02T00:00:00Z"
        }
      ]
    }    ```
  - **エラー時**: 401 Unauthorized    ```json
    {
      "status": "error",
      "code": "UNAUTHORIZED",
      "message": "認証が必要です。"
    }    ```

## 4. エラーハンドリング
- **クライアントエラー（4xx）**:
  - 400: バリデーションエラー
  - 401: 認証エラー
  - 403: 権限エラー
  - 404: リソース未発見
  - 429: レート制限超過

- **サーバーエラー（5xx）**:
  - 500: 内部サーバーエラー
  - 503: サービス利用不可

## 5. セキュリティ対策
- **認証方式**: Bearer認証（JWTトークン）
- **CORS対応**: 許可されたオリジンのみアクセス可能
- **HTTPS通信の強制** 

## 6. フォルダ関連エンドポイント

### 6.1 フォルダ作成 (/api/v1/folders)
- **メソッド**: POST
- **認証**: Bearerトークン
- **リクエストボディ**:  ```json
  {
    "name": "新しいフォルダ",
    "icon": "default",
    "color": "#FFFFFF"
  }  ```
- **レスポンス**:
  - **成功時**: 201 Created    ```json
    {
      "folder_id": "3",
      "message": "フォルダが作成されました。"
    }    ```
  - **エラー時**: 400 Bad Request    ```json
    {
      "status": "error",
      "code": "VALIDATION_ERROR",
      "message": "フォルダ名が不正です。",
      "details": {
        "field": "エラーの詳細情報"
      }
    }    ```

### 6.2 フォルダ更新 (/api/v1/folders/{folder_id})
- **メソッド**: PUT
- **認証**: Bearerトークン
- **リクエストボディ**:  ```json
  {
    "name": "更新されたフォルダ名",
    "icon": "updated_icon",
    "color": "#000000"
  }  ```
- **レスポンス**:
  - **成功時**: 200 OK    ```json
    {
      "message": "フォルダが更新されました。"
    }    ```
  - **エラー時**: 404 Not Found    ```json
    {
      "status": "error",
      "code": "NOT_FOUND",
      "message": "フォルダが見つかりません。"
    }    ```

### 6.3 フォルダ削除 (/api/v1/folders/{folder_id})
- **メソッド**: DELETE
- **認証**: Bearerトークン
- **レスポンス**:
  - **成功時**: 200 OK    ```json
    {
      "message": "フォルダが削除されました。"
    }    ```
  - **エラー時**: 404 Not Found    ```json
    {
      "status": "error",
      "code": "NOT_FOUND",
      "message": "フォルダが見つかりません。"
    }    ```

## 7. 店舗関連エンドポイント

### 7.1 店舗一覧取得 (/api/v1/stores)
- **メソッド**: GET
- **認証**: Bearerトークン
- **レスポンス**:
  - **成功時**: 200 OK    ```json
    {
      "stores": [
        {
          "store_id": "1",
          "name": "ラーメン屋",
          "location": "東京都渋谷区"
        },
        {
          "store_id": "2",
          "name": "カフェ",
          "location": "東京都新宿区"
        }
      ]
    }    ```
  - **エラー時**: 401 Unauthorized    ```json
    {
      "status": "error",
      "code": "UNAUTHORIZED",
      "message": "認証が必要です。"
    }    ```

## 8. メモ関連エンドポイント

### 8.1 メモ作成・更新 (/api/v1/stores/{store_id}/memo)
- **メソッド**: POST
- **認証**: Bearerトークン
- **リクエストボディ**:  ```json
  {
    "content": "この店舗はとても良かったです。"
  }  ```
- **レスポンス**:
  - **成功時**: 200 OK    ```json
    {
      "message": "メモが保存されました。"
    }    ```
  - **エラー時**: 400 Bad Request    ```json
    {
      "status": "error",
      "code": "VALIDATION_ERROR",
      "message": "メモの内容が不正です。",
      "details": {
        "field": "エラーの詳細情報"
      }
    }    ```

## 9. 写真関連エンドポイント

### 9.1 写真アップロード (/api/v1/stores/{store_id}/photos)
- **メソッド**: POST
- **認証**: Bearerトークン
- **リクエストボディ**: マルチパートフォームデータ
- **レスポンス**:
  - **成功時**: 201 Created    ```json
    {
      "photo_id": "123",
      "message": "写真がアップロードされました。"
    }    ```
  - **エラー時**: 413 Payload Too Large    ```json
    {
      "status": "error",
      "code": "PAYLOAD_TOO_LARGE",
      "message": "アップロードされたファイルが大きすぎます。"
    }    ```
