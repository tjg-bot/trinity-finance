"use client";

/**
 * 10-Question Agentic Intake - conversational AI qualifier.
 */
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import type { GapAnalysis, IntakeMessage } from "@trinity/ai";

export default function QualifyPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<IntakeMessage[]>([]);
  const [input, setInput] = useState("");
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chat = trpc.intake.chat.useMutation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startIntake = async () => {
    setStarted(true);
    try {
      const result = await chat.mutateAsync({ history: [] });
      setMessages([{ role: "assistant", content: result.response }]);
    } catch {
      setMessages([{ role: "assistant", content: "Sorry, the AI qualifier is temporarily unavailable. Please try the full application instead." }]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || chat.isPending) return;

    const userMsg: IntakeMessage = { role: "user", content: input };
    const newHistory: IntakeMessage[] = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");

    try {
      const result = await chat.mutateAsync({
        history: newHistory,
        message: input,
      });

      const assistantMsg: IntakeMessage = { role: "assistant", content: result.response };
      setMessages([...newHistory, assistantMsg]);

      if (result.complete && result.gapAnalysis) {
        setGapAnalysis(result.gapAnalysis);
      }
    } catch {
      setMessages([...newHistory, { role: "assistant", content: "Something went wrong. Please try again or start the full application." }]);
    }
  };

  if (gapAnalysis) {
    return <GapAnalysisDisplay analysis={gapAnalysis} onStart={(path) => router.push(path)} />;
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#0B2545] text-4xl">
            🤖
          </div>
          <h1 className="text-3xl font-bold text-[#0B2545]">10-Question Qualifier</h1>
          <p className="mt-3 text-gray-600">
            Our AI will ask you up to 10 short questions and tell you exactly which loan types
            you qualify for today - and what you'd need to do to qualify for others.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Takes 2-3 minutes. No SSN or sensitive information required.
          </p>
        </div>
        <button
          onClick={startIntake}
          className="rounded-lg bg-[#0B2545] px-8 py-4 text-lg font-semibold text-[#C9A227] hover:bg-[#0d2d52]"
        >
          Start Qualifier
        </button>
        <div className="mt-6">
          <a href="/apply" className="text-sm text-gray-500 underline">
            Skip to full application instead
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#0B2545]">Loan Qualifier</h1>
        <p className="text-sm text-gray-500">
          Question {Math.ceil(messages.filter((m) => m.role === "user").length + 1)} of 10
        </p>
      </div>

      {/* Chat window */}
      <div className="flex h-[500px] flex-col rounded-lg border bg-white shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0B2545] text-sm text-[#C9A227]">
                  AI
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-[#0B2545] text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {chat.isPending && (
            <div className="flex justify-start">
              <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0B2545] text-sm text-[#C9A227]">
                AI
              </div>
              <div className="rounded-2xl bg-gray-100 px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
              placeholder="Type your answer..."
              disabled={chat.isPending}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545] disabled:opacity-50"
            />
            <button
              onClick={() => void sendMessage()}
              disabled={chat.isPending || !input.trim()}
              className="rounded-lg bg-[#0B2545] px-4 py-2 text-sm font-semibold text-[#C9A227] hover:bg-[#0d2d52] disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GapAnalysisDisplay({
  analysis,
  onStart,
}: {
  analysis: GapAnalysis;
  onStart: (path: string) => void;
}) {
  const routeMap: Record<string, string> = {
    SBA: "/apply/sba",
    "Line of Credit": "/apply/line-of-credit",
    "Equipment Financing": "/apply/equipment",
    MCA: "/apply/mca",
    "Invoice Financing": "/apply/invoice-financing",
    "Invoice Factoring": "/apply/factoring",
  };

  const primaryPath = routeMap[analysis.recommendedNext] ?? "/apply";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0B2545]">Your Qualification Analysis</h1>
        <p className="mt-2 text-gray-600">
          Based on your answers, here's what you qualify for today.
        </p>
      </div>

      {/* Qualified For */}
      {analysis.qualifiedFor.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <h2 className="mb-3 font-semibold text-green-800">You Qualify For</h2>
          <div className="flex flex-wrap gap-2">
            {analysis.qualifiedFor.map((lt) => (
              <span key={lt} className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                {lt}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Gap Analysis */}
      {analysis.gapAnalysis.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700">What You'd Need to Qualify For</h2>
          {analysis.gapAnalysis.map((gap) => (
            <div key={gap.loanType} className="rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-gray-900">{gap.loanType}</h3>
                <span className="rounded-full border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700">
                  Not Yet
                </span>
              </div>
              <ul className="mt-2 space-y-1">
                {gap.missingCriteria.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-0.5 text-red-400">x</span>
                    {c}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-[#0B2545]">{gap.howToQualify}</p>
            </div>
          ))}
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => onStart(primaryPath)}
          className="flex-1 rounded-lg bg-[#0B2545] py-3 font-semibold text-[#C9A227] hover:bg-[#0d2d52]"
        >
          Start Recommended Application: {analysis.recommendedNext}
        </button>
        <button
          onClick={() => onStart("/apply")}
          className="flex-1 rounded-lg border border-[#0B2545] py-3 font-semibold text-[#0B2545] hover:bg-gray-50"
        >
          View All Options
        </button>
      </div>

      <p className="text-center text-sm text-gray-500">
        Want a copy of this analysis?{" "}
        <button className="text-[#0B2545] underline">Email it to me</button>
      </p>
    </div>
  );
}
