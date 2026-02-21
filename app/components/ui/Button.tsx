// components/ui/Button.tsx
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  className = '',
  ...props  // ← This captures ALL props passed from Header
}: ButtonProps) {
  
  console.log(props); // Let's see what we receive!
  // {
  //   onClick: handleLogin,
  //   disabled: false,
  //   aria-label: "Login to your account",
  //   id: "signup-btn",
  //   "data-testid": "signup-button"
  // }
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  };
  
  const sizes = {
    small: 'text-sm px-2 py-1',
    medium: 'text-base px-4 py-2',
    large: 'text-lg px-6 py-3'
  };
  
  return (
    <button 
      className={`
        rounded-lg transition-colors 
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
      {...props}  // ← This FORWARDS all props to the actual button
    >
      {children}
    </button>
  );
}