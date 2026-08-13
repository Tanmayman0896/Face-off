"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FootballLogo from "./FootballLogo";
import { SafeQuestion, TierQuestionPageData } from "@/lib/queries";
import { submitAnswer, SubmitAnswerResult } from "@/app/actions/question";

interface QuestionViewProps {
  initialData: TierQuestionPageData;
}

const QUESTIONS_PER_PAGE = 10;

export default function QuestionView({ initialData }: QuestionViewProps) {
  const router = useRouter();
  const { team, tier, questions: initialQuestions } = initialData;

  const [questions, setQuestions] = useState<SafeQuestion[]>(initialQuestions);
  const [currentRetries, setCurrentRetries] = useState<number>(tier.retriesRemaining);
  const [tierStatus, setTierStatus] = useState<string>(tier.status);
  const [balance, setBalance] = useState<number>(team.balance);

  // Find index of first unsolved question
  const firstUnsolvedIdx = initialQuestions.findIndex((q) => !q.isSolved);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(
    firstUnsolvedIdx >= 0 ? firstUnsolvedIdx : 0
  );

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE) || 1;
  const [currentPage, setCurrentPage] = useState<number>(() =>
    Math.floor((firstUnsolvedIdx >= 0 ? firstUnsolvedIdx : 0) / QUESTIONS_PER_PAGE) + 1
  );

  // Auto-sync page number when active question index changes
  useEffect(() => {
    const requiredPage = Math.floor(activeQuestionIndex / QUESTIONS_PER_PAGE) + 1;
    if (requiredPage !== currentPage && requiredPage <= totalPages) {
      setCurrentPage(requiredPage);
    }
  }, [activeQuestionIndex, totalPages]);

  const [answerInput, setAnswerInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<SubmitAnswerResult | null>(null);

  const currentQuestion = questions[activeQuestionIndex];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answerInput.trim() || isSubmitting || !currentQuestion || currentQuestion.isSolved) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const res = await submitAnswer({
      questionId: currentQuestion.id,
      answer: answerInput.trim(),
    });

    setIsSubmitting(false);
    setFeedback(res);

    if (res.success) {
      if (res.isCorrect) {
        // Mark current question as solved
        setQuestions((prev) =>
          prev.map((q, idx) =>
            idx === activeQuestionIndex ? { ...q, isSolved: true } : q
          )
        );

        if (res.reward && res.reward > 0) {
          setBalance((prev) => prev + res.reward!);
        }

        if (res.tierCompleted) {
          setTierStatus("COMPLETED");
        }

        setAnswerInput("");
      } else {
        // Incorrect
        if (res.retriesRemaining !== undefined) {
          setCurrentRetries(res.retriesRemaining);
        }
        if (res.tierFailed) {
          setTierStatus("FAILED");
        }
      }
    }
  }

  const isTierFailed = tierStatus === "FAILED" || currentRetries <= 0;
  const isTierCompleted = tierStatus === "COMPLETED" || questions.every((q) => q.isSolved);

  function handleNextQuestion() {
    setFeedback(null);
    setAnswerInput("");
    // Find next unsolved
    const nextIdx = questions.findIndex((q, i) => i > activeQuestionIndex && !q.isSolved);
    if (nextIdx !== -1) {
      setActiveQuestionIndex(nextIdx);
    } else {
      // Loop or go to first unsolved
      const firstIdx = questions.findIndex((q) => !q.isSolved);
      if (firstIdx !== -1) {
        setActiveQuestionIndex(firstIdx);
      }
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#f4f3ef] text-black p-4 sm:p-8 font-sans selection:bg-[#ffe600] selection:text-black">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header Bar */}
        <header className="p-6 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FootballLogo size="sm" />
            <div>
              <span className="text-xs font-mono font-black uppercase text-slate-600 block">
                {team.teamName} &bull; TIER {tier.tierNumber}
              </span>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                {tier.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Balance Badge */}
            <div className="bg-[#ffe600] px-3 py-1.5 border-2 border-black shadow-[3px_3px_0px_0px_#000] text-sm font-black flex items-center gap-1.5">
              <span>🪙</span>
              <span>${balance.toLocaleString()}</span>
            </div>

            <Link
              href="/dashboard"
              className="px-3 py-1.5 bg-white hover:bg-black hover:text-white text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] text-xs font-black uppercase tracking-wider transition cursor-pointer"
            >
              &larr; Dashboard
            </Link>
          </div>
        </header>

        {/* Tier Progress & Navigation Bar */}
        <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_#000] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-200 pb-3 gap-2">
            {/* Index Counter */}
            <div className="flex items-center gap-3">
              <span className="bg-black text-white px-3 py-1 text-xs font-mono font-bold shadow-[2px_2px_0px_0px_#ccff00]">
                Question {activeQuestionIndex + 1} / {questions.length}
              </span>
              {currentQuestion?.isSolved && (
                <span className="bg-[#ccff00] text-black border border-black px-2 py-0.5 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]">
                  ✓ SOLVED
                </span>
              )}
            </div>

            {/* Retries Remaining Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 uppercase">Retries Remaining:</span>
              <span
                className={`px-3 py-1 border-2 border-black font-mono font-black text-xs shadow-[2px_2px_0px_0px_#000] ${
                  currentRetries > 1
                    ? "bg-[#ccff00] text-black"
                    : currentRetries === 1
                    ? "bg-[#ffe600] text-black"
                    : "bg-[#ff4d4d] text-white"
                }`}
              >
                {currentRetries} / 2
              </span>
            </div>
          </div>

          {/* Question Selector Tabs & Pagination */}
          <div className="space-y-3 pt-1">
            {/* Pagination Controls Bar */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-2.5 border-2 border-black">
                <div className="text-xs font-mono font-bold uppercase text-slate-700 flex items-center gap-2">
                  <span className="bg-black text-white px-2 py-0.5 text-[11px] font-mono shadow-[1px_1px_0px_0px_#ccff00]">
                    PAGE {currentPage} OF {totalPages}
                  </span>
                  <span className="text-[11px]">
                    (Q{(currentPage - 1) * QUESTIONS_PER_PAGE + 1} - Q
                    {Math.min(currentPage * QUESTIONS_PER_PAGE, questions.length)})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="px-2.5 py-1 text-xs font-black uppercase border-2 border-black bg-white hover:bg-black hover:text-white transition disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                  >
                    &larr; Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isCurrent = pageNum === currentPage;
                    const pageStartIdx = (pageNum - 1) * QUESTIONS_PER_PAGE;
                    const pageEndIdx = Math.min(pageNum * QUESTIONS_PER_PAGE, questions.length);
                    const pageQuestions = questions.slice(pageStartIdx, pageEndIdx);
                    const allSolved =
                      pageQuestions.length > 0 && pageQuestions.every((q) => q.isSolved);

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-2.5 py-1 text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] transition cursor-pointer ${
                          isCurrent
                            ? "bg-[#00f0ff] text-black"
                            : allSolved
                            ? "bg-[#ccff00]/60 text-black hover:bg-[#ccff00]"
                            : "bg-white text-black hover:bg-slate-200"
                        }`}
                      >
                        {pageNum} {allSolved && "✓"}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="px-2.5 py-1 text-xs font-black uppercase border-2 border-black bg-white hover:bg-black hover:text-white transition disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Question Buttons Grid (10 per page) */}
            <div className="grid grid-cols-2 min-[440px]:grid-cols-5 sm:grid-cols-10 gap-2">
              {questions
                .slice((currentPage - 1) * QUESTIONS_PER_PAGE, currentPage * QUESTIONS_PER_PAGE)
                .map((q, localIdx) => {
                  const globalIdx = (currentPage - 1) * QUESTIONS_PER_PAGE + localIdx;
                  const isActive = globalIdx === activeQuestionIndex;
                  const isSolved = q.isSolved;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setActiveQuestionIndex(globalIdx);
                        setFeedback(null);
                        setAnswerInput("");
                      }}
                      className={`py-2 px-1 text-center font-black border-2 border-black shadow-[3px_3px_0px_0px_#000] transition cursor-pointer ${
                        isActive
                          ? "bg-[#00f0ff] text-black"
                          : isSolved
                          ? "bg-[#ccff00]/60 text-black hover:bg-[#ccff00]"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <div className="text-xs truncate">Q{globalIdx + 1}</div>
                      <div className="text-[10px] opacity-90 font-mono truncate">
                        {isSolved ? "✓" : `+$${q.reward}`}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Failed Banner */}
        {isTierFailed ? (
          <div className="bg-[#ff4d4d] text-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000] space-y-4 text-center">
            <h2 className="text-3xl font-black uppercase tracking-tight">✕ Tier Failed!</h2>
            <p className="text-sm font-bold max-w-lg mx-auto leading-relaxed">
              You have exhausted all retries for this tier. Tier status has been marked as FAILED.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-black text-white hover:bg-white hover:text-black font-black uppercase text-sm border-2 border-black shadow-[4px_4px_0px_0px_#fff] transition"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : isTierCompleted ? (
          <div className="bg-[#ccff00] text-black border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000] space-y-4 text-center">
            <h2 className="text-3xl font-black uppercase tracking-tight">🎉 Tier Completed!</h2>
            <p className="text-sm font-bold max-w-lg mx-auto leading-relaxed">
              Congratulations! All questions in Tier {tier.tierNumber} have been solved correctly and rewards credited to your team balance.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-black text-white hover:bg-white hover:text-black font-black uppercase text-sm border-2 border-black shadow-[4px_4px_0px_0px_#000] transition"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* Active Question Card */
          <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] space-y-6">
            <div className="flex items-start justify-between gap-4 border-b-3 border-black pb-4">
              <h2 className="text-xl sm:text-2xl font-black leading-snug">
                {currentQuestion.question}
              </h2>
              <span className="shrink-0 bg-[#ffe600] px-3 py-1 border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000]">
                +${currentQuestion.reward}
              </span>
            </div>

            {currentQuestion.isSolved ? (
              <div className="bg-emerald-100 border-3 border-black p-6 text-center space-y-3 shadow-[4px_4px_0px_0px_#000]">
                <div className="text-2xl font-black text-emerald-800 uppercase">
                  ✓ You Solved This Question!
                </div>
                <p className="text-xs font-bold text-slate-700">
                  Reward of +${currentQuestion.reward} has been credited to your team balance.
                </p>
                {questions.some((q) => !q.isSolved) && (
                  <button
                    onClick={handleNextQuestion}
                    className="mt-2 px-5 py-2.5 bg-black text-white hover:bg-[#00f0ff] hover:text-black font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] transition cursor-pointer"
                  >
                    Next Unsolved Question &rarr;
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="answer-input" className="block text-xs font-black uppercase tracking-wider mb-2">
                    Enter Your Answer:
                  </label>
                  <input
                    id="answer-input"
                    type="text"
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    placeholder="Type your answer here..."
                    disabled={isSubmitting}
                    className="w-full p-4 bg-slate-50 border-3 border-black font-mono text-base font-bold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#00f0ff] shadow-[4px_4px_0px_0px_#000] transition disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !answerInput.trim()}
                    className="w-full sm:w-auto px-8 py-4 bg-[#00f0ff] hover:bg-black hover:text-white text-black font-black text-sm uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_0px_#000] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? "Validating Server-Side..." : "Submit Answer [ Enter ]"}
                  </button>
                </div>
              </form>
            )}

            {/* Feedback Banner */}
            {feedback && (
              <div
                className={`p-5 border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-2 ${
                  feedback.isCorrect
                    ? "bg-[#ccff00] text-black"
                    : "bg-[#ff4d4d] text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black uppercase tracking-tight">
                    {feedback.isCorrect
                      ? `✓ Correct! +$${feedback.reward}`
                      : feedback.error
                      ? `✕ ${feedback.error}`
                      : `✕ Incorrect! Retries remaining: ${feedback.retriesRemaining}`}
                  </span>
                </div>

                {feedback.isCorrect ? (
                  <div className="flex items-center justify-between pt-2 border-t border-black/20">
                    <p className="text-xs font-bold">
                      {feedback.tierCompleted
                        ? "Congratulations! You have completed all questions in this tier!"
                        : "Great job! Keep going to complete the tier."}
                    </p>
                    {!feedback.tierCompleted && (
                      <button
                        onClick={handleNextQuestion}
                        className="px-4 py-2 bg-black text-white hover:bg-white hover:text-black font-black text-xs uppercase border border-black shadow-[2px_2px_0px_0px_#000] transition cursor-pointer"
                      >
                        Next Question &rarr;
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs font-bold">
                    {feedback.tierFailed
                      ? "No retries remaining. This tier has been marked as FAILED."
                      : feedback.error
                      ? feedback.error
                      : "Double check your spelling and try again."}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
