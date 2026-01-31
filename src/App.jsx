import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Check, ArrowRight, Trophy, Star, HelpCircle } from 'lucide-react';

const TapeFractionApp = () => {
  const [gameState, setGameState] = useState('start'); // start, playing, result
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect'
  const [showHint, setShowHint] = useState(false);

  const TOTAL_QUESTIONS = 5;

  // 問題生成ロジック
  const generateProblem = () => {
    // 2倍, 3倍, 4倍 のいずれか
    const multiplier = Math.floor(Math.random() * 3) + 2;

    // 問題タイプ: 'times' (倍数) or 'fraction' (分数)
    const type = Math.random() > 0.5 ? 'times' : 'fraction';

    // テープの基本サイズ (ロジック計算用)
    const baseUnit = 60;

    return {
      multiplier,
      type,
      shortTapeLength: baseUnit,
      longTapeLength: baseUnit * multiplier,
      tapeA: { color: 'bg-blue-200', borderColor: 'border-blue-400', label: 'あみ' },
      tapeB: { color: 'bg-red-200', borderColor: 'border-red-400', label: 'りく' }
    };
  };

  const startGame = () => {
    setScore(0);
    setQuestionCount(0);
    setGameState('playing');
    nextQuestion();
  };

  const nextQuestion = () => {
    setFeedback(null);
    setShowHint(false);
    if (questionCount >= TOTAL_QUESTIONS) {
      setGameState('result');
    } else {
      setCurrentProblem(generateProblem());
      setQuestionCount(prev => prev + 1);
    }
  };

  const checkAnswer = (answer) => {
    if (feedback) return; // すでに回答済み

    const isCorrect = answer === currentProblem.expectedAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }

    setTimeout(() => {
      if (questionCount < TOTAL_QUESTIONS) {
        nextQuestion();
      } else {
        setGameState('result');
      }
    }, 2000);
  };

  // 基準（もと）バッジコンポーネント
  const BaseBadge = () => (
    <span className="inline-flex items-center justify-center bg-gray-700 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1 align-middle transform -translate-y-0.5">
      もと
    </span>
  );

  // 表示用コンポーネント：テープ
  const Tape = ({ length, color, borderColor, label, showSegments, multiplier, isBase, showHint }) => {
    // 画面幅に収まるように調整
    const maxPossibleLength = 60 * 4;
    const widthPercentage = Math.min((length / maxPossibleLength) * 90, 100);

    return (
      <div className="flex flex-col items-start mb-6 w-full">
        <div className="flex items-center mb-1">
          <span className="font-bold text-gray-700 mr-2 w-12 text-right">{label}</span>
          {/* テープのラベル横にも「もと」を表示してあげる */}
          {isBase && showHint && <BaseBadge />}
        </div>
        <div className="relative w-full">
          <div
            className={`h-12 ${color} border-2 ${borderColor} rounded-r-md flex relative transition-all duration-500`}
            style={{ width: `${widthPercentage}%` }}
          >
            {/* 分数の理解を助ける点線（セグメント） */}
            {showSegments && Array.from({ length: multiplier }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 border-r border-dashed ${borderColor} opacity-50 last:border-r-0`}
              />
            ))}
          </div>

          {/* 長さを示すガイド線 */}
          <div
            className="absolute -bottom-4 left-0 flex justify-between px-0.5"
            style={{ width: `${widthPercentage}%` }}
          >
            <div className="h-2 border-l border-gray-400"></div>
            <div className="h-2 border-l border-gray-400"></div>
          </div>
          <div
            className="absolute -bottom-3 left-0 border-b border-gray-300"
            style={{ width: `${widthPercentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // ゲーム画面レンダリング
  const renderGame = () => {
    if (!currentProblem) return null;

    const { multiplier, type, shortTapeLength, longTapeLength } = currentProblem;

    // 基準（もと）の判定
    // type === 'times' (倍数) なら、短い方（りく）が「もと」
    // type === 'fraction' (分数) なら、長い方（あみ）が「もと」
    const isBlueBase = type === 'fraction';
    const isRedBase = type === 'times';

    currentProblem.expectedAnswer = type === 'times' ? multiplier : `1/${multiplier}`;

    return (
      <div className="max-w-2xl mx-auto p-4 flex flex-col items-center animate-fadeIn w-full">

        {/* 進捗バー */}
        <div className="w-full flex justify-between items-center mb-6 text-gray-500 font-bold">
          <div>もんだい {questionCount} / {TOTAL_QUESTIONS}</div>
          <div className="flex items-center text-yellow-500">
            <Star className="w-5 h-5 mr-1 fill-current" />
            <span>{score}</span>
          </div>
        </div>

        {/* テープ図エリア */}
        <div className="bg-white p-4 md:p-8 rounded-2xl shadow-lg w-full mb-8 border-2 border-gray-100 relative overflow-hidden">
          {/* フィードバックオーバーレイ */}
          {feedback && (
            <div className={`absolute inset-0 flex items-center justify-center z-10 bg-white/80 backdrop-blur-sm transition-all duration-300`}>
              {feedback === 'correct' ? (
                <div className="flex flex-col items-center animate-bounce">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <div className="w-16 h-16 border-4 border-green-500 rounded-full flex items-center justify-center">
                      <div className="w-10 h-6 border-b-4 border-l-4 border-green-500 -rotate-45 mb-2"></div>
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-green-600">せいかい！</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-6xl mb-2">😢</div>
                  <span className="text-2xl font-bold text-red-500">ざんねん...</span>
                  <span className="text-lg text-gray-600 mt-2">
                    正解は {type === 'times' ? `${multiplier}倍` : `1/${multiplier}`} でした
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 青テープ（長い） */}
          <Tape
            label="あみ"
            length={longTapeLength}
            color="bg-blue-100"
            borderColor="border-blue-400"
            showSegments={true}
            multiplier={multiplier}
            isBase={isBlueBase}
            showHint={showHint}
          />

          {/* スペーサー */}
          <div className="h-8"></div>

          {/* 赤テープ（短い） */}
          <Tape
            label="りく"
            length={shortTapeLength}
            color="bg-red-100"
            borderColor="border-red-400"
            showSegments={false}
            multiplier={1}
            isBase={isRedBase}
            showHint={showHint}
          />

        </div>

        {/* 問題文 */}
        <div className="text-xl md:text-2xl font-bold text-gray-800 mb-8 text-center leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
          {type === 'times' ? (
            <>
              <span className="text-blue-600">あみさん</span>の テープの 長さは、<br />
              <span className="text-red-500">りくさん</span>の テープの 長さ{showHint && <BaseBadge />}の<br />
              <span className="inline-block border-b-4 border-gray-800 px-2 min-w-[3ch] text-center mt-2">？</span> です。
            </>
          ) : (
            <>
              <span className="text-red-500">りくさん</span>の テープの 長さは、<br />
              <span className="text-blue-600">あみさん</span>の テープの 長さ{showHint && <BaseBadge />}の<br />
              <span className="inline-block border-b-4 border-gray-800 px-2 min-w-[3ch] text-center mt-2">？</span> です。
            </>
          )}
        </div>

        {/* 解答ボタンエリア */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          {type === 'times' ? (
            [2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => checkAnswer(num)}
                disabled={!!feedback}
                className="bg-white border-b-4 border-blue-200 hover:border-blue-400 active:border-b-0 active:translate-y-1 text-blue-600 font-bold text-2xl py-4 rounded-xl shadow-sm transition-all flex flex-col items-center justify-center group"
              >
                <span>{num}</span>
                <span className="text-sm text-gray-400 group-hover:text-blue-400">ばい</span>
              </button>
            ))
          ) : (
            [2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => checkAnswer(`1/${num}`)}
                disabled={!!feedback}
                className="bg-white border-b-4 border-red-200 hover:border-red-400 active:border-b-0 active:translate-y-1 text-red-500 font-bold text-2xl py-4 rounded-xl shadow-sm transition-all flex flex-col items-center justify-center group"
              >
                <div className="flex flex-col items-center leading-none">
                  <span className="border-b-2 border-current px-1 mb-1">1</span>
                  <span>{num}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* ヒントボタン */}
        {!feedback && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="mt-8 text-gray-400 hover:text-green-500 flex items-center text-sm font-bold transition-colors"
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            ヒントを見る
          </button>
        )}

        {showHint && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-gray-600 text-sm animate-fadeIn text-center">
            💡
            <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full mx-1">もと</span>
            がついている方のテープを「1」と考えよう。<br />
            {type === 'times'
              ? `「もと」のテープの、なんこぶん かな？`
              : `「もと」のテープを、なんこに わけたかな？`}
          </div>
        )}

      </div>
    );
  };

  // スタート画面
  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border-4 border-blue-100">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <RotateCcw className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2">
            テープの長さ<br />くらべマスター
          </h1>
          <p className="text-gray-500 mb-8 font-bold">
            「ばい」と「ぶんすう」のかんけいを<br />マスターしよう！
          </p>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl text-left border border-blue-100">
              <h3 className="font-bold text-blue-600 mb-2 flex items-center">
                <Check className="w-4 h-4 mr-1" /> ルール
              </h3>
              <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                <li>全5問です</li>
                <li>
                  <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full mx-1">もと</span>
                  マークにちゅうもく！
                </li>
                <li>「何倍？」と「何分の一？」の問題が出ます</li>
              </ul>
            </div>
          </div>

          <button
            onClick={startGame}
            className="mt-8 w-full bg-blue-500 hover:bg-blue-600 text-white font-black text-2xl py-5 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 active:shadow-none flex items-center justify-center"
          >
            <Play className="w-6 h-6 mr-2 fill-current" />
            スタート！
          </button>
        </div>
      </div>
    );
  }

  // 結果画面
  if (gameState === 'result') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border-4 border-yellow-100 animate-scaleIn">
          <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 animate-bounce" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">けっかはっぴょう！</h2>
          <div className="text-6xl font-black text-gray-800 mb-4">
            {score} <span className="text-2xl text-gray-400 font-medium">/ {TOTAL_QUESTIONS}</span>
          </div>

          <p className="text-lg text-gray-600 mb-8">
            {score === TOTAL_QUESTIONS ? 'すごい！ぜんもんせいかい！🎉' :
              score >= 3 ? 'あとすこし！がんばったね！👍' : 'もういちど チャレンジしよう！💪'}
          </p>

          <button
            onClick={startGame}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-xl py-4 rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95 active:shadow-none flex items-center justify-center"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            もういちど
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-4 px-4 font-sans select-none">
      {renderGame()}
    </div>
  );
};

export default TapeFractionApp;
