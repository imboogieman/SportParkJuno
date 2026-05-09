import { motion } from 'motion/react';
import { ReactNode } from 'react';

export function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick,
  disabled = false
}: { 
  children: ReactNode; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; 
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const baseStyles = "px-6 py-3 rounded-full font-bold transition-all duration-500 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand-navy text-white hover:brightness-110 shadow-xl",
    secondary: "bg-brand-sunset text-white hover:brightness-110 neon-glow-sunset",
    outline: "border border-brand-teal/20 text-brand-teal hover:bg-brand-teal hover:text-white glass",
    ghost: "text-brand-graphite/50 hover:text-brand-navy hover:bg-black/5"
  };

  return (
    <motion.button 
      whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string; key?: string | number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`glass p-6 rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function Badge({ children, color = 'teal', className = '' }: { children: ReactNode; color?: 'teal' | 'sunset' | 'blue' | 'white'; className?: string }) {
  const colors = {
    teal: "bg-brand-teal/10 text-brand-teal border-brand-teal/20",
    sunset: "bg-brand-sunset/10 text-brand-sunset border-brand-sunset/20",
    blue: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
    white: "bg-white/20 text-white border-white/30"
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
  className = "" 
}: { 
  icon?: any, 
  label?: string, 
  placeholder?: string, 
  type?: string,
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 ml-4">{label}</label>}
      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          {Icon && <Icon className="w-4 h-4 text-brand-navy/30 group-focus-within:text-brand-teal transition-colors" />}
        </div>
        <input 
          type={type}
          placeholder={placeholder}
          className="w-full bg-white/40 backdrop-blur-md border border-white/40 rounded-full py-4 pl-12 pr-6 text-sm font-medium focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal/40 transition-all outline-none text-brand-navy placeholder:text-brand-navy/20"
        />
      </div>
    </div>
  );
}
