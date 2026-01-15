export default function WhaleCard({ whale }) {
    return (
      <div className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-r-lg shadow-sm mb-3">
        <h3 className="font-bold text-lg text-blue-900"> {whale.name}</h3>
        <div className="text-sm text-gray-700 mt-1 space-y-1">
          <p> 潜水能力: <span className="font-semibold">{whale.max_depth}m</span></p>
          <p> 耐寒性能: <span className="font-semibold">{whale.min_temp}℃</span></p>
          <p> 食性: {whale.diet}</p>
        </div>
      </div>
    );
  }