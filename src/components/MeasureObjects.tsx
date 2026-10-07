import React from 'react';

export const PX_PER_CM = 50;

export interface MeasurableObject {
  id: string;
  type: string;
  lengthCm: number;
}

export const OBJECT_TEMPLATES = [
  { type: 'eraser', minLen: 2, maxLen: 4, name: '橡皮' },
  { type: 'paperclip', minLen: 2, maxLen: 3, name: '回形针' },
  { type: 'leaf', minLen: 3, maxLen: 5, name: '树叶' },
  { type: 'toycar', minLen: 4, maxLen: 6, name: '小汽车' },
  { type: 'key', minLen: 4, maxLen: 6, name: '钥匙' },
  { type: 'crayon', minLen: 5, maxLen: 8, name: '蜡笔' },
  { type: 'lollipop', minLen: 6, maxLen: 8, name: '棒棒糖' },
  { type: 'gluestick', minLen: 7, maxLen: 9, name: '胶棒' },
  { type: 'scissors', minLen: 8, maxLen: 10, name: '小剪刀' },
  { type: 'popsicle', minLen: 9, maxLen: 11, name: '雪糕棒' },
  { type: 'marker', minLen: 10, maxLen: 12, name: '记号笔' },
  { type: 'pencil', minLen: 11, maxLen: 14, name: '铅笔' },
  { type: 'ribbon', minLen: 11, maxLen: 15, name: '彩带' },
  { type: 'toothbrush', minLen: 12, maxLen: 15, name: '牙刷' },
  { type: 'pencilcase', minLen: 13, maxLen: 15, name: '文具盒' },
  { type: 'block', minLen: 1, maxLen: 15, name: '积木条' },
];

