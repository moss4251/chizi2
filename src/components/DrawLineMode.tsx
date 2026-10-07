import React, { useState, useRef } from 'react';
import { Ruler, RULER_PADDING_LEFT } from './Ruler';
import { PX_PER_CM } from './MeasureObjects';
import { playClickSound, playPencilSound } from '../utils/sound';
import { Trash2, RotateCcw } from 'lucide-react';

interface DrawnLine {
  id: string;
  startX: number; // pixel relative to ruler zero
  lengthPx: number; // final rounded pixel length
  lengthCm: number; // integer cm
  color: string;
  y: number;
}

const LINE_COLORS = ['#2563EB', '#DC2626', '#16A34A', '#9333EA', '#EA580C'];

export const DrawLineMode: React.FC = () => {
  const [rulerPos, setRulerPos] = useState({ x: 80, y: 160 });
  const [isDraggingRuler, setIsDraggingRuler] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; rulerX: number; rulerY: number } | null>(null);

  const [currentColor, setCurrentColor] = useState(LINE_COLORS[0]);
  const [lines, setLines] = useState<DrawnLine[]>([]);

  // Continuous (无极) drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStartX, setDrawStartX] = useState<number>(0);
  const [currentDrawX, setCurrentDrawX] = useState<number>(0);

  const boardRef = useRef<HTMLDivElement>(null);

  // Ruler dragging
  const handleRulerDragStart = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    if (relativeY <= 26) {
      return;
    }

    setIsDraggingRuler(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      rulerX: rulerPos.x,
      rulerY: rulerPos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Continuous pointer move (无极)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRuler && dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      setRulerPos({
        x: Math.max(10, Math.min(650, dragStartRef.current.rulerX + dx)),
        y: Math.max(60, Math.min(260, dragStartRef.current.rulerY + dy)),
      });
      return;
    }

    if (isDrawing && boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const rulerZeroX = rulerPos.x + RULER_PADDING_LEFT;
      const rawRelativeX = e.clientX - boardRect.left - rulerZeroX;
      const clampedX = Math.max(0, Math.min(10 * PX_PER_CM, rawRelativeX));
      setCurrentDrawX(clampedX);
    }
  };

  // Releasing pointer: "只有结果要就近整理"
  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRuler) {
      setIsDraggingRuler(false);
      dragStartRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      return;
    }

    if (isDrawing) {
      setIsDrawing(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      const rawLeft = Math.min(drawStartX, currentDrawX);
      const rawRight = Math.max(drawStartX, currentDrawX);
      const rawWidthPx = rawRight - rawLeft;

      const rawLengthCm = rawWidthPx / PX_PER_CM;
      if (rawLengthCm >= 0.3) {
        const roundedCm = Math.max(1, Math.min(10, Math.round(rawLengthCm)));
        const finalLengthPx = roundedCm * PX_PER_CM;

        const snappedStartCm = Math.round(rawLeft / PX_PER_CM);
        const clampedStartCm = Math.max(0, Math.min(10 - roundedCm, snappedStartCm));
        const finalStartX = clampedStartCm * PX_PER_CM;

        const newLine: DrawnLine = {
          id: `line-${Date.now()}-${Math.random()}`,
          startX: finalStartX,
          lengthPx: finalLengthPx,
          lengthCm: roundedCm,
          color: currentColor,
          y: rulerPos.y - 6,
        };
        setLines((prev) => [...prev, newLine]);
        playPencilSound();
      }
    }
  };

  // Start continuous drawing on ruler edge
  const handleEdgePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    const rulerZeroX = rulerPos.x + RULER_PADDING_LEFT;
    const rawX = e.clientX - boardRect.left - rulerZeroX;
    const clampedStartX = Math.max(0, Math.min(10 * PX_PER_CM, rawX));

    setIsDrawing(true);
    setDrawStartX(clampedStartX);
    setCurrentDrawX(clampedStartX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    playClickSound();
  };

  // Quick preset draw button
  const handleQuickDraw = (len: number) => {
    playPencilSound();
    const newLine: DrawnLine = {
      id: `line-${Date.now()}-${Math.random()}`,
      startX: 0,
      lengthPx: len * PX_PER_CM,
      lengthCm: len,
      color: currentColor,
      y: rulerPos.y - 6,
    };
    setLines((prev) => [...prev, newLine]);
  };

  const handleClearLines = () => {
    playClickSound();
    setLines([]);
    setIsDrawing(false);
  };

  const handleResetRuler = () => {
    playClickSound();
    setRulerPos({ x: 80, y: 160 });
  };

  const activeLeft = Math.min(drawStartX, currentDrawX);
  const activeRight = Math.max(drawStartX, currentDrawX);
  const activeContinuousWidth = activeRight - activeLeft;
  const liveLengthCm = (activeContinuousWidth / PX_PER_CM).toFixed(1);

  return (
    <div className="w-full flex flex-col gap-3 select-none">
      {/* Top Toolbar: Separated cleanly from canvas */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl px-4 py-2.5 border border-slate-200 shadow-xs">
        {/* Color buttons */}
        <div className="flex items-center gap-2">
          {LINE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                playClickSound();
                setCurrentColor(c);
              }}
              className={`w-7 h-7 rounded-full transition-transform ${
                currentColor === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-800 shadow' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Integer CM preset buttons for quick drawing: 1cm ~ 10cm */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((len) => (
            <button
              key={len}
              onClick={() => handleQuickDraw(len)}
              className="px-2.5 py-1 text-xs font-bold font-mono rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 transition-colors shadow-xs active:scale-95"
            >
              {len}cm
            </button>
          ))}
        </div>

        {/* Action buttons: Reset & Clear */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetRuler}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            复位
          </button>
          <button
            onClick={handleClearLines}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空
          </button>
        </div>
      </div>

      {/* Drawing Paper Canvas with zero padding */}
      <div
        ref={boardRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full h-[450px] rounded-2xl bg-gradient-to-b from-amber-50/70 to-orange-50/50 border border-amber-200/80 shadow-inner overflow-hidden select-none touch-none"
      >
        {/* Grid paper background */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)',
            backgroundSize: '25px 25px',
          }}
        />

        {/* Finished Drawn Lines (snapped to integer cm) */}
        {lines.map((line) => {
          const lineAbsoluteX = rulerPos.x + RULER_PADDING_LEFT + line.startX;
          return (
            <div
              key={line.id}
              style={{
                left: `${lineAbsoluteX}px`,
                top: `${line.y}px`,
                width: `${line.lengthPx}px`,
              }}
              className="absolute z-15 pointer-events-none flex flex-col items-center"
            >
              <div className="relative w-full h-[18px] flex items-center">
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full"
                  style={{ backgroundColor: line.color }}
                />
                <div
                  className="w-full h-[4px] rounded-full"
                  style={{ backgroundColor: line.color }}
                />
                <div
                  className="absolute right-0 top-0 bottom-0 w-[3px] rounded-full"
                  style={{ backgroundColor: line.color }}
                />
              </div>

              <div
                className="mt-1 px-2 py-0.5 rounded text-[13px] font-mono font-bold text-white shadow-xs"
                style={{ backgroundColor: line.color }}
              >
                {line.lengthCm} cm
              </div>
            </div>
          );
        })}

        {/* Live Continuous (无极) Drawing Preview */}
        {isDrawing && activeContinuousWidth > 0 && (
          <div
            style={{
              left: `${rulerPos.x + RULER_PADDING_LEFT + activeLeft}px`,
              top: `${rulerPos.y - 6}px`,
              width: `${activeContinuousWidth}px`,
            }}
            className="absolute z-25 pointer-events-none flex flex-col items-center"
          >
            <div className="relative w-full h-[18px] flex items-center">
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full"
                style={{ backgroundColor: currentColor }}
              />
              <div
                className="w-full h-[4px] rounded-full"
                style={{ backgroundColor: currentColor }}
              />
              <div
                className="absolute right-0 top-0 bottom-0 w-[3px] rounded-full"
                style={{ backgroundColor: currentColor }}
              />
            </div>

            <div
              className="mt-1 px-2 py-0.5 rounded text-[12px] font-mono font-bold text-white shadow-md animate-pulse"
              style={{ backgroundColor: currentColor }}
            >
              {liveLengthCm} cm
            </div>
          </div>
        )}

        {/* Floating Realistic Pencil Graphic following the drawing tip continuously */}
        {isDrawing && (
          <div
            style={{
              left: `${rulerPos.x + RULER_PADDING_LEFT + currentDrawX - 12}px`,
              top: `${rulerPos.y - 56}px`,
            }}
            className="absolute z-40 pointer-events-none drop-shadow-lg transition-transform"
          >
            <svg width="40" height="50" viewBox="0 0 40 50" fill="none">
              <polygon points="12,48 4,28 20,28" fill="#FDE68A" />
              <polygon points="12,48 8,40 16,40" fill="#334155" />
              <rect x="4" y="4" width="16" height="24" rx="2" fill="#F59E0B" />
              <rect x="8" y="4" width="8" height="24" fill="#FBBF24" />
              <rect x="4" y="0" width="16" height="5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="0.5" />
            </svg>
          </div>
        )}

        {/* The 10cm Ruler */}
        <Ruler
          x={rulerPos.x}
          y={rulerPos.y}
          onDragStart={handleRulerDragStart}
          isDragging={isDraggingRuler}
        />

        {/* Interactive Ruler Measurement Edge for continuous drawing */}
        <div
          style={{
            left: `${rulerPos.x + RULER_PADDING_LEFT}px`,
            top: `${rulerPos.y - 14}px`,
            width: `${10 * PX_PER_CM}px`,
            height: '28px',
          }}
          onPointerDown={handleEdgePointerDown}
          className="absolute z-30 cursor-crosshair group flex items-center"
        >
          <div className="w-full h-2 bg-blue-500/20 group-hover:bg-blue-500/40 rounded-full transition-colors" />
        </div>
      </div>
    </div>
  );
};
