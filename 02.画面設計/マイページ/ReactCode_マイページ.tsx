import React, { useState } from 'react';
import { Menu, MapPin, Search, User, X, Plus } from 'lucide-react';

const MapViewLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-screen relative">
      {/* マップ（フルスクリーン） */}
      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
        <MapPin size={32} className="text-gray-400" />
        <span className="ml-2 text-gray-500">Map Area</span>
      </div>

      {/* ヘッダー（オーバーレイ） */}
      <header className="absolute top-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-sm shadow-sm flex items-center px-4 justify-between z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
          {/* PCのみロゴを表示 */}
          <h1 className="hidden md:block font-bold text-xl">グルメコンパス</h1>
        </div>
        
        {/* 検索バー */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="店舗を検索..."
              className="w-full px-4 py-2 pl-10 border rounded-lg bg-white/90 backdrop-blur-sm"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <User size={20} />
        </button>
      </header>

      {/* サイドバー（モバイル：フルスクリーン / PC：オーバーレイ） */}
      {isSidebarOpen && (
        <div className="absolute inset-0 bg-black/20 z-30" onClick={() => setIsSidebarOpen(false)} />
      )}
      <aside 
        className={`
          absolute top-0 left-0 z-40 h-full
          md:w-80 w-full
          bg-white shadow-lg
          transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* モバイルのみヘッダーを表示 */}
          <div className="md:hidden flex items-center justify-between p-4 border-b">
            <h1 className="font-bold text-xl">グルメコンパス</h1>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* タブナビゲーション */}
          <div className="flex border-b">
            <button className="flex-1 px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
              フォルダ
            </button>
            <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
              店舗一覧
            </button>
          </div>

          {/* スクロール可能なコンテンツエリア */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <div className="font-medium">お気に入り店舗</div>
                <div className="text-sm text-gray-500">12店舗</div>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="p-4 border-t">
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              新規フォルダ作成
            </button>
          </div>
        </div>
      </aside>

      {/* モバイル用フローティングアクションボタン */}
      <button className="md:hidden fixed right-4 bottom-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-20 hover:bg-blue-700">
        <Plus size={24} />
      </button>
    </div>
  );
};

export default MapViewLayout;
