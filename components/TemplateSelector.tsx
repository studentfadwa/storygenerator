
import React, { useState } from 'react';
import { ThemeColors } from './ColorCustomizer';
import { InnerBorderStyle, InnerBorderCssStyle } from './StoryGenerator';
import { SaveIcon, TrashIcon } from './icons';

interface StoryTemplate {
  name: string;
  theme: ThemeColors;
  font: string;
  pageFrame: { svg: string; color: string } | null;
  innerBorderStyle: InnerBorderStyle | InnerBorderCssStyle | null;
}

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  predefinedTemplates: StoryTemplate[];
  userTemplates: StoryTemplate[];
  onSelectTemplate: (template: Omit<StoryTemplate, 'name'>) => void;
  onSaveTemplate: (name: string) => void;
  onDeleteTemplate: (index: number) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  isOpen,
  onClose,
  predefinedTemplates,
  userTemplates,
  onSelectTemplate,
  onSaveTemplate,
  onDeleteTemplate,
}) => {
  if (!isOpen) return null;
  
  const [newTemplateName, setNewTemplateName] = useState('');

  const handleSelectTemplate = (template: StoryTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const handleSaveClick = () => {
      if (newTemplateName.trim()) {
          onSaveTemplate(newTemplateName.trim());
          setNewTemplateName('');
      }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-stone-50 rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-6 border border-stone-200" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-amber-900 mb-4 text-center font-amiri">اختر أو احفظ نموذجًا</h3>
        
        {/* Save current design */}
        <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg mb-6">
            <h4 className="font-bold text-amber-800 mb-2 text-center">حفظ التصميم الحالي</h4>
            <div className="flex items-center gap-2">
                <input 
                    type="text" 
                    value={newTemplateName} 
                    onChange={e => setNewTemplateName(e.target.value)} 
                    placeholder="اسم النموذج الجديد" 
                    className="flex-grow w-full p-2 border border-stone-300 rounded-md" 
                />
                <button 
                    onClick={handleSaveClick}
                    disabled={!newTemplateName.trim()}
                    className="p-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 disabled:bg-stone-400"
                    aria-label="حفظ النموذج"
                >
                    <SaveIcon />
                </button>
            </div>
        </div>

        {/* User Templates */}
        {userTemplates.length > 0 && (
            <div className="mb-4">
                <h4 className="font-semibold text-stone-700 mb-2 border-b pb-1">نماذجي المحفوظة</h4>
                <div className="space-y-2">{userTemplates.map((template, index) => (
                    <div key={`${template.name}-${index}`} className="flex items-center gap-2 group">
                        <button onClick={() => handleSelectTemplate(template)} className="w-full text-right p-2 rounded-lg hover:bg-stone-200 transition-colors flex items-center gap-4">
                            <div className="flex-shrink-0 grid grid-cols-2 grid-rows-2 w-8 h-8 rounded-md overflow-hidden border-2 border-stone-300">
                                <div style={{ backgroundColor: template.theme.title.background }}></div>
                                <div style={{ backgroundColor: template.theme.story.background }}></div>
                                <div style={{ backgroundColor: template.theme.story.textColor }}></div>
                                <div style={{ backgroundColor: template.theme.title.titleColor }}></div>
                            </div>
                            <span className="font-semibold text-stone-700">{template.name}</span>
                        </button>
                        <button onClick={() => onDeleteTemplate(index)} className="p-2 rounded-full hover:bg-red-100 opacity-0 group-hover:opacity-100" aria-label={`حذف نموذج ${template.name}`}>
                            <TrashIcon />
                        </button>
                    </div>
                ))}</div>
            </div>
        )}

        {/* Predefined Templates */}
         <div>
            <h4 className="font-semibold text-stone-700 mb-2 border-b pb-1">نماذج جاهزة</h4>
            <div className="space-y-2">{predefinedTemplates.map((template) => (
                <button key={template.name} onClick={() => handleSelectTemplate(template)} className="w-full text-right p-3 rounded-lg hover:bg-stone-200 transition-colors flex items-center gap-4">
                    <div className="flex-shrink-0 grid grid-cols-2 grid-rows-2 w-10 h-10 rounded-md overflow-hidden border-2 border-stone-300">
                        <div style={{ backgroundColor: template.theme.title.background }}></div>
                        <div style={{ backgroundColor: template.theme.story.background }}></div>
                        <div style={{ backgroundColor: template.theme.story.textColor }}></div>
                        <div style={{ backgroundColor: template.theme.title.titleColor }}></div>
                    </div>
                    <span className="font-semibold text-stone-700">{template.name}</span>
                </button>
            ))}</div>
        </div>
        
        <div className="flex gap-3 mt-6"><button onClick={onClose} className="w-full bg-amber-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-900 transition-colors">إغلاق</button></div>
      </div>
    </div>
  );
};

export default TemplateSelector;
