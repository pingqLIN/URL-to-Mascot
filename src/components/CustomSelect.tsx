import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { SELECT_CLS } from '../constants';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  disabled?: boolean;
  title?: string;
  'aria-label'?: string;
};

export function CustomSelect({
  value,
  onChange,
  options,
  className = SELECT_CLS,
  disabled = false,
  title,
  'aria-label': ariaLabel,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        className={`flex items-center justify-between text-left ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        title={title}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl liquid-glass liquid-glass--compact"
          >
            <div className="max-h-60 overflow-y-auto py-1 scrollbar-visible" role="listbox">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  disabled={option.disabled}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    option.disabled
                      ? 'opacity-50 cursor-not-allowed text-white/40'
                      : option.value === value
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => {
                    if (!option.disabled) {
                      onChange(option.value);
                      setIsOpen(false);
                    }
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
