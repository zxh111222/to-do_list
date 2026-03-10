import { useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, LayoutGrid, X, ChevronDown } from 'lucide-react';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, 
  isToday, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths, 
  addWeeks, subWeeks, startOfDay, endOfDay
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useDroppable } from '@dnd-kit/core';
import { useAppStore, CalendarEvent } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

type ViewMode = 'month' | 'week' | 'agenda';

// --- Detail Popup Component ---
const EventDetailModal = ({ event, onClose }: { event: CalendarEvent; onClose: () => void }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm rounded-[2rem]"
            onClick={(e) => {
                // Close if clicked on background
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-slate-900/90 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
                
                <h3 className="text-xl font-bold text-white mb-4 pr-8">{event.title}</h3>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-white/80">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300">
                            <CalendarIcon size={18} />
                        </div>
                        <div>
                            <div className="text-xs text-white/40 uppercase tracking-wider">日期</div>
                            <div className="font-medium">{format(new Date(event.date), 'yyyy年MM月dd日 EEEE', { locale: zhCN })}</div>
                        </div>
                    </div>
                    
                    {event.type === 'todo' && (
                        <div className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full border border-emerald-500/20">
                            来自待办事项
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// --- Month View Components ---
const MonthDay = ({ day, currentDate, events, onEventClick }: { day: Date; currentDate: Date; events: CalendarEvent[], onEventClick: (e: CalendarEvent) => void }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day.toISOString()}`,
    data: { date: day }
  });

  const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));
  const isCurrentMonth = isSameMonth(day, currentDate);
  const isDayToday = isToday(day);

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] flex flex-col items-start p-2 rounded-2xl text-sm relative group cursor-pointer transition-all duration-300 border border-transparent
        ${!isCurrentMonth ? 'bg-white/[0.02] text-white/20' : 'bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/5'}
        ${isDayToday ? 'ring-2 ring-blue-500/50 bg-blue-500/10' : ''}
        ${isOver ? 'bg-white/20 border-white/40 scale-105 z-10 ring-2 ring-blue-400/50' : ''}
      `}
    >
      <span className={`text-sm font-bold mb-1.5 ${isDayToday ? 'text-blue-400' : 'opacity-50'}`}>{format(day, 'd')}</span>
      
      <div className="flex flex-col gap-1 w-full overflow-y-auto custom-scrollbar" style={{ maxHeight: '80px' }}>
        {dayEvents.slice(0, 2).map((e) => (
          <div 
            key={e.id} 
            className={`text-[10px] px-2 py-0.5 rounded-full truncate w-full transition-all hover:opacity-80 font-medium
                ${e.done 
                    ? 'bg-white/10 text-white/40 border border-white/5 line-through decoration-white/30' 
                    : isDayToday 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-emerald-500/80 text-white border border-emerald-400/20 shadow-sm'
                }
            `}
            title={e.title} 
            onClick={(evt) => {
                evt.stopPropagation();
                onEventClick(e);
            }}
          >
            {e.title}
          </div>
        ))}
        {dayEvents.length > 2 && (
          <div className="text-[9px] text-white/40 px-1 font-medium">
            +{dayEvents.length - 2} 更多
          </div>
        )}
      </div>
    </div>
  );
};

// --- Week View Components ---
const WeekDay = ({ day, events, onEventClick }: { day: Date; events: CalendarEvent[], onEventClick: (e: CalendarEvent) => void }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day.toISOString()}`,
    data: { date: day }
  });
  
  const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));
  const isCurrentDay = isToday(day);

  return (
    <div 
        ref={setNodeRef}
        className={`flex flex-col h-full border-r border-white/5 last:border-0 p-1 min-h-[100px] transition-colors
            ${isOver ? 'bg-white/10 ring-inset ring-2 ring-blue-400/30' : ''}
            ${isCurrentDay ? 'bg-white/[0.02]' : ''}
        `}
    >
        <div className={`text-center mb-3 p-1.5 rounded-xl transition-all ${isCurrentDay ? 'bg-blue-500/20 text-blue-200 border border-blue-500/20' : 'text-white/60'}`}>
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">{format(day, 'EEE', { locale: zhCN })}</div>
            <div className={`text-lg font-bold leading-none mt-0.5 ${isCurrentDay ? 'text-blue-400' : ''}`}>{format(day, 'd')}</div>
        </div>
        
        <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar px-0.5">
            {dayEvents.map(e => (
                <div 
                    key={e.id} 
                    className={`text-[10px] rounded-lg px-2 py-1.5 break-words transition-colors cursor-pointer border
                        ${e.done 
                            ? 'bg-white/5 border-white/5 text-white/40 line-through decoration-white/30 hover:bg-white/10' 
                            : 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-100'
                        }
                    `}
                    title={e.title}
                    onClick={() => onEventClick(e)}
                >
                    {e.title}
                </div>
            ))}
        </div>
    </div>
  );
};

// --- Agenda View Components ---
const AgendaItem = ({ event, onClick }: { event: CalendarEvent, onClick: () => void }) => (
    <div 
        onClick={onClick}
        className="flex gap-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-3 rounded-2xl transition-all duration-300 group cursor-pointer"
    >
        <div className="flex flex-col items-center min-w-[3.5rem] text-white/60 group-hover:text-white/90 transition-colors bg-white/5 rounded-xl p-2 h-fit border border-white/5">
            <span className="text-[10px] uppercase font-bold tracking-widest">{format(new Date(event.date), 'MMM', { locale: zhCN })}</span>
            <span className="text-2xl font-light leading-none mt-1">{format(new Date(event.date), 'd')}</span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
            <div className="text-base font-medium text-white/90 group-hover:text-white transition-colors">{event.title}</div>
            <div className="text-xs text-white/40 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50"></span>
                {format(new Date(event.date), 'EEEE, p', { locale: zhCN })}
            </div>
        </div>
    </div>
);

export const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [agendaRange, setAgendaRange] = useState<'today' | 'week' | 'custom'>('week');
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [customRange, setCustomRange] = useState({ start: new Date(), end: new Date() });

  const handlePrev = () => {
      if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
      else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
      else setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
      if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
      else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
      else setCurrentDate(addMonths(currentDate, 1));
  };

  // Generate days based on view
  let days: Date[] = [];
  if (view === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const startDate = startOfWeek(monthStart);
      const endDate = endOfWeek(monthEnd);
      
      days = eachDayOfInterval({ 
          start: startDate, 
          end: endDate 
      });
  } else if (view === 'week') {
      days = eachDayOfInterval({
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate)
      });
  }
  
  const { events } = useAppStore();

  // For Agenda, filter events based on selected range
  const getAgendaDateRange = () => {
    const now = new Date();
    switch (agendaRange) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'custom':
        return customRange;
      default:
        return { start: startOfWeek(now), end: endOfWeek(now) };
    }
  };
  
  const agendaEvents = view === 'agenda' 
      ? events
          .filter(e => {
            const eventDate = new Date(e.date);
            const range = getAgendaDateRange();
            return eventDate >= range.start && eventDate <= range.end;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 20)
      : [];

  return (
    <GlassCard className="flex flex-col h-full !p-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              {view === 'agenda' ? '日程列表' : format(currentDate, view === 'week' ? 'yyyy年 MMM' : 'yyyy年M月', { locale: zhCN })}
          </h2>
          
          {/* Agenda Range Selector */}
          {view === 'agenda' && (
            <div className="relative flex items-center gap-2">
              <button 
                onClick={() => setShowRangePicker(!showRangePicker)}
                className="flex items-center gap-2 px-3 py-1.5 bg-black/20 hover:bg-black/30 rounded-lg border border-white/5 text-sm text-white/70 transition-all"
              >
                <span>
                  {agendaRange === 'today' ? '今天' : 
                   agendaRange === 'week' ? '本周' : 
                   agendaRange === 'custom' ? '自定义' : '本周'}
                </span>
                <ChevronDown size={14} className={`transition-transform ${showRangePicker ? 'rotate-180' : ''}`} />
              </button>
              
              {showRangePicker && (
                <div className="absolute top-full left-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl z-50 min-w-[140px]">
                  {[
                    { key: 'today', label: '今天' },
                    { key: 'week', label: '本周' },
                    { key: 'custom', label: '自定义' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        if (item.key === 'custom') {
                          // Set custom range to next 7 days by default
                          const today = new Date();
                          setCustomRange({ 
                            start: today, 
                            end: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) 
                          });
                        }
                        setAgendaRange(item.key as typeof agendaRange);
                        setShowRangePicker(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        agendaRange === item.key 
                          ? 'bg-white/20 text-white' 
                          : 'text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Custom date inputs */}
              {agendaRange === 'custom' && (
                <div className="flex items-center gap-1">
                  <input 
                    type="date" 
                    value={format(customRange.start, 'yyyy-MM-dd')}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                    className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white"
                  />
                  <span className="text-white/40">-</span>
                  <input 
                    type="date" 
                    value={format(customRange.end, 'yyyy-MM-dd')}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                    className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex bg-black/20 rounded-xl p-1 border border-white/5">
                <button 
                    onClick={() => setView('month')} 
                    className={`p-1.5 rounded-lg transition-all duration-300 ${view === 'month' ? 'bg-white/20 shadow-sm text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    title="月视图"
                >
                    <LayoutGrid size={16} />
                </button>
                <button 
                    onClick={() => setView('week')} 
                    className={`p-1.5 rounded-lg transition-all duration-300 ${view === 'week' ? 'bg-white/20 shadow-sm text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    title="周视图"
                >
                    <CalendarIcon size={16} />
                </button>
                <button 
                    onClick={() => setView('agenda')} 
                    className={`p-1.5 rounded-lg transition-all duration-300 ${view === 'agenda' ? 'bg-white/20 shadow-sm text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    title="日程列表"
                >
                    <List size={16} />
                </button>
            </div>

            {view !== 'agenda' && (
                <div className="flex gap-1 bg-black/20 rounded-xl p-1 border border-white/5">
                    <button onClick={handlePrev} className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"><ChevronLeft size={16} /></button>
                    <button onClick={handleNext} className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"><ChevronRight size={16} /></button>
                </div>
            )}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {view === 'month' && (
            <>
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] mb-3 text-white/40 font-bold uppercase tracking-widest flex-shrink-0">
                    {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2 flex-1 overflow-y-auto custom-scrollbar content-start pr-1 pb-2" style={{ maxHeight: 'calc(100% - 30px)' }}>
                    {days.map((day) => (
                        <MonthDay 
                            key={day.toISOString()} 
                            day={day} 
                            currentDate={currentDate} 
                            events={events} 
                            onEventClick={setSelectedEvent}
                        />
                    ))}
                </div>
            </>
        )}

        {view === 'week' && (
            <div className="grid grid-cols-7 gap-0 h-full divide-x divide-white/5 bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
                {days.map((day) => (
                    <WeekDay 
                        key={day.toISOString()} 
                        day={day} 
                        events={events} 
                        onEventClick={setSelectedEvent}
                    />
                ))}
            </div>
        )}

        {view === 'agenda' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {agendaEvents.length > 0 ? (
                    agendaEvents.map(event => (
                        <AgendaItem 
                            key={event.id} 
                            event={event} 
                            onClick={() => setSelectedEvent(event)}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-3">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <CalendarIcon size={24} className="opacity-50" />
                        </div>
                        <p className="font-medium">暂无日程</p>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Detail Popup */}
      <AnimatePresence>
        {selectedEvent && (
            <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </AnimatePresence>
    </GlassCard>
  );
};
