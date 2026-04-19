import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  to?: string;        // explicit route - omit to use navigate(-1)
  label?: string;     // shown beside icon when provided
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to, label, className }) => {
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      size={label ? 'sm' : 'icon'}
      className={`rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors ${label ? 'gap-1.5 px-3 h-9' : 'w-9 h-9'} ${className ?? ''}`}
      onClick={() => (to ? navigate(to) : navigate(-1))}
      aria-label="Go back"
    >
      <ArrowLeft className="w-4 h-4 flex-shrink-0" />
      {label && <span className="text-xs font-bold">{label}</span>}
    </Button>
  );
};

export default BackButton;
