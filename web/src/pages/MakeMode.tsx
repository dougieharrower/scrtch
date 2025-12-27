import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getRecipeById } from "../data/recipesStore";

type StepTimer = {
  label: string;
  seconds: number;
  kind?: "countdown" | "in";
};

type RunningTimer = {
  stepIndex: number;
  label: string;
  endTime: number; // timestamp (ms)
};

type CatchUpPrompt = null | {
  targetIdx: number;
  activeIndex: number;
};

type SuggestTimerPrompt = null | {
  baseLabel: string;
  suggestions: Array<{
    stepIndex: number;
    label: string;
    seconds: number;
  }>;
};

export default function MakeMode() {
  const { id } = useParams();

  // ✅ IMPORTANT FIX: look up from store, not sampleRecipes
  const recipe = useMemo(() => (id ? getRecipeById(id) : undefined), [id]);

  const [completed, setCompleted] = useState<number[]>([]);
  const [timers, setTimers] = useState<RunningTimer[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [showCompleted, setShowCompleted] = useState(false);

  const [catchUpPrompt, setCatchUpPrompt] = useState<CatchUpPrompt>(null);
  const [suggestTimerPrompt, setSuggestTimerPrompt] =
    useState<SuggestTimerPrompt>(null);

  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Tick clock (keeps timer display updating without Date.now() during render)
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  // Auto-scroll active step into view
  useEffect(() => {
    if (!recipe) return;

    const activeIndexRaw = recipe.steps.findIndex(
      (_, i) => !completed.includes(i)
    );
    const activeIndex = activeIndexRaw === -1 ? 0 : activeIndexRaw;

    const el = stepRefs.current[activeIndex];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [recipe, completed]);

  if (!recipe) {
    return (
      <div style={{ padding: 24 }}>
        <p>Recipe not found.</p>
        <Link to="/recipes">← Back</Link>
      </div>
    );
  }

  const r = recipe;

  const activeIndexRaw = r.steps.findIndex((_, i) => !completed.includes(i));
  const activeIndex = activeIndexRaw === -1 ? 0 : activeIndexRaw;

  const completedSteps = r.steps
    .map((s, idx) => ({ s, idx }))
    .filter(({ idx }) => completed.includes(idx));

  const remainingSteps = r.steps
    .map((s, idx) => ({ s, idx }))
    .filter(({ idx }) => !completed.includes(idx));

  function hasRunningTimer(stepIndex: number, label: string) {
    return timers.some(
      (t) => t.stepIndex === stepIndex && t.label === label && t.endTime > now
    );
  }

  function addTimer(stepIndex: number, label: string, seconds: number) {
    if (hasRunningTimer(stepIndex, label)) return;

    setTimers((prev) => [
      ...prev,
      { stepIndex, label, endTime: now + seconds * 1000 },
    ]);
  }

  function remainingSeconds(t: RunningTimer) {
    return Math.max(0, Math.floor((t.endTime - now) / 1000));
  }

  function toggleStepSimple(idx: number) {
    setCompleted((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }

  function handleDoneClick(idx: number) {
    if (completed.includes(idx)) {
      toggleStepSimple(idx);
      return;
    }

    if (idx === activeIndex) {
      setCompleted((prev) => [...prev, idx]);
      return;
    }

    if (idx > activeIndex) {
      setCatchUpPrompt({ targetIdx: idx, activeIndex });
      return;
    }

    setCompleted((prev) => [...prev, idx]);
  }

  function completeOnlyTarget(targetIdx: number) {
    setCompleted((prev) =>
      prev.includes(targetIdx) ? prev : [...prev, targetIdx]
    );
    setCatchUpPrompt(null);
  }

  function completeAllPrevious(targetIdx: number) {
    setCompleted((prev) => {
      const set = new Set(prev);
      for (let i = 0; i <= targetIdx; i++) set.add(i);
      return Array.from(set).sort((a, b) => a - b);
    });
    setCatchUpPrompt(null);
  }

  function startTimer(stepIndex: number) {
    const step = r.steps[stepIndex];
    const timer = step.timer as StepTimer | undefined;
    if (!timer) return;

    addTimer(stepIndex, timer.label, timer.seconds);

    const kind = timer.kind ?? "countdown";
    if (kind === "countdown") {
      const suggestions = r.steps
        .map((s, idx) => {
          const t = s.timer as StepTimer | undefined;
          if (!t) return null;
          if ((t.kind ?? "countdown") !== "in") return null;
          if (hasRunningTimer(idx, t.label)) return null;
          return { stepIndex: idx, label: t.label, seconds: t.seconds };
        })
        .filter(Boolean) as {
        stepIndex: number;
        label: string;
        seconds: number;
      }[];

      if (suggestions.length > 0) {
        setSuggestTimerPrompt({
          baseLabel: timer.label,
          suggestions,
        });
      }
    }
  }

  const isAllDone = completed.length === r.steps.length;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <style>{`
        @keyframes scrtchPulse {
          0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.12); }
          70% { box-shadow: 0 0 0 10px rgba(255,255,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }
      `}</style>

      <Link to={`/recipes/${r.id}`}>← Back to recipe</Link>

      <h1 style={{ marginTop: 12 }}>{r.title}</h1>
      <p style={{ opacity: 0.75 }}>Make Mode — focus on what’s next</p>

      {/* Relative timer suggestion modal */}
      {suggestTimerPrompt && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 999,
          }}
          onClick={() => setSuggestTimerPrompt(null)}
        >
          <div
            style={{
              width: "min(560px, 100%)",
              border: "1px solid #333",
              borderRadius: 16,
              background: "#111",
              padding: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 800, fontSize: 16 }}>
              Timer started: {suggestTimerPrompt.baseLabel}
            </div>
            <div style={{ marginTop: 8, opacity: 0.85 }}>
              This recipe also has “start later” timers. Start any of these now?
            </div>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              {suggestTimerPrompt.suggestions.map((s) => (
                <button
                  key={`${s.stepIndex}-${s.label}`}
                  onClick={() => {
                    addTimer(s.stepIndex, s.label, s.seconds);
                    setSuggestTimerPrompt(null);
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #444",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  ⏱ {s.label} ({Math.round(s.seconds / 60)} min)
                  <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>
                    Starts a timer counting down from now.
                  </div>
                </button>
              ))}

              <button
                onClick={() => setSuggestTimerPrompt(null)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #444",
                  cursor: "pointer",
                }}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catch-up prompt modal */}
      {catchUpPrompt && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 998,
          }}
          onClick={() => setCatchUpPrompt(null)}
        >
          <div
            style={{
              width: "min(560px, 100%)",
              border: "1px solid #333",
              borderRadius: 16,
              background: "#111",
              padding: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 800, fontSize: 16 }}>
              Mark Step {catchUpPrompt.targetIdx + 1} as done?
            </div>

            <div style={{ marginTop: 8, opacity: 0.85 }}>
              You’re skipping ahead (next step is{" "}
              {catchUpPrompt.activeIndex + 1}
              ). Want to catch up?
            </div>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <button
                onClick={() => completeAllPrevious(catchUpPrompt.targetIdx)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #444",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                ✅ Complete all previous steps (1 →{" "}
                {catchUpPrompt.targetIdx + 1})
                <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>
                  Best if you did several steps while not looking at the app.
                </div>
              </button>

              <button
                onClick={() => completeOnlyTarget(catchUpPrompt.targetIdx)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #444",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                ☑️ Complete only this step
                <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>
                  Best if you prepped this ahead of time.
                </div>
              </button>

              <button
                onClick={() => setCatchUpPrompt(null)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #444",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active timers */}
      {timers.length > 0 && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            border: "1px solid #333",
            borderRadius: 14,
            background: "#111",
          }}
        >
          <strong>⏱ Timers running</strong>
          <ul style={{ marginTop: 8 }}>
            {timers.map((t, i) => (
              <li key={i}>
                {t.label}:{" "}
                <strong>{Math.ceil(remainingSeconds(t) / 60)} min</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Completed toggle */}
      {completed.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <button
            onClick={() => setShowCompleted((v) => !v)}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #444",
              cursor: "pointer",
            }}
          >
            {showCompleted ? "Hide" : "Show"} completed ({completed.length})
          </button>

          {showCompleted && (
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {completedSteps.map(({ s, idx }) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #333",
                    borderRadius: 14,
                    padding: 12,
                    opacity: 0.55,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div>
                      <strong>Step {idx + 1}</strong>
                      <div style={{ marginTop: 6 }}>{s.text}</div>
                    </div>
                    <button
                      onClick={() => toggleStepSimple(idx)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: "1px solid #444",
                        cursor: "pointer",
                        height: "fit-content",
                      }}
                    >
                      ↩ Undo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Remaining steps */}
      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {remainingSteps.map(({ s: step, idx }) => {
          const isActive = idx === activeIndex;
          const timer = step.timer as StepTimer | undefined;

          const timerRunning = !!timer && hasRunningTimer(idx, timer.label);

          return (
            <div
              key={idx}
              ref={(el) => {
                stepRefs.current[idx] = el;
              }}
              style={{
                border: "1px solid #333",
                borderRadius: 16,
                padding: 14,
                background: isActive ? "#111" : "transparent",
                animation: isActive
                  ? "scrtchPulse 1.6s ease-out infinite"
                  : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <strong>Step {idx + 1}</strong>
                  <div style={{ marginTop: 6 }}>{step.text}</div>

                  {timer && (
                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
                      Suggested timer:{" "}
                      <strong>
                        {timer.label} ({Math.round(timer.seconds / 60)} min)
                        {timer.kind === "in" ? " (start later)" : ""}
                      </strong>
                    </div>
                  )}
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <button
                    onClick={() => handleDoneClick(idx)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid #444",
                      cursor: "pointer",
                    }}
                  >
                    ✓ Done
                  </button>

                  {timer && (
                    <button
                      onClick={() => startTimer(idx)}
                      disabled={timerRunning}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: "1px solid #444",
                        cursor: timerRunning ? "not-allowed" : "pointer",
                        opacity: timerRunning ? 0.6 : 1,
                      }}
                      title={
                        timerRunning ? "Timer already running" : "Start timer"
                      }
                    >
                      ⏱ {timerRunning ? "Timer running" : "Start timer"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isAllDone && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            border: "1px solid #333",
            borderRadius: 16,
            textAlign: "center",
          }}
        >
          🎉 You’re done. Take a photo. Write a note. Fork it next time.
        </div>
      )}
    </div>
  );
}
