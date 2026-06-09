// components/ui/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  footer?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onClick?: () => void;
}

export default function Card({ 
  children, 
  title,
  subtitle,
  image,
  imageAlt = '',
  footer,
  className = '',
  variant = 'default',
  padding = 'medium',
  onClick
}: CardProps) {
  // Variant styles
  const variants = {
    default: 'bg-white border border-gray-200',
    outlined: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white shadow-lg hover:shadow-xl transition-shadow'
  };
  
  // Padding styles
  const paddings = {
    none: 'p-0',
    small: 'p-3',
    medium: 'p-5',
    large: 'p-8'
  };
  
  return (
    <div 
      className={`
        rounded-xl overflow-hidden
        ${variants[variant]}
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Image section */}
      {image && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={image} 
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Header section with title/subtitle */}
      {(title || subtitle) && (
        <div className={`${paddings[padding]} pb-0`}>
          {title && <h3 className="text-xl font-bold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      
      {/* Main content */}
      <div className={paddings[padding]}>
        {children}
      </div>
      
      {/* Footer section */}
      {footer && (
        <div className={`${paddings[padding]} pt-0 border-t border-gray-100 mt-2`}>
          {footer}
        </div>
      )}
    </div>
  );
}