"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Share2, Star } from "lucide-react";
import { toast } from "sonner";
import {
  BANK_BY_ID,
  REPORT_KINDS,
  UPI_APP_BY_ID,
  searchApps,
  shareLine,
  type EntityStatus,
  type ReportKind,
  type Verdict,
} from "@upi-down/shared";
import { NumberTicker } from "@/components/ui/number-ticker";
import { PulsatingButton } from "@/components/ui/pulsating-button";
import { bankUrl } from "@/lib/config";
import { deviceId } from "@/lib/device";
import { useFavorites } from "@/lib/favorites";
import { useT } from "@/lib/i18n";
import { sendReport, useLive } from "@/lib/live";
import { haptic, share } from "@/lib/native";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { SignalPlate, Sparkline, STATUS_ICON, STATUS_TEXT } from "./status";
import { Turnstile } from "./turnstile";

const chip =
  "h-9 rounded-[3px] border border-base-300 px-3 text-sm font-medium transition-colors aria-pressed:border-base-content aria-pressed:bg-base-content aria-pressed:text-base-100";

const empty = (id: string): EntityStatus => ({
  id,
  status: "unknown",
  total: 0,
  counts: { failed: 0, pending: 0, slow: 0 },
  spark: Array(24).fill(0),
});

export function BankPanel({ bankId, onPickBank }: { bankId: string; onPickBank?: (id: string) => void }) {
  const { t, lang } = useT();
  const { theme } = useTheme();
  const { snapshot } = useLive();
  const { isFav, toggle } = useFavorites();
  const bank = BANK_BY_ID[bankId];

  const [kind, setKind] = useState<ReportKind>("failed");
  const [appId, setAppId] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [needCaptcha, setNeedCaptcha] = useState(false);
  const [token, setToken] = useState<string | undefined>();
  const [captchaReset, setCaptchaReset] = useState(0);
  const onToken = useCallback((tk: string | undefined) => setToken(tk), []);

  const [appQuery, setAppQuery] = useState("");
  const picked = appId && !searchApps(appQuery).some((a) => a.id === appId) ? [UPI_APP_BY_ID[appId]] : [];
  const appChoices = [...picked, ...searchApps(appQuery)].filter((a) => a.id !== "bank-app" || bank.psp);

  const [fresh, setFresh] = useState<EntityStatus | null>(null);
  const fromSnapshot = snapshot?.banks.find((b) => b.id === bankId) ?? empty(bankId);
  const live = fresh && fresh.total > fromSnapshot.total ? { ...fresh, spark: fromSnapshot.spark } : fromSnapshot;
  const Icon = STATUS_ICON[live.status];
  const alternatives = (snapshot?.banks ?? [])
    .filter((b) => b.id !== bankId && b.status === "ok" && BANK_BY_ID[b.id]?.tier === 1)
    .slice(0, 4);

  async function submit() {
    if (sending) return;
    setSending(true);
    void haptic("tap");
    const res = await sendReport({ bankId, kind, appId, deviceId: deviceId(), turnstileToken: token });
    setSending(false);
    if (token) {
      setToken(undefined);
      setCaptchaReset((n) => n + 1);
    }
    if (res.ok) {
      setVerdict(res.verdict);
      setFresh(res.bank);
      setNeedCaptcha(false);
      void haptic("success");
      toast.success(t.reported);
      return;
    }
    void haptic("warn");
    if (res.error === "rate_limited") toast.message(t.rateLimited(Math.ceil((res.retryAfter ?? 600) / 60)));
    else if (res.error === "captcha") {
      setNeedCaptcha(true);
      toast.message(t.captcha);
    } else toast.error(t.failed);
  }

  const doShare = () => share(shareLine(bank.short, live.status), bankUrl(bankId));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <SignalPlate label={bank.short} status={live.status} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="board-label">{bank.name}</p>
          <p className={cn("mt-0.5 flex items-center gap-2 font-display text-4xl font-extrabold leading-none", STATUS_TEXT[live.status])}>
            <Icon className="size-7 shrink-0" strokeWidth={2.4} aria-hidden />
            {t.status[live.status]}
          </p>
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            <li className="inline-flex h-6 items-center rounded-[3px] border border-base-300 px-2 font-mono text-[11px] font-bold tracking-wide">
              {bank.short}
            </li>
            {bank.psp && (
              <li className="inline-flex h-6 items-center rounded-[3px] border border-base-300 bg-base-200 px-2 text-[11px] font-semibold">
                Own UPI app
              </li>
            )}
            {bank.ppi && (
              <li className="inline-flex h-6 items-center rounded-[3px] border border-base-300 bg-base-200 px-2 text-[11px] font-semibold">
                Wallet / payments bank
              </li>
            )}
            <li className="inline-flex h-6 items-center rounded-[3px] border border-dashed border-base-300 px-2 text-[11px] text-muted-foreground">
              NPCI UPI member
            </li>
          </ul>
          <p className="tnum mt-2 font-mono text-sm text-muted-foreground">
            {live.total > 0 ? (
              <>
                <NumberTicker value={live.total} className="font-semibold text-base-content" />{" "}
                {t.reportsLabel}
              </>
            ) : (
              t.noReports15
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggle(bankId)}
          aria-label={isFav(bankId) ? t.favRemove : t.favAdd}
          aria-pressed={isFav(bankId)}
          className="grid size-11 place-items-center rounded-[3px] border border-base-300 text-muted-foreground hover:text-base-content"
        >
          <Star className={cn("size-5", isFav(bankId) && "fill-current text-base-content")} />
        </button>
      </div>

      {live.total > 0 && (
        <div className="stats stats-horizontal rounded-[4px] border border-base-300 bg-transparent">
          {REPORT_KINDS.map((k) => (
            <div key={k} className="stat px-3 py-2">
              <div className="stat-title text-[11px]">{t.kind[k]}</div>
              <div className="stat-value tnum font-mono text-xl">{live.counts[k]}</div>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="board-label mb-2">{t.last24}</p>
        <div className="overflow-x-auto">
          <Sparkline data={live.spark} status={live.status} tall />
        </div>
      </div>

      <div className="border-t border-base-300 pt-5">
        <AnimatePresence mode="wait" initial={false}>
          {verdict ? (
            <motion.div
              key="verdict"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="flex gap-3 rounded-[4px] border border-base-300 bg-base-200 p-4">
                <Check className="mt-0.5 size-5 shrink-0 text-ok" aria-hidden />
                <div>
                  <p className="font-display text-lg font-bold">{t.verdictTitle}</p>
                  <p className="mt-1 text-[15px] leading-relaxed">{t.verdict[verdict]}</p>
                </div>
              </div>
              {alternatives.length > 0 && (
                <div>
                  <p className="board-label mb-2">{t.tryInstead}</p>
                  <div className="flex flex-wrap gap-2">
                    {alternatives.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => onPickBank?.(a.id)}
                        className="badge h-8 gap-1.5 rounded-[3px] border-ok/50 bg-ok/10 px-2.5 font-mono text-xs font-semibold text-ok"
                      >
                        <span className="status status-success" aria-hidden />
                        {BANK_BY_ID[a.id].short}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="form" exit={{ opacity: 0 }} className="flex flex-col gap-5">
              <fieldset>
                <legend className="board-label mb-2">{t.whatHappened}</legend>
                <div className="flex flex-wrap gap-2">
                  {REPORT_KINDS.map((k) => (
                    <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={chip}>
                      {t.kind[k]}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="board-label mb-2">{t.whichApp}</legend>
                <input
                  type="search"
                  value={appQuery}
                  onChange={(e) => setAppQuery(e.target.value)}
                  placeholder={t.appSearch}
                  aria-label={t.appSearch}
                  className="mb-2 h-9 w-full rounded-[3px] border border-base-300 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-base-content"
                />
                <div className="flex flex-wrap gap-2">
                  {appChoices.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      aria-pressed={appId === a.id}
                      onClick={() => setAppId(appId === a.id ? undefined : a.id)}
                      className={cn(chip, "h-8 px-2.5 text-[13px]")}
                    >
                      {a.name}
                    </button>
                  ))}
                  {appChoices.length === 0 && <p className="text-sm text-muted-foreground">{t.noApp}</p>}
                </div>
              </fieldset>
              {needCaptcha && <Turnstile onToken={onToken} theme={theme} lang={lang === "hi" ? "hi" : "auto"} resetKey={captchaReset} />}
              <PulsatingButton
                type="button"
                onClick={submit}
                disabled={sending || (needCaptcha && !token)}
                pulseColor="color-mix(in oklab, var(--color-error) 45%, transparent)"
                duration="2s"
                distance="10px"
                className="h-14 w-full rounded-[4px] bg-down font-display text-lg font-bold text-error-content disabled:opacity-60"
              >
                {sending ? t.reporting : t.reportBtn(bank.short)}
              </PulsatingButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={doShare}
        className="flex h-12 items-center justify-center gap-2 rounded-[4px] border border-base-300 font-medium hover:bg-base-200"
      >
        <Share2 className="size-4" aria-hidden /> {t.shareWa}
      </button>

      <p className="text-xs leading-relaxed text-muted-foreground">{t.disclaimer}</p>
    </div>
  );
}
