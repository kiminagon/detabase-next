'use client';

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
  const [executedQuery, setExecutedQuery] = useState("");

  // 1. アプリ起動時にSQLデータベースを作成
  useEffect(() => {
    const loadDB = async () => {
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
      const database = new SQL.Database();

      // --- SQL: テーブル作成とデータ投入 ---
      database.run(`
        DROP TABLE IF EXISTS sea_areas;
        DROP TABLE IF EXISTS whales;

        CREATE TABLE sea_areas (id INTEGER, name TEXT, depth INTEGER, temp INTEGER, food TEXT);
        CREATE TABLE whales (id INTEGER, name TEXT, scientific_name TEXT, family TEXT, max_depth INTEGER, min_temp INTEGER, diet TEXT);

        -- 海域データ
        INSERT INTO sea_areas VALUES (1, '南極海 (Southern Ocean)', 200, -2, 'プランクトン');
        INSERT INTO sea_areas VALUES (2, '北大西洋 (North Atlantic)', 500, 5, '魚');
        INSERT INTO sea_areas VALUES (3, '熱帯太平洋 (Tropical Pacific)', 1000, 15, 'イカ');

        -- 鯨類データ
        INSERT INTO whales VALUES (1, 'シロナガスクジラ', 'Balaenoptera musculus', 'ナガスクジラ科', 500, -2, 'プランクトン');
        INSERT INTO whales VALUES (2, 'クロミンククジラ', 'Balaenoptera bonaerensis', 'ナガスクジラ科', 300, -5, 'プランクトン');
        INSERT INTO whales VALUES (3, 'ザトウクジラ', 'Megaptera novaeangliae', 'ナガスクジラ科', 400, -2, 'プランクトン');
        INSERT INTO whales VALUES (4, 'セミクジラ', 'Eubalaena japonica', 'セミクジラ科', 300, -5, 'プランクトン');

        INSERT INTO whales VALUES (5, 'ナガスクジラ', 'Balaenoptera physalus', 'ナガスクジラ科', 500, 0, '魚');
        INSERT INTO whales VALUES (6, 'シャチ (北洋型)', 'Orcinus orca', 'マイルカ科', 300, -2, '魚');
        INSERT INTO whales VALUES (7, 'ミンククジラ', 'Balaenoptera acutorostrata', 'ナガスクジラ科', 300, 0, '魚');
        INSERT INTO whales VALUES (8, 'イシイルカ', 'Phocoenoides dalli', 'ネズミイルカ科', 200, 2, '魚');

        INSERT INTO whales VALUES (9, 'マッコウクジラ', 'Physeter macrocephalus', 'マッコウクジラ科', 3000, 4, 'イカ');
        INSERT INTO whales VALUES (10, 'アカボウクジラ', 'Ziphius cavirostris', 'アカボウクジラ科', 2992, 4, 'イカ');
        INSERT INTO whales VALUES (11, 'コビレゴンドウ', 'Globicephala macrorhynchus', 'マイルカ科', 1000, 10, 'イカ');
        INSERT INTO whales VALUES (12, 'ハナゴンドウ', 'Grampus griseus', 'マイルカ科', 600, 10, 'イカ');
      `);
      // -------------------------------------

      setDb(database);

      const res = database.exec("SELECT * FROM sea_areas");
      if (res.length > 0) {
        const rows = res[0].values.map(row => ({
          id: row[0], name: row[1], depth: row[2], temp: row[3], food: row[4]
        }));
        setAreas(rows);
      }
    };
    loadDB();
  }, []);

  // 2. 検索処理
  const handleSearch = () => {
    if (!db || !selectedAreaId) return;

    const area = areas.find(a => a.id == selectedAreaId);
    setCurrentArea(area);

    const queryStr = `SELECT * FROM whales 
WHERE max_depth >= ${area.depth} 
AND min_temp <= ${area.temp} 
AND diet = '${area.food}'
ORDER BY max_depth DESC;`;

    setExecutedQuery(queryStr);

    const res = db.exec(queryStr);
    
    if (res.length > 0) {
      const matchedWhales = res[0].values.map(row => ({
        id: row[0], 
        name: row[1], 
        scientific_name: row[2],
        family: row[3],
        max_depth: row[4], 
        min_temp: row[5], 
        diet: row[6]
      }));
      setResults(matchedWhales);
    } else {
      setResults([]);
    }
  };

  if (!db) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl font-bold text-blue-600">
          データベース構築中...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-grow container mx-auto p-4 max-w-2xl">
        <div className="bg-white p-6 rounded shadow-sm my-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">調査海域選択</h2>
          
          <select 
            className="w-full p-3 border border-gray-300 rounded mb-4 text-base"
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
          >
            <option value="">海域を選択してください</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>

          <button 
            onClick={handleSearch}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition"
          >
            生息条件を照合 (SQL実行)
          </button>

          {/* SQLログ表示エリア（シンプル版） */}
          {executedQuery && (
            <div className="mt-6 bg-gray-900 text-green-400 p-4 rounded font-mono text-xs overflow-x-auto">
              <pre>{executedQuery}</pre>
            </div>
          )}
        </div>

        {/* 結果表示エリア */}
        {currentArea && (
          <div>
            <div className="mb-6 p-4 bg-gray-100 rounded text-sm text-gray-700 border border-gray-300">
              <p className="font-bold text-gray-900 mb-1">[{currentArea.name}] 環境パラメータ:</p>
              <ul className="list-disc list-inside">
                <li>水圧条件: 水深 {currentArea.depth}m 以上</li>
                <li>水温条件: {currentArea.temp}℃ 以下</li>
                <li>生物資源: {currentArea.food}</li>
              </ul>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">適合鯨類一覧</h3>
            
            {results.length > 0 ? (
              results.map(whale => <WhaleCard key={whale.id} whale={whale} />)
            ) : (
              <p className="text-red-600 font-bold p-4 border border-red-200 bg-red-50 rounded">
                条件不適合: この環境に適応可能な種はデータベースに存在しません。
              </p>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}