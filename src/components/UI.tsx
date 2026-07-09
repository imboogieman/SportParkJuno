import React, { ReactNode } from 'react';
import { motion } from 'motion/react';

export function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick,
  disabled = false,
  type = 'button',
  id,
  animatePulse = false
}: { 
  children: ReactNode; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; 
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  id?: string;
  animatePulse?: boolean;
}) {
  const baseStyles = "px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand-teal text-white hover:brightness-110 shadow-xl neon-glow-teal",
    secondary: "bg-brand-sunset text-white hover:brightness-110 neon-glow-sunset",
    outline: "border border-brand-teal/20 text-brand-teal hover:bg-brand-teal hover:text-white glass",
    ghost: "text-brand-graphite/50 hover:text-brand-navy hover:bg-black/5"
  };

  const animationProps = animatePulse && !disabled ? {
    animate: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 4px 14px rgba(79, 176, 168, 0.3)",
        "0 12px 28px rgba(79, 176, 168, 0.65)",
        "0 4px 14px rgba(79, 176, 168, 0.3)"
      ]
    },
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  let finalClassName = `${baseStyles} ${variants[variant]} ${className}`;
  if (animatePulse) {
    // Strip transition and scale hover classes to prevent CSS conflicts with Framer Motion animations
    finalClassName = finalClassName
      .replace(/transition-all/g, '')
      .replace(/transition/g, '')
      .replace(/duration-\d+/g, '')
      .replace(/hover:scale-\d+/g, '');
    finalClassName = `relative overflow-visible ${finalClassName}`;
  } else {
    finalClassName = `transition-all duration-500 ${finalClassName}`;
  }

  // Detect rounded class to match the outline contour shape
  let roundedClass = "rounded-full";
  if (className.includes("rounded-xl") || className.includes("!rounded-xl")) {
    roundedClass = "rounded-xl";
  } else if (className.includes("rounded-2xl") || className.includes("!rounded-2xl")) {
    roundedClass = "rounded-2xl";
  } else if (className.includes("rounded-3xl") || className.includes("!rounded-3xl")) {
    roundedClass = "rounded-3xl";
  } else if (className.includes("rounded-[32px]")) {
    roundedClass = "rounded-[32px]";
  } else if (className.includes("rounded-[28px]")) {
    roundedClass = "rounded-[28px]";
  }

  return (
    <motion.button 
      id={id}
      whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={finalClassName}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      type={type}
      {...animationProps}
    >
      {/* Animated Contour Lines: Brand Orange & Lemon Yellow */}
      {animatePulse && !disabled && (
        <>
          {/* Inner contour ring (Brand Orange / Sunset) */}
          <motion.span 
            className={`absolute -inset-[3px] pointer-events-none border-2 border-[#FF8C42] ${roundedClass} z-[-1]`}
            animate={{
              scale: [1, 1.04, 1.01, 1.05, 1],
              opacity: [0.7, 1, 0.8, 1, 0.7],
              borderColor: ["#FF8C42", "#FFE31A", "#FF8C42"]
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Outer contour ripple wave (Lemon Yellow) */}
          <motion.span 
            className={`absolute -inset-[6px] pointer-events-none border border-[#FFE31A] ${roundedClass} z-[-2]`}
            animate={{
              scale: [1, 1.08, 1.14, 1.08, 1],
              opacity: [0.4, 0.8, 0, 0.6, 0.4],
              borderColor: ["#FFE31A", "#FF8C42", "#FFE31A"]
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.15
            }}
          />
        </>
      )}
      <span className="relative z-10 flex items-center justify-center gap-2 w-full h-full">
        {children}
      </span>
    </motion.button>
  );
}

export function Card({ 
  children, 
  className = '', 
  onClick 
}: { 
  children: ReactNode; 
  className?: string; 
  key?: string | number; 
  onClick?: () => void; 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`glass p-6 rounded-2xl ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

export function Badge({ children, color = 'teal', className = '' }: { children: ReactNode; color?: 'teal' | 'sunset' | 'blue' | 'white' | 'red' | 'navy' | 'purple' | 'orange'; className?: string }) {
  const colors = {
    teal: "bg-brand-teal/10 text-brand-teal border-brand-teal/20",
    sunset: "bg-brand-sunset/10 text-brand-sunset border-brand-sunset/20",
    blue: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
    white: "bg-white/20 text-white border-white/30",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
    navy: "bg-brand-navy/10 text-brand-navy border-brand-navy/20",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-600 border-orange-500/20"
  };
  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}

export function Input({ 
  icon: Icon, 
  label, 
  placeholder, 
  type = "text",
  className = "",
  value,
  onChange,
  required = false,
  id
}: { 
  icon?: any, 
  label?: string, 
  placeholder?: string, 
  type?: string,
  className?: string,
  value?: string,
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
  required?: boolean,
  id?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label htmlFor={id} className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 ml-4">{label}</label>}
      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          {Icon && <Icon className="w-4 h-4 text-brand-navy/30 group-focus-within:text-brand-teal transition-colors" />}
        </div>
        <input 
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full bg-white/40 backdrop-blur-md border border-white/40 rounded-full py-4 pl-12 pr-6 text-sm font-medium focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal/40 transition-all outline-none text-brand-navy placeholder:text-brand-navy/20"
        />
      </div>
    </div>
  );
}
