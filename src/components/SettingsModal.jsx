import React, { useState } from 'react';
import { X, Save, Database, Cloud, Globe, Bell, Copy, Check, ExternalLink, HelpCircle, ShieldCheck } from 'lucide-react';
import { kdsStorage } from '../services/supabase';

export default function SettingsModal({ isOpen, onClose, onSaveSuccess }) {
  if (!isOpen) return null;

  const currentConfig = kdsStorage.getConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.supabaseUrl);
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.supabaseKey);
  const [goomerToken, setGoomerToken] = useState(currentConfig.goomerToken);
  const [warningMin, setWarningMin] = useState(currentConfig.warningMin);
  const [urgentMin, setUrgentMin] = useState(currentConfig.urgentMin);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const webhookExampleUrl = `${window.location.origin}/api/goomer-webhook`;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookExampleUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    kdsStorage.saveConfig({
      supabaseUrl,
      supabaseKey,
      goomerToken,
      warningMin,
      urgentMin
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSaveSuccess();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">Configurações & Integração Goomer</h2>
              <p className="text-xs text-slate-400">Conecte ao Supabase e coloque seu KDS online 24/7 na nuvem</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSave} className="p-5 space-y-5 overflow-y-auto flex-1 text-slate-200">
          
          {/* Webhook Goomer URL Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-850 to-slate-900 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> URL do Webhook para cadastrar no Painel Goomer
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded">ONLINE 24H</span>
            </div>
            <p className="text-xs text-slate-400">
              Cole este link no portal do <strong>Goomer (Configurações ➔ API / Webhooks)</strong> para que os pedidos entrem automaticamente no seu KDS:
            </p>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={webhookExampleUrl} 
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 select-all"
              />
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedUrl ? 'Copiado!' : 'Copiar URL'}
              </button>
            </div>
          </div>

          {/* Supabase Database Cloud */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-400" /> Credenciais Supabase (Banco de Dados Cloud Gratuito)
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Supabase Project URL</label>
              <input 
                type="text" 
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xxxxxxxx.supabase.co"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Supabase Anon Key</label>
              <input 
                type="password" 
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhYmdj..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Timers & Alerts Settings */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-400" /> Alertas de Tempo de Cozinha (Minutos)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-amber-400 mb-1">Tempo de Alerta (Amarelo)</label>
                <input 
                  type="number"
                  min="1"
                  max="60"
                  value={warningMin}
                  onChange={(e) => setWarningMin(parseInt(e.target.value) || 10)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold"
                />
                <span className="text-[10px] text-slate-500">Padrão: 10 minutos</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-red-400 mb-1">Tempo Urgente (Pulsante)</label>
                <input 
                  type="number"
                  min="2"
                  max="120"
                  value={urgentMin}
                  onChange={(e) => setUrgentMin(parseInt(e.target.value) || 20)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold"
                />
                <span className="text-[10px] text-slate-500">Padrão: 20 minutos</span>
              </div>
            </div>
          </div>

        </form>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
            {savedSuccess && <ShieldCheck className="w-4 h-4" />}
            {savedSuccess ? 'Configurações salvas com sucesso!' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
            >
              Fechar
            </button>
            <button 
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Salvar Alterações
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
