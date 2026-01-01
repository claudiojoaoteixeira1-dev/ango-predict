import React from 'react';
import { PredictionResult } from '../types';

interface ResultCardProps {
  data: PredictionResult;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data, onReset }) => {
  const borderColor = 
    data.color === 'green' ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' :
    data.color === 'red' ? 'border-ango-red shadow-[0_0_20px_rgba(204,9,47,0.3)]' :
    'border-ango-yellow shadow-[0_0_20px_rgba(255,203,0,0.3)]';

  const textColor = 
    data.color === 'green' ? 'text-green-400' :
    data.color === 'red' ? 'text-red-500' :
    'text-yellow-400';

  return (
    <div className={`w-full max-w-md bg-telegram-card border-2 ${borderColor} rounded-2xl p-6 flex flex-col items-center animate-fade-in-up transition-all relative overflow-hidden`}>
      
      {/* Background Grid Pattern for Tech Feel */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
      </div>

      {/* Header Info: Timestamp & Label */}
      <div className="w-full flex justify-between items-center border-b border-gray-700/50 pb-3 mb-4 z-10">
        <div className="flex flex-col">
           <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Entrada: {data.timestamp}</span>
           <span className="text-xs font-bold text-ango-yellow tracking-wider mt-1 uppercase">{data.platform}</span>
        </div>
        <div className="text-right">
           <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block">Confiança</span>
           <span className={`text-sm font-bold ${data.color === 'green' ? 'text-green-400' : data.color === 'red' ? 'text-red-400' : 'text-yellow-400'}`}>
              {data.confidence}%
           </span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="w-full h-1.5 bg-gray-800 rounded-full mb-6 overflow-hidden z-10">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${data.color === 'red' ? 'bg-ango-red' : data.color === 'green' ? 'bg-green-500' : 'bg-ango-yellow'}`} 
          style={{ width: `${data.confidence}%` }}
        ></div>
      </div>

      {/* Main Prediction */}
      <div className="text-center mb-6 z-10">
        {data.multiplier && (
           <div className={`text-7xl font-black mb-2 ${textColor} drop-shadow-lg tracking-tighter`}>
             {data.multiplier}
           </div>
        )}
        <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{data.prediction}</h2>
        <p className="text-gray-400 italic font-medium">"{data.slangQuote}"</p>
      </div>

      {/* Provably Fair Section (Technical Look) */}
      <div className="w-full bg-black/40 border border-gray-700/50 rounded-lg p-3 mb-6 z-10">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Provably Fair Seed</span>
            </div>
            <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] text-green-500 font-bold uppercase">Sincronizado</span>
            </div>
        </div>
        <code className="block text-[9px] text-gray-500 font-mono break-all leading-tight bg-black/20 p-1.5 rounded border border-gray-800/50">
            {data.serverSeed}
        </code>
        <div className="mt-2 text-[10px] text-gray-400 text-center border-t border-gray-800 pt-1.5">
            Algoritmo compatível com <span className="text-white font-bold">{data.platform}</span>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={onReset}
        className="w-full py-4 bg-white text-black font-extrabold rounded-xl hover:bg-gray-200 transition-colors active:scale-95 z-10 shadow-lg"
      >
        NOVA ENTRADA
      </button>
    </div>
  );
};