
import React from 'react';
import { TitleTheme } from './ColorCustomizer';
import { EditIcon } from './icons';

interface TitlePageProps {
  title?: string;
  subtitle?: string;
  className?: string;
  theme: TitleTheme;
  onEdit?: () => void;
  pageFrame?: { svg: string; color: string } | null;
}

const TitlePage: React.FC<TitlePageProps> = ({ title, subtitle, className, theme, onEdit, pageFrame }) => {
  return (
    <div 
      className={`relative group p-2 sm:p-3 rounded-2xl shadow-2xl w-full max-w-md mx-auto aspect-[9/16] flex flex-col items-center justify-center text-white ${className}`}
      style={{ background: theme.background }}
    >
        {pageFrame && (
            <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
                backgroundColor: pageFrame.color,
                maskImage: `url("data:image/svg+xml;base64,${btoa(pageFrame.svg)}")`,
                maskSize: '100% 100%',
                WebkitMaskImage: `url("data:image/svg+xml;base64,${btoa(pageFrame.svg)}")`,
                WebkitMaskSize: '100% 100%'
            }} />
        )}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] opacity-10"></div>
        <div 
          className="relative p-8 w-full h-full flex flex-col items-center justify-center text-center bg-black/20 border-4 rounded-lg"
          style={{ borderColor: theme.borderColor }}
        >
            {title && (
              <h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-amiri font-bold leading-tight" 
                style={{
                  color: theme.titleColor,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                  {title}
              </h1>
            )}
            {subtitle && (
              <p 
                className="mt-4 text-lg font-amiri"
                style={{ color: theme.subtitleColor }}
              >
                {subtitle}
              </p>
            )}
        </div>
        {onEdit && (
            <div className="absolute top-0 right-0 flex gap-2 -translate-y-1/2 translate-x-1/4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 no-export z-10">
                <button
                    onClick={onEdit}
                    className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:opacity-100 focus:outline-none transform hover:scale-110 transition-transform"
                    aria-label="تعديل العنوان"
                ><EditIcon /></button>
            </div>
        )}
    </div>
  );
};

export default TitlePage;