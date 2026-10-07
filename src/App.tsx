import React, { useState } from 'react';
import { DrawLineMode } from './components/DrawLineMode';
import { MeasureMode } from './components/MeasureMode';
import { playClickSound } from './utils/sound';
import { Edit3, Compass } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'draw' | 'measure'>('draw');

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-start p-3 sm:p-6 md:p-8 select-none">
      <div className="w-full max-w-5xl flex flex-col gap-4">
        {/* Top Navigation Bar: Strictly Functional Mode Switch Buttons */}
        <header className="w-full flex items-center justify-center">
          <div className="flex items-center gap-2 p-1.5 bg-slate-200/90 rounded-2xl shadow-inner">
            <button
              onClick={() => {
                playClickSound();
                setActiveTab('draw');
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-base font-bold transition-all active:scale-95 ${
                activeTab === 'draw'
                  ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-4 h-4 stroke-[2.5]" />
              画线
            </button>
            <button
              onClick={() => {
                playClickSound();
                setActiveTab('measure');
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-base font-bold transition-all active:scale-95 ${
                activeTab === 'measure'
                  ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4 stroke-[2.5]" />
              测量
            </button>
          </div>
        </header>

        {/* Operational Workspace */}
        <section className="w-full">
          {activeTab === 'draw' ? <DrawLineMode /> : <MeasureMode />}
        </section>
      </div>
    </main>
  );
}
