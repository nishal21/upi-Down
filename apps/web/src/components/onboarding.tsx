"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Megaphone, Search, Shield, Star } from "lucide-react";
import { pinFavorites } from "@/lib/favorites";
import { createStored } from "@/lib/store";
import { useIsNative } from "@/lib/use-native";
import { haptic } from "@/lib/native";
import { cn } from "@/lib/utils";

const onboarded = createStored<boolean>("upidown-onboarded", false);

const STEPS = [
  { id: "board", label: "LIVE BOARD" },
  { id: "banks", label: "YOUR BANKS" },
  { id: "report", label: "REPORT" },
  { id: "honest", label: "HONEST NOTE" },
] as const;

const DEMO_BANKS = [
  { id: "sbi", short: "SBI", name: "State Bank of India", line: "Few failures · just now", tone: "ok" as const },
  { id: "hdfc", short: "HDFC", name: "HDFC Bank", line: "Elevated reports · 4 min ago", tone: "slow" as const },
  { id: "icici", short: "ICICI", name: "ICICI Bank", line: "Outage · many reports", tone: "down" as const },
  { id: "axis", short: "AXIS", name: "Axis Bank", line: "Quiet · just now", tone: "ok" as const },
];

const REPORT_KINDS = [
  { id: "failed", label: "PAYMENT DECLINED" },
  { id: "pending", label: "MONEY STUCK" },
  { id: "slow", label: "VERY SLOW" },
  { id: "app", label: "APP NOT OPENING" },
] as const;

function forcePreview() {
  try {
    return new URLSearchParams(window.location.search).get("onboard") === "1";
  } catch {
    return false;
  }
}

function ToneChip({ tone }: { tone: "ok" | "slow" | "down" }) {
  const map = {
    ok: { text: "LIVE", cls: "border-[#1a7a3c] bg-[#d8f0e0] text-[#1a7a3c]" },
    slow: { text: "SLOW", cls: "border-[#b8860b] bg-[#f5e6b8] text-[#8a6500]" },
    down: { text: "DOWN", cls: "border-[#c0392b] bg-[#f8d4ce] text-[#c0392b]" },
  }[tone];
  return (
    <span className={cn("inline-flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[10px] font-bold", map.cls)}>
      <span className="size-1.5 bg-current" aria-hidden />
      {map.text}
    </span>
  );
}

function StepHeader({ step, onSkip, showSkip }: { step: number; onSkip: () => void; showSkip: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-[#1a1a1a]">
          Step {String(step + 1).padStart(2, "0")} / 04 — {STEPS[step].label}
        </p>
        {showSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="border border-[#1a1a1a] bg-transparent px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-[#1a1a1a]"
          >
            Skip
          </button>
        )}
      </div>
      <div className="flex gap-1" aria-hidden>
        {STEPS.map((_, i) => (
          <span key={STEPS[i].id} className={cn("h-1 flex-1", i <= step ? "bg-[#1a1a1a]" : "bg-[#1a1a1a]/20")} />
        ))}
      </div>
    </div>
  );
}

function LiveBoardSlide() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
      <div className="space-y-2 pt-2">
        <span className="inline-block bg-[#e4432d] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-white">
          Never guess before you pay
        </span>
        <h1 className="font-display text-[1.85rem] font-extrabold leading-[1.05] tracking-tight text-[#1a1a1a]">
          Know if your bank&apos;s UPI is live.
        </h1>
        <p className="text-[14px] leading-relaxed text-[#5c5c5c]">
          Live status from crowd reports in the last 15 minutes. Green means try. Red means wait.
        </p>
      </div>

      <motion.div
        className="overflow-hidden border-2 border-[#1a1a1a] bg-white"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      >
        <div className="flex items-center justify-between bg-[#2a2e27] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wide text-[#ece6d6]">
          <span>Live board</span>
          <span className="text-[#8fa3a8]">■ Reports · 15m</span>
        </div>
        {DEMO_BANKS.slice(0, 3).map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 + i * 0.07 }}
            className={cn(
              "flex items-center gap-2.5 border-t border-[#1a1a1a]/15 px-3 py-2.5",
              b.tone === "down" && "bg-[#fdeceb]",
            )}
          >
            <span className="grid size-9 shrink-0 place-items-center border border-[#1a1a1a] bg-[#f4efe3] font-mono text-[10px] font-extrabold text-[#1a1a1a]">
              {b.short.slice(0, 3)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold text-[#1a1a1a]">{b.name}</span>
              <span className="block truncate font-mono text-[10px] text-[#6b6b6b]">{b.line}</span>
            </span>
            <ToneChip tone={b.tone} />
          </motion.div>
        ))}
        <div className="border-t border-[#1a1a1a]/20 bg-[#ece6d6] px-3 py-2 font-mono text-[10px] font-semibold text-[#1a1a1a]">
          12 banks live · 2 slow · 1 down right now
        </div>
      </motion.div>

      <div className="border border-dashed border-[#1a1a1a] px-3 py-2.5 text-[12px] leading-snug text-[#3d3d3d]">
        Check status before every big payment — saves failed txn charges.
      </div>
    </div>
  );
}

