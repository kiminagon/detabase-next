export default function WhaleCard({ whale }) {
    // 深度のバーの長さ (3000mを100%とする)
    const depthPercent = Math.min((whale.max_depth / 3000) * 100, 100);
  
    return (
      <div className="border border-gray-200 bg-white p-5 rounded-lg shadow-sm mb-4 hover:shadow-md transition">
        <div className="flex justify-between items-baseline border-b border-gray-100 pb-2 mb-3">
          <div>
            <h3 className="font-bold text-xl text-blue-900">{whale.name}</h3>
            <p className="text-xs text-gray-500 italic font-serif">
              {whale.scientific_name} <span className="not-italic text-gray-400">| {whale.family}</span>
            </p>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
            {whale.diet}食
          </span>
        </div>
  
        <div className="space-y-3">
          {/* 潜水能力バー */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">🌊 潜水深度</span>
              <span className="font-bold">{whale.max_depth}m</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${depthPercent}%` }}
              ></div>
            </div>
          </div>
  
          {/* 耐寒性能 */}
          <div className="flex justify-between text-sm items-center">
            <span className="text-gray-600">🌡️ 耐寒性能</span>
            <span className={`font-bold px-2 py-0.5 rounded ${whale.min_temp <= 0 ? 'bg-cyan-100 text-cyan-800' : 'bg-orange-100 text-orange-800'}`}>
              {whale.min_temp}℃ まで適応
            </span>
          </div>
        </div>
      </div>
    );
  }