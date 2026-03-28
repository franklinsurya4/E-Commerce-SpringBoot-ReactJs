import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader } from 'lucide-react';
import { chatAPI } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import './ChatWidget.css';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm ShopAI, your shopping assistant. I can help you find products, compare items, track orders, or answer questions. What can I do for you?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await chatAPI.send({ message: userMsg, history });
      const data = res.data.data;
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.suggestedProducts?.length) setSuggestedProducts(data.suggestedProducts);
      else setSuggestedProducts([]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className={`chat-fab ${isOpen ? 'hidden' : ''}`} onClick={() => setIsOpen(true)}>
        <Sparkles size={24} />
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatar"><Sparkles size={18} /></div>
              <div>
                <h3>ShopAI Assistant</h3>
                <span className="chat-status">Powered by Claude</span>
              </div>
            </div>
            <button className="chat-close" onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                {msg.role === 'assistant' && <div className="msg-avatar"><Sparkles size={14} /></div>}
                <div className="msg-bubble">
                  {msg.content.split('\n').map((line, j) => (
                    <React.Fragment key={j}>{line}<br /></React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg assistant">
                <div className="msg-avatar"><Sparkles size={14} /></div>
                <div className="msg-bubble typing">
                  <Loader size={16} className="spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            {suggestedProducts.length > 0 && (
              <div className="chat-products">
                {suggestedProducts.map(p => (
                  <button key={p.id} className="chat-product-card" onClick={() => { navigate(`/products/${p.id}`); setIsOpen(false); }}>
                    <img src={p.imageUrl} alt={p.name} />
                    <div>
                      <span className="cp-name">{p.name}</span>
                      <span className="cp-price">${p.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          <div className="chat-input-area">
            <input ref={inputRef} type="text" placeholder="Ask me anything..."
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
            <button className="chat-send" onClick={sendMessage} disabled={!input.trim() || loading}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
