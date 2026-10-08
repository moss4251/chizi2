import React from 'react';
import { PX_PER_CM } from './MeasureObjects';

export const RULER_PADDING_LEFT = 25; // 25px before 0 tick
export const RULER_PADDING_RIGHT = 25; // 25px after 10cm tick
export const RULER_TOTAL_CM = 10;
export const RULER_CONTENT_WIDTH = RULER_TOTAL_CM * PX_PER_CM; // 500px
export const RULER_TOTAL_WIDTH = RULER_CONTENT_WIDTH + RULER_PADDING_LEFT + RULER_PADDING_RIGHT; // 550px
export const RULER_HEIGHT = 86;

interface RulerProps {
  x: number;
  y: number;
  onDragStart?: (e: React.PointerEvent) => void;
  isDragging?: boolean;
  disableDrag?: boolean;
  highlightCm?: number | null;
  selectedStartCm?: number | null;
  selectedEndCm?: number | null;
  onTickClick?: (cm: number) => void;
  className?: string;
  theme?: 'sky' | 'amber';
  rulerNumber?: number;
}

export const Ruler: React.FC<RulerProps> = ({
  x,
  y,
  onDragStart,
  isDragging = false,
  disableDrag = false,
  highlightCm = null,
  selectedStartCm = null,
  selectedEndCm = null,
  onTickClick,
  className = '',
  theme = 'sky',
  rulerNumber,
}) => {
  // Generate millimeter and centimeter ticks
  const ticks = [];
  const totalMm = RULER_TOTAL_CM * 10;

  for (let mm = 0; mm <= totalMm; mm++) {
    const tickX = RULER_PADDING_LEFT + (mm * PX_PER_CM) / 10;
    const isCm = mm % 10 === 0;
    const isHalfCm = mm % 5 === 0 && !isCm;
    const cmValue = mm / 10;

    let tickHeight = 11;
    let strokeWidth = 1;
    let strokeColor = '#334155';

    if (isCm) {
      tickHeight = 28;
      strokeWidth = 1.75;
      strokeColor = '#0F172A';
    } else if (isHalfCm) {
      tickHeight = 18;
      strokeWidth = 1.25;
      strokeColor = '#475569';
    }

    const isHighlighted = highlightCm !== null && Math.abs(highlightCm - cmValue) < 0.05;
    const isInSelection =
      selectedStartCm !== null &&
      selectedEndCm !== null &&
      cmValue >= Math.min(selectedStartCm, selectedEndCm) &&
      cmValue <= Math.max(selectedStartCm, selectedEndCm);

    ticks.push(
      <g
        key={mm}
        className={isCm && onTickClick ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''}
        onClick={(e) => {
          if (isCm && onTickClick) {
            e.stopPropagation();
            onTickClick(cmValue);
          }
        }}
      >
        {isCm && (
          <rect
            x={tickX - 12}
            y={0}
            width={24}
            height={tickHeight + 24}
            fill="transparent"
            className="hover:fill-blue-500/10 cursor-pointer"
          />
        )}

        <line
          x1={tickX}
          y1={0}
          x2={tickX}
          y2={tickHeight}
          stroke={isHighlighted ? '#EF4444' : isInSelection ? '#2563EB' : strokeColor}
          strokeWidth={isHighlighted || isInSelection ? strokeWidth + 0.8 : strokeWidth}
          strokeLinecap="square"
        />

        {/* Centimeter number */}
        {isCm && (
          <text
            x={tickX}
            y={tickHeight + 17}
            textAnchor="middle"
            className={`font-mono text-[15px] font-bold select-none tabular-nums ${
              isHighlighted
                ? 'fill-red-600 font-extrabold'
                : isInSelection
                ? 'fill-blue-600 font-extrabold'
                : 'fill-slate-800'
            }`}
          >
            {cmValue}
          </text>
        )}
      </g>
    );
  }

  const isAmber = theme === 'amber';

  return (
    <div
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: RULER_TOTAL_WIDTH,
        height: RULER_HEIGHT,
        touchAction: 'none',
      }}
      onPointerDown={disableDrag ? undefined : onDragStart}
      className={`absolute select-none group transition-shadow ${
        disableDrag
          ? 'cursor-default shadow-md'
          : isDragging
          ? 'cursor-grabbing shadow-2xl scale-[1.01]'
          : 'cursor-grab shadow-lg'
      } ${className}`}
    >
      {/* Acrylic Translucent Ruler Body with Realistic Bevel */}
      <div
        className={`absolute inset-0 rounded-md border backdrop-blur-sm shadow-md overflow-hidden ${
          isAmber
            ? 'bg-gradient-to-b from-white/95 via-amber-50/85 to-orange-50/90 border-amber-300/80'
            : 'bg-gradient-to-b from-white/95 via-sky-50/85 to-amber-50/90 border-slate-300/80'
        }`}
      >
        {/* Beveled Top Edge Reflection */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-white/90" />
        <div className="absolute top-[2px] inset-x-0 h-[1px] bg-slate-200/60" />

        {/* Central Frosted Strip for visual depth & grip */}
        <div
          className={`absolute top-[52px] inset-x-4 h-[24px] rounded-sm border flex items-center justify-between px-3 ${
            isAmber
              ? 'bg-gradient-to-r from-amber-100/50 via-orange-50/40 to-yellow-100/50 border-amber-200/80 text-amber-500'
              : 'bg-gradient-to-r from-sky-100/40 via-blue-50/30 to-amber-100/40 border-white/60 text-slate-400'
          }`}
        >
          <div className="w-8 h-[2px] bg-slate-300/60 rounded" />
          {rulerNumber ? (
            <span className="text-[11px] font-bold font-mono tracking-wider opacity-70">
              #{rulerNumber}
            </span>
          ) : (
            <div className="w-16 h-[2px] bg-slate-300/60 rounded" />
          )}
          <div className="w-8 h-[2px] bg-slate-300/60 rounded" />
        </div>

        {/* Standard "cm" Logo/Mark on the ruler */}
        <div
          className={`absolute top-[8px] left-[7px] text-[13px] font-bold font-mono tracking-tight select-none ${
            isAmber ? 'text-amber-800' : 'text-slate-700'
          }`}
        >
          cm
        </div>
      </div>

      {/* SVG overlay for precision tick marks and numbers */}
      <svg
        width={RULER_TOTAL_WIDTH}
        height={RULER_HEIGHT}
        viewBox={`0 0 ${RULER_TOTAL_WIDTH} ${RULER_HEIGHT}`}
        className="absolute inset-0 overflow-visible pointer-events-auto"
      >
        <line x1="0" y1="0" x2={RULER_TOTAL_WIDTH} y2="0" stroke="#0F172A" strokeWidth="1.5" />
        {ticks}
      </svg>
    </div>
  );
};
