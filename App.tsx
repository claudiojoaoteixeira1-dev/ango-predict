import React, { useState, useEffect } from 'react';
import { getGeminiPrediction } from './services/geminiService';
import { AppMode, PredictionResult } from './types';
import { ResultCard } from './components/ResultCard';
import MatrixRain from './components/MatrixRain';

// SVG Icons
const PlaneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="m22 12-5-5"/><path d="m22 12-5 5"/><path d="M22 2 2 22"/><path d="M2 2 22 22"/></svg>
); 
const MagicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M7 3v4"/><path d="M3 5h4"/><path d="M3 9h4"/><path d="M3 7h4"/></svg>
);
const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.956-2.971 3.005v.97h4.438l-.602 3.667h-3.836v7.98h-4.843Z"/></svg>
);
const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
);
const PowerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
);

const App: React.FC = () => {
  // Lock State - Initialized from LocalStorage
  const [isLocked, setIsLocked] = useState(() => {
    // Check if session is already unlocked
    const savedSession = localStorage.getItem('angoPredict_unlocked');
    return savedSession !== 'true';
  });

  const [visitedLinks, setVisitedLinks] = useState(() => {
    // Restore visited links status so user doesn't have to click again on refresh
    const savedLinks = localStorage.getItem('angoPredict_visited');
    return savedLinks ? JSON.parse(savedLinks) : { page: false, profile: false, whatsapp: false };
  });

  const [activationCode, setActivationCode] = useState('');
  const [codeError, setCodeError] = useState('');

  // App State
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const socialUrls = {
    page: "https://www.facebook.com/share/17ynoTSFkn/",
    profile: "https://www.facebook.com/share/1KdMrfCqd3/",
    whatsapp: "https://wa.me/244933177470?text=Kota%20manda%20o%20código%20do%20AngoPredict!"
  };

  const handleSocialClick = (type: 'page' | 'profile' | 'whatsapp') => {
    window.open(socialUrls[type], '_blank');
    setVisitedLinks(prev => {
      const newState = { ...prev, [type]: true };
      // Save visited state to persistence
      localStorage.setItem('angoPredict_visited', JSON.stringify(newState));
      return newState;
    });
  };

  const handleUnlockAttempt = () => {
    if (activationCode.trim() === '933177470') {
      setIsLocked(false);
      // Persist the unlocked state
      localStorage.setItem('angoPredict_unlocked', 'true');
      setCodeError('');
    } else {
      setCodeError('Código incorreto. Clica no WhatsApp para pedir.');
      setActivationCode('');
    }
  };

  const handleLogout = () => {
    // Remove the unlocked flag from storage
    localStorage.removeItem('angoPredict_unlocked');
    setIsLocked(true);
    setMode(AppMode.HOME);
    setResult(null);
  };

  const handlePredict = async (selectedMode: 'AVIATOR' | 'ORACLE') => {
    setLoading(true);
    // Simulate a "hacking/connecting" delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const prompt = selectedMode === 'AVIATOR' 
      ? `Prevê a próxima vela do Aviator. O user diz: "${inputText || 'Gera uma vela aleatória'}"` 
      : `O user pergunta: "${inputText}". Dá uma previsão angolana.`;

    const data = await getGeminiPrediction(prompt, selectedMode);
    setResult(data);
    setLoading(false);
  };

  const renderLockScreen = () => {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-md px-6 space-y-6 animate-fade-in text-center my-4">
        <div className="space-y-2">
          <div className="inline-block p-3 rounded-full bg-gray-800 border border-gray-700 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ango-red"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Sistema Bloqueado</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Segue os passos e insere o <span className="text-ango-yellow font-bold">Código VIP</span> para liberar o AngoPredict.
          </p>
        </div>

        <div className="w-full space-y-3">
          <button 
            onClick={() => handleSocialClick('page')}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-sm ${visitedLinks.page ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-[#1877F2] border-[#1877F2] text-white hover:bg-[#166fe5]'}`}
          >
            <div className="flex items-center gap-3">
              <FacebookIcon />
              <span className="font-bold">1. Curtir Página (FB)</span>
            </div>
            {visitedLinks.page && <span className="text-xs font-bold">FEITO</span>}
          </button>

          <button 
            onClick={() => handleSocialClick('profile')}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-sm ${visitedLinks.profile ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'}`}
          >
            <div className="flex items-center gap-3">
              <FacebookIcon />
              <span className="font-bold">2. Seguir Perfil (FB)</span>
            </div>
            {visitedLinks.profile && <span className="text-xs font-bold">FEITO</span>}
          </button>

          <button 
            onClick={() => handleSocialClick('whatsapp')}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-sm ${visitedLinks.whatsapp ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-[#25D366] border-[#25D366] text-white hover:bg-[#22bf5b]'}`}
          >
            <div className="flex items-center gap-3">
              <WhatsAppIcon />
              <span className="font-bold">3. Pedir Código (Zap)</span>
            </div>
            {visitedLinks.whatsapp && <span className="text-xs font-bold">FEITO</span>}
          </button>
        </div>

        <div className="w-full pt-4 border-t border-gray-800 space-y-3">
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Código de Ativação</label>
            <input 
              type="text" 
              inputMode="numeric"
              value={activationCode}
              onChange={(e) => { setActivationCode(e.target.value); setCodeError(''); }}
              placeholder="Digite o código aqui..."
              className={`w-full bg-telegram-card border-2 ${codeError ? 'border-red-500 animate-pulse' : 'border-gray-700 focus:border-ango-yellow'} text-white rounded-xl p-4 outline-none transition-colors font-mono text-center text-lg tracking-widest placeholder-gray-600`}
            />
            {codeError && <p className="text-red-500 text-xs font-bold text-center mt-1">{codeError}</p>}
          </div>

          <button
            onClick={handleUnlockAttempt}
            className="w-full py-4 rounded-xl font-black text-lg uppercase tracking-wide transition-all shadow-lg bg-gradient-to-r from-ango-red to-red-600 text-white hover:scale-105 cursor-pointer shadow-red-900/30 active:scale-95"
          >
            ATIVAR SISTEMA 🔓
          </button>
        </div>
      </div>
    );
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center w-full max-w-md px-4 space-y-6 animate-fade-in relative">
      {/* Header with Logout */}
      <div className="absolute top-0 right-0 w-full flex justify-end p-2 z-20">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all"
        >
          <span>Sair</span>
          <PowerIcon />
        </button>
      </div>

      <div className="text-center space-y-2 mt-8">
        <div className="inline-block p-2 rounded-full bg-ango-red/20 border border-ango-red mb-2">
          <span className="text-ango-red font-bold text-xs tracking-widest uppercase px-2">Versão 2.0 AO</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Kizua<span className="text-ango-red">Predict</span>
        </h1>
        <p className="text-gray-400 text-sm">A Inteligência Artificial mais <span className="text-ango-yellow font-bold">mwangolé</span> do Telegram.</p>
      </div>

      <div className="w-full grid grid-cols-2 gap-4 mt-8">
        <button 
          onClick={() => setMode(AppMode.AVIATOR)}
          className="group relative overflow-hidden bg-gradient-to-br from-gray-800 to-black border border-gray-700 p-6 rounded-2xl flex flex-col items-center gap-4 hover:border-ango-red transition-all active:scale-95"
        >
          <div className="absolute inset-0 bg-ango-red/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-ango-red rounded-full text-white shadow-[0_0_15px_rgba(204,9,47,0.5)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="font-bold text-white">Aviator / Crash</span>
        </button>

        <button 
          onClick={() => setMode(AppMode.ORACLE)}
          className="group relative overflow-hidden bg-gradient-to-br from-gray-800 to-black border border-gray-700 p-6 rounded-2xl flex flex-col items-center gap-4 hover:border-ango-yellow transition-all active:scale-95"
        >
          <div className="absolute inset-0 bg-ango-yellow/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-ango-yellow rounded-full text-black shadow-[0_0_15px_rgba(255,203,0,0.5)]">
            <MagicIcon />
          </div>
          <span className="font-bold text-white">Oráculo Geral</span>
        </button>
      </div>

      <div className="mt-8 p-4 bg-black/50 backdrop-blur-md rounded-xl border border-gray-800 text-center w-full">
        <p className="text-xs text-gray-500">
          ⚠️ O mambo é só previsão. Joga com responsabilidade wi. Não gasta o dinheiro do leite.
        </p>
      </div>
    </div>
  );

  const renderInput = () => (
    <div className="w-full max-w-md px-4 flex flex-col h-full justify-between pb-6 animate-fade-in-right">
      <div className="mt-4">
        <button 
          onClick={() => { setMode(AppMode.HOME); setInputText(''); setResult(null); }}
          className="text-gray-400 flex items-center gap-2 mb-6 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Voltar
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">
          {mode === AppMode.AVIATOR ? 'Analisar Vela' : 'Pergunta ao Kota'}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {mode === AppMode.AVIATOR 
            ? 'O sistema vai analisar o padrão dos últimos voos.' 
            : 'Manda a tua boca. O Kota sabe tudo.'}
        </p>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-ango-red to-ango-yellow rounded-xl opacity-50 group-focus-within:opacity-100 transition duration-500 blur"></div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={mode === AppMode.AVIATOR ? "Ex: Tá a pagar mal agora..." : "Ex: O Petro ganha hoje?"}
            className="relative w-full bg-telegram-card text-white p-4 rounded-xl outline-none border border-transparent focus:border-white/20 transition-all placeholder-gray-600 resize-none h-32"
          />
        </div>
      </div>

      <button
        onClick={() => handlePredict(mode as 'AVIATOR' | 'ORACLE')}
        disabled={loading}
        className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-wide transition-all transform active:scale-95 shadow-lg
          ${mode === AppMode.AVIATOR 
            ? 'bg-gradient-to-r from-ango-red to-red-800 text-white shadow-red-900/20' 
            : 'bg-gradient-to-r from-ango-yellow to-yellow-600 text-black shadow-yellow-900/20'}
          ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'}
        `}
      >
        {loading ? 'Processando...' : 'PREVER AGORA'}
      </button>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center space-y-8 animate-pulse">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-ango-red rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-4 border-4 border-ango-yellow rounded-full border-b-transparent animate-spin-slow"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🇦🇴</span>
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-white">A contactar a Central...</h3>
        <p className="text-sm text-ango-yellow font-mono">
           {mode === AppMode.AVIATOR ? 'Desencriptando Algoritmo...' : 'Lendo os Búzios Digitais...'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-sans overflow-hidden bg-telegram-bg relative">
      <MatrixRain />
      
      {/* Decorative Blur Blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-ango-red/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-ango-yellow/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Main Container */}
      <div className="w-full h-full min-h-screen md:h-auto md:min-h-[600px] md:max-w-md md:border md:border-gray-800 md:rounded-3xl md:bg-black/80 backdrop-blur-xl relative flex flex-col">
        
        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
          {loading ? (
            renderLoading()
          ) : isLocked ? (
            renderLockScreen()
          ) : result ? (
            <ResultCard data={result} onReset={() => { setResult(null); setInputText(''); }} />
          ) : mode === AppMode.HOME ? (
            renderHome()
          ) : (
            renderInput()
          )}
        </div>

      </div>
    </div>
  );
};

export default App;