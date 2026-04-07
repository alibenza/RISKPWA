// src/components/AIChatRoom.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, RefreshCw, BrainCircuit, AlertCircle, CheckCheck, Loader2 } from 'lucide-react';
import { useInspectionStore } from '../hooks/useInspectionStore';

const AIChatRoom = () => {
  const { 
    chatHistory, 
    addChatMessage, 
    responses, 
    smpData, 
    clearChat, 
    setSmpData,
    questionsConfig
  } = useInspectionStore();
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationDone, setValidationDone] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory, isTyping]);

  const getCleanContextAsText = () => {
    try {
      const observations = Object.entries(responses)
        .filter(([_, r]) => r && (r.comment?.trim().length > 2 || r.score <= 2))
        .map(([id, r]) => {
          const section = questionsConfig.find(s => s.questions.some(q => q.id === id));
          const question = section?.questions.find(q => q.id === id);
          return `- ${section?.title} > ${question?.label}: Score ${r.score}/5${r.comment ? ` - ${r.comment.substring(0, 300)}` : ''}`;
        });
      return observations.length > 0 ? observations.join('\n') : 'Aucune donnée terrain disponible.';
    } catch {
      return 'Erreur lors du traitement des données.';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const currentMessage = input.trim();
    setErrorStatus(null);
    setIsTyping(true);
    setInput('');
    setValidationDone(false);
    
    addChatMessage({ role: 'user', content: currentMessage });

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error('Clé API manquante.');

      const cleanHistory = chatHistory.slice(-6).map(({ role, content }) => ({
        role: role === 'assistant' ? 'assistant' : 'user',
        content: String(content),
      }));

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${apiKey}` 
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `Tu es l'Expert Senior IARD CIAR. Contexte terrain :\n${getCleanContextAsText()}\n\nValeurs SMP actuelles : ${JSON.stringify(smpData?.valeurs || {})}\n\nTu aides à définir le scénario de sinistre maximum probable (SMP) et les valeurs assurables. Sois précis et professionnel.`,
// src/components/AIChatRoom.jsx (continued)
            },
            ...cleanHistory,
            { role: 'user', content: currentMessage },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Erreur API');
      
      addChatMessage({ role: 'assistant', content: data.choices[0].message.content });
    } catch (err) {
      setErrorStatus(err.message);
      setInput(currentMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleValidate = async () => {
    if (chatHistory.length === 0 || isValidating) return;
    setIsValidating(true);
    setErrorStatus(null);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error('Clé API manquante.');

      const conversationText = chatHistory
        .map(m => `${m.role === 'user' ? 'Expert' : 'IA'}: ${m.content}`)
        .join('\n\n');

      const prompt = `
Sur la base de cette discussion entre un expert IARD et l'assistant IA, génère un récapitulatif structuré pour le Rapport de Scénario SMP.

DISCUSSION :
${conversationText}

CONTEXTE TERRAIN :
${getCleanContextAsText()}

Réponds UNIQUEMENT en JSON valide avec exactement cette structure :
{
  "scenario": "Description narrative du scénario de sinistre retenu (2-4 phrases)",
  "smpFinal": <montant numérique en DZD, ex: 150000000>,
  "valeurs": {
    "batiment": <valeur numérique en DZD>,
    "materiel": <valeur numérique en DZD>,
    "stocks": <valeur numérique en DZD>,
    "pe": <valeur numérique en DZD>
  },
  "hypotheses": [
    "Hypothèse technique 1",
    "Hypothèse technique 2",
    "Hypothèse technique 3"
  ]
}

Si une valeur n'a pas été discutée, utilise 0 pour les montants. Ne génère que le JSON, rien d'autre.`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${apiKey}` 
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'Tu es un expert IARD senior. Tu réponds uniquement en JSON valide, sans texte autour.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Erreur API');

      const extracted = JSON.parse(data.choices[0].message.content);

      setSmpData({
        scenario: extracted.scenario || '',
        smpFinal: Number(extracted.smpFinal) || 0,
        valeurs: {
          batiment: Number(extracted.valeurs?.batiment) || 0,
          materiel: Number(extracted.valeurs?.materiel) || 0,
          stocks: Number(extracted.valeurs?.stocks) || 0,
          pe: Number(extracted.valeurs?.pe) || 0,
        },
        hypotheses: Array.isArray(extracted.hypotheses) ? extracted.hypotheses : [],
      });

      setValidationDone(true);

      addChatMessage({
        role: 'assistant',
        content: `✅ Rapport de Scénario mis à jour :\n\n**Scénario :** ${extracted.scenario}\n\n**SMP Final :** ${new Intl.NumberFormat('fr-DZ').format(extracted.smpFinal || 0)} DZD`,
      });

    } catch (err) {
      setErrorStatus('Erreur lors de la validation : ' + err.message);
    } finally {
      setIsValidating(false);
    }
  };

  const hasMessages = chatHistory.length > 0;

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Intelligence CIAR</h3>
            <div className="flex items-center gap-1.5 text-xs text-primary-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Analyseur Actif
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat} 
          className="p-2 text-slate-400 hover:text-white transition-colors"
          title="Réinitialiser"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {!hasMessages && (
          <div className="text-center py-8 px-4 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <BrainCircuit className="mx-auto text-primary-400 mb-3" size={40} />
            <p className="text-slate-600 text-sm font-medium mb-1">Prêt pour l'expertise SMP</p>
            <p className="text-slate-400 text-xs">Décrivez le scénario de sinistre, les valeurs exposées ou posez vos questions.</p>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              msg.role === 'user'
                ? 'bg-primary-600 text-white rounded-tr-none'
                : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
            }`}>
              <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
              <span className="text-[10px] opacity-60 mt-1 block">
                {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 flex gap-1">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        {errorStatus && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <p>{errorStatus}</p>
          </div>
        )}
      </div>

      {/* Validate Button */}
      {hasMessages && (
        <div className="px-4 pt-2 bg-white border-t border-slate-100">
          <button
            onClick={handleValidate}
            disabled={isValidating || isTyping}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs uppercase transition-all ${
              validationDone
                ? 'bg-green-500 text-white'
                : 'bg-slate-900 hover:bg-primary-700 text-white disabled:bg-slate-300'
            }`}
          >
            {isValidating ? (
              <><Loader2 size={14} className="animate-spin" /> Génération...</>
            ) : validationDone ? (
              <><CheckCheck size={14} /> Rapport mis à jour</>
            ) : (
              <><CheckCheck size={14} /> Valider la discussion</>
            )}
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-end gap-2 bg-slate-100 p-2 rounded-xl">
          <textarea
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isTyping ? "L'IA réfléchit..." : "Votre message..."}
            disabled={isTyping || isValidating}
            className="flex-1 bg-transparent border-none focus:outline-none text-sm p-2 resize-none max-h-24"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping || isValidating}
            className="w-10 h-10 bg-primary-600 text-white rounded-lg flex items-center justify-center hover:bg-primary-700 disabled:bg-slate-300 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatRoom;
