import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { Plus, Check, Trash2, GripVertical, Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, Todo } from '../../store/useAppStore';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { parseDateFromText, ParsedDate } from '../../utils/nlp';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const DraggableTodoItem = React.forwardRef<HTMLDivElement, { todo: Todo }>(({ todo }, ref) => {
  const { toggleTodo, removeTodo } = useAppStore();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `todo-${todo.id}`,
    data: { type: 'todo', id: todo.id, text: todo.text, dueDate: todo.dueDate }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const setRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  return (
    <motion.div
      ref={setRef}
      style={style}
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-all duration-300 relative border border-transparent hover:border-white/5"
    >
      <div {...listeners} {...attributes} className="cursor-grab touch-none pt-1 self-start">
        <GripVertical size={14} className="text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <button
        onClick={() => toggleTodo(todo.id)}
        className={`w-5 h-5 mt-0.5 rounded-full border flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
          todo.done 
            ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
            : 'border-white/30 hover:border-white/60 hover:bg-white/5'
        }`}
      >
        {todo.done && <Check size={12} className="text-white" />}
      </button>
      
      <div className="flex-1 min-w-0 flex flex-col">
          <span className={`text-sm truncate transition-all duration-300 ${todo.done ? 'text-white/30 line-through' : 'text-white/90 font-medium'}`}>
            {todo.text}
          </span>
          {todo.dueDate && (
            <span className={`text-[10px] flex items-center gap-1 mt-0.5 ${todo.done ? 'text-white/20' : 'text-blue-300/80'}`}>
                <CalendarIcon size={10} />
                {format(new Date(todo.dueDate), 'MMM d, HH:mm')}
            </span>
          )}
      </div>

      <button 
        onClick={() => removeTodo(todo.id)}
        className="text-white/20 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0 p-1 hover:bg-rose-400/10 rounded-lg"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
});

DraggableTodoItem.displayName = 'DraggableTodoItem';

export const TodoWidget = () => {
  const { todos, addTodo } = useAppStore();
  const [input, setInput] = useState('');
  const [detectedDate, setDetectedDate] = useState<ParsedDate | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const activeTodos = todos.filter(t => !t.done);
  const completedTodos = todos.filter(t => t.done);

  // Parse date as user types
  useEffect(() => {
      if (!input) {
          setDetectedDate(null);
          return;
      }
      const result = parseDateFromText(input);
      setDetectedDate(result);
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    if (detectedDate) {
        // Add with detected date
        addTodo(detectedDate.cleanText || input, detectedDate.date);
    } else {
        addTodo(input);
    }
    
    setInput('');
    setDetectedDate(null);
  };

  return (
    <GlassCard className="w-full h-full !p-5">
      <div className="flex flex-col h-full w-full pointer-events-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">待办事项</h2>
          <span className="text-xs font-bold px-2.5 py-1 bg-white/10 rounded-full text-white/70 border border-white/5 shadow-inner">
            剩余 {activeTodos.length}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mb-6 relative z-20 pointer-events-auto">
        <div className="relative group">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="添加新任务 (例如：明天下午3点开会)..."
            className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 pl-4 pr-10 text-sm text-white placeholder-white/30 focus:outline-none focus:bg-black/30 focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-300 shadow-inner"
            />
            <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
            <Plus size={18} />
            </button>
        </div>
        
        {/* Date Detection Preview */}
        <AnimatePresence>
            {detectedDate && (
                <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="absolute -bottom-8 left-2 text-[10px] text-blue-200 flex items-center gap-1.5 bg-blue-500/20 px-3 py-1 rounded-full backdrop-blur-md border border-blue-500/30 shadow-lg"
                >
                    <Clock size={10} />
                    <span className="font-medium">识别时间: {format(detectedDate.date, 'MM月dd日 HH:mm', { locale: zhCN })}</span>
                </motion.div>
            )}
        </AnimatePresence>
      </form>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar -mr-2 pl-1">
        <AnimatePresence initial={false} mode='popLayout'>
          {activeTodos.length === 0 && completedTodos.length === 0 ? (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-white/20 pb-8"
            >
                <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center mb-3">
                    <Check size={20} />
                </div>
                <p className="text-sm">暂无任务</p>
            </motion.div>
          ) : (
            activeTodos.map((todo) => (
                <DraggableTodoItem key={todo.id} todo={todo} />
            ))
          )}
        </AnimatePresence>

        {completedTodos.length > 0 && (
            <div className="mt-6">
                <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors mb-3 w-full group"
                >
                    <div className={`transition-transform duration-200 ${showCompleted ? 'rotate-90' : ''}`}>
                        <ChevronRight size={14} />
                    </div>
                    <span>已完成 ({completedTodos.length})</span>
                    <div className="h-px bg-white/10 flex-1 ml-2 group-hover:bg-white/20 transition-colors" />
                </button>
                
                <AnimatePresence>
                    {showCompleted && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            {completedTodos.map(todo => (
                                <DraggableTodoItem key={todo.id} todo={todo} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )}
      </div>
      </div>
    </GlassCard>
  );
};
