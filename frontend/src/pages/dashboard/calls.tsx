import { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface Props { tenant?: any; }
type Tab = "local" | "live";
type Outcome = "all" | "completed" | "escalated" | "missed";

function fmtDuration(secs: number) {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function fmtDate(iso: string | number) {
  if (!iso) return "—";
  const d = new Date(typeof iso === "number" ? iso * 1000 : iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + " " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function Calls({ tenant }: Props) {
  const [tab, setTab] = useState<Tab>("live");
  const [localCalls, setLocalCalls] = useState<any[]>([]);
  const [liveCalls, setLiveCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Outcome>("all");
  const [selected, setSelected] = useState<any | null>(null);
  const [convDetail, setConvDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [outboundNumber, setOutboundNumber] = useState("");
  const [calling, setCalling] = useState(false);
  const [callMsg, setCallMsg] = useState("");
  const hasRealAgent = !!tenant?.agentId && !tenant.agentId.startsWith("local-");
  const hasRealPhoneNumber = !!tenant?.phoneNumberId && !tenant.phoneNumberId.startsWith("local-");

  useEffect(() => {
    if (!tenant?.id) return;
    setLoading(true);
    Promise.all([
      api.get(`/tenants/${tenant.id}/calls`).then(r => setLocalCalls(r.calls || [])).catch(() => {}),
      hasRealAgent
        ? api.get(`/tenants/${tenant.id}/conversations`).then(r => setLiveCalls(r.conversations || [])).catch(() => {})
        : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, [tenant?.id, hasRealAgent]);

  const openConvDetail = async (conv: any) => {
    setSelected(conv);
    setConvDetail(null);
    setLoadingDetail(true);
    try {
      const r = await api.get(`/tenants/${tenant.id}/conversations/${conv.conversation_id}`);
      setConvDetail(r.conversation);
    } catch {}
    setLoadingDetail(false);
  };

  const handleOutbound = async () => {
    if (!outboundNumber.match(/^\+\d{10,15}$/)) {
      setCallMsg("Enter a valid number with country code (e.g. +919876543210)");
      return;
    }
    setCalling(true); setCallMsg("");
    try {
      const result = await api.post(`/tenants/${tenant.id}/outbound-call`, { to_number: outboundNumber });
      setCallMsg(result.conversation_id
        ? `Call started. Conversation ${result.conversation_id} will appear after the call is processed.`
        : "Call started. Refresh local call logs for the latest status.");
      setOutboundNumber("");
    } catch (e: any) {
      let message = e.message || "Request failed";
      if (message.startsWith("{")) {
        try {
          message = JSON.parse(message).error || message;
        } catch {}
      }
      setCallMsg("Failed: " + message);
    }
    setCalling(false);
  };

  const filteredLocal = filter === "all" ? localCalls : localCalls.filter(c => c.outcome === filter);

  const outcomeColor = (o: string) =>
    o === "completed" || o === "success" ? "bg-emerald-500/10 text-emerald-400" :
    o === "escalated" || o === "failure" ? "bg-amber-500/10 text-amber-400" :
    "bg-[#1E2A3E] text-[#475569]";

  const totalCalls = tab === "live" ? liveCalls.length : filteredLocal.length;

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold">Call Logs</h1>
          <p className="text-sm text-[#475569] mt-0.5">{totalCalls} {tab === "live" ? "ElevenLabs conversations" : "local records"}</p>
        </div>
        {hasRealAgent && hasRealPhoneNumber && (
          <div className="flex items-center gap-2">
            <input
              type="text" value={outboundNumber} onChange={e => setOutboundNumber(e.target.value)}
              placeholder="+91XXXXXXXXXX"
              className="bg-[#0F1623] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3 py-2 text-sm font-mono text-white placeholder-[#475569] outline-none w-44 transition-colors"
            />
            <button onClick={handleOutbound} disabled={calling}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-xl transition-colors">
              {calling ? "Calling..." : "Call"}
            </button>
          </div>
        )}
      </div>

      {callMsg && (
        <div className={`mb-4 text-xs px-4 py-2.5 rounded-xl ${callMsg.startsWith("Failed:") ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
          {callMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 bg-[#0F1623] border border-[#1E2A3E] rounded-xl p-1 w-fit">
        {([["live", "ElevenLabs Live"], ["local", "Local DB"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-xs px-4 py-1.5 rounded-lg transition-colors ${tab === t ? "bg-[#1E2A3E] text-white" : "text-[#475569] hover:text-[#94A3B8]"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Live ElevenLabs conversations */}
      {tab === "live" && (
        <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_90px_80px_100px_120px_80px] px-5 py-3 border-b border-[#1E2A3E]">
            {["Caller / Summary", "Direction", "Duration", "Status", "Date", ""].map(h => (
              <div key={h} className="text-xs font-medium text-[#475569]">{h}</div>
            ))}
          </div>
          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-[#475569]">Loading...</div>
          ) : liveCalls.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="text-sm text-[#475569] mb-2">No ElevenLabs conversations yet</div>
              <div className="text-xs text-[#2A3A54]">{hasRealAgent ? `Make or receive a call via ${tenant?.phoneNumber || "your Twilio number"} to see live transcripts here` : "Connect a real ElevenLabs agent to enable live transcripts."}</div>
            </div>
          ) : (
            <div className="divide-y divide-[#1E2A3E]">
              {liveCalls.map((conv, i) => (
                <div key={conv.conversation_id || i}
                  className="grid grid-cols-[1fr_90px_80px_100px_120px_80px] px-5 py-3.5 hover:bg-[#0A0E1A] cursor-pointer transition-colors"
                  onClick={() => openConvDetail(conv)}>
                  <div>
                    <div className="text-sm font-medium text-white">{conv.call_summary_title || "Call"}</div>
                    <div className="text-xs text-[#475569] mt-0.5 font-mono">{conv.conversation_id}</div>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${conv.direction === "outbound" ? "bg-blue-500/10 text-blue-400" : "bg-[#1E2A3E] text-[#94A3B8]"}`}>
                      {conv.direction || "inbound"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm font-mono text-[#94A3B8]">
                    {fmtDuration(conv.call_duration_secs)}
                  </div>
                  <div className="flex items-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${outcomeColor(conv.call_successful || "")}`}>
                      {conv.call_successful || "unknown"}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-[#475569]">
                    {fmtDate(conv.start_time_unix_secs)}
                  </div>
                  <div className="flex items-center">
                    {conv.has_audio && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">audio</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Local DB calls */}
      {tab === "local" && (
        <>
          <div className="flex gap-2 mb-4">
            {(["all", "completed", "escalated", "missed"] as Outcome[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-colors ${filter === f ? "bg-[#1E2A3E] text-white" : "text-[#475569] hover:text-[#94A3B8]"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_100px_100px_100px] px-5 py-3 border-b border-[#1E2A3E]">
              {["Caller", "Dir.", "Duration", "Status", "Date"].map(h => (
                <div key={h} className="text-xs font-medium text-[#475569]">{h}</div>
              ))}
            </div>
            {loading ? (
              <div className="px-5 py-10 text-center text-sm text-[#475569]">Loading...</div>
            ) : filteredLocal.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-[#475569]">No calls found.</div>
            ) : (
              <div className="divide-y divide-[#1E2A3E]">
                {filteredLocal.map((call, i) => (
                  <div key={call.id || i}
                    className="grid grid-cols-[1fr_80px_100px_100px_100px] px-5 py-3.5 hover:bg-[#0A0E1A] cursor-pointer transition-colors"
                    onClick={() => { setSelected(call); setConvDetail(null); }}>
                    <div>
                      <div className="text-sm font-mono">{call.callerNumber || "Unknown"}</div>
                      <div className="text-xs text-[#475569] mt-0.5 truncate max-w-xs">{call.summary || "—"}</div>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${call.direction === "outbound" ? "bg-blue-500/10 text-blue-400" : "bg-[#1E2A3E] text-[#94A3B8]"}`}>
                        {call.direction || "in"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm font-mono text-[#94A3B8]">{fmtDuration(call.durationSeconds)}</div>
                    <div className="flex items-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${outcomeColor(call.outcome)}`}>{call.outcome || "unknown"}</span>
                    </div>
                    <div className="flex items-center text-xs text-[#475569]">{call.createdAt?.slice(0, 10) || "—"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm"
          onClick={() => { setSelected(null); setConvDetail(null); }}>
          <div
            className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl w-full max-w-2xl m-4 flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2A3E] shrink-0">
              <div>
                <h3 className="font-semibold">
                  {selected.call_summary_title || selected.callerNumber || "Call Detail"}
                </h3>
                <div className="text-xs text-[#475569] mt-0.5 font-mono">
                  {selected.conversation_id || selected.id || "—"}
                </div>
              </div>
              <button onClick={() => { setSelected(null); setConvDetail(null); }}
                className="text-[#475569] hover:text-white text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1E2A3E] transition-colors">
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5">
              {/* Meta */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  ["Duration", fmtDuration(selected.call_duration_secs || selected.durationSeconds)],
                  ["Direction", selected.direction || "inbound"],
                  ["Status", selected.call_successful || selected.outcome || "—"],
                  ["Date", fmtDate(selected.start_time_unix_secs || selected.createdAt)],
                  ["Messages", selected.message_count ? `${selected.message_count} turns` : "—"],
                  ["Language", selected.main_language || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-[#080C14] rounded-xl px-3 py-2.5">
                    <div className="text-xs text-[#475569] mb-0.5">{label}</div>
                    <div className="text-sm font-medium text-white capitalize">{value}</div>
                  </div>
                ))}
              </div>

              {/* AI Summary */}
              {(convDetail?.analysis?.transcript_summary || selected.summary) && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                  <div className="text-xs font-medium text-blue-400 mb-2 uppercase tracking-wide">AI Summary</div>
                  <div className="text-sm text-[#94A3B8] leading-relaxed">
                    {convDetail?.analysis?.transcript_summary || selected.summary}
                  </div>
                </div>
              )}

              {/* Audio player */}
              {(selected.has_audio || convDetail?.has_audio) && selected.conversation_id && (
                <div>
                  <div className="text-xs font-medium text-[#94A3B8] mb-2 uppercase tracking-wide">Call Recording</div>
                  <audio
                    controls
                    src={`/api/tenants/${tenant?.id}/conversations/${selected.conversation_id}/audio`}
                    className="w-full rounded-xl"
                    style={{ filter: "invert(1) hue-rotate(180deg) brightness(0.85)" }}
                  />
                </div>
              )}

              {/* Transcript */}
              <div>
                <div className="text-xs font-medium text-[#94A3B8] mb-3 uppercase tracking-wide">
                  Transcript {loadingDetail && <span className="text-[#475569] normal-case ml-2">Loading...</span>}
                </div>
                {loadingDetail ? (
                  <div className="space-y-2">
                    {[1,2,3].map(i => <div key={i} className="h-10 bg-[#1E2A3E] rounded-xl animate-pulse" />)}
                  </div>
                ) : convDetail?.transcript?.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {convDetail.transcript
                      .filter((e: any) => e.message)
                      .map((entry: any, i: number) => (
                        <div key={i} className={`flex gap-3 ${entry.role === "agent" ? "" : "flex-row-reverse"}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            entry.role === "agent" ? "bg-blue-600 text-white" : "bg-[#1E2A3E] text-[#94A3B8]"
                          }`}>
                            {entry.role === "agent" ? "A" : "U"}
                          </div>
                          <div className={`rounded-2xl px-3.5 py-2.5 max-w-[78%] ${
                            entry.role === "agent"
                              ? "bg-blue-600/10 border border-blue-600/20 text-[#94A3B8]"
                              : "bg-[#1E2A3E] text-white"
                          }`}>
                            <div className="text-sm leading-relaxed">{entry.message}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : selected.transcript ? (
                  <div className="bg-[#080C14] rounded-xl p-4 text-sm text-[#94A3B8]">{selected.transcript}</div>
                ) : !selected.conversation_id ? (
                  <div className="text-xs text-[#475569]">Transcript not available for local-only records.</div>
                ) : (
                  <div className="text-xs text-[#475569]">No transcript available.</div>
                )}
              </div>

              {/* Tool calls */}
              {convDetail?.transcript?.some((e: any) => e.tool_requests) && (
                <div>
                  <div className="text-xs font-medium text-[#94A3B8] mb-2 uppercase tracking-wide">Tool Calls</div>
                  <div className="space-y-1.5">
                    {convDetail.transcript
                      .filter((e: any) => e.tool_requests?.length > 0)
                      .flatMap((e: any) => e.tool_requests)
                      .map((tr: any, i: number) => (
                        <div key={i} className="bg-[#080C14] border border-[#1E2A3E] rounded-xl px-4 py-2.5 flex items-center gap-3">
                          <span className="text-xs font-mono text-emerald-400">{tr.tool_name}</span>
                          <span className="text-xs text-[#475569]">{JSON.stringify(tr.params_as_json)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
