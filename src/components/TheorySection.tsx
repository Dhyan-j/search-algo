import React, { useState } from 'react';
import { BookOpen, CheckCircle, HelpCircle, XCircle, Award, Compass, Calculator } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: 'If the heuristic h(n) = 0 for all nodes, what does A* Search become identical to?',
    options: [
      'Greedy Best-First Search',
      "Dijkstra's Algorithm / Uniform Cost Search",
      'Depth-First Search (DFS)',
      'Bidirectional Search',
    ],
    correctIndex: 1,
    explanation:
      "When h(n) = 0 for all nodes, the evaluation function f(n) = g(n) + h(n) simplifies directly to f(n) = g(n), which is exactly Dijkstra's Algorithm (Uniform Cost Search)!",
  },
  {
    question: 'What is the definition of an "admissible" heuristic?',
    options: [
      'It must always overestimate the true cost to reach the goal.',
      'It must never overestimate the true cost to reach the goal (h(n) <= h*(n)).',
      'It must equal 0 for all non-goal nodes.',
      'It must be strictly greater than the edge weights.',
    ],
    correctIndex: 1,
    explanation:
      'An admissible heuristic is optimistic: it never estimates the cost to be greater than the actual lowest cost to reach the goal (h(n) <= h*(n)). Admissibility guarantees A* will return the optimal path on tree search.',
  },
  {
    question: 'Why can Greedy Best-First Search produce a suboptimal path with high total cost?',
    options: [
      'It considers path cost g(n) too heavily.',
      'It is constrained by FIFO queue mechanics.',
      'It solely prioritizes h(n) and completely ignores past path cost g(n).',
      'It only operates on binary trees.',
    ],
    correctIndex: 2,
    explanation:
      'Greedy Best-First orders nodes solely by f(n) = h(n). It can be tempted by a node that appears close to the goal, even if the road leading to it has a huge edge cost!',
  },
  {
    question: 'Which search algorithm uses O(b * d) linear memory instead of O(b^d) exponential memory while still finding the shortest hop path on uniform costs?',
    options: [
      'Breadth-First Search (BFS)',
      'Iterative Deepening Search (IDDFS)',
      'Greedy Best-First Search',
      "Dijkstra's Algorithm",
    ],
    correctIndex: 1,
    explanation:
      'IDDFS combines the linear memory space O(b*d) of Depth-First Search with the completeness and shallowest-path optimality of Breadth-First Search.',
  },
  {
    question: 'What is the primary advantage of Bidirectional Search over standard BFS?',
    options: [
      'It requires zero memory.',
      'It reduces the search frontier from O(b^d) to O(b^(d/2)), drastically shrinking node expansions.',
      'It avoids checking for cycles.',
      'It works without knowing where the goal is.',
    ],
    correctIndex: 1,
    explanation:
      'Two search spheres expanding toward each other from Start and Goal meet at the middle (d/2). Since b^(d/2) + b^(d/2) is vastly smaller than b^d, it cuts expansions exponentially.',
  },
];

