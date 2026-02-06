import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          // Base - Increased opacity for better readability on busy backgrounds
          "bg-slate-900/60 backdrop-blur-3xl", // Darker background, strong blur
          "border border-white/20", // More visible border
          "shadow-xl shadow-black/20", // Stronger shadow for lift
          "rounded-3xl", 
          "p-6", 
          "text-white overflow-hidden relative",
          "group",
          
          // Hover
          "transition-all duration-500 ease-out",
          "hover:bg-slate-900/60 hover:border-white/30 hover:shadow-2xl hover:shadow-black/30",
          
          className
        )}
        {...(props as any)}
      >
        {/* Gradient Sheen - Top light source */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70 pointer-events-none" />
        
        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 opacity-100 pointer-events-none" />
        
        {/* Noise Texture - reduced slightly */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Content container - ensure it's above overlays */}
        <div className="relative z-10 h-full">
            {children}
        </div>
      </motion.div>
    );
  }
);
