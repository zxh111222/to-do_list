import { TodoWidget } from './modules/todo/TodoWidget';
import { CalendarWidget } from './modules/calendar/CalendarWidget';
import { WeatherWidget } from './modules/weather/WeatherWidget';
import { FocusWidget } from './modules/focus/FocusWidget';
import { NotesWidget } from './modules/notes/NotesWidget';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useAppStore } from './store/useAppStore';
import { useState, useRef, useEffect } from 'react';
import { ChevronRight, LayoutDashboard, Menu, CheckSquare, Calendar as CalendarIcon, Timer, Sun, LogOut, RefreshCw, X, Settings, Download, Upload, StickyNote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { convertTodoToEvent, opacity, setOpacity, exportData, importData, weatherCity, setWeatherCity } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'todo' | 'calendar' | 'focus' | 'notes' | 'weather'>('todo');

  // Load auto-start setting
  useEffect(() => {
    if ((window as any).ipcRenderer) {
        (window as any).ipcRenderer.invoke('get-auto-start').then((enabled: boolean) => {
            setAutoStart(enabled);
        });
    }
  }, []);


  const toggleAutoStart = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newState = e.target.checked;
      setAutoStart(newState);
      if ((window as any).ipcRenderer) {
          (window as any).ipcRenderer.send('set-auto-start', newState);
      }
  };

  // Constants for window sizing
  const EXPANDED_WIDTH = 900;
  const EXPANDED_HEIGHT = 700;
  const COLLAPSED_WIDTH = 60;
  const COLLAPSED_HEIGHT = 60;

  const toggleCollapse = () => {
      const newState = !isCollapsed;
      setIsCollapsed(newState);
      
      if ((window as any).ipcRenderer) {
          if (newState) {
              (window as any).ipcRenderer.resizeWindow(COLLAPSED_WIDTH, COLLAPSED_HEIGHT);
          } else {
              (window as any).ipcRenderer.resizeWindow(EXPANDED_WIDTH, EXPANDED_HEIGHT);
          }
      }
  };

  const handleReload = () => {
      window.location.reload();
  };

  const handleExit = () => {
      if ((window as any).ipcRenderer) {
          window.close();
      }
  };
  
  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              try {
                  const json = e.target?.result as string;
                  const data = JSON.parse(json);
                  importData(data);
                  alert('数据导入成功！');
              } catch (error) {
                  alert('导入失败：无效的文件格式');
              }
          };
          reader.readAsText(file);
      }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.data.current?.type === 'todo') {
      const todoId = active.data.current.id;
      if (over.id.toString().startsWith('day-')) {
        const dateStr = over.data.current?.date;
        if (dateStr) {
          convertTodoToEvent(todoId, new Date(dateStr));
        }
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="w-full h-full relative overflow-hidden bg-transparent font-sans select-none flex">
        
        {/* Collapse Toggle - Floating */}
        <button 
            onClick={toggleCollapse}
            className="absolute top-4 right-4 z-50 p-2.5 bg-slate-900/40 hover:bg-slate-800/60 backdrop-blur-md text-white rounded-full shadow-lg border border-white/10 transition-all hover:scale-105"
            title={isCollapsed ? "展开面板" : "收起面板"}
        >
            {isCollapsed ? <LayoutDashboard size={20} /> : <ChevronRight size={20} />}
        </button>

        <AnimatePresence>
            {!isCollapsed && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex p-8 gap-8"
                >
                    {/* Left Sidebar Navigation */}
                    <div className="w-18 flex flex-col items-center gap-6 py-6 bg-slate-900/30 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl h-fit self-center relative z-50">
                        <button onClick={() => setActiveTab('todo')} className={`p-3.5 rounded-2xl transition-all relative group ${activeTab === 'todo' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`} title="待办事项">
                            <CheckSquare size={22} />
                            {activeTab === 'todo' && <motion.div layoutId="active-nav" className="absolute inset-0 rounded-2xl border border-white/20" />}
                        </button>
                        <button onClick={() => setActiveTab('calendar')} className={`p-3.5 rounded-2xl transition-all relative group ${activeTab === 'calendar' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`} title="日历">
                            <CalendarIcon size={22} />
                        </button>
                         <button onClick={() => setActiveTab('focus')} className={`p-3.5 rounded-2xl transition-all relative group ${activeTab === 'focus' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`} title="专注计时">
                            <Timer size={22} />
                        </button>
                        <button onClick={() => setActiveTab('notes')} className={`p-3.5 rounded-2xl transition-all relative group ${activeTab === 'notes' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`} title="便签">
                            <StickyNote size={22} />
                        </button>
                        <button onClick={() => setActiveTab('weather')} className={`p-3.5 rounded-2xl transition-all relative group ${activeTab === 'weather' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`} title="天气">
                            <Sun size={22} />
                        </button>
                        
                        <div className="w-8 h-px bg-white/5 my-1" />
                        
                        <div className="relative">
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`p-3.5 rounded-2xl transition-all duration-300 relative group
                                    ${isMenuOpen ? 'bg-white/20 text-white' : 'text-white/30 hover:text-white hover:bg-white/5 hover:rotate-90'}
                                `}
                            >
                                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>

                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: 10, scale: 0.9 }}
                                        className="absolute left-full bottom-0 ml-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl flex flex-col gap-2 min-w-[240px] z-50 max-h-[400px] overflow-y-auto custom-scrollbar"
                                    >
                                        <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm font-medium whitespace-nowrap w-full text-left">
                                            <Settings size={16} />
                                            界面设置
                                        </button>
                                        
                                        <AnimatePresence>
                                            {showSettings && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden w-full"
                                                >
                                                    <div className="px-3 py-2 bg-black/20 rounded-xl mb-1 flex items-center justify-between">
                                                        <span className="text-xs text-white/60">开机自启</span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input type="checkbox" checked={autoStart} onChange={toggleAutoStart} className="sr-only peer" />
                                                            <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                                                        </label>
                                                    </div>

                                                    <div className="px-3 py-2 bg-black/20 rounded-xl mb-1">
                                                        <div className="flex justify-between text-xs text-white/60 mb-1.5">
                                                            <span>透明度</span>
                                                            <span>{Math.round(opacity * 100)}%</span>
                                                        </div>
                                                        <input 
                                                            type="range" 
                                                            min="0.1" 
                                                            max="0.9" 
                                                            step="0.05"
                                                            value={opacity} 
                                                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                                            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                                        />
                                                    </div>

                                                    <div className="px-3 py-2 bg-black/20 rounded-xl mb-1">
                                                        <div className="flex justify-between text-xs text-white/60 mb-1.5">
                                                            <span>天气城市</span>
                                                        </div>
                                                        <input 
                                                            type="text" 
                                                            value={weatherCity}
                                                            onChange={(e) => setWeatherCity(e.target.value)}
                                                            placeholder="输入城市名"
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30"
                                                        />
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        <button onClick={exportData} className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors gap-1 text-xs text-white/60 hover:text-white">
                                                            <Download size={14} />
                                                            <span>备份</span>
                                                        </button>
                                                        <button onClick={handleImportClick} className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors gap-1 text-xs text-white/60 hover:text-white">
                                                            <Upload size={14} />
                                                            <span>导入</span>
                                                        </button>
                                                        <input 
                                                            type="file" 
                                                            ref={fileInputRef} 
                                                            onChange={handleFileChange} 
                                                            accept=".json" 
                                                            className="hidden" 
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <button onClick={handleReload} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm font-medium whitespace-nowrap w-full text-left">
                                            <RefreshCw size={16} />
                                            刷新界面
                                        </button>
                                        <button onClick={handleExit} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/20 text-white/70 hover:text-red-200 transition-colors text-sm font-medium whitespace-nowrap w-full text-left">
                                            <LogOut size={16} />
                                            退出应用
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 grid grid-cols-12 grid-rows-12 gap-8 h-full">
                        
                        {/* Dynamic Main Widget Area (Takes up most space) */}
                        <div className="col-span-8 row-span-12 h-full overflow-hidden flex flex-col">
                            <AnimatePresence mode="wait">
                                {activeTab === 'todo' && (
                                    <motion.div key="todo" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="h-full">
                                        <TodoWidget />
                                    </motion.div>
                                )}
                                {activeTab === 'calendar' && (
                                    <motion.div key="calendar" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="h-full">
                                        <CalendarWidget />
                                    </motion.div>
                                )}
                                {activeTab === 'focus' && (
                                    <motion.div key="focus" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="h-full">
                                        <FocusWidget />
                                    </motion.div>
                                )}
                                {activeTab === 'notes' && (
                                    <motion.div key="notes" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="h-full">
                                        <NotesWidget />
                                    </motion.div>
                                )}
                                {activeTab === 'weather' && (
                                    <motion.div key="weather" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="h-full">
                                        <WeatherWidget />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Right Side - Always Visible Secondary Info */}
                        <div className="col-span-4 row-span-5">
                             <WeatherWidget />
                        </div>
                        <div className="col-span-4 row-span-7">
                             <FocusWidget />
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </DndContext>
  )
}

export default App
