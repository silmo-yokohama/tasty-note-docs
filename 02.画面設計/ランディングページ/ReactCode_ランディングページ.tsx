import React from 'react';
import { UtensilsCrossed, Heart, Share2, Smartphone, Map, Instagram, Twitter, Facebook } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="fixed w-full bg-white/90 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <nav className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-8 h-8 text-[#FF6B6B]" />
              <span className="text-2xl font-bold text-[#2C363F]">TastyNote</span>
            </div>

            <div className="flex items-center gap-4">
              <button className="px-4 py-2 border-2 border-[#4ECDC4] text-[#4ECDC4] hover:bg-[#4ECDC4] hover:text-white rounded-lg transition-colors">
                ログイン
              </button>
              <button className="px-4 py-2 bg-[#FF6B6B] text-white hover:bg-[#ff5252] rounded-lg transition-colors">
                新規登録
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1525268323446-0505b6fe7778?auto=format&fit=crop&q=80"
            alt="居酒屋の雰囲気"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2C363F]/95 via-[#2C363F]/90 to-[#2C363F]/85" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              あなたの
              <span className="text-[#FF6B6B] relative">
                美味しい記録
                <svg className="absolute w-full h-3 -bottom-2 left-0 text-[#FF6B6B]/20" viewBox="0 0 200 8">
                  <path d="M0 4C50 4 50 1 100 1C150 1 150 7 200 7" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
              </span>
              を、
              <br />もっと価値あるものに
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              お気に入りのお店を記録して共有できる、
              <br className="hidden md:block" />
              あなただけのグルメガイド
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#ff5252] transition-all transform hover:scale-105 flex items-center justify-center gap-2 group shadow-lg shadow-[#FF6B6B]/20">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                コレクションを始める
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-lg hover:bg-white/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2 group">
                <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                使い方を見る
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* アプリ紹介セクション */}
      <section className="py-20 bg-gradient-to-b from-white to-[#4ECDC4]/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2C363F] mb-4">
              シンプルで使いやすい
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              直感的な操作で、すぐに使い始められます
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="bg-[#FF6B6B]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Smartphone className="w-8 h-8 text-[#FF6B6B]" />
              </div>
              <h3 className="text-xl font-bold text-[#2C363F]">簡単操作</h3>
              <p className="text-gray-600">
                スマートフォンに最適化された
                インターフェースで、
                直感的に操作できます
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-[#4ECDC4]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Map className="w-8 h-8 text-[#4ECDC4]" />
              </div>
              <h3 className="text-xl font-bold text-[#2C363F]">マップ表示</h3>
              <p className="text-gray-600">
                地図上で視覚的にお店を管理。
                場所の記憶と紐づけて
                思い出を残せます
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-[#FFE66D]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-[#FFE66D]" />
              </div>
              <h3 className="text-xl font-bold text-[#2C363F]">コレクション</h3>
              <p className="text-gray-600">
                目的やシーンに合わせて
                お気に入りのお店を
                自由にグループ化
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-[#2C363F] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <UtensilsCrossed className="w-8 h-8 text-[#FF6B6B]" />
              <span className="text-2xl font-bold">TastyNote</span>
            </div>
            <p className="text-gray-400 max-w-md">
              あなたの美味しい思い出を記録し、共有するためのグルメガイド
            </p>
          </div>

          <div className="flex flex-wrap justify-between items-center border-t border-gray-700 pt-8">
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-[#FF6B6B] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-[#FF6B6B] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-[#FF6B6B] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>

            <div className="flex gap-8 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a>
              <a href="#" className="hover:text-white transition-colors">利用規約</a>
              <a href="#" className="hover:text-white transition-colors">特定商取引法に基づく表記</a>
            </div>

            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} TastyNote
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}