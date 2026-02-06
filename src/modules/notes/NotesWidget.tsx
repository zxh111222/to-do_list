import { useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { Plus, X, Palette } from 'lucide-react';
import { useAppStore, Note } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

const NoteItem = ({ note }: { note: Note }) => {
  const { updateNote, removeNote } = useAppStore();
  const [, setIsEditing] = useState(false);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      layout
      className={`relative p-4 rounded-2xl text-gray-800 shadow-lg group min-h-[120px] flex flex-col ${note.color} backdrop-blur-sm border border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
    >
      <textarea
        value={note.content}
        onChange={(e) => updateNote(note.id, e.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        className="w-full h-full bg-transparent resize-none focus:outline-none text-sm font-medium placeholder-gray-600/50 flex-1 leading-relaxed"
        placeholder="记点什么..."
      />
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
         <button 
          onClick={() => removeNote(note.id)}
          className="p-1 hover:bg-black/10 rounded-full text-black/50 hover:text-red-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      
      <div className="text-[10px] text-black/40 mt-2 text-right font-medium">
        {new Date(note.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
};

export const NotesWidget = () => {
  const { notes, addNote } = useAppStore();
  const colors = ['bg-amber-200/80', 'bg-blue-200/80', 'bg-rose-200/80', 'bg-emerald-200/80'];
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  return (
    <GlassCard className="flex flex-col h-full !p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">便签</h2>
        <div className="flex items-center gap-3">
           <div className="flex gap-1.5 p-1 bg-black/20 rounded-full border border-white/5">
             {colors.map(c => (
               <button
                 key={c}
                 onClick={() => setSelectedColor(c)}
                 className={`w-4 h-4 rounded-full transition-all duration-300 ${c.replace('/80', '')} ${selectedColor === c ? 'ring-2 ring-white scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
               />
             ))}
           </div>
           <button 
             onClick={() => addNote('', selectedColor)}
             className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
           >
             <Plus size={18} />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-2 gap-3 content-start pr-1 -mr-2 pl-1 pb-2">
        <AnimatePresence mode="popLayout">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </AnimatePresence>
        
        {notes.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center text-white/20 h-40 border-2 border-dashed border-white/10 rounded-2xl">
            <Palette size={24} className="mb-2 opacity-50" />
            <p className="text-sm font-medium">暂无便签</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