export const TheorySection: React.FC = () => {
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) score++;
    });
    return score;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-slate-200">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="text-indigo-400" />
          Search Algorithm Theory & Mathematical Foundations
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Master the principles of Graph Search, Heuristic Admissibility, and Algorithmic Complexity.
        </p>
      </div>

      {/* Core Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* A* Formula Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <Calculator size={18} />
            <h3 className="font-bold text-sm text-white">The A* Evaluation Function</h3>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center font-mono text-base font-bold text-indigo-300">
            f(n) = g(n) + h(n)
          </div>
          <ul className="text-xs text-slate-300 space-y-2">
            <li>
              <strong className="text-emerald-400 font-mono">g(n):</strong> The exact cumulative
              cost of the path from the starting node to node <em>n</em>.
            </li>
            <li>
              <strong className="text-amber-400 font-mono">h(n):</strong> The estimated remaining
              cost to reach the goal from node <em>n</em> (heuristic).
            </li>
            <li>
              <strong className="text-indigo-400 font-mono">f(n):</strong> The total estimated cost
              of the cheapest path passing through node <em>n</em> to the goal.
            </li>
          </ul>
        </div>

        {/* Admissibility & Consistency */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Compass size={18} />
            <h3 className="font-bold text-sm text-white">Admissibility & Consistency</h3>
          </div>
          <div className="text-xs text-slate-300 space-y-2.5">
            <p>
              <strong className="text-cyan-300">Admissibility:</strong> A heuristic{' '}
              <code className="text-indigo-300 font-mono">h(n)</code> is admissible if it never
              overestimates the actual cost to reach the goal:
              <span className="block mt-1 font-mono text-center text-slate-100 bg-slate-950 py-1 rounded">
                0 &le; h(n) &le; h*(n)
              </span>
            </p>
            <p>
              <strong className="text-cyan-300">Consistency (Monotonicity):</strong> For every node{' '}
              <em>n</em> and every successor <em>n'</em> generated by action <em>a</em>:
              <span className="block mt-1 font-mono text-center text-slate-100 bg-slate-950 py-1 rounded">
                h(n) &le; c(n, a, n') + h(n')
              </span>
              If <code className="text-indigo-300 font-mono">h</code> is consistent, A* using graph
              search never needs to re-open nodes in the closed set!
            </p>
          </div>
        </div>
      </div>

      {/* Complexity Comparison Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <h3 className="font-bold text-sm text-white">Search Algorithm Comparison Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="p-2.5">Algorithm</th>
                <th className="p-2.5">Heuristic?</th>
                <th className="p-2.5">Time Complexity</th>
                <th className="p-2.5">Space Complexity</th>
                <th className="p-2.5">Optimal Cost?</th>
                <th className="p-2.5">Complete?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td className="p-2.5 font-bold text-white font-sans">A* Search</td>
                <td className="p-2.5 text-emerald-400">Yes</td>
                <td className="p-2.5">O(b^d)</td>
                <td className="p-2.5">O(b^d)</td>
                <td className="p-2.5 text-emerald-400">Yes (if admissible)</td>
                <td className="p-2.5 text-emerald-400">Yes</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-white font-sans">Greedy Best-First</td>
                <td className="p-2.5 text-emerald-400">Yes</td>
                <td className="p-2.5">O(b^m)</td>
                <td className="p-2.5">O(b^m)</td>
                <td className="p-2.5 text-rose-400">No</td>
                <td className="p-2.5 text-amber-400">Conditional</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-white font-sans">Dijkstra / UCS</td>
                <td className="p-2.5 text-slate-500">No</td>
                <td className="p-2.5">O((V+E) log V)</td>
                <td className="p-2.5">O(V)</td>
                <td className="p-2.5 text-emerald-400">Yes (costs &ge; 0)</td>
                <td className="p-2.5 text-emerald-400">Yes</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-white font-sans">Breadth-First (BFS)</td>
                <td className="p-2.5 text-slate-500">No</td>
                <td className="p-2.5">O(b^d)</td>
                <td className="p-2.5">O(b^d)</td>
                <td className="p-2.5 text-amber-300">Fewest hops</td>
                <td className="p-2.5 text-emerald-400">Yes</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-white font-sans">Depth-First (DFS)</td>
                <td className="p-2.5 text-slate-500">No</td>
                <td className="p-2.5">O(b^m)</td>
                <td className="p-2.5 text-emerald-400">O(b * m)</td>
                <td className="p-2.5 text-rose-400">No</td>
                <td className="p-2.5 text-rose-400">No (in loops)</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-white font-sans">Iterative Deepening (IDDFS)</td>
                <td className="p-2.5 text-slate-500">No</td>
                <td className="p-2.5">O(b^d)</td>
                <td className="p-2.5 text-emerald-400">O(b * d)</td>
                <td className="p-2.5 text-amber-300">Fewest hops</td>
                <td className="p-2.5 text-emerald-400">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Knowledge Quiz */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="text-amber-400" />
            <h3 className="font-bold text-sm text-white">Interactive Knowledge Check Quiz</h3>
          </div>
          {submitted && (
            <div className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700">
              Score: {calculateScore()} / {QUIZ_QUESTIONS.length}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {QUIZ_QUESTIONS.map((q, qIdx) => {
            const isAnswered = userAnswers[qIdx] !== undefined;
            const isCorrect = userAnswers[qIdx] === q.correctIndex;

            return (
              <div key={qIdx} className="space-y-2.5">
                <p className="text-xs font-semibold text-slate-200">
                  {qIdx + 1}. {q.question}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[qIdx] === optIdx;
                    let btnStyle = 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800';

                    if (submitted) {
                      if (optIdx === q.correctIndex) {
                        btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-300';
                      } else {
                        btnStyle = 'bg-slate-900/50 border-slate-800 text-slate-500';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-indigo-600 border-indigo-500 text-white font-semibold shadow-xs';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelect(qIdx, optIdx)}
                        className={`p-2.5 rounded-lg border text-left text-xs transition duration-150 flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {submitted && optIdx === q.correctIndex && (
                          <CheckCircle size={14} className="text-emerald-400 shrink-0 ml-2" />
                        )}
                        {submitted && isSelected && !isCorrect && (
                          <XCircle size={14} className="text-rose-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-[11px] text-slate-400">
                    <strong className="text-indigo-300">Explanation: </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end gap-3">
          {submitted ? (
            <button
              onClick={() => {
                setSubmitted(false);
                setUserAnswers({});
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
            >
              Retake Quiz
            </button>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(userAnswers).length === 0}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-md transition"
            >
              Submit Answers
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
