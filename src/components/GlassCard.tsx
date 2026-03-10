import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { useAppStore } from '../store/useAppStore';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, ...props }, ref) => {
    const opacity = useAppStore((state) => state.opacity);
    
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-slate-900/60 backdrop-blur-3xl",
          "border border-white/20",
          "shadow-xl shadow-black/20",
          "rounded-3xl", 
          "p-6", 
          "text-white overflow-hidden relative",
          "group",
          "transition-all duration-500 ease-out",
          "hover:bg-slate-900/60 hover:border-white/30 hover:shadow-2xl hover:shadow-black/30",
          className
        )}
        style={{ backgroundColor: `rgba(15, 23, 42, ${opacity})` }}
        {...(props as any)}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70 pointer-events-none" />
        
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 opacity-100 pointer-events-none" />
        
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        <div className="relative z-10 h-full flex flex-col">
            {children}
        </div>
      </motion.div>
    );
  }
);
