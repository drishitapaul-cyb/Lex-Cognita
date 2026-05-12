import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  spatial?: boolean;
}

export const GlassCard = ({ children, className = "", onClick, spatial = true }: GlassCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], ["5deg", "-5deg"]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], ["-5deg", "5deg"]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!spatial || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      whileHover={{ y: -5, scale: spatial ? 1.01 : 1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        floating-glass rounded-[40px] p-8 relative overflow-hidden group
        transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Light Diffusion Overlay */}
      <motion.div 
        style={{ 
          background: useTransform(
            [x, y], 
            ([mx, my]) => `radial-gradient(circle at ${Number(mx) * 100 + 50}% ${Number(my) * 100 + 50}%, rgba(34,211,238,0.1), transparent 60%)`
          )
        }}
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
      />

      {/* Surface Depth Shimmer */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div style={{ transform: 'translateZ(30px)' }} className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
};
