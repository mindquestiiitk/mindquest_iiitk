import React from 'react';

interface ButtonProps {
  label: string;
  iconURL?: string; 
  backgroundColor?: string;  
  textColor?: string;  
  borderColor?: string;  
  fullWidth?: boolean;  
}

const Button: React.FC<ButtonProps> = ({
  label,
  iconURL,
  backgroundColor,
  textColor,
  borderColor,
  fullWidth,
}) => {
  return (
    <button
      className={`flex justify-center items-center gap-2 px-7 py-4 border font-roboto text-lg rounded-full leading-none 
        ${backgroundColor ? `${backgroundColor} ${textColor} ${borderColor}` : 'bg-light-green text-white'} 
        ${fullWidth && 'w-full'}`}
    >
      {label}
      {iconURL && <img src={iconURL} className="ml-2 rounded-full w-5 h-5" alt="icon" />}
    </button>
  );
};

export default Button;
