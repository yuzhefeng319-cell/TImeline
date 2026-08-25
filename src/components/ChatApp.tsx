"use client";

import React, { useState, useRef, useEffect } from "react";

export interface CardData {
  title: string;
  time_anchor: string;
  fact_summary: string;
  emotional_peak: string;
  inner_insight: string;
  keywords: string[];
}

export interface StoryItem {
  id: string;
  chapter: string;
  card_data: CardData;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "嗨，今天过得怎么样？听声音感觉你心里装了些事情，随时跟我聊聊。" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [storyline, setStoryline] = useState<StoryItem[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error("请求失败");

      const data = await response.json();
      const assistantText = data.reply || "";
      const card = data.card;

      const assistantMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: assistantMsgId, role: "assistant", content: assistantText }]);

      if (card && card.has_card) {
        setStoryline((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            chapter: card.chapter || "人生记忆片段",
            card_data: card.card_data,
          },
        ]);
      }
    } catch (error) {
      console.error("发送失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex", backgroundColor: "#fafaf9", margin: 0 }}>
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
          zIndex: 50,
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          backgroundColor: "#1c1917",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}
        className="sidebar-toggle"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Chat Panel - Left */}
      <div style={{ flex: "1 1 0%", display: "flex", flexDirection: "column", borderRight: "1px solid #e7e5e4", minHeight: "100vh", backgroundColor: "#fff", minWidth: 0 }} className="chat-panel">
        {/* Header */}
        <div style={{ padding: "20px 32px", borderBottom: "1px solid #e7e5e4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "32px", height: "1px", backgroundColor: "#d6d3d1" }} />
            <span style={{ fontSize: "18px", letterSpacing: "0.02em", fontWeight: 500, color: "#1c1917" }}>The Listener</span>
          </div>
          {isLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a8a29e" }}>
              <span style={{ display: "flex", gap: "4px" }}>
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#a8a29e", animation: "bounce 1s infinite" }} />
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#a8a29e", animation: "bounce 1s infinite 0.15s" }} />
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#a8a29e", animation: "bounce 1s infinite 0.3s" }} />
              </span>
              <span style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "system-ui" }}>Thinking</span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
          {messages.map((m) => (
            <div key={m.id} style={{ marginBottom: "24px" }}>
              {m.role === "assistant" && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ width: "20px", height: "1px", backgroundColor: "#d6d3d1" }} />
                  <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#78716c", fontFamily: "system-ui" }}>Listener</span>
                </div>
              )}
              <div style={{
                padding: "16px 24px",
                borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                backgroundColor: m.role === "user" ? "#1c1917" : "#fff",
                border: m.role === "user" ? "none" : "1px solid #e7e5e4",
                color: m.role === "user" ? "#fafaf9" : "#44403c",
                fontSize: "15px",
                lineHeight: 1.6,
                maxWidth: "85%",
                marginLeft: m.role === "user" ? "auto" : "0"
              }}>
                {m.content}
              </div>
              {m.role === "user" && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#78716c", fontFamily: "system-ui" }}>You</span>
                  <div style={{ width: "20px", height: "1px", backgroundColor: "#d6d3d1" }} />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #e7e5e4" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="写点什么..."
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid #e7e5e4",
                backgroundColor: "#fafaf9",
                fontSize: "14px",
                fontFamily: "Georgia, serif",
                color: "#1c1917",
                outline: "none",
                resize: "none",
                minHeight: "44px",
                maxHeight: "120px"
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: isLoading || !input.trim() ? "#d6d3d1" : "#1c1917",
                border: "none",
                color: "#fff",
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14.5 1.5L7 9M14.5 1.5L10 14.5L7 9M14.5 1.5L2 6.5L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p style={{ fontSize: "10px", color: "#d6d3d1", marginTop: "8px", fontFamily: "system-ui" }}>按 Enter 发送 · Shift + Enter 换行</p>
        </div>
      </div>

      {/* Sidebar - Right (Desktop) */}
      <div style={{ width: "320px", display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" }} className="sidebar-desktop">
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #f5f5f4", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "24px", height: "1px", backgroundColor: "#d6d3d1" }} />
          <span style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#78716c", fontFamily: "system-ui", fontWeight: 500 }}>Storyline</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {storyline.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#f5f5f4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p style={{ fontSize: "14px", color: "#a8a29e", fontFamily: "Georgia" }}>聊一段深刻的记忆</p>
              <p style={{ fontSize: "12px", color: "#d6d3d1", marginTop: "4px", fontFamily: "system-ui" }}>它会出现在这里</p>
            </div>
          ) : (
            <div style={{ position: "relative", paddingLeft: "20px" }}>
              <div style={{ position: "absolute", left: "7px", top: "8px", bottom: "8px", width: "1px", backgroundColor: "#e7e5e4" }} />
              {storyline.map((item) => (
                <div key={item.id} style={{ position: "relative", marginBottom: "32px" }}>
                  <div style={{ position: "absolute", left: "-9px", top: "6px", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#fff", border: "2px solid #d6d3d1", zIndex: 1 }} />
                  <div style={{ backgroundColor: "#fafaf9", border: "1px solid #e7e5e4", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#78716c", fontFamily: "system-ui" }}>{item.chapter}</span>
                      <div style={{ flex: 1, height: "1px", backgroundColor: "#e7e5e4" }} />
                      <span style={{ fontSize: "9px", color: "#d6d3d1", fontFamily: "system-ui" }}>{item.card_data.time_anchor}</span>
                    </div>
                    <h3 style={{ fontSize: "14px", fontWeight: 500, color: "#1c1917", lineHeight: 1.4, margin: "0 0 12px 0" }}>{item.card_data.title}</h3>
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#78716c", fontFamily: "system-ui", marginBottom: "2px" }}>事实</div>
                      <p style={{ fontSize: "12px", color: "#57534e", lineHeight: 1.5, margin: 0 }}>{item.card_data.fact_summary}</p>
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#78716c", fontFamily: "system-ui", marginBottom: "2px" }}>情绪</div>
                      <p style={{ fontSize: "12px", color: "#57534e", lineHeight: 1.5, margin: 0 }}>{item.card_data.emotional_peak}</p>
                    </div>
                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e7e5e4" }}>
                      <p style={{ fontSize: "12px", color: "#57534e", fontStyle: "italic", lineHeight: 1.5, margin: 0 }}>&ldquo;{item.card_data.inner_insight}&rdquo;</p>
                    </div>
                    {item.card_data.keywords?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f5f5f4" }}>
                        {item.card_data.keywords.map((kw, i) => (
                          <span key={i} style={{ fontSize: "9px", color: "#a8a29e", fontFamily: "system-ui" }}>#{kw}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <>
          <div
            onClick={() => setShowSidebar(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 60
            }}
          />
          <div style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "85%",
            maxWidth: "360px",
            height: "100vh",
            backgroundColor: "#fff",
            zIndex: 70,
            display: "flex",
            flexDirection: "column",
            boxShadow: "-4px 0 20px rgba(0,0,0,0.1)"
          }}>
            <div style={{ padding: "20px 28px", borderBottom: "1px solid #f5f5f4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "24px", height: "1px", backgroundColor: "#d6d3d1" }} />
                <span style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#78716c", fontFamily: "system-ui", fontWeight: 500 }}>Storyline</span>
              </div>
              <button
                onClick={() => setShowSidebar(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "#f5f5f4",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#78716c" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
              {storyline.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "16px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#f5f5f4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: "14px", color: "#a8a29e", fontFamily: "Georgia" }}>聊一段深刻的记忆</p>
                  <p style={{ fontSize: "12px", color: "#d6d3d1", marginTop: "4px", fontFamily: "system-ui" }}>它会出现在这里</p>
                </div>
              ) : (
                <div style={{ position: "relative", paddingLeft: "20px" }}>
                  <div style={{ position: "absolute", left: "7px", top: "8px", bottom: "8px", width: "1px", backgroundColor: "#e7e5e4" }} />
                  {storyline.map((item) => (
                    <div key={item.id} style={{ position: "relative", marginBottom: "32px" }}>
                      <div style={{ position: "absolute", left: "-9px", top: "6px", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#fff", border: "2px solid #d6d3d1", zIndex: 1 }} />
                      <div style={{ backgroundColor: "#fafaf9", border: "1px solid #e7e5e4", borderRadius: "12px", padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                          <span style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#78716c", fontFamily: "system-ui" }}>{item.chapter}</span>
                          <div style={{ flex: 1, height: "1px", backgroundColor: "#e7e5e4" }} />
                          <span style={{ fontSize: "9px", color: "#d6d3d1", fontFamily: "system-ui" }}>{item.card_data.time_anchor}</span>
                        </div>
                        <h3 style={{ fontSize: "14px", fontWeight: 500, color: "#1c1917", lineHeight: 1.4, margin: "0 0 12px 0" }}>{item.card_data.title}</h3>
                        <div style={{ marginBottom: "8px" }}>
                          <div style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#78716c", fontFamily: "system-ui", marginBottom: "2px" }}>事实</div>
                          <p style={{ fontSize: "12px", color: "#57534e", lineHeight: 1.5, margin: 0 }}>{item.card_data.fact_summary}</p>
                        </div>
                        <div style={{ marginBottom: "8px" }}>
                          <div style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#78716c", fontFamily: "system-ui", marginBottom: "2px" }}>情绪</div>
                          <p style={{ fontSize: "12px", color: "#57534e", lineHeight: 1.5, margin: 0 }}>{item.card_data.emotional_peak}</p>
                        </div>
                        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e7e5e4" }}>
                          <p style={{ fontSize: "12px", color: "#57534e", fontStyle: "italic", lineHeight: 1.5, margin: 0 }}>&ldquo;{item.card_data.inner_insight}&rdquo;</p>
                        </div>
                        {item.card_data.keywords?.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f5f5f4" }}>
                            {item.card_data.keywords.map((kw, i) => (
                              <span key={i} style={{ fontSize: "9px", color: "#a8a29e", fontFamily: "system-ui" }}>#{kw}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        textarea:focus { border-color: #a8a29e !important; }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .sidebar-desktop {
            display: none !important;
          }
          .sidebar-toggle {
            display: flex !important;
          }
          .chat-panel {
            min-height: 100vh !important;
            border-right: none !important;
          }
        }
        
        @media (min-width: 769px) {
          .sidebar-toggle {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ChatApp;
