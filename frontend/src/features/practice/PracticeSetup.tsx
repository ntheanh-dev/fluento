import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlignLeft, 
  FileText, 
  PenLine, 
  BarChart2, 
  Globe, 
  Brain, 
  MessageSquare, 
  ListOrdered, 
  Info, 
  ArrowRight,
  Clock
} from 'lucide-react';

const PracticeSetup = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'sentence' | 'paragraph' | 'custom'>('sentence');
  
  // Form States
  const [topic, setTopic] = useState('Daily Conversation');
  const [difficulty, setDifficulty] = useState('Medium');
  const [tone, setTone] = useState('Neutral');
  
  // Sentence Specific
  const [sentenceCount, setSentenceCount] = useState(5);
  
  // Paragraph Specific
  const [paraType, setParaType] = useState('Essay');
  const [wordCount, setWordCount] = useState(150);

  // Custom Specific
  const [customText, setCustomText] = useState('');

  const handleStart = () => {
    navigate('/session', { state: { mode, topic, difficulty, tone, sentenceCount, paraType, wordCount, customText } });
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          
          {/* Header & Mode Switcher */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Start New Practice</h1>
              <p className="text-slate-500 text-sm mt-1">Choose your preferred way to practice translating.</p>
            </div>
            <div className="bg-slate-100 p-1.5 rounded-xl flex text-sm font-medium overflow-x-auto">
              <button 
                onClick={() => setMode('sentence')}
                className={`flex-1 px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 min-w-[120px] ${
                  mode === 'sentence' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <AlignLeft size={16} />
                Dịch theo câu
              </button>
              <button 
                onClick={() => setMode('paragraph')}
                className={`flex-1 px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 min-w-[120px] ${
                  mode === 'paragraph' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileText size={16} />
                Viết đoạn văn
              </button>
              <button 
                onClick={() => setMode('custom')}
                className={`flex-1 px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 min-w-[120px] ${
                  mode === 'custom' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <PenLine size={16} />
                Tự do
              </button>
            </div>
          </div>

          {/* CONTENT BASED ON MODE */}
          <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            
            {/* === SENTENCE & PARAGRAPH MODES COMMON CONFIG === */}
            {(mode === 'sentence' || mode === 'paragraph') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {mode === 'paragraph' && (
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <FileText size={16} className="text-slate-400" />
                        Paragraph Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Essay', 'Email', 'IELTS Task 1', 'IELTS Task 2', 'Formal Letter', 'Creative'].map((type) => (
                          <button 
                            key={type}
                            onClick={() => setParaType(type)}
                            className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-center border ${
                              paraType === type 
                                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Globe size={16} className="text-slate-400" />
                      Topic
                    </label>
                    <div className="relative">
                      <select 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 py-3 pl-4 pr-10 appearance-none outline-none font-medium text-slate-700"
                      >
                        <option>Daily Conversation</option>
                        <option>Business & Finance</option>
                        <option>Travel & Culture</option>
                        <option>Technology</option>
                        <option>Academic Writing</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Brain size={16} className="text-slate-400" />
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-3">
                      {['Beginner', 'Easy', 'Medium', 'Hard'].map((level) => (
                        <button
                          key={level}
                          onClick={() => setDifficulty(level)}
                          className={`py-2.5 rounded-lg text-sm font-bold border transition-all ${
                            difficulty === level
                              ? level === 'Beginner' ? 'border-teal-500 bg-teal-50 text-teal-700'
                              : level === 'Easy' ? 'border-green-500 bg-green-50 text-green-700'
                              : level === 'Medium' ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : level === 'Hard' ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-red-500 bg-red-50 text-red-700'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <MessageSquare size={16} className="text-slate-400" />
                      Tone & Style
                    </label>
                    <div className="relative">
                      <select 
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 py-3 pl-4 pr-10 appearance-none outline-none font-medium text-slate-700"
                      >
                        <option>Neutral</option>
                        <option>Formal</option>
                        <option>Casual</option>
                        <option>Professional</option>
                        <option>Humorous</option>
                      </select>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>

                  {mode === 'sentence' ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <ListOrdered size={16} className="text-slate-400" />
                          Number of Sentences
                        </label>
                        <span className="text-blue-600 font-bold text-lg bg-blue-50 px-3 py-1 rounded-lg">{sentenceCount}</span>
                      </div>
                      <div className="px-2 pt-2 pb-4">
                        <input 
                          type="range" 
                          min="1" 
                          max="20" 
                          value={sentenceCount}
                          onChange={(e) => setSentenceCount(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                          <span>1</span>
                          <span>10</span>
                          <span>20</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                       <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <AlignLeft size={16} className="text-slate-400" />
                          Length (Words)
                        </label>
                        <span className="text-blue-600 font-bold text-lg bg-blue-50 px-3 py-1 rounded-lg">{wordCount}</span>
                      </div>
                      <div className="px-2 pt-2 pb-4">
                        <input 
                          type="range" 
                          min="50" 
                          max="500" 
                          step="10"
                          value={wordCount}
                          onChange={(e) => setWordCount(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                          <span>50</span>
                          <span>250</span>
                          <span>500</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <h4 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                      <Info size={16} />
                      Estimated Time
                    </h4>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Based on your selection, this practice session will take approximately <span className="font-bold">{mode === 'sentence' ? '5-10 minutes' : '20-25 minutes'}</span> to complete.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* === CUSTOM MODE === */}
            {mode === 'custom' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Custom Vietnamese Text</h2>
                  <p className="text-slate-500 mt-1">Paste your own Vietnamese text to practice pronunciation, translation, or listening exercises.</p>
                </div>

                <div className="relative flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <label className="text-slate-700 text-sm font-bold uppercase tracking-wider">Input Paragraph</label>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">
                      {customText.length} / 2000 characters
                    </span>
                  </div>
                  <div className="relative group">
                    <textarea 
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="form-input flex w-full min-h-[320px] resize-none rounded-xl text-slate-900 border-2 border-slate-200 bg-white focus:border-blue-500 focus:ring-0 p-5 text-lg leading-relaxed placeholder:text-slate-300 transition-all outline-none" 
                      placeholder="Dán đoạn văn tiếng Việt của bạn vào đây để bắt đầu luyện tập..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <Info size={20} className="text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-700">Format Tip</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">For best results, ensure your text includes proper Vietnamese diacritics and punctuation.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <BarChart2 size={20} className="text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-700">Auto-Detection</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">We will automatically detect the difficulty level and suggest vocabulary based on your custom text.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* === FOOTER ACTION === */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-2">
              <div className="hidden sm:flex items-center gap-2 text-slate-400">
                <Clock size={16} />
                <span className="text-xs font-medium">Est. practice time: {mode === 'custom' ? 'Variable' : '15 mins'}</span>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => {
                      setTopic('Daily Conversation');
                      setDifficulty('Medium');
                      setCustomText('');
                  }}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-lg text-slate-500 font-bold text-sm hover:bg-slate-50 hover:text-slate-700 transition-colors"
                >
                  Reset
                </button>
                <button 
                  onClick={handleStart}
                  disabled={mode === 'custom' && customText.length < 10}
                  className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Start Practicing
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeSetup;