import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Zap,
  Sparkles,
  Trophy,
  Sword,
  Shield,
  RotateCcw,
  Play,
  Star,
  Flame,
  Medal,
  Crown,
  User,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { ALL_SUBJECTS } from "../../types";

interface Question {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

interface LeaderboardEntry {
  id: string;
  playerName: string;
  className: string;
  subject: string;
  score: number;
}

const SUBJECTS = ALL_SUBJECTS.map((s) => ({ label: s, value: s }));

const CLASSES = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SS 1",
  "SS 2",
  "SS 3",
];

const OPTION_LETTERS = ["A", "B", "C", "D"];

const isEmpty = (value: string) => !value || !value.trim();

const streakBonus = (score: number, total: number, bestStreak: number) =>
  Math.floor((score / Math.max(total, 1)) * 100) + bestStreak * 5;

export const GamifiedLearningView: React.FC = () => {
  const [screen, setScreen] = useState<"setup" | "battle" | "end">("setup");
  const [subject, setSubject] = useState<string>("Mathematics");
  const [playerName, setPlayerName] = useState("");
  const [className, setClassName] = useState("JSS 1");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingBattle, setLoadingBattle] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const timerRef = useRef<number | null>(null);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLeaderboardLoading(true);
      const res = await fetch("/api/games/leaderboard");
      const data = await res.json();
      if (data.ok && data.data) setLeaderboard(data.data);
    } catch {
      setLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const startBattle = async () => {
    setLoadingBattle(true);
    try {
      const res = await fetch(`/api/games/questions?subject=${encodeURIComponent(subject)}`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      const qs: Question[] = data.ok ? data.data : [];
      if (qs.length === 0) {
        setLoadingBattle(false);
        alert("No questions available for this subject. Please try another subject.");
        return;
      }
      setQuestions(qs);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setBestStreak(0);
      setSelected(null);
      setIsCorrect(null);
      setResults(new Array(qs.length).fill(false));
      setScreen("battle");
    } catch {
      setLoadingBattle(false);
      alert("Failed to load questions. Please check your connection and try again.");
    }
  };

  const chooseOption = (optionIndex: number) => {
    if (selected !== null) return;
    const q = questions[currentIndex];
    if (!q) return;
    const correct = optionIndex === q.correctOptionIndex;
    setSelected(optionIndex);
    setIsCorrect(correct);
    if (correct) {
      const bonus = streak >= 2 ? 5 : 0;
      setScore((s) => s + 10 + bonus);
      setBestStreak((b) => Math.max(b, streak + 1));
    }
    setStreak((st) => (correct ? st + 1 : 0));
    setResults((r) => {
      const next = [...r];
      next[currentIndex] = correct;
      return next;
    });
    timerRef.current = window.setTimeout(() => advanceQuiz(), 1400);
  };

  const advanceQuiz = () => {
    setSelected(null);
    setIsCorrect(null);
    if (currentIndex + 1 >= questions.length) {
      setScreen("end");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePlayAgain = () => {
    setScreen("setup");
    setQuestions([]);
    setResults([]);
    setPosted(false);
  };

  const postAndRefresh = async () => {
    if (posting || posted) return;
    setPosting(true);
    try {
      const res = await fetch("/api/games/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: isEmpty(playerName) ? "Challenger" : playerName.trim(),
          className,
          subject,
          score,
        }),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.data)) {
        setLeaderboard(data.data);
        setPosted(true);
      }
    } catch {
      await fetchLeaderboard();
    } finally {
      setPosting(false);
    }
  };

  const totalQuestions = questions.length;
  const percent = totalQuestions ? Math.round((score / (totalQuestions * 10)) * 100) : 0;
  const medal = totalQuestions === 0 ? null : percent >= 80 ? "gold" : percent >= 55 ? "silver" : percent >= 30 ? "bronze" : null;

  const rankStyles =
    percent >= 80
      ? "from-amber-300 via-yellow-200 to-amber-400 text-amber-900"
      : percent >= 55
      ? "from-slate-200 via-slate-100 to-slate-300 text-slate-800"
      : percent >= 30
      ? "from-orange-300 via-amber-200 to-amber-400 text-amber-900"
      : "from-slate-200 to-slate-300 text-slate-700";

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 shadow-lg">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 left-1/3 w-32 h-32 rounded-full bg-emerald-300/20 blur-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 text-white">
                <Zap className="w-5 h-5" />
              </span>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Gamified Learning Arena
                </h1>
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>
            </div>
            <p className="text-sm text-indigo-100">
              Battle through quiz questions, build streaks, and climb the school leaderboard.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 text-white inline-flex items-center gap-1.5">
              <Sword className="w-3.5 h-3.5" />
              VS Bot
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main battle area */}
        <div className="lg:col-span-2 space-y-6">
          {screen === "setup" && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Choose your subject
                </label>
                <div className="flex flex-wrap gap-2 mt-3">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSubject(s.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        subject === s.value
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Player Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="e.g. Amina Yusuf"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none text-sm text-slate-800 dark:text-white placeholder-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Class
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 outline-none text-sm text-slate-800 dark:text-white"
                    >
                      {CLASSES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={startBattle}
                disabled={loadingBattle}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-500 text-white font-bold inline-flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:brightness-110 active:scale-[0.99] transition disabled:opacity-60"
              >
                {loadingBattle ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading questions...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start Battle
                  </>
                )}
              </button>
            </div>
          )}

          {screen === "battle" && (
            <BattleCard
              question={questions[currentIndex]}
              index={currentIndex}
              totalQuestionsCount={totalQuestions}
              score={score}
              streak={streak}
              bestStreak={bestStreak}
              selected={selected}
              isCorrect={isCorrect}
              results={results}
              onChoose={chooseOption}
            />
          )}

          {screen === "end" && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className={`flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${rankStyles} shadow-lg`}>
                  <Trophy className={`w-9 h-9 ${medal === null ? "text-slate-400" : ""}`} />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                  Battle Complete!
                </h2>
                <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300">
                  <Crown className="w-3.5 h-3.5" />
                  {percent}% Accuracy {medal && `· ${medal === "gold" ? "Gold" : medal === "silver" ? "Silver" : "Bronze"} Medal`}
                </div>

                <div className="w-full grid grid-cols-3 gap-3 mt-6">
                  <StatCard label="Final Score" value={score} accent="text-indigo-600 dark:text-indigo-400" icon={<Trophy className="w-4 h-4" />} />
                  <StatCard label="Best Streak" value={bestStreak} accent="text-emerald-600 dark:text-emerald-400" icon={<Flame className="w-4 h-4" />} />
                  <StatCard label="Bonus" value={streakBonus(score, totalQuestions, bestStreak)} accent="text-amber-500 dark:text-amber-400" icon={<Medal className="w-4 h-4" />} />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-md">
                  <button
                    onClick={handlePlayAgain}
                    className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Play Again
                  </button>
                  <button
                    onClick={postAndRefresh}
                    disabled={posting || posted}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-60"
                  >
                    {posting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : posted ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <Trophy className="w-4 h-4" />
                    )}
                    {posted ? "Posted to Leaderboard" : "Post to Leaderboard"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {screen === "battle" && currentIndex === totalQuestions - 1 && (
            <div className="text-center text-xs text-slate-400 font-medium">
              Last question — choose wisely!
            </div>
          )}
        </div>

        {/* Leaderboard panel */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Trophy className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Leaderboard
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Top 10 champions across the arena.
          </p>
          {leaderboardLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, idx) => {
                const isTop = idx === 0;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                      isTop
                        ? "bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-400"
                        : "bg-slate-50 dark:bg-slate-800/60"
                    }`}
                  >
                    <RankBadge rank={idx} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold truncate ${isTop ? "text-indigo-700 dark:text-indigo-200" : "text-slate-700 dark:text-slate-200"}`}>
                        {entry.playerName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {entry.className} · {entry.subject}
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${isTop ? "text-indigo-600 dark:text-indigo-300" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {entry.score}
                    </div>
                  </div>
                );
              })}
              {leaderboard.length === 0 && (
                <div className="py-10 text-center text-sm text-slate-400">
                  No champions yet. Be the first!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BattleCard: React.FC<{
  question: Question;
  index: number;
  score: number;
  streak: number;
  bestStreak: number;
  selected: number | null;
  isCorrect: boolean | null;
  results: boolean[];
  totalQuestionsCount: number;
  onChoose: (optionIndex: number) => void;
}> = ({ question, index, score, streak, bestStreak, selected, isCorrect, results, onChoose }) => {
  if (!question) return null;
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {score}
          </span>
          <span className="text-xs font-medium text-slate-400 -ml-1">pts</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5" />
            {streak} streak
          </div>
          {bestStreak > 0 && (
            <span className="text-xs font-semibold text-amber-500 dark:text-amber-400 inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              best {bestStreak}
            </span>
          )}
        </div>
        <div className="text-xs font-semibold text-slate-400">
          Question {index + 1} / {results.length}
        </div>
      </div>

      <div>
        <span className="inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 mb-3">
          {question.subject}
        </span>
        <p className="text-lg font-semibold text-slate-800 dark:text-slate-100 leading-snug">
          {question.question}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onChoose(i)}
            disabled={selected !== null}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
              selected === null
                ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                : selected === i
                ? isCorrect
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/40 animate-pulse"
                  : "border-red-500 bg-red-50 dark:bg-red-900/40 shake"
                : i === question.correctOptionIndex
                ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
                : "border-slate-200 dark:border-slate-700 opacity-60"
            }`}
          >
            <span
              className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0 ${
                selected !== null && i === question.correctOptionIndex
                  ? "bg-emerald-500 text-white"
                  : selected === i && !isCorrect
                  ? "bg-red-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {OPTION_LETTERS[i]}
            </span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {opt}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-6">
        {results.map((r, i) => (
          <span
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i > index
                ? "bg-slate-200 dark:bg-slate-700"
                : r
                ? "bg-emerald-500"
                : "bg-red-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number | string;
  accent: string;
  icon: React.ReactNode;
}> = ({ label, value, accent, icon }) => (
  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex flex-col items-center text-center">
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${accent}`}>
      {icon}
      {label}
    </span>
    <span className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
  </div>
);

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 0)
    return (
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-white shadow">
        <Trophy className="w-4 h-4" />
      </span>
    );
  if (rank === 1)
    return (
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 text-slate-700 shadow">
        <Medal className="w-4 h-4" />
      </span>
    );
  if (rank === 2)
    return (
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-300 text-orange-900 shadow">
        <Medal className="w-4 h-4" />
      </span>
    );
  return (
    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs font-bold">
      {rank + 1}
    </span>
  );
};