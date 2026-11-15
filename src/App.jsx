import { useState, useRef, useEffect } from "react";
import "./App.css";

const user_list = ["Alan", "Bob", "Carol", "Dean", "Elin"];

const AVATAR_COLORS = {
  Alan: "#e98a8a",
  Bob: "#d4e06b",
  Carol: "#7fc4e8",
  Dean: "#b79df0",
  Elin: "#f2a65a",
};

const EMOJIS = [
  "😀", "😂", "🤣", "😊", "😍", "😎", "🥳", "😢",
  "😡", "🤔", "😴", "🙌", "👍", "👎", "👏", "🙏",
  "👋", "💪", "🔥", "✨", "🎉", "❤️", "💔", "💯",
];

const getInitials = (name) => name.slice(0, 2).toUpperCase();

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

export default function App() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const pickerRef = useRef(null);

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close the emoji picker on outside click or Escape
  useEffect(() => {
    if (!showPicker) return;
    const onClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setShowPicker(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showPicker]);

  // Insert the emoji at the cursor position
  const insertEmoji = (emoji) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? text.length;
    const end = input?.selectionEnd ?? text.length;
    setText(text.slice(0, start) + emoji + text.slice(end));
    requestAnimationFrame(() => {
      input?.focus();
      const pos = start + emoji.length;
      input?.setSelectionRange(pos, pos);
    });
  };

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const user = user_list[Math.floor(Math.random() * user_list.length)];

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), user, text: trimmed, time: formatTime(new Date()) },
    ]);
    setText("");
  };

  return (
    <div className="chat">
      <header className="chat__header">
        <h1>Introductions</h1>
        <p>This Channel Is For Company Wide Chatter</p>
      </header>

      <main className="chat__thread">
        {messages.length === 0 && (
          <p className="chat__empty">No messages yet. Send one to start the conversation.</p>
        )}

        {messages.map((m) => (
          <div className="message" key={m.id}>
            <div className="message__avatar" style={{ background: AVATAR_COLORS[m.user] }}>
              {getInitials(m.user)}
            </div>
            <div className="message__body">
              <div className="message__meta">
                <span className="message__name">{m.user}</span>
                <span className="message__time">{m.time}</span>
              </div>
              <div className="message__bubble">{m.text}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      <form className="chat__input" onSubmit={handleSend}>
        <div className="chat__field" ref={pickerRef}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type Message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Type a message"
          />
          <button
            type="button"
            className="emoji-toggle"
            onClick={() => setShowPicker((v) => !v)}
            aria-label="Choose an emoji"
            aria-expanded={showPicker}
          >
            😊
          </button>

          {showPicker && (
            <div className="emoji-picker" role="listbox" aria-label="Emoji picker">
              {EMOJIS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  className="emoji-picker__item"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="submit" className="send-btn" disabled={!text.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}