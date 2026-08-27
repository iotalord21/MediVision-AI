import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import API from '../api/axios';

const SUGGESTED_QUESTIONS = [
  'Why is my risk level elevated?',
  'Which specific factors affected my prediction most?',
  'What do clinical guidelines say about my lab readings?',
  'What evidence-based lifestyle changes are recommended?'
];

const PredictionChatbot = ({
  disease,
  predictionResult,
  inputData,
  predictionId = null
}) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I can answer any questions regarding your **${(disease || 'medical').toUpperCase()}** prediction, contributing SHAP factors, and authoritative clinical guidelines. What would you like to explore?`,
      citations: [],
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText) => {
    const textToSend = questionText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!questionText) setInputQuery('');
    setLoading(true);

    try {
      const payload = {
        user_question: textToSend.trim(),
        disease: disease || 'general',
        prediction: predictionResult?.prediction ?? 0,
        status: predictionResult?.status ?? 'Negative',
        probability: predictionResult?.probability ?? 0.5,
        shap_explanations: predictionResult?.shap_explanations ?? [],
        input_data: inputData || {},
        prediction_id: predictionId,
        chat_history: messages.map((m) => ({
          role: m.role,
          message: m.content
        }))
      };

      const res = await API.post('/chat/ask-prediction', payload);

      const botMessage = {
        role: 'assistant',
        content: res.data.answer,
        citations: res.data.citations || [],
        disclaimer: res.data.disclaimer,
        timestamp: res.data.timestamp || new Date().toISOString()
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat prediction error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error retrieving grounded knowledge for this question. Please verify the backend connection and try again.',
          citations: [],
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl border border-cyan-500/30 overflow-hidden shadow-xl flex flex-col h-[520px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600/15 via-blue-600/10 to-transparent p-4 border-b border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Ask About My Prediction</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Grounded conversational decision support powered by RAG & SHAP
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 shrink-0">
          Suggested:
        </span>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            disabled={loading}
            className="px-2.5 py-1 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10 border border-slate-300 dark:border-slate-700 text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
          >
            <span>{q}</span>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="leading-relaxed whitespace-pre-line">
                  {msg.content}
                </div>

                {/* Source Citations Badges */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Grounded In:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 text-[10px] font-medium"
                        >
                          {c.source_reference || c.document_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[9px] ${
                    isUser ? 'text-cyan-100 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start items-center text-xs text-slate-500 dark:text-slate-400">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-bl-none flex items-center gap-2">
              <span className="animate-pulse">Consulting medical guidelines & analyzing SHAP factors...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a question about this prediction or risk factors..."
          disabled={loading}
          className="flex-1 glass-input px-3.5 py-2.5 rounded-xl text-xs focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || loading}
          className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};

export default PredictionChatbot;
