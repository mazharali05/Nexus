import React, { useState, useRef } from 'react';

// ── Types ─────────────────────────────────────────────────
interface Participant {
  name: string;
  initials: string;
  online: boolean;
}

interface ChatMessage {
  from: string;
  text: string;
}

// ── Static data ───────────────────────────────────────────
const PARTICIPANTS: Participant[] = [
  { name: 'Sarah Chen', initials: 'SC', online: true },
  { name: 'Mark Osei',  initials: 'MO', online: true },
  { name: 'Amina Raza', initials: 'AR', online: false },
];

// ── Styles ────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: '24px',
    background: '#f9fafb',
    minHeight: '100vh',
    color: '#111827',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '24px',
    color: '#111827',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '20px',
  },
  videoArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  mainVideo: {
    width: '100%',
    aspectRatio: '16/9',
    background: '#111827',
    borderRadius: '12px',
    position: 'relative',
    overflow: 'hidden',
    border: '2px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholder: {
    color: '#9ca3af',
    fontSize: '16px',
    textAlign: 'center',
  },
  selfVideo: {
    position: 'absolute',
    bottom: '16px',
    right: '16px',
    width: '160px',
    aspectRatio: '16/9',
    background: '#1f2937',
    borderRadius: '8px',
    border: '2px solid #2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: '#9ca3af',
    overflow: 'hidden',
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '14px',
    color: '#111827',
  },
  participantItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    borderRadius: '8px',
    marginBottom: '8px',
    background: '#f9fafb',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    flexShrink: 0,
  },
  chatInput: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
  },
  chatMsg: {
    padding: '8px 12px',
    background: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '6px',
    fontSize: '13px',
  },
  msgName: {
    fontWeight: '600',
    fontSize: '11px',
    color: '#2563eb',
    marginBottom: '2px',
  },
};

// ── Sub-components ────────────────────────────────────────

// Control button (mic, camera, share)
const CtrlBtn: React.FC<{
  active: boolean;
  danger?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ active, danger = false, onClick, title, children }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      fontSize: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: danger ? '#dc2626' : active ? '#2563eb' : '#e5e7eb',
      color: 'white',
      transition: 'all 0.2s ease',
    }}
  >
    {children}
  </button>
);

// Online status dot
const StatusDot: React.FC<{ online: boolean }> = ({ online }) => (
  <div style={{
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: online ? '#16a34a' : '#9ca3af',
    marginLeft: 'auto',
    flexShrink: 0,
  }} />
);

// Start / End call button
const CallBtn: React.FC<{ active: boolean; onClick: () => void }> = ({ active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '12px 24px',
      background: active ? '#dc2626' : '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }}
  >
    {active ? '⛔ End Call' : '📞 Start Call'}
  </button>
);

// ── Main component ────────────────────────────────────────
const VideoCallPage: React.FC = () => {
  const [callActive, setCallActive] = useState(false);
  const [micOn,      setMicOn]      = useState(true);
  const [cameraOn,   setCameraOn]   = useState(true);
  const [sharing,    setSharing]    = useState(false);
  const [messages,   setMessages]   = useState<ChatMessage[]>([
    { from: 'Sarah Chen', text: 'Ready to start!' },
  ]);
  const [msgInput, setMsgInput] = useState('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef     = useRef<MediaStream | null>(null);

  // ── Call controls ─────────────────────────────────────
  const startCall = async () => {
    setCallActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch {
      console.log('Camera not available – using mock UI');
    }
  };

  const endCall = () => {
    setCallActive(false);
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  };

  const toggleMic = () => {
    setMicOn(prev => {
      streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !prev; });
      return !prev;
    });
  };

  const toggleCamera = () => {
    setCameraOn(prev => {
      streamRef.current?.getVideoTracks().forEach(t => { t.enabled = !prev; });
      return !prev;
    });
  };

  // ── Chat ──────────────────────────────────────────────
  const sendMessage = () => {
    if (!msgInput.trim()) return;
    setMessages(prev => [...prev, { from: 'You', text: msgInput }]);
    setMsgInput('');
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>📹 Video Call Room</h1>

      <div style={styles.layout}>

        {/* ── Video area ── */}
        <div style={styles.videoArea}>

          {/* Main video box */}
          <div style={styles.mainVideo}>
            {callActive ? (
              <>
                <div style={{ color: '#4ade80', fontSize: '18px', fontWeight: '600' }}>
                  🔴 Live – Sarah Chen
                </div>
                {/* Self preview */}
                <div style={styles.selfVideo}>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </>
            ) : (
              <div style={styles.videoPlaceholder}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📹</div>
                <div>Call not started</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>
                  Click "Start Call" to begin
                </div>
              </div>
            )}
          </div>

          {/* Controls bar */}
          <div style={styles.controls}>
            <CtrlBtn active={micOn} onClick={toggleMic} title={micOn ? 'Mute' : 'Unmute'}>
              {micOn ? '🎤' : '🔇'}
            </CtrlBtn>

            <CtrlBtn active={cameraOn} onClick={toggleCamera} title={cameraOn ? 'Camera off' : 'Camera on'}>
              {cameraOn ? '📷' : '🚫'}
            </CtrlBtn>

            <CtrlBtn active={sharing} onClick={() => setSharing(p => !p)} title="Screen Share">
              🖥️
            </CtrlBtn>

            <CallBtn active={callActive} onClick={callActive ? endCall : startCall} />
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={styles.sidebar}>

          {/* Participants */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              Participants ({PARTICIPANTS.filter(p => p.online).length} online)
            </div>
            {PARTICIPANTS.map((p, i) => (
              <div key={i} style={styles.participantItem}>
                <div style={styles.avatar}>{p.initials}</div>
                <span style={{ fontSize: '14px', color: '#111827' }}>{p.name}</span>
                <StatusDot online={p.online} />
              </div>
            ))}
          </div>

          {/* In-call chat */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>In-Call Chat</div>

            <div style={{ maxHeight: '160px', overflowY: 'auto', marginBottom: '8px' }}>
              {messages.map((m, i) => (
                <div key={i} style={styles.chatMsg}>
                  <div style={styles.msgName}>{m.from}</div>
                  <div style={{ color: '#374151', fontSize: '13px' }}>{m.text}</div>
                </div>
              ))}
            </div>

            <div style={styles.chatInput}>
              <input
                style={{
                  flex: 1,
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#111827',
                  fontSize: '13px',
                  outline: 'none',
                }}
                placeholder="Type a message..."
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '16px',
                }}
              >
                ➤
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;