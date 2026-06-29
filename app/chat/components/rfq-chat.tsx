import { useState, useEffect, useRef } from "react";
import { useAuth } from "~/modules/authentication";
import { MessageSquare, Send, Paperclip } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";

interface ChatMessage {
  _id: string;
  rfqId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  attachmentUrl: string;
  attachmentName: string;
  createdAt: string;
}

export function RfqChat({ rfqId }: { rfqId: string }) {
  const { user } = useAuth();
  const { config } = useConfigurables();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const enabled = config?.enableNegotiationChat ?? true;

  useEffect(() => {
    if (!enabled || !rfqId) return;
    window.fetch(`/api/chat/${rfqId}/messages`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setMessages(j.data.messages);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [rfqId, enabled]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const res = await window.fetch(`/api/chat/${rfqId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (json.success) {
        setMessages((prev) => [...prev, json.data]);
        setInput("");
      } else {
        setError(json.message);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  if (!enabled) return null;

  return (
    <div className="bg-card border border-border rounded-md flex flex-col" style={{ height: "420px" }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <MessageSquare className="w-4 h-4 text-accent" strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-foreground">Negotiation Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="text-center py-8 text-muted-foreground text-xs">Loading messages...</div>
        )}
        {error && (
          <div className="text-center py-4 text-destructive text-xs">{error}</div>
        )}
        {!loading && messages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-xs">
            No messages yet. Start the conversation.
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === user?.id;
          return (
            <div key={msg._id} className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isOwn ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                {msg.senderName.charAt(0).toUpperCase()}
              </div>
              <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{msg.senderName}</span>
                  <span className="text-xs text-muted-foreground/60 uppercase tracking-wider">{msg.senderRole}</span>
                </div>
                <div className={`px-3 py-2 rounded-md text-sm text-foreground ${isOwn ? "bg-accent/20" : "bg-muted"}`}>
                  {msg.content}
                  {msg.attachmentUrl && (
                    <a
                      href={msg.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 mt-1 text-xs text-accent hover:underline"
                    >
                      <Paperclip className="w-3 h-3" />
                      {msg.attachmentName || "Attachment"}
                    </a>
                  )}
                </div>
                <span className="text-xs text-muted-foreground/60">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder="Type a message..."
          className="flex-1 bg-background border border-border rounded-sm px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="p-2 bg-accent text-accent-foreground rounded-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
