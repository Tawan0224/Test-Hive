import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}: ButtonProps) => {
  const baseStyles = `
    font-semibold rounded-full uppercase tracking-wider
    transition-all duration-300 ease-out
    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variants = {
    primary: `
      bg-hive-purple text-white
      hover:bg-hive-purple-light hover:scale-105 
      hover:shadow-lg hover:shadow-hive-purple/40
    `,
    secondary: `
      bg-dark-600 text-white border border-hive-purple/30
      hover:bg-dark-500 hover:border-hive-purple/60
      hover:shadow-lg hover:shadow-hive-purple/20
    `,
    outline: `
      bg-transparent text-hive-purple border-2 border-hive-purple
      hover:bg-hive-purple hover:text-white
      hover:shadow-lg hover:shadow-hive-purple/40
    `,
  }

  const sizes = {
    sm: 'px-5 py-2 text-xs',
    md: 'px-8 py-4 text-sm',
    lg: 'px-10 py-5 text-base',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button