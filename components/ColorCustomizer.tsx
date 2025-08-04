import React from 'react';

// Define the structure of our theme
export interface TitleTheme {
  background: string;
  borderColor: string;
  titleColor: string;
  subtitleColor: string;
}

export interface StoryTheme {
  background: string;
  borderColor: string;
  innerBackground: string;
  textBoxBackground: string;
  textBoxBorder: string;
  textColor: string;
  pageNumberBackground: string;
  pageNumberColor: string;
}

export interface ThemeColors {
  title: TitleTheme;
  story: StoryTheme;
}


interface ColorCustomizerProps {
  theme: ThemeColors;
  setTheme: React.Dispatch<React.SetStateAction<ThemeColors>>;
  onClose: () => void;
  onReset: () => void;
  isOpen: boolean;
}

const ColorInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, onChange }) => {
  // Create a unique ID for the input to link it with the label for accessibility
  const inputId = `color-input-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="flex items-center justify-between">
      <label htmlFor={inputId} className="text-sm font-medium text-stone-600">{label}</label>
      <input
        id={inputId}
        type="color"
        value={value}
        onChange={onChange}
        className="w-10 h-10 p-1 bg-white border border-stone-300 rounded-md cursor-pointer"
      />
    </div>
  );
};


const ColorCustomizer: React.FC<ColorCustomizerProps> = ({ theme, setTheme, onClose, onReset, isOpen }) => {
  if (!isOpen) return null;

  const handleTitleChange = (field: keyof TitleTheme, value: string) => {
    setTheme(prev => ({ ...prev, title: { ...prev.title, [field]: value } }));
  };

  const handleStoryChange = (field: keyof StoryTheme, value: string) => {
    setTheme(prev => ({ ...prev, story: { ...prev.story, [field]: value } }));
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-stone-50 rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-6 border border-stone-200" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-amber-900 mb-4 text-center font-amiri">تخصيص الألوان</h3>
        
        <div className="space-y-4">
          {/* Title Page Colors */}
          <div className="p-4 border border-stone-200 rounded-lg">
            <h4 className="font-bold text-amber-800 mb-3">صفحة العنوان والنهاية</h4>
            <div className="space-y-2">
              <ColorInput label="لون الخلفية" value={theme.title.background} onChange={e => handleTitleChange('background', e.target.value)} />
              <ColorInput label="لون الإطار" value={theme.title.borderColor} onChange={e => handleTitleChange('borderColor', e.target.value)} />
              <ColorInput label="لون العنوان الرئيسي" value={theme.title.titleColor} onChange={e => handleTitleChange('titleColor', e.target.value)} />
              <ColorInput label="لون العنوان الفرعي" value={theme.title.subtitleColor} onChange={e => handleTitleChange('subtitleColor', e.target.value)} />
            </div>
          </div>

          {/* Story Page Colors */}
          <div className="p-4 border border-stone-200 rounded-lg">
            <h4 className="font-bold text-amber-800 mb-3">صفحات القصة</h4>
            <div className="space-y-2">
              <ColorInput label="الخلفية الخارجية" value={theme.story.background} onChange={e => handleStoryChange('background', e.target.value)} />
              <ColorInput label="الإطار الخارجي" value={theme.story.borderColor} onChange={e => handleStoryChange('borderColor', e.target.value)} />
              <ColorInput label="الخلفية الداخلية" value={theme.story.innerBackground} onChange={e => handleStoryChange('innerBackground', e.target.value)} />
              <ColorInput label="خلفية صندوق النص" value={theme.story.textBoxBackground} onChange={e => handleStoryChange('textBoxBackground', e.target.value)} />
              <ColorInput label="إطار صندوق النص" value={theme.story.textBoxBorder} onChange={e => handleStoryChange('textBoxBorder', e.target.value)} />
              <ColorInput label="لون النص" value={theme.story.textColor} onChange={e => handleStoryChange('textColor', e.target.value)} />
              <ColorInput label="خلفية رقم الصفحة" value={theme.story.pageNumberBackground} onChange={e => handleStoryChange('pageNumberBackground', e.target.value)} />
              <ColorInput label="لون رقم الصفحة" value={theme.story.pageNumberColor} onChange={e => handleStoryChange('pageNumberColor', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onReset} className="w-1/2 bg-stone-200 text-stone-700 font-bold py-2 px-4 rounded-lg hover:bg-stone-300 transition-colors">
            استعادة الافتراضي
          </button>
          <button onClick={onClose} className="w-1/2 bg-amber-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-900 transition-colors">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorCustomizer;