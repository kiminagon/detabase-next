'use client'; // ブラウザ側で動かすおまじない

import { useState, useEffect } from 'react';
import initSqlJs from 'sql.js';
import Header from './components/Header';
import Footer from './components/Footer';
import WhaleCard from './components/WhaleCard';

export default function Home() {
  const [db, setDb] = useState(null);
  const [areas, setAreas] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [results, setResults] = useState([]);
  const [currentArea, setCurrentArea] = useState(null);

  // 1. アプリ起動時にSQLデータベースを作成
  useEffect(() => {
    const loadDB = async () => {
      // SQL.jsの読み込み (CDNからWASMを取得)
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
      const database = new SQL.Database();

      // --- SQL: テーブル作成とデータ投入 ---
      database.run(`
        CREATE TABLE sea_areas (id INTEGER, name TEXT, depth INTEGER, temp INTEGER, food TEXT);
        CREATE TABLE whales (id INTEGER, name TEXT, max_depth INTEGER, min_temp INTEGER, diet TEXT);

        INSERT INTO sea_areas VALUES 
          (1, '北極海', 300, -2, 'プランクトン'),
          (2, 'マリアナ海溝', 1000, 4, 'イカ'),
          (3, '東京湾', 10, 15, '魚');

        INSERT INTO whales VALUES 
          (1, 'マッコウクジラ', 3000, 4, 'イカ'),
          (2, 'ホッキョククジラ', 500, -5, 'プランクトン'),
          (3, 'バンドウイルカ', 50, 10, '魚'),
          (4, 'シロナガスクジラ', 500, 5, 'プランクトン');
      `);
      // -------------------------------------

      setDb(database);

      // 海域リストを取得して選択肢に入れる
      const res = database.exec("SELECT * FROM sea_areas");
      if (res.length > 0) {
        // 結果を使いやすい形(オブジェクトの配列)に変換
        const rows = res[0].values.map(row => ({
          id: row[0], name: row[1], depth: row[2], temp: row[3], food: row[4]
        }));
        setAreas(rows);
      }
    };
    loadDB();
  }, []);

  // 2. 検索ボタンを押したときの処理 (SQLで照合)
  const handleSearch = () => {
    if (!db || !selectedAreaId) return;

    // 選ばれた海域の情報を取得
    const area = areas.find(a => a.id == selectedAreaId);
    setCurrentArea(area);

    // 【重要】 ここでSQLを使って条件に合うクジラを検索！
    const query = `
      SELECT * FROM whales 
      WHERE max_depth >= ${area.depth} 
      AND min_temp <= ${area.temp} 
      AND diet = '${area.food}'
    `;
    
    const res = db.exec(query);
    
    if (res.length > 0) {
      const matchedWhales = res[0].values.map(row => ({
        id: row[0], name: row[1], max_depth: row[2], min_temp: row[3], diet: row[4]
      }));
      setResults(matchedWhales);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-grow container mx-auto p-4 max-w-2xl">
        {/* コントロールパネル */}
        <div className="bg-white p-6 rounded-xl shadow-md my-6 text-center">
          <h2 className="text-lg font-bold text-gray-700 mb-4">調査海域を選択</h2>
          
          <select 
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-lg"
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
          >
            <option value="">-- 海域を選択 --</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>

          <button 
            onClick={handleSearch}
            disabled={!db}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            🔍 生息条件を照合 (SQL実行)
          </button>
        </div>

        {/* 結果表示エリア */}
        {currentArea && (
          <div className="animate-fade-in">
            <div className="mb-6 p-4 bg-gray-200 rounded-lg text-sm text-gray-700">
              <p><strong>[{currentArea.name}] の要求スペック:</strong></p>
              <p>深度 {currentArea.depth}m以上 / 水温 {currentArea.temp}℃以下 / 餌: {currentArea.food}</p>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4">🐋 適合した鯨類</h3>
            
            {results.length > 0 ? (
              results.map(whale => <WhaleCard key={whale.id} whale={whale} />)
            ) : (
              <p className="text-red-500 font-bold text-center bg-red-50 p-4 rounded">
                この過酷な環境に適合できる鯨類はいません。
              </p>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}