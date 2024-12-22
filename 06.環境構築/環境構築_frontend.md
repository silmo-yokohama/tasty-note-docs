# Nuxt.js 開発環境構築手順

## 1. 前提条件
- Docker環境が構築済みであること
- Node.jsコンテナが利用可能であること

## 2. プロジェクトの初期化

### 2.1 Nuxtプロジェクトの作成
```bash
docker compose exec node sh -c "npx nuxi init ."
```
※パッケージマネージャーの選択では「npm」を選択

## 3. 依存パッケージのインストール

### 3.1 メインパッケージ
```bash
# 基本パッケージ
docker compose exec node npm install \
  @pinia/nuxt@0.9.x \
  @vueuse/core@12.0.x \
  @vueuse/nuxt@12.0.x \
  axios@1.7.x \
  pinia@2.3.x

# UI関連パッケージ
docker compose exec node npm install \
  @vee-validate/nuxt@4.14.x \
  vue-sonner@1.3.x

# 地図関連パッケージ
docker compose exec node npm install \
  @googlemaps/js-api-loader@1.16.x
```

### 3.2 開発用パッケージ
```bash
docker compose exec node npm install -D \
  @nuxt/devtools@1.6.x \
  @nuxt/test-utils@3.15.x \
  @nuxtjs/tailwindcss@6.12.x \
  @types/google.maps@3.58.x \
  @types/node@22.10.x \
  @vitejs/plugin-vue@5.2.x \
  @volar/typescript@2.4.x \
  @vue/test-utils@2.4.x \
  autoprefixer@10.4.x \
  happy-dom@15.11.x \
  postcss@8.4.x \
  tailwindcss@3.4.x \
  typescript@5.7.x \
  vitest@2.1.x \
  vue-tsc@2.1.x
```

### 3.3 ESLint & Prettier関連
```bash
docker compose exec node npm install -D \
  @nuxtjs/eslint-config@12.0.x \
  @nuxtjs/eslint-config-typescript@12.1.x \
  @typescript-eslint/eslint-plugin@6.21.x \
  @typescript-eslint/parser@6.21.x \
  eslint@8.57.x \
  eslint-config-prettier@9.1.x \
  eslint-plugin-nuxt@4.0.x \
  eslint-plugin-prettier@5.2.x \
  eslint-plugin-vue@9.32.x \
  prettier@3.4.x
```

## 4. TailwindCSSの設定

### 4.1 設定ファイルの初期化
```bash
docker compose exec node npx tailwindcss init -p
```

### 4.2 tailwind.config.jsの設定
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B6B',
          50: '#FFF1F1',
          100: '#FFE1E1',
          200: '#FFC7C7',
          300: '#FFA0A0',
          400: '#FF6B6B',
          500: '#F83B3B',
          600: '#E51D1D',
          700: '#C11414',
          800: '#A01414',
          900: '#841818'
        },
        secondary: {
          DEFAULT: '#4ECDC4',
          50: '#F0FDFB',
          100: '#CCFBF5',
          200: '#99F3EA',
          300: '#4ECDC4',
          400: '#2CB3AA',
          500: '#1C938B',
          600: '#197872',
          700: '#1A605B',
          800: '#1A4D4A',
          900: '#193F3D'
        },
        accent: {
          DEFAULT: '#FFE66D',
          50: '#FEFCE8',
          100: '#FFF9C2',
          200: '#FFE66D',
          300: '#FFD43B',
          400: '#FABE0B',
          500: '#F59F00',
          600: '#E67700',
          700: '#BF5600',
          800: '#9A4200',
          900: '#7E3600'
        }
      }
    }
  },
  plugins: []
}
```

### 4.3 CSSファイルの作成
assets/css/main.css を作成:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4.4 Nuxt設定ファイルの更新
nuxt.config.ts を作成:
```typescript
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss',
    '@vee-validate/nuxt'
  ],
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL
    }
  }
})
```

## 5. プロジェクト構造の作成

### 5.1 ディレクトリ構造の作成
```bash
mkdir -p components/base
mkdir -p components/layout
mkdir -p components/ui
mkdir -p composables
mkdir -p layouts
mkdir -p middleware
mkdir -p pages
mkdir -p plugins
mkdir -p stores
mkdir -p types
mkdir -p utils
```

## 6. リンター・フォーマッターの設定

### 6.1 ESLint設定
プロジェクトのルートに`.eslintrc.cjs`ファイルを作成:
```javascript
const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended',
    'prettier'
  ],
  plugins: [],
  rules: {
    // 基本ルール
    'vue/multi-word-component-names': 'off',
    'no-console': isProduction ? 'error' : 'warn',
    'no-debugger': isProduction ? 'error' : 'warn',
    
    // TypeScript関連
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // 論理演算子の簡略化
    'no-extra-boolean-cast': 'error',
    
    'vue/no-v-html': 'off'
  }
}
```

`.eslintignore`ファイルを作成:
```plaintext
node_modules
dist
.nuxt
.output
```

### 6.2 Prettier設定
`.prettierrc`ファイルを作成:
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none",
  "printWidth": 100,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": true
}
```

`.prettierignore`ファイルを作成:
```plaintext
node_modules
dist
.nuxt
.output
public
```

### 6.3 VSCode設定
`.vscode/settings.json`ファイルを作成:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.eol": "\n",
  "files.associations": {
    "*.css": "postcss"
  }
}
```

## 7. package.jsonのスクリプト更新
package.jsonのscriptsセクションを以下のように更新:
```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "lint": "eslint . --ext .vue,.js,.ts",
    "lint:fix": "eslint . --ext .vue,.js,.ts --fix",
    "type-check": "vue-tsc --noEmit"
  }
}
```

## 8. 動作確認

1. **すべてのコンテナを再起動**
```bash
docker compose restart
```

2. **ブラウザで動作確認**
```
http://localhost:3000
```

## 9. 注意点
- テストの設定と実装は、基本機能の実装後に行います
- コンポーネントやストア、APIクライアントなどの実装は、この環境構築後に順次進めていきます
- 実装段階で必要に応じて追加のパッケージをインストールします