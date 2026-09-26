import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BadgeIA } from '../components/ui/BadgeIA';
import { formatFCFA } from '../types';
import {
  Sparkles,
  Send,
  MessageSquare,
  Bot,
  User,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FileText,
  Boxes,
  ShieldCheck
} from 'lucide-react';

export const IAPage: React.FC = () => {
  const { aiMessages, sendAIMessage, navigate, lowStockCount, treasuryAccounts } = useApp();
  const [input, setInput] = useState('');

  const quickChips = [
    'Générer bon de commande Dangote',
    'Auditer les impayés clients > 15 jours',
    'Calculer la marge globale par famille',
    'Préparer déclaration TVA OHADA'
  ];

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim()) return;
    sendAIMessage(q);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* LEFT PANEL: Chat History & Topics */}
      <div className="hidden md:flex w-64 shrink-0 flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-slate-900 dark:text-white font-display">
              Sessions Stratégiques
            </span>
          </div>
          <BadgeIA size="sm" label="✦" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 text-xs">
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 font-semibold cursor-pointer">
            Session Actuelle : BatiCam Douala
            <span className="block text-[10px] text-blue-600 dark:text-blue-400 font-normal mt-0.5">
              Septembre 2026
            </span>
          </div>

          <div className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition-colors">
            Audit Fraude Caisse Akwa
            <span className="block text-[10px] text-slate-400 mt-0.5">Hier à 18h20</span>
          </div>

          <div className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition-colors">
            Prévisionnel DSF OHADA 2026
            <span className="block text-[10px] text-slate-400 mt-0.5">Il y a 3 jours</span>
          </div>

          <div className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition-colors">
            Négociation Tarif Fer Prometal
            <span className="block text-[10px] text-slate-400 mt-0.5">18 Septembre</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
          ✦ Les réponses s appuient directement sur votre comptabilité OHADA et votre catalogue.
        </div>
      </div>

      {/* CENTER PANEL: Conversational Core */}
      <div className="flex-1 flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs">
        {/* Chat Header */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Assistant GestCam IA
                </span>
                <span className="text-[10px] text-purple-600 font-mono font-bold bg-purple-100 dark:bg-purple-950 px-1.5 py-0.2 rounded-sm">
                  ✦ Claude 3.7 Sonnet
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Spécialisé en fiscalité camerounaise, réconciliation MoMo et gestion de stock.
              </p>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {aiMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'gestcam_ai' && (
                <div className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.text}

                {/* Suggestion Chips inside bot bubble */}
                {msg.chips && msg.chips.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-1.5">
                    {msg.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(chip)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors cursor-pointer text-left"
                      >
                        {chip} →
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  MK
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Suggestion Chips bar */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] text-slate-400 font-semibold uppercase shrink-0">
            Sujets rapides :
          </span>
          {quickChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez une question sur vos marges, vos stocks ou votre trésorerie..."
              className="flex-1 resize-none bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 transition-all cursor-pointer shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Live Action Widgets */}
      <div className="hidden lg:flex w-72 shrink-0 flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Actions Déclenchables
        </h3>

        <div className="space-y-3 text-xs">
          {/* Action 1: Stock refill */}
          <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
              <Boxes className="w-4 h-4" />
              <span>Commande Dangote</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Stock critique : 8 sacs restants.
            </p>
            <button
              onClick={() => navigate('/stocks')}
              className="w-full py-1.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-50"
            >
              Ouvrir le bon d entrée →
            </button>
          </div>

          {/* Action 2: WhatsApp dunning */}
          <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4" />
              <span>Relance Mokolo</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Créance échue : 1 041 745 FCFA (+20 jours).
            </p>
            <button
              onClick={() => navigate('/facturation')}
              className="w-full py-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-50"
            >
              Voir la facture échue →
            </button>
          </div>

          {/* Action 3: Tax report */}
          <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Déclaration TVA CIME 1</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Prêt pour le 15 du mois (689 228 FCFA collectés).
            </p>
            <button
              onClick={() => navigate('/parametres')}
              className="w-full py-1.5 text-[11px] font-semibold text-blue-800 dark:text-blue-300 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50"
            >
              Vérifier les barèmes →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