export function getRandomObject(targetLength?: number): MeasurableObject {
  const len = targetLength ?? Math.floor(Math.random() * 15) + 1; // 1 to 15 cm
  // Find templates suitable for this length
  const matched = OBJECT_TEMPLATES.filter((t) => len >= t.minLen && len <= t.maxLen);
  const selected = matched.length > 0
    ? matched[Math.floor(Math.random() * matched.length)]
    : OBJECT_TEMPLATES[OBJECT_TEMPLATES.length - 1];

  return {
    id: `${selected.type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: selected.type,
    lengthCm: len,
  };
}

interface ObjectRendererProps {
  object: MeasurableObject;
}

export const ObjectRenderer: React.FC<ObjectRendererProps> = ({ object }) => {
  const widthPx = object.lengthCm * PX_PER_CM;
  const heightPx = 64;

  const renderSvgContent = () => {
    switch (object.type) {
      case 'crayon':
        return (
          <svg width={widthPx} height={heightPx} viewBox={`0 0 ${widthPx} 64`} fill="none" className="overflow-visible drop-shadow-md">
            {/* Crayon Body */}
            <defs>
              <linearGradient id="crayonGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="50%" stopColor="#E11D48" />
                <stop offset="100%" stopColor="#9F1239" />
              </linearGradient>
            </defs>
            {/* Crayon tip */}
            <polygon points={`0,32 24,14 24,50`} fill="#BE123C" />
            <polygon points={`0,32 8,26 8,38`} fill="#881337" />
            {/* Main body */}
            <rect x="24" y="14" width={widthPx - 28} height="36" rx="4" fill="url(#crayonGrad)" />
            {/* Paper wrap */}
            <rect x="36" y="14" width={Math.max(10, widthPx - 60)} height="36" fill="#FFE4E6" />
            <line x1="42" y1="14" x2="42" y2="50" stroke="#FDA4AF" strokeWidth="2" strokeDasharray="3 3" />
            <line x1={Math.max(46, widthPx - 30)} y1="14" x2={Math.max(46, widthPx - 30)} y2="50" stroke="#FDA4AF" strokeWidth="2" strokeDasharray="3 3" />
            {/* Flat end */}
            <rect x={widthPx - 8} y="15" width="8" height="34" rx="2" fill="#9F1239" />
          </svg>
        );

      case 'pencil':
        return (
          <svg width={widthPx} height={heightPx} viewBox={`0 0 ${widthPx} 64`} fill="none" className="overflow-visible drop-shadow-md">
            {/* Eraser */}
            <rect x="0" y="20" width="22" height="24" rx="4" fill="#F472B6" />
            {/* Metal ferrule */}
            <rect x="18" y="19" width="14" height="26" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
            <line x1="23" y1="19" x2="23" y2="45" stroke="#64748B" strokeWidth="1" />
            <line x1="27" y1="19" x2="27" y2="45" stroke="#64748B" strokeWidth="1" />
            {/* Hexagonal wood shaft */}
            <rect x="32" y="20" width={widthPx - 62} height="24" fill="#F59E0B" />
            <line x1="32" y1="28" x2={widthPx - 30} y2="28" stroke="#FBBF24" strokeWidth="2" />
            <line x1="32" y1="36" x2={widthPx - 30} y2="36" stroke="#D97706" strokeWidth="2" />
            {/* Wood cone tip */}
            <polygon points={`${widthPx - 30},20 ${widthPx - 30},44 ${widthPx},32`} fill="#FDE68A" />
            {/* Lead tip */}
            <polygon points={`${widthPx - 10},28 ${widthPx - 10},36 ${widthPx},32`} fill="#334155" />
          </svg>
        );

      case 'paperclip':
        return (
          <svg width={widthPx} height={heightPx} viewBox={`0 0 ${widthPx} 64`} fill="none" className="overflow-visible drop-shadow-md">
            <path
              d={`M 12 36 L ${widthPx - 16} 36 A 12 12 0 0 0 ${widthPx - 16} 16 L 24 16 A 16 16 0 0 0 24 48 L ${widthPx - 12} 48`}
              stroke="#3B82F6"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={`M 12 36 L ${widthPx - 16} 36 A 12 12 0 0 0 ${widthPx - 16} 16 L 24 16 A 16 16 0 0 0 24 48 L ${widthPx - 12} 48`}
              stroke="#93C5FD"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'eraser':
        return (
          <svg width={widthPx} height={heightPx} viewBox={`0 0 ${widthPx} 64`} fill="none" className="overflow-visible drop-shadow-md">
            <rect x="0" y="16" width={widthPx} height="32" rx="6" fill="#38BDF8" />
            <path d={`M 0 22 L ${widthPx * 0.4} 22 L ${widthPx * 0.4} 48 L 0 48 Z`} fill="#0284C7" opacity="0.3" />
            {/* Paper sleeve */}
            <rect x={widthPx * 0.35} y="15" width={widthPx * 0.65} height="34" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            <rect x={widthPx * 0.4} y="22" width={widthPx * 0.55} height="6" rx="2" fill="#0284C7" />
            <rect x={widthPx * 0.4} y="34" width={widthPx * 0.3} height="4" rx="1" fill="#94A3B8" />
          </svg>
        );

      case 'leaf':
        return (
          <svg width={widthPx} height={heightPx} viewBox={`0 0 ${widthPx} 64`} fill="none" className="overflow-visible drop-shadow-md">
            {/* Stem */}
            <path d={`M 0 32 Q 10 32 18 32`} stroke="#15803D" strokeWidth="4" strokeLinecap="round" />
            {/* Leaf body */}
            <path
              d={`M 16 32 C 24 10, ${widthPx - 15} 12, ${widthPx} 32 C ${widthPx - 15} 52, 24 54, 16 32 Z`}
              fill="#22C55E"
              stroke="#16A34A"
              strokeWidth="2"
            />
            {/* Central vein */}
            <path d={`M 16 32 Q ${widthPx * 0.5} 32 ${widthPx} 32`} stroke="#86EFAC" strokeWidth="2.5" />
            {/* Side veins */}
            {Array.from({ length: 4 }).map((_, i) => {
              const x = 25 + i * ((widthPx - 35) / 5);
              return (
                <g key={i}>
                  <line x1={x} y1="32" x2={x + 10} y2="22" stroke="#86EFAC" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1={x} y1="32" x2={x + 10} y2="42" stroke="#86EFAC" strokeWidth="1.5" strokeLinecap="round" />
                </g>
              );
            })}
          </svg>
        );

      case 'popsicle':
        return (
          <svg width={widthPx} height={heightPx} viewBox={`0 0 ${widthPx} 64`} fill="none" className="overflow-visible drop-shadow-md">
            <rect x="0" y="18" width={widthPx} height="28" rx="14" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />
            <line x1="14" y1="28" x2={widthPx - 14} y2="28" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="12 8" />
            <line x1="14" y1="36" x2={widthPx - 14} y2="36" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="16 10" />
          </svg>
        );

      case 'gluestick':
        return (
          <svg width={widthPx} height={heightPx} viewBox={`0 0 ${widthPx} 64`} fill="none" className="overflow-visible drop-shadow-md">
            {/* Turn base */}
            <rect x="0" y="20" width="16" height="24" rx="2" fill="#E2E8F0" stroke="#94A3B8" />
            {/* Body */}
            <rect x="16" y="16" width={widthPx - 40} height="32" rx="4" fill="#6366F1" />
            <rect x="24" y="22" width={widthPx - 56} height="20" rx="2" fill="#EEF2FF" />
            <circle cx="34" cy="32" r="5" fill="#4F46E5" />
            {/* Cap */}
            <rect x={widthPx - 26} y="15" width="26" height="34" rx="5" fill="#4338CA" />
            <line x1={widthPx - 20} y1="18" x2={widthPx - 20} y2="46" stroke="#818CF8" strokeWidth="2" />
          </svg>
        );

      case 'scissors':
        return (
          <svg width={widthPx} height={heightPx} viewBox={`0 0 ${widthPx} 64`} fill="none" className="overflow-visible drop-shadow-md">
            {/* Handles */}
            <ellipse cx="14" cy="22" rx="14" ry="10" fill="#EF4444" stroke="#DC2626" strokeWidth="2" />
            <ellipse cx="14" cy="22" rx="7" ry="5" fill="#FFFFFF" />
            <ellipse cx="14" cy="42" rx="14" ry="10" fill="#EF4444" stroke="#DC2626" strokeWidth="2" />
            <ellipse cx="14" cy="42" rx="7" ry="5" fill="#FFFFFF" />
            {/* Pivot screw */}
            <circle cx="34" cy="32" r="4" fill="#64748B" />
            {/* Steel blades */}
            <polygon points={`32,30 ${widthPx},30 ${widthPx - 4},34 32,34`} fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
            <polygon points={`32,30 ${widthPx},34 ${widthPx - 4},30 32,34`} fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
            <circle cx="34" cy="32" r="2.5" fill="#0F172A" />
          </svg>
        );

      case 'lollipop':
        return (
          <svg width={widthPx} height={heightPx} viewBox={`0 0 ${widthPx} 64`} fill="none" className="overflow-visible drop-shadow-md">
            {/* Candy ball on left */}
            <circle cx="24" cy="32" r="22" fill="#EC4899" stroke="#DB2777" strokeWidth="2" />
            <path d="M 12 32 A 12 12 0 0 1 36 32 A 6 6 0 0 1 24 32" stroke="#FCE7F3" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* White stick extending to the right */}
            <rect x="36" y="29" width={widthPx - 36} height="6" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          </svg>
        );

      case 'ribbon':
        return (
          <svg width={widthPx} height={heightPx} viewBox={`0 0 ${widthPx} 64`} fill="none" className="overflow-visible drop-shadow-md">
            <defs>
              <linearGradient id="ribbonGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="33%" stopColor="#8B5CF6" />
                <stop offset="66%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <path
              d={`M 0 32 Q ${widthPx * 0.25} 18 ${widthPx * 0.5} 32 T ${widthPx} 32`}
              stroke="url(#ribbonGrad)"
              strokeWidth="22"
              strokeLinecap="round"
            />
            {/* Stitches */}
            <path
              d={`M 8 32 Q ${widthPx * 0.25} 18 ${widthPx * 0.5} 32 T ${widthPx - 8} 32`}
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeDasharray="4 4"
              fill="none"
            />
          </svg>
        );

      case 'toothbrush':
        return (
          <svg width={widthPx} height={heightPx} viewBox={`0 0 ${widthPx} 64`} fill="none" className="overflow-visible drop-shadow-md">
            {/* Bristles */}
            <rect x="0" y="16" width="34" height="14" rx="2" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
            <line x1="8" y1="16" x2="8" y2="30" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="16" y1="16" x2="16" y2="30" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="24" y1="16" x2="24" y2="30" stroke="#FFFFFF" strokeWidth="1" />
            {/* Brush head & handle */}
            <path
              d={`M 0 30 L 40 30 Q 60 36 90 34 L ${widthPx} 34 L ${widthPx} 42 L 80 42 Q 50 40 30 38 L 0 38 Z`}
              fill="#10B981"
              stroke="#059669"
              strokeWidth="1.5"
            />
            {/* Grip rubber */}
            <rect x={widthPx * 0.45} y="33" width={widthPx * 0.3} height="8" rx="4" fill="#047857" />
          </svg>
        );

      case 'pencilcase':
        return (
          <svg width={widthPx} height={heightPx} viewBox={`0 0 ${widthPx} 64`} fill="none" className="overflow-visible drop-shadow-md">
            <rect x="0" y="14" width={widthPx} height="36" rx="8" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="2" />
            {/* Zipper line */}
            <line x1="4" y1="20" x2={widthPx - 4} y2="20" stroke="#FDE047" strokeWidth="3" strokeDasharray="3 2" />
            <circle cx="16" cy="20" r="4" fill="#F59E0B" />
            {/* Cute pocket */}
            <rect x="28" y="26" width={widthPx - 56} height="18" rx="4" fill="#A78BFA" opacity="0.6" />
          </svg>
        );

      case 'toycar':
        return (
          <svg width={widthPx} height={heightPx} viewBox={`0 0 ${widthPx} 64`} fill="none" className="overflow-visible drop-shadow-md">
            {/* Car body */}
            <path
              d={`M 6 42 L ${widthPx - 6} 42 L ${widthPx} 36 L ${widthPx * 0.75} 34 L ${widthPx * 0.6} 20 L ${widthPx * 0.3} 20 L ${widthPx * 0.2} 34 L 0 36 Z`}
              fill="#EF4444"
              stroke="#B91C1C"
              strokeWidth="2"
            />
            {/* Window */}
            <polygon points={`${widthPx * 0.33},23 ${widthPx * 0.58},23 ${widthPx * 0.68},33 ${widthPx * 0.24},33`} fill="#BAE6FD" />
            {/* Wheels */}
            <circle cx={widthPx * 0.24} cy="42" r="10" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
            <circle cx={widthPx * 0.76} cy="42" r="10" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
            <circle cx={widthPx * 0.24} cy="42" r="4" fill="#CBD5E1" />
            <circle cx={widthPx * 0.76} cy="42" r="4" fill="#CBD5E1" />
          </svg>
        );

      case 'marker':
        return (
          <svg width={widthPx} height={heightPx} viewBox={`0 0 ${widthPx} 64`} fill="none" className="overflow-visible drop-shadow-md">
            {/* Chisel tip on right */}
            <polygon points={`${widthPx - 16},26 ${widthPx},22 ${widthPx},42 ${widthPx - 16},38`} fill="#10B981" />
            {/* Body */}
            <rect x="24" y="20" width={widthPx - 42} height="24" rx="3" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1" />
            <rect x="36" y="24" width={widthPx - 64} height="16" rx="2" fill="#10B981" />
            {/* Base Cap */}
            <rect x="0" y="18" width="24" height="28" rx="4" fill="#047857" />
          </svg>
        );

      case 'key':
        return (
          <svg width={widthPx} height={heightPx} viewBox={`0 0 ${widthPx} 64`} fill="none" className="overflow-visible drop-shadow-md">
            {/* Key ring head on left */}
            <circle cx="20" cy="32" r="18" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
            <circle cx="20" cy="32" r="8" fill="#FFFFFF" />
            {/* Shaft */}
            <rect x="34" y="28" width={widthPx - 34} height="8" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
            {/* Teeth */}
            <rect x={widthPx - 26} y="36" width="6" height="8" rx="1" fill="#D97706" />
            <rect x={widthPx - 14} y="36" width="6" height="11" rx="1" fill="#D97706" />
          </svg>
        );

      case 'block':
      default:
        return (
          <svg width={widthPx} height={heightPx} viewBox={`0 0 ${widthPx} 64`} fill="none" className="overflow-visible drop-shadow-md">
            <rect x="0" y="16" width={widthPx} height="32" rx="4" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
            {/* Striped block segments */}
            {Array.from({ length: object.lengthCm }).map((_, i) => (
              <g key={i}>
                <line x1={i * PX_PER_CM} y1="16" x2={i * PX_PER_CM} y2="48" stroke="#60A5FA" strokeWidth="1.5" />
                <circle cx={i * PX_PER_CM + 25} cy="32" r="4" fill="#93C5FD" opacity="0.8" />
              </g>
            ))}
          </svg>
        );
    }
  };

  return (
    <div className="relative select-none flex items-center justify-start" style={{ width: widthPx, height: heightPx }}>
      {renderSvgContent()}
      
      {/* Clean hairline alignment indicators at exact start and end for pedagogical measurement clarity */}
      <div className="absolute top-0 left-0 w-[2px] h-full bg-indigo-500/30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[2px] h-full bg-indigo-500/30 pointer-events-none" />
    </div>
  );
};
