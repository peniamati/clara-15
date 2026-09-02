import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Gamepad2, Award, CheckCircle, HelpCircle, Vote, Sparkles, RefreshCw } from 'lucide-react';

export const InteractiveGames: React.FC = () => {
  const { triviaQuestions, polls, votePoll, guests, config } = useEvent();

  const [activeGameTab, setActiveGameTab] = useState<'trivia' | 'memotest' | 'encuestas' | 'sorteo'>('trivia');

  // Trivia State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [triviaFinished, setTriviaFinished] = useState(false);

  // Memotest State
  const memotestCardsInitial = [
    { id: 1, img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&q=80', pairId: 1, flipped: false, matched: false },
    { id: 2, img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&q=80', pairId: 1, flipped: false, matched: false },
    { id: 3, img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&q=80', pairId: 2, flipped: false, matched: false },
    { id: 4, img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&q=80', pairId: 2, flipped: false, matched: false },
    { id: 5, img: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=300&q=80', pairId: 3, flipped: false, matched: false },
    { id: 6, img: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=300&q=80', pairId: 3, flipped: false, matched: false },
  ];
  const [memotestCards, setMemotestCards] = useState(memotestCardsInitial);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  // Sorteo State
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [spinningSorteo, setSpinningSorteo] = useState(false);

  const handleAnswerSelect = (optionIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIdx);

    const currentQ = triviaQuestions[currentQuestionIdx];
    if (optionIdx === currentQ.correctAnswer) {
      setScore(s => s + 10);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < triviaQuestions.length - 1) {
      setCurrentQuestionIdx(i => i + 1);
      setSelectedAnswer(null);
    } else {
      setTriviaFinished(true);
    }
  };

  const restartTrivia = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setScore(0);
    setTriviaFinished(false);
  };

  // Memotest card flip logic
  const handleMemotestFlip = (id: number) => {
    if (flippedCards.length === 2) return;
    const clickedCard = memotestCards.find(c => c.id === id);
    if (!clickedCard || clickedCard.flipped || clickedCard.matched) return;

    const newCards = memotestCards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setMemotestCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const card1 = newCards.find(c => c.id === newFlipped[0])!;
      const card2 = newCards.find(c => c.id === newFlipped[1])!;

      if (card1.pairId === card2.pairId) {
        setTimeout(() => {
          setMemotestCards(prev => prev.map(c => c.pairId === card1.pairId ? { ...c, matched: true } : c));
          setFlippedCards([]);
        }, 600);
      } else {
        setTimeout(() => {
          setMemotestCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleSpinSorteo = () => {
    setSpinningSorteo(true);
    setWinnerName(null);

    setTimeout(() => {
      const confirmed = guests.filter(g => g.status === 'CONFIRMED' || g.status === 'CHECKED_IN');
      const pool = confirmed.length > 0 ? confirmed : guests;
      const randomWinner = pool[Math.floor(Math.random() * pool.length)];
      setWinnerName(`${randomWinner.name} ${randomWinner.lastName}`);
      setSpinningSorteo(false);
    }, 2500);
  };

  return (
    <section id="juegos" className="py-24 bg-[#050505] text-white relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs uppercase tracking-widest mb-4">
            <Gamepad2 className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Zona Interactiva & Juegos</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-semibold silver-gradient-text mb-3">
            Juegos & Encuestas de la Noche
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Demostrá cuánto conocés a {config.honoree}, votá en vivo y participá de los sorteos exclusivos.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {[
              { id: 'trivia', label: `🧠 Trivia ${config.honoree}` },
              { id: 'memotest', label: '🃏 Memotest' },
              { id: 'encuestas', label: '📊 Encuestas Vivo' },
              { id: 'sorteo', label: '🎁 Sorteo Express' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveGameTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeGameTab === tab.id
                    ? 'bg-[#C0C0C0] text-black font-bold shadow-lg shadow-[#C0C0C0]/20'
                    : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Trivia */}
        {activeGameTab === 'trivia' && (
          <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto">
            {!triviaFinished ? (
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-3">
                  <span>Pregunta {currentQuestionIdx + 1} de {triviaQuestions.length}</span>
                  <span className="text-[#C0C0C0] font-bold">Puntos: {score}</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-white mb-6">
                  {triviaQuestions[currentQuestionIdx].question}
                </h3>

                <div className="space-y-3 mb-6">
                  {triviaQuestions[currentQuestionIdx].options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === triviaQuestions[currentQuestionIdx].correctAnswer;
                    let style = 'bg-zinc-900 border-white/10 text-white';

                    if (selectedAnswer !== null) {
                      if (isCorrect) style = 'bg-[#C0C0C0]/20 border-[#C0C0C0] text-[#C0C0C0] font-bold';
                      else if (isSelected) style = 'bg-rose-500/20 border-rose-400 text-rose-200';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelect(idx)}
                        className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-center justify-between ${style}`}
                      >
                        <span>{option}</span>
                        {selectedAnswer !== null && isCorrect && <CheckCircle className="w-4 h-4 text-[#C0C0C0]" />}
                      </button>
                    );
                  })}
                </div>

                {selectedAnswer !== null && (
                  <div className="p-4 rounded-2xl bg-[#C0C0C0]/10 border border-[#C0C0C0]/30 text-[#C0C0C0] text-xs mb-6 font-light">
                    💡 <strong>Saber curioso:</strong> {triviaQuestions[currentQuestionIdx].explanation}
                  </div>
                )}

                {selectedAnswer !== null && (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-3.5 rounded-full bg-[#C0C0C0] hover:bg-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-widest shadow-lg shadow-[#C0C0C0]/10 transition-all"
                  >
                    {currentQuestionIdx < triviaQuestions.length - 1 ? 'Siguiente Pregunta →' : 'Ver Resultado Final'}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Award className="w-16 h-16 text-[#C0C0C0] mx-auto mb-4 animate-bounce" />
                <h3 className="font-serif text-3xl font-bold text-white mb-2">¡Trivia Completada!</h3>
                <p className="text-zinc-300 text-sm mb-6 font-light">Lograste un puntaje de <strong className="text-[#C0C0C0] text-xl font-bold">{score} Puntos</strong> sobre {triviaQuestions.length * 10} posibles.</p>

                <button
                  onClick={restartTrivia}
                  className="px-8 py-3 rounded-full bg-[#C0C0C0] text-black font-semibold text-xs uppercase tracking-widest hover:bg-[#E0E0E0] transition-all shadow-lg shadow-[#C0C0C0]/10"
                >
                  Jugar de Nuevo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Memotest */}
        {activeGameTab === 'memotest' && (
          <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-xl mx-auto text-center">
            <h3 className="font-serif text-3xl font-semibold text-white mb-2">Memotest de Fotos de {config.honoree}</h3>
            <p className="text-zinc-400 text-xs mb-6 font-light">Encontrá los pares de imágenes idénticos.</p>

            <div className="grid grid-cols-3 gap-3">
              {memotestCards.map(card => (
                <div
                  key={card.id}
                  onClick={() => handleMemotestFlip(card.id)}
                  className="aspect-square rounded-2xl overflow-hidden border border-white/10 cursor-pointer bg-black flex items-center justify-center transition-transform hover:scale-105"
                >
                  {card.flipped || card.matched ? (
                    <img src={card.img} alt="Memotest card" className="w-full h-full object-cover" />
                  ) : (
                    <Sparkles className="w-8 h-8 text-[#C0C0C0]/40" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Encuestas */}
        {activeGameTab === 'encuestas' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {polls.map(p => (
              <div key={p.id} className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/10 shadow-2xl">
                <h3 className="font-serif text-2xl font-semibold text-white mb-4">{p.question}</h3>
                <div className="space-y-3">
                  {p.options.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => votePoll(p.id, opt.id)}
                      className="w-full p-4 rounded-xl bg-zinc-900 border border-white/10 hover:border-[#C0C0C0]/50 flex items-center justify-between text-xs text-white font-medium transition-all"
                    >
                      <span>{opt.label}</span>
                      <span className="font-bold text-[#C0C0C0]">{opt.votes} votos</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Sorteos */}
        {activeGameTab === 'sorteo' && (
          <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-8 shadow-2xl max-w-lg mx-auto text-center">
            <Sparkles className="w-12 h-12 text-[#C0C0C0] mx-auto mb-3" />
            <h3 className="font-serif text-3xl font-semibold text-white mb-2">Sorteo en Vivo entre Presentes</h3>
            <p className="text-zinc-400 text-xs mb-6 font-light">Presioná el botón para seleccionar aleatoriamente al invitado ganador.</p>

            {winnerName && (
              <div className="p-6 rounded-2xl bg-[#C0C0C0]/20 border border-[#C0C0C0] text-[#C0C0C0] text-2xl font-serif font-semibold mb-6 animate-pulse">
                🎉 ¡Ganador/a: {winnerName}!
              </div>
            )}

            <button
              onClick={handleSpinSorteo}
              disabled={spinningSorteo}
              className="px-8 py-4 rounded-full bg-[#C0C0C0] hover:bg-[#E0E0E0] text-black font-semibold text-xs uppercase tracking-widest shadow-xl shadow-[#C0C0C0]/10 flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw className={`w-4 h-4 ${spinningSorteo ? 'animate-spin' : ''}`} />
              <span>{spinningSorteo ? 'Girando ruleta...' : 'Sortea Ahora'}</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