function BanksSlide({
  starred,
  onToggle,
}: {
  starred: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
      <div className="space-y-2 pt-2">
        <h1 className="font-display text-[1.85rem] font-extrabold leading-[1.05] tracking-tight text-[#1a1a1a]">
          Star the banks you use.
        </h1>
        <p className="text-[14px] leading-relaxed text-[#5c5c5c]">
          Pin up to 5 banks to the top of your board. Change them anytime.
        </p>
      </div>

      <div className="flex h-11 items-center gap-2 border-2 border-[#1a1a1a] bg-white px-3">
        <Search className="size-4 text-[#1a1a1a]" aria-hidden />
        <span className="text-[13px] text-[#8a8a8a]">Search banks… e.g. SBI</span>
      </div>

      <div className="space-y-2">
        {DEMO_BANKS.map((b, i) => {
          const on = starred.has(b.id);
          return (
            <motion.button
              key={b.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onToggle(b.id)}
              className="flex w-full items-center gap-2.5 border-2 border-[#1a1a1a] bg-white px-2.5 py-2 text-start"
            >
              <span className="grid size-10 shrink-0 place-items-center border border-[#1a1a1a] bg-[#f4efe3] font-mono text-[10px] font-extrabold">
                {b.short.slice(0, 3)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold text-[#1a1a1a]">{b.name}</span>
                <span className="mt-0.5 flex items-center gap-2">
                  <ToneChip tone={b.tone} />
                </span>
              </span>
              <span
                className={cn(
                  "grid size-10 place-items-center border-2 border-[#1a1a1a]",
                  on ? "bg-[#1a1a1a] text-white" : "bg-white text-[#1a1a1a]",
                )}
              >
                <Star className={cn("size-4", on && "fill-current")} aria-hidden />
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center justify-between bg-[#1a1a1a] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wide text-white">
        <span>
          {starred.size} of 5 starred
        </span>
        <span className="font-semibold normal-case tracking-normal opacity-80">Pinned on your board</span>
      </div>
      <p className="text-center text-[12px] text-[#7a7a7a]">You can change this later from the board</p>
    </div>
  );
}

function ReportSlide({ kind, setKind }: { kind: string; setKind: (k: string) => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
      <div className="space-y-2 pt-2">
        <span className="inline-block bg-[#1a1a1a] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-white">
          30-second report
        </span>
        <h1 className="font-display text-[1.85rem] font-extrabold leading-[1.05] tracking-tight text-[#1a1a1a]">
          Payment failed? Shout it out.
        </h1>
        <p className="text-[14px] leading-relaxed text-[#5c5c5c]">
          One tap tells others to wait — before their money gets stuck too.
        </p>
      </div>

      <motion.div
        className="space-y-3 border-2 border-[#1a1a1a] bg-white p-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]">
          Report a failed payment
        </p>
        <div className="flex h-11 items-center justify-between border-2 border-[#1a1a1a] px-3 text-[13px] font-semibold text-[#1a1a1a]">
          <span>ICICI Bank · UPI</span>
          <span aria-hidden>▾</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {REPORT_KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              className={cn(
                "border-2 border-[#1a1a1a] px-2 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wide",
                kind === k.id ? "bg-[#1a1a1a] text-white" : "bg-white text-[#1a1a1a]",
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
        <div className="flex h-12 items-center justify-center gap-2 bg-[#e4432d] font-mono text-[12px] font-bold uppercase tracking-wide text-white">
          <Megaphone className="size-4" aria-hidden />
          Submit report
        </div>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#6b6b6b]">
          <Shield className="size-3.5" aria-hidden />
          Anonymous. No UPI ID or amount needed.
        </p>
      </motion.div>
      <p className="text-center text-[12px] text-[#7a7a7a]">Reports take ~10 seconds on the real board.</p>
    </div>
  );
}

function HonestSlide({ agreed, setAgreed }: { agreed: boolean; setAgreed: (v: boolean) => void }) {
  const points = [
    { t: "Reports are signals, not proof.", d: "A spike means trouble is likely, not certain." },
    { t: "We filter spam.", d: "Duplicate & flood reports are rate-limited before scoring." },
    { t: "Not financial advice.", d: "For stuck money, raise a complaint in your UPI app." },
  ];
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
      <div className="space-y-2 pt-2">
        <h1 className="font-display text-[1.85rem] font-extrabold leading-[1.05] tracking-tight text-[#1a1a1a]">
          Powered by people like you.
        </h1>
        <p className="text-[14px] leading-relaxed text-[#5c5c5c]">
          Status comes from crowd reports. Fast, but not official. Always check your bank app for large transfers.
        </p>
      </div>

      <div className="border-2 border-[#1a1a1a] bg-white">
        <div className="flex items-center gap-2 border-b-2 border-[#1a1a1a] px-3 py-2.5">
          <span className="grid size-6 place-items-center border border-[#1a1a1a] font-mono text-[10px] font-bold">◎</span>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-[#1a1a1a]">
            How our crowd data works
          </p>
        </div>
        <ol className="space-y-3 px-3 py-3">
          {points.map((p, i) => (
            <motion.li
              key={p.t}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.08 }}
              className="flex gap-3 text-[13px] leading-snug"
            >
              <span className="font-mono text-[12px] font-bold text-[#1a1a1a]">{i + 1}.</span>
              <span>
                <span className="font-bold text-[#1a1a1a]">{p.t}</span>{" "}
                <span className="text-[#5c5c5c]">{p.d}</span>
              </span>
            </motion.li>
          ))}
        </ol>
      </div>

      <button
        type="button"
        onClick={() => setAgreed(!agreed)}
        className="flex items-start gap-3 border-2 border-[#1a1a1a] bg-white px-3 py-3 text-start"
      >
        <span
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center border-2 border-[#1a1a1a] font-mono text-[11px] font-bold",
            agreed ? "bg-[#1a1a1a] text-white" : "bg-white",
          )}
          aria-hidden
        >
          {agreed ? "✓" : ""}
        </span>
        <span className="text-[13px] leading-snug text-[#1a1a1a]">
          I understand status is crowd-sourced and may lag a few minutes during major outages.
        </span>
      </button>
      <p className="text-center font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a7a7a]">
        Free forever · No login needed
      </p>
    </div>
  );
}

export function Onboarding() {
  const native = useIsNative();
  const done = onboarded.use();
  const reduce = useReducedMotion();
  const preview = forcePreview();
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(true);
  const [starred, setStarred] = useState<Set<string>>(() => new Set(["sbi", "hdfc"]));
  const [kind, setKind] = useState("pending");
  const [agreed, setAgreed] = useState(true);

  const last = step === STEPS.length - 1;

  if ((!native && !preview) || (done && !preview) || !open) return null;

  function finish() {
    void haptic("success");
    pinFavorites([...starred].slice(0, 5));
    onboarded.set(true);
    setOpen(false);
  }

  function next() {
    if (last && !agreed) {
      void haptic("warn");
      return;
    }
    void haptic("tap");
    if (last) finish();
    else setStep((s) => s + 1);
  }

  function toggleStar(id: string) {
    void haptic("tap");
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 5) next.add(id);
      return next;
    });
  }

  const hint = useMemo(() => {
    if (step === 0) return "Swipe or tap Continue";
    if (step === 2) return "Reports take ~10 seconds";
    if (step === 3) return "Free forever · No login needed";
    return "You can change this later from the board";
  }, [step]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#f4efe3] text-[#1a1a1a]"
      style={{
        paddingTop: "max(0.75rem, env(safe-area-inset-top))",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboard-title"
    >
      <div className="px-4 pt-1">
        <StepHeader step={step} onSkip={finish} showSkip={!last} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-3 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={STEPS[step].id}
            className="flex min-h-0 flex-1 flex-col"
            initial={reduce ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div id="onboard-title" className="sr-only">
              {STEPS[step].label}
            </div>
            {step === 0 && <LiveBoardSlide />}
            {step === 1 && <BanksSlide starred={starred} onToggle={toggleStar} />}
            {step === 2 && <ReportSlide kind={kind} setKind={setKind} />}
            {step === 3 && <HonestSlide agreed={agreed} setAgreed={setAgreed} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="space-y-2 px-4 pb-2">
        {step !== 3 && <p className="text-center text-[12px] text-[#7a7a7a]">{hint}</p>}
        <div className="flex items-center gap-3">
          <div className="flex flex-1 gap-1.5" aria-hidden>
            {STEPS.map((s, i) => (
              <span
                key={s.id}
                className={cn("h-2 w-7 border-2 border-[#1a1a1a]", i === step ? "bg-[#1a1a1a]" : "bg-transparent")}
              />
            ))}
          </div>
          <motion.button
            type="button"
            onClick={next}
            whileTap={reduce ? undefined : { scale: 0.98 }}
            disabled={last && !agreed}
            className={cn(
              "h-12 min-w-[9.5rem] bg-[#1a1a1a] px-5 font-display text-sm font-bold text-white disabled:opacity-40",
            )}
          >
            {last ? "Get started →" : "Continue →"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
