import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Ruler, RULER_PADDING_LEFT } from './Ruler';
import { MeasurableObject, getRandomObject, ObjectRenderer, PX_PER_CM } from './MeasureObjects';
import { playClickSound, playPencilSound, playSuccessSound, playErrorSound } from '../utils/sound';
import { triggerNativeConfetti } from '../utils/confetti';
import { RotateCcw, Pencil, Eraser, ArrowRight, Check, X, Magnet } from 'lucide-react';

interface PencilMark {
  id: string;
  x: number; // pixel coordinate relative to canvas left (0)
  label: string;
}

export const MeasureMode: React.FC = () => {
  // Current object to measure (1cm to 15cm)
  const [currentObject, setCurrentObject] = useState<MeasurableObject>(() => getRandomObject());

  // Fixed baseline for object's left edge inside the canvas
  const OBJECT_START_X = 60;
  const OBJECT_Y = 40;

  // Ruler position
  const [rulerPos, setRulerPos] = useState({ x: OBJECT_START_X - RULER_PADDING_LEFT, y: 140 });
  const [isDraggingRuler, setIsDraggingRuler] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; rulerX: number; rulerY: number } | null>(null);

  // Pencil tool state
  const [isPencilActive, setIsPencilActive] = useState(false);
  const [pencilMarks, setPencilMarks] = useState<PencilMark[]>([]);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Keypad & Answer state
  const [inputAnswer, setInputAnswer] = useState<string>('');
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const canvasRef = useRef<HTMLDivElement>(null);

  // Load next random object (1cm to 15cm)
  const handleNextObject = useCallback(() => {
    playClickSound();
    setCurrentObject(getRandomObject());
    setInputAnswer('');
    setFeedbackStatus('idle');
    setPencilMarks([]);
    // Reset ruler position to align with start
    setRulerPos({ x: OBJECT_START_X - RULER_PADDING_LEFT, y: 140 });
  }, []);

  // Handle ruler dragging
  const handleRulerDragStart = (e: React.PointerEvent) => {
    if (isPencilActive) return; // If pencil is active, clicks make marks instead of dragging
    setIsDraggingRuler(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      rulerX: rulerPos.x,
      rulerY: rulerPos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCursorPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    if (isDraggingRuler && dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      setRulerPos({
        x: Math.max(10, Math.min(850, dragStartRef.current.rulerX + dx)),
        y: Math.max(90, Math.min(220, dragStartRef.current.rulerY + dy)),
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRuler) {
      setIsDraggingRuler(false);
      dragStartRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Align ruler's 0-mark to the object's left edge
  const handleAlignToStart = () => {
    playClickSound();
    setRulerPos({ x: OBJECT_START_X - RULER_PADDING_LEFT, y: 140 });
  };

  // Align ruler's 0-mark to the latest pencil mark
  const handleAlignToMark = () => {
    if (pencilMarks.length === 0) return;
    playClickSound();
    const markX = pencilMarks[pencilMarks.length - 1].x;
    setRulerPos({ x: markX - RULER_PADDING_LEFT, y: 140 });
  };

  // Place pencil mark at 10cm shortcut
  const handleAdd10cmMark = () => {
    playPencilSound();
    const markX = OBJECT_START_X + 10 * PX_PER_CM;
    setPencilMarks((prev) => [
      ...prev.filter((m) => Math.abs(m.x - markX) > 8),
      { id: `mark-${Date.now()}`, x: markX, label: '10cm' },
    ]);
  };

  // Reset ruler
  const handleResetRuler = () => {
    playClickSound();
    setRulerPos({ x: OBJECT_START_X - RULER_PADDING_LEFT, y: 140 });
  };

  // Clear pencil marks
  const handleClearMarks = () => {
    playClickSound();
    setPencilMarks([]);
  };

  // Click on canvas with Pencil: Place mark EXACTLY at the mouse click location
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPencilActive || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    if (clickX < 5 || clickX > rect.width - 5) return;

    playPencilSound();

    const relativeFromStartCm = (clickX - OBJECT_START_X) / PX_PER_CM;
    let markLabel = '';

    if (Math.abs(relativeFromStartCm - 10) <= 0.35) {
      markLabel = '10cm';
    } else if (relativeFromStartCm >= 0.5 && relativeFromStartCm <= 15.5) {
      const rounded = Math.round(relativeFromStartCm);
      if (Math.abs(relativeFromStartCm - rounded) <= 0.25) {
        markLabel = `${rounded}cm`;
      } else {
        markLabel = `${relativeFromStartCm.toFixed(1)}cm`;
      }
    }

    const newMark: PencilMark = {
      id: `mark-${Date.now()}-${Math.random()}`,
      x: clickX,
      label: markLabel,
    };

    setPencilMarks((prev) => [...prev, newMark]);
  };

  // Handle number pad inputs
  const handleNumberClick = (digit: string) => {
    playClickSound();
    if (feedbackStatus === 'correct') return;
    if (inputAnswer.length >= 2) return;
    setInputAnswer((prev) => prev + digit);
    setFeedbackStatus('idle');
  };

  const handleClearInput = () => {
    playClickSound();
    if (feedbackStatus === 'correct') return;
    setInputAnswer('');
    setFeedbackStatus('idle');
  };

  // Check student answer
  const handleSubmit = useCallback(() => {
    if (!inputAnswer) return;
    const num = parseInt(inputAnswer, 10);
    if (num === currentObject.lengthCm) {
      setFeedbackStatus('correct');
      playSuccessSound();
      triggerNativeConfetti();
    } else {
      setFeedbackStatus('wrong');
      playErrorSound();
    }
  }, [inputAnswer, currentObject.lengthCm]);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (inputAnswer.length < 2 && feedbackStatus !== 'correct') {
          playClickSound();
          setInputAnswer((prev) => prev + e.key);
          setFeedbackStatus('idle');
        }
      } else if (e.key === 'Backspace') {
        if (feedbackStatus !== 'correct') {
          playClickSound();
          setInputAnswer((prev) => prev.slice(0, -1));
          setFeedbackStatus('idle');
        }
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputAnswer, feedbackStatus, handleSubmit]);

  const objectRightX = OBJECT_START_X + currentObject.lengthCm * PX_PER_CM;

  return (
    <div className="w-full flex flex-col gap-3 select-none">
      {/* Top Toolbar: Separated cleanly from the measurement canvas */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-xl px-4 py-2.5 border border-slate-200 shadow-xs">
        {/* Alignment and Pencil tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAlignToStart}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors active:scale-95"
          >
            <Magnet className="w-3.5 h-3.5 text-blue-600" />
            对齐
          </button>

          {/* Pencil button (画笔) */}
          <button
            onClick={() => {
              playClickSound();
              setIsPencilActive((prev) => !prev);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all active:scale-95 ${
              isPencilActive
                ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300 scale-105'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            画笔
          </button>

          {/* Quick 10cm mark button for objects > 10cm */}
          {currentObject.lengthCm > 10 && (
            <button
              onClick={handleAdd10cmMark}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-100/80 hover:bg-amber-200 rounded-lg transition-colors active:scale-95"
            >
              ✏️ 10cm
            </button>
          )}

          {/* Align to mark if marked */}
          {pencilMarks.length > 0 && (
            <button
              onClick={handleAlignToMark}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors active:scale-95"
            >
              <Magnet className="w-3.5 h-3.5 text-indigo-600" />
              对齐记号
            </button>
          )}

          {pencilMarks.length > 0 && (
            <button
              onClick={handleClearMarks}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg transition-colors active:scale-95"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Reset ruler & Next object */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetRuler}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            复位
          </button>
          <button
            onClick={handleNextObject}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors active:scale-95"
          >
            换一个
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Measurement Canvas (Dedicated zero-padding coordinate container) */}
      <div
        ref={canvasRef}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => setCursorPos(null)}
        className={`relative w-full h-[320px] rounded-2xl bg-gradient-to-b from-sky-50/60 to-indigo-50/40 border border-slate-200/90 shadow-inner overflow-hidden touch-none ${
          isPencilActive ? 'cursor-none' : ''
        }`}
      >
        {/* Soft grid background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)',
            backgroundSize: `${PX_PER_CM}px ${PX_PER_CM}px`,
          }}
        />

        {/* Start (0) vertical guideline */}
        <div
          style={{ left: `${OBJECT_START_X}px` }}
          className="absolute top-0 bottom-0 w-[1px] border-l-2 border-dashed border-blue-400/60 pointer-events-none z-5"
        />

        {/* Object End vertical guideline */}
        <div
          style={{ left: `${objectRightX}px` }}
          className="absolute top-0 bottom-0 w-[1px] border-l-2 border-dashed border-rose-400/60 pointer-events-none z-5"
        />

        {/* The Random Object to measure: strictly starting at OBJECT_START_X */}
        <div
          style={{
            left: `${OBJECT_START_X}px`,
            top: `${OBJECT_Y}px`,
          }}
          className="absolute z-10 cursor-default"
        >
          <ObjectRenderer object={currentObject} />
        </div>

        {/* Pencil Marks made by student - strictly centered at mark.x */}
        {pencilMarks.map((mark) => (
          <div
            key={mark.id}
            style={{ left: `${mark.x}px` }}
            className="absolute top-2 bottom-2 z-20 pointer-events-none flex flex-col items-center -translate-x-1/2 w-0 overflow-visible"
          >
            {/* Pencil Mark visual badge */}
            <div className="bg-red-500 text-white text-[11px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 whitespace-nowrap mb-0.5">
              ✏️ {mark.label || ''}
            </div>
            {/* The vertical mark line centered EXACTLY on mark.x */}
            <div className="w-[2px] h-full bg-red-500 shadow-sm" />
          </div>
        ))}

        {/* 10cm Standard Ruler */}
        <Ruler
          x={rulerPos.x}
          y={rulerPos.y}
          onDragStart={handleRulerDragStart}
          isDragging={isDraggingRuler}
          disableDrag={isPencilActive}
          className="z-15"
        />

        {/* Custom Visual Pencil tracking mouse position with tip at exact cursor (x, y) */}
        {isPencilActive && cursorPos && (
          <div
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              transform: 'translate(-2px, -34px)',
            }}
            className="absolute z-50 pointer-events-none drop-shadow-lg select-none"
          >
            <svg width="32" height="36" viewBox="0 0 32 36" fill="none">
              <polygon points="2,34 0,22 14,22" fill="#FDE68A" />
              <polygon points="2,34 1,29 6,29" fill="#0F172A" />
              <rect x="0" y="6" width="14" height="16" rx="1" fill="#F59E0B" />
              <rect x="4" y="6" width="6" height="16" fill="#FBBF24" />
              <rect x="0" y="1" width="14" height="5" rx="1" fill="#F43F5E" />
            </svg>
          </div>
        )}
      </div>

      {/* Answer Area & Child-friendly Keypad */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Answer Display & Feedback Card */}
        <div className="md:col-span-6 flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[220px]">
          <div className="flex items-baseline gap-3">
            <div
              className={`w-32 h-16 rounded-xl border-2 flex items-center justify-center text-3xl font-mono font-bold tabular-nums transition-all ${
                feedbackStatus === 'correct'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : feedbackStatus === 'wrong'
                  ? 'border-rose-400 bg-rose-50 text-rose-700 animate-shake'
                  : inputAnswer
                  ? 'border-blue-500 bg-blue-50/50 text-slate-900'
                  : 'border-slate-300 bg-slate-50 text-slate-400'
              }`}
            >
              {inputAnswer || '__'}
            </div>
            <span className="text-2xl font-bold font-mono text-slate-700">cm</span>
          </div>

          <div className="h-10 mt-3 flex items-center justify-center">
            {feedbackStatus === 'correct' && (
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg animate-bounce">
                <Check className="w-5 h-5 stroke-[3]" />
                答对啦！🎉
              </div>
            )}
            {feedbackStatus === 'wrong' && (
              <div className="flex items-center gap-1.5 text-rose-500 font-bold text-base">
                <X className="w-5 h-5 stroke-[2.5]" />
                再试一次
              </div>
            )}
          </div>

          {feedbackStatus === 'correct' && (
            <button
              onClick={handleNextObject}
              className="mt-2 flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              下一题
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>

        {/* 3x4 Child-friendly Number Keypad */}
        <div className="md:col-span-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px]">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleNumberClick(digit)}
                className="h-13 rounded-xl bg-slate-100 hover:bg-blue-500 hover:text-white active:bg-blue-600 text-slate-800 text-2xl font-bold font-mono transition-colors shadow-xs active:scale-95"
              >
                {digit}
              </button>
            ))}

            <button
              onClick={handleClearInput}
              className="h-13 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 text-sm font-bold transition-colors shadow-xs active:scale-95"
            >
              清除
            </button>

            <button
              onClick={() => handleNumberClick('0')}
              className="h-13 rounded-xl bg-slate-100 hover:bg-blue-500 hover:text-white active:bg-blue-600 text-slate-800 text-2xl font-bold font-mono transition-colors shadow-xs active:scale-95"
            >
              0
            </button>

            <button
              onClick={handleSubmit}
              className="h-13 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-base font-bold transition-colors shadow-xs active:scale-95"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
