"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Check,
  Copy,
  Maximize2,
  MessageSquare,
  Mic,
  MicOff,
  Minimize2,
  MonitorUp,
  PhoneOff,
  Send,
  ShieldCheck,
  Users,
  Video,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

type ChatMsg = { id: string; sender: string; text: string; time: string };
type PeerInfo = {
  peerId: string;
  userId: string;
  name: string;
  role: string;
};
type ExpectedClient = { id: string; name: string; email?: string };

function VideoStream({
  stream,
  muted = false,
  mirror = false,
}: {
  stream: MediaStream | null;
  muted?: boolean;
  mirror?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: mirror ? "scaleX(-1)" : "none",
      }}
    />
  );
}

const initials = (name: string) =>
  (name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || "")
    .join("");

export default function LiveMeetingRoom({
  session,
  userName,
  isAdmin = true,
  onLeave,
}: {
  session: {
    id?: string;
    title?: string;
    category_name?: string;
    minutes?: number;
  } | null;
  userName: string;
  isAdmin?: boolean;
  onLeave: () => void;
}) {
  const roomRef = useRef<HTMLDivElement>(null);
  const myPeerIdRef = useRef(
    `${isAdmin ? "admin" : "client"}-${Math.random().toString(36).slice(2, 8)}`,
  );
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const bcRef = useRef<BroadcastChannel | null>(null);
  const seqRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unmountedRef = useRef(false);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [expectedClients, setExpectedClients] = useState<ExpectedClient[]>([]);
  const [coachName, setCoachName] = useState("Dr. Ananya Rao");

  const [permState, setPermState] = useState<
    "requesting" | "granted" | "denied"
  >("requesting");
  const [permError, setPermError] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sidePanel, setSidePanel] = useState<"none" | "chat" | "people">("none");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);

  const roomId = session?.id || "chatheal-live";
  const myPeerId = myPeerIdRef.current;

  function sendSignal(to: string, type: string, payload: any) {
    if (unmountedRef.current) return;
    api(
      `/live-sessions/${roomId}/rtc/signal`,
      "POST",
      { from: myPeerId, to, type, payload },
      false,
      isAdmin,
    ).catch(() => {});
    if (bcRef.current) {
      try {
        bcRef.current.postMessage({
          from: myPeerId,
          fromName: userName,
          fromRole: isAdmin ? "admin" : "client",
          to,
          type,
          payload,
        });
      } catch {
        // Channel already closed
      }
    }
  }

  function closePeer(peerId: string) {
    const pc = pcsRef.current.get(peerId);
    if (pc) {
      pc.close();
      pcsRef.current.delete(peerId);
    }
    setRemoteStreams((prev) => {
      if (!prev[peerId]) return prev;
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
  }

  function getOrCreatePC(remotePeerId: string, stream: MediaStream) {
    const existing = pcsRef.current.get(remotePeerId);
    if (existing) return existing;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcsRef.current.set(remotePeerId, pc);

    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    pc.ontrack = (ev) => {
      if (ev.streams[0]) {
        setRemoteStreams((prev) => ({
          ...prev,
          [remotePeerId]: ev.streams[0],
        }));
      }
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        sendSignal(remotePeerId, "ice", { candidate: ev.candidate.toJSON() });
      }
    };

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        closePeer(remotePeerId);
      }
    };

    return pc;
  }

  async function handleIncomingSignal(
    from: string,
    type: string,
    payload: any,
    stream: MediaStream,
  ) {
    if (!from || from === myPeerId || unmountedRef.current) return;
    try {
      if (type === "offer" && payload?.sdp?.type && payload?.sdp?.sdp) {
        const pc = getOrCreatePC(from, stream);
        await pc.setRemoteDescription(
          new RTCSessionDescription({
            type: payload.sdp.type,
            sdp: payload.sdp.sdp,
          }),
        );
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal(from, "answer", {
          sdp: { type: answer.type, sdp: answer.sdp },
        });
      } else if (type === "answer" && payload?.sdp?.type && payload?.sdp?.sdp) {
        const pc = pcsRef.current.get(from);
        if (pc && pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(
            new RTCSessionDescription({
              type: payload.sdp.type,
              sdp: payload.sdp.sdp,
            }),
          );
        }
      } else if (type === "ice" && payload?.candidate) {
        const pc = pcsRef.current.get(from);
        if (pc && pc.remoteDescription) {
          await pc
            .addIceCandidate(new RTCIceCandidate(payload.candidate))
            .catch(() => {});
        }
      } else if (type === "chat" && payload) {
        setMessages((prev) =>
          prev.some((m) => m.id === payload.id) ? prev : [...prev, payload],
        );
      } else if (type === "bye") {
        closePeer(from);
        setPeers((prev) => prev.filter((p) => p.peerId !== from));
      }
    } catch {
      // Ignore transient signaling race
    }
  }

  async function syncPeers(activePeers: PeerInfo[], stream: MediaStream) {
    const others = activePeers.filter((p) => p.peerId !== myPeerId);
    setPeers(others);

    const activeIds = new Set(others.map((p) => p.peerId));
    for (const existingId of Array.from(pcsRef.current.keys())) {
      if (!activeIds.has(existingId)) {
        closePeer(existingId);
      }
    }

    for (const p of others) {
      if (!pcsRef.current.has(p.peerId)) {
        const pc = getOrCreatePC(p.peerId, stream);
        if (myPeerId < p.peerId) {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendSignal(p.peerId, "offer", {
              sdp: { type: offer.type, sdp: offer.sdp },
            });
          } catch {
            // Wait for peer
          }
        }
      }
    }
  }

  async function startSignaling(stream: MediaStream) {
    if (typeof BroadcastChannel !== "undefined") {
      const ch = new BroadcastChannel("chatheal-meet-" + roomId);
      bcRef.current = ch;
      ch.onmessage = async (ev) => {
        const msg = ev.data;
        if (!msg || msg.from === myPeerId) return;
        if (msg.type === "hello") {
          setPeers((prev) =>
            prev.some((p) => p.peerId === msg.from)
              ? prev
              : [
                  ...prev,
                  {
                    peerId: msg.from,
                    userId: msg.from,
                    name: msg.fromName || "Participant",
                    role: msg.fromRole || "client",
                  },
                ],
          );
          const pc = getOrCreatePC(msg.from, stream);
          if (myPeerId < msg.from) {
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              ch.postMessage({
                from: myPeerId,
                to: msg.from,
                type: "offer",
                payload: { sdp: { type: offer.type, sdp: offer.sdp } },
              });
            } catch {
              // Ignore closed channel or race
            }
          }
        } else if (!msg.to || msg.to === "*" || msg.to === myPeerId) {
          await handleIncomingSignal(msg.from, msg.type, msg.payload, stream);
        }
      };
      ch.postMessage({
        from: myPeerId,
        fromName: userName,
        fromRole: isAdmin ? "admin" : "client",
        type: "hello",
      });
    }

    try {
      const joined = await api(
        `/live-sessions/${roomId}/rtc/join`,
        "POST",
        { peerId: myPeerId },
        false,
        isAdmin,
      );
      if (joined?.expectedClients) setExpectedClients(joined.expectedClients);
      if (joined?.coach?.name) setCoachName(joined.coach.name);
      if (typeof joined?.seq === "number") seqRef.current = joined.seq;
      if (Array.isArray(joined?.peers)) {
        await syncPeers(joined.peers, stream);
      }

      pollTimerRef.current = setInterval(async () => {
        try {
          const res = await api(
            `/live-sessions/${roomId}/rtc/poll?peerId=${encodeURIComponent(myPeerId)}&since=${seqRef.current}`,
            "GET",
            undefined,
            false,
            isAdmin,
          );
          if (typeof res?.seq === "number" && res.seq > seqRef.current) {
            seqRef.current = res.seq;
          }
          if (Array.isArray(res?.peers)) {
            await syncPeers(res.peers, stream);
          }
          if (Array.isArray(res?.signals)) {
            for (const s of res.signals) {
              await handleIncomingSignal(s.from, s.type, s.payload, stream);
            }
          }
        } catch {
          // Transient poll failure ignored
        }
      }, 1400);
    } catch {
      // Offline/demo mode uses BroadcastChannel
    }
  }

  async function startMedia() {
    setPermState("requesting");
    setPermError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera and microphone access requires a modern browser on localhost or HTTPS.",
        );
      }
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setMicOn(false);
      }
      localStreamRef.current = stream;
      setLocalStream(stream);
      setCamOn(stream.getVideoTracks().some((t) => t.enabled));
      setMicOn(stream.getAudioTracks().some((t) => t.enabled));
      setPermState("granted");
      await startSignaling(stream);
    } catch (err) {
      setPermState("denied");
      setPermError(
        (err as Error).message ||
          "Please click Allow for Camera & Microphone in your browser address bar.",
      );
    }
  }

  useEffect(() => {
    unmountedRef.current = false;
    void startMedia();
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) {
        handleLeave();
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("keydown", onEsc);

    return () => {
      unmountedRef.current = true;
      clearInterval(timer);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("keydown", onEsc);
      api(
        `/live-sessions/${roomId}/rtc/leave`,
        "POST",
        { peerId: myPeerId },
        false,
        isAdmin,
      ).catch(() => {});
      const ch = bcRef.current;
      bcRef.current = null;
      if (ch) {
        try {
          ch.postMessage({ from: myPeerId, type: "bye" });
          ch.close();
        } catch {
          // Channel already closed
        }
      }
      for (const pc of pcsRef.current.values()) pc.close();
      pcsRef.current.clear();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleMic = () => {
    const tracks = localStreamRef.current?.getAudioTracks() || [];
    const next = !micOn;
    tracks.forEach((t) => {
      t.enabled = next;
    });
    setMicOn(next);
  };

  const toggleCam = () => {
    const tracks = localStreamRef.current?.getVideoTracks() || [];
    const next = !camOn;
    tracks.forEach((t) => {
      t.enabled = next;
    });
    setCamOn(next);
  };

  const replaceOutgoingVideoTrack = (track: MediaStreamTrack | undefined) => {
    if (!track) return;
    for (const pc of pcsRef.current.values()) {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) void sender.replaceTrack(track);
    }
  };

  const toggleScreenShare = async () => {
    if (sharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      if (localStreamRef.current) {
        setLocalStream(localStreamRef.current);
        replaceOutgoingVideoTrack(localStreamRef.current.getVideoTracks()[0]);
      }
      setSharing(false);
      return;
    }
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      screenStreamRef.current = screen;
      setLocalStream(screen);
      replaceOutgoingVideoTrack(screen.getVideoTracks()[0]);
      screen.getVideoTracks()[0].onended = () => {
        if (localStreamRef.current) {
          setLocalStream(localStreamRef.current);
          replaceOutgoingVideoTrack(localStreamRef.current.getVideoTracks()[0]);
        }
        setSharing(false);
      };
      setSharing(true);
    } catch {
      // Cancelled
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await roomRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore
    }
  };

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const payload: ChatMsg = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      sender: userName,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, payload]);
    sendSignal("*", "chat", payload);
    setChatInput("");
  };

  const handleLeave = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    onLeave();
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const liveClients = peers.filter((p) => p.role !== "admin");
  const liveAdmin = peers.find((p) => p.role === "admin");
  const liveClientUserIds = new Set(liveClients.map((p) => p.userId));
  const waitingClients = expectedClients.filter(
    (c) => !liveClientUserIds.has(c.id),
  );

  const adminGridCount = Math.max(
    liveClients.length + waitingClients.length,
    1,
  );
  const gridCols =
    adminGridCount === 1
      ? "1fr"
      : adminGridCount === 2
        ? "repeat(2, minmax(0, 1fr))"
        : adminGridCount <= 4
          ? "repeat(2, minmax(0, 1fr))"
          : "repeat(auto-fit, minmax(260px, 1fr))";

  return (
    <div
      ref={roomRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0b1120",
        color: "#f8fafc",
        overflow: "hidden",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          padding: "12px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(15, 23, 42, 0.9)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "999px",
              background: "rgba(16, 185, 129, 0.16)",
              color: "#34d399",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 8px #10b981",
              }}
            />
            LIVE &bull; {mm}:{ss}
          </span>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700 }}>
              {session?.title || "ChatHeal Live Video Consultation"}
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              {session?.category_name ? `${session.category_name} • ` : ""}
              {isAdmin
                ? `Host View (${userName}) • ${liveClients.length} client${liveClients.length === 1 ? "" : "s"} live`
                : `Host: ${coachName}`}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={() =>
              setSidePanel((v) => (v === "people" ? "none" : "people"))
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 12px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.14)",
              background:
                sidePanel === "people"
                  ? "rgba(13,114,97,0.45)"
                  : "rgba(255,255,255,0.06)",
              color: "#f8fafc",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Users size={14} />
            {isAdmin
              ? `Clients (${liveClients.length}/${Math.max(expectedClients.length, liveClients.length)})`
              : `${1 + peers.length} in room`}
          </button>

          <button
            type="button"
            onClick={() => {
              const clientOrigin =
                process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";
              const inviteUrl = `${isAdmin ? clientOrigin : typeof window !== "undefined" ? window.location.origin : clientOrigin}/sessions?session=${roomId}`;
              navigator.clipboard?.writeText(inviteUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 12px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.08)",
              color: "#f8fafc",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Invite"}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit browser fullscreen" : "Fullscreen"}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              color: "#f8fafc",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <button
            type="button"
            onClick={handleLeave}
            title="Close room"
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              color: "#f8fafc",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Stage */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          gap: "16px",
          padding: "16px 20px",
          position: "relative",
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            position: "relative",
            display: "grid",
            gridTemplateColumns: isAdmin ? gridCols : "1fr",
            gridAutoRows: "minmax(0, 1fr)",
            gap: "14px",
          }}
        >
          {isAdmin ? (
            <>
              {liveClients.map((client) => {
                const stream = remoteStreams[client.peerId] || null;
                return (
                  <div
                    key={client.peerId}
                    style={{
                      position: "relative",
                      borderRadius: "16px",
                      overflow: "hidden",
                      background: "#111c33",
                      border: "2px solid rgba(16, 185, 129, 0.55)",
                      minHeight: "220px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {stream ? (
                      <VideoStream stream={stream} />
                    ) : (
                      <div style={{ textAlign: "center", color: "#94a3b8" }}>
                        <div
                          style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            background: "rgba(13, 114, 97, 0.35)",
                            color: "#34d399",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "22px",
                            fontWeight: 700,
                            margin: "0 auto 10px",
                          }}
                        >
                          {initials(client.name)}
                        </div>
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#f8fafc",
                          }}
                        >
                          {client.name}
                        </div>
                        <div style={{ fontSize: "12px", marginTop: "4px" }}>
                          Connecting video...
                        </div>
                      </div>
                    )}
                    <div
                      style={{
                        position: "absolute",
                        left: "12px",
                        bottom: "12px",
                        background: "rgba(15, 23, 42, 0.8)",
                        backdropFilter: "blur(6px)",
                        padding: "5px 11px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#10b981",
                        }}
                      />
                      {client.name} &bull; Live
                    </div>
                  </div>
                );
              })}

              {waitingClients.map((client) => (
                <div
                  key={client.id}
                  style={{
                    position: "relative",
                    borderRadius: "16px",
                    overflow: "hidden",
                    background: "#131c31",
                    border: "1px dashed rgba(255,255,255,0.16)",
                    minHeight: "220px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.08)",
                      color: "#cbd5e1",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "22px",
                      fontWeight: 700,
                      marginBottom: "12px",
                    }}
                  >
                    {initials(client.name)}
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#f8fafc",
                    }}
                  >
                    {client.name}
                  </div>
                  {client.email && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        marginTop: "2px",
                      }}
                    >
                      {client.email}
                    </div>
                  )}
                  <span
                    style={{
                      marginTop: "10px",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      background: "rgba(245, 158, 11, 0.14)",
                      color: "#fbbf24",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    Invited &bull; Waiting to join
                  </span>
                </div>
              ))}

              {liveClients.length === 0 && waitingClients.length === 0 && (
                <div
                  style={{
                    borderRadius: "16px",
                    background: "#131c31",
                    border: "1px dashed rgba(255,255,255,0.16)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "32px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "68px",
                      height: "68px",
                      borderRadius: "50%",
                      background: "rgba(13, 114, 97, 0.2)",
                      color: "#34d399",
                      display: "grid",
                      placeItems: "center",
                      marginBottom: "14px",
                    }}
                  >
                    <Video size={30} />
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 700 }}>
                    Waiting for clients to join...
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#94a3b8",
                      marginTop: "6px",
                      maxWidth: "360px",
                    }}
                  >
                    Share the invite link or wait for your category clients to
                    open the session room.
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                position: "relative",
                borderRadius: "18px",
                overflow: "hidden",
                background: "#131c31",
                border: liveAdmin
                  ? "2px solid rgba(16, 185, 129, 0.55)"
                  : "1px dashed rgba(255,255,255,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              {liveAdmin && remoteStreams[liveAdmin.peerId] ? (
                <VideoStream stream={remoteStreams[liveAdmin.peerId]} />
              ) : (
                <div style={{ textAlign: "center", padding: "32px" }}>
                  <div
                    style={{
                      width: "84px",
                      height: "84px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #0d7261, #0f766e)",
                      color: "#ffffff",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "28px",
                      fontWeight: 800,
                      margin: "0 auto 14px",
                      boxShadow: "0 10px 30px rgba(13,114,97,0.35)",
                    }}
                  >
                    {initials(liveAdmin?.name || coachName)}
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#f8fafc",
                    }}
                  >
                    {liveAdmin?.name || coachName}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#34d399",
                      fontWeight: 600,
                      marginTop: "4px",
                    }}
                  >
                    Wellness Coach &bull; Session Host
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#94a3b8",
                      marginTop: "10px",
                      maxWidth: "340px",
                    }}
                  >
                    {liveAdmin
                      ? "Connecting coach video & audio..."
                      : "Your camera & mic are ready. Waiting for your coach to join live."}
                  </div>
                </div>
              )}

              <div
                style={{
                  position: "absolute",
                  left: "16px",
                  bottom: "16px",
                  background: "rgba(15, 23, 42, 0.8)",
                  backdropFilter: "blur(6px)",
                  padding: "6px 12px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: liveAdmin ? "#10b981" : "#f59e0b",
                  }}
                />
                {liveAdmin?.name || coachName} &bull; Wellness Coach
              </div>
            </div>
          )}

          {/* Self Video PiP Tile (Bottom-Right) */}
          <div
            style={{
              position: "absolute",
              right: "18px",
              bottom: "18px",
              width: "230px",
              height: "145px",
              borderRadius: "14px",
              overflow: "hidden",
              background: "#1e293b",
              border: "2px solid rgba(255,255,255,0.22)",
              boxShadow: "0 14px 36px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 5,
            }}
          >
            {permState === "requesting" && (
              <div style={{ textAlign: "center", padding: "12px" }}>
                <Camera size={22} style={{ color: "#34d399", marginBottom: "6px" }} />
                <div style={{ fontSize: "12px", fontWeight: 600 }}>
                  Allow Camera &amp; Mic...
                </div>
              </div>
            )}

            {permState === "denied" && (
              <div style={{ textAlign: "center", padding: "12px" }}>
                <CameraOff size={20} style={{ color: "#f87171", marginBottom: "6px" }} />
                <div
                  style={{
                    fontSize: "11px",
                    color: "#cbd5e1",
                    marginBottom: "8px",
                  }}
                >
                  {permError || "Camera blocked"}
                </div>
                <button
                  type="button"
                  onClick={startMedia}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#0d7261",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {permState === "granted" && localStream && (
              <>
                <VideoStream stream={localStream} muted mirror={!sharing} />
                {!camOn && !sharing && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "#1e293b",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "12px",
                      color: "#94a3b8",
                    }}
                  >
                    Camera Off
                  </div>
                )}
              </>
            )}

            <div
              style={{
                position: "absolute",
                left: "8px",
                bottom: "8px",
                background: "rgba(15, 23, 42, 0.78)",
                padding: "3px 8px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              {micOn ? (
                <Mic size={11} color="#34d399" />
              ) : (
                <MicOff size={11} color="#f87171" />
              )}
              {userName} (You)
            </div>
          </div>
        </div>

        {/* Side Drawer: Participants or Chat */}
        {sidePanel !== "none" && (
          <div
            style={{
              width: "320px",
              background: "#131c31",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              <span>
                {sidePanel === "people" ? "Participants" : "Session Chat"}
              </span>
              <button
                type="button"
                onClick={() => setSidePanel("none")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {sidePanel === "people" ? (
              <div
                style={{
                  flex: 1,
                  padding: "12px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    background: "rgba(16, 185, 129, 0.1)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "13px",
                  }}
                >
                  <span>{userName} (You)</span>
                  <span
                    style={{ color: "#34d399", fontSize: "11px", fontWeight: 700 }}
                  >
                    LIVE
                  </span>
                </div>
                {peers.map((p) => (
                  <div
                    key={p.peerId}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.05)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "13px",
                    }}
                  >
                    <span>
                      {p.name}
                      {p.role === "admin" ? " • Coach" : ""}
                    </span>
                    <span
                      style={{
                        color: "#34d399",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      LIVE
                    </span>
                  </div>
                ))}
                {isAdmin &&
                  waitingClients.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.03)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "13px",
                        color: "#94a3b8",
                      }}
                    >
                      <span>{c.name}</span>
                      <span style={{ color: "#fbbf24", fontSize: "11px" }}>
                        Invited
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <>
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {messages.length === 0 ? (
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "12px",
                        textAlign: "center",
                        marginTop: "24px",
                      }}
                    >
                      Messages appear here for everyone in the call.
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          padding: "8px 10px",
                          borderRadius: "10px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#34d399",
                            fontWeight: 600,
                            marginBottom: "2px",
                          }}
                        >
                          {m.sender} &bull; {m.time}
                        </div>
                        <div style={{ fontSize: "13px", color: "#f1f5f9" }}>
                          {m.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <form
                  onSubmit={sendChat}
                  style={{
                    padding: "10px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Send a message..."
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "8px",
                      padding: "8px 10px",
                      color: "#fff",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: "#0d7261",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0 12px",
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Send size={14} />
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 24px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(15, 23, 42, 0.95)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: "#94a3b8",
          }}
        >
          <ShieldCheck size={14} color="#34d399" />
          Encrypted WebRTC Room
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            onClick={toggleMic}
            title={micOn ? "Mute microphone" : "Unmute microphone"}
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              border: "none",
              background: micOn ? "rgba(255,255,255,0.12)" : "#dc2626",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            {micOn ? <Mic size={19} /> : <MicOff size={19} />}
          </button>

          <button
            type="button"
            onClick={toggleCam}
            title={camOn ? "Turn off camera" : "Turn on camera"}
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              border: "none",
              background: camOn ? "rgba(255,255,255,0.12)" : "#dc2626",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            {camOn ? <Camera size={19} /> : <CameraOff size={19} />}
          </button>

          <button
            type="button"
            onClick={toggleScreenShare}
            title={sharing ? "Stop sharing screen" : "Share screen"}
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              border: "none",
              background: sharing ? "#0284c7" : "rgba(255,255,255,0.12)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <MonitorUp size={19} />
          </button>

          <button
            type="button"
            onClick={() =>
              setSidePanel((v) => (v === "chat" ? "none" : "chat"))
            }
            title="Toggle chat"
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              border: "none",
              background:
                sidePanel === "chat" ? "#0d7261" : "rgba(255,255,255,0.12)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <MessageSquare size={19} />
          </button>

          <button
            type="button"
            onClick={handleLeave}
            style={{
              height: "46px",
              padding: "0 22px",
              borderRadius: "999px",
              border: "none",
              background: "#ef4444",
              color: "#fff",
              fontWeight: 700,
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <PhoneOff size={17} />
            Leave Call
          </button>
        </div>

        <div style={{ width: "140px" }} />
      </div>
    </div>
  );
}
