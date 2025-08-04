
import React, { useRef, useState, useEffect } from 'react';
import { TrashIcon, PaletteIcon, EditIcon, CutIcon, MoveIcon, CloseIcon } from './icons';
import { StoryTheme } from './ColorCustomizer';
import { InnerBorderStyle, InnerBorderCssStyle } from './StoryGenerator';


interface WhiteBoxData { x: number; y: number; width: number; height: number; text: string; }
interface StickerData { id: string; src: string; x: number; y: number; width: number; height: number; }

// Define StoryPageData locally for component clarity
interface StoryPageData {
  id: string;
  imageUrl: string;
  storyText: string;
  pageTitle?: string;
  pageTitleColor?: string;
  whiteBox?: WhiteBoxData;
  stickers?: StickerData[];
}


interface StoryPageProps {
  pageData: StoryPageData;
  pageNumber: number;
  className?: string;
  onDelete: () => void;
  onUpdate: (updates: Partial<StoryPageData>) => void;
  onEdit: () => void;
  onCut: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  theme: StoryTheme;
  fontFamily: string;
  isSelected: boolean;
  onSelect: () => void;
  pageFrame: { svg: string; color: string } | null;
  innerBorderStyle: InnerBorderStyle | InnerBorderCssStyle | null;
}

// --- Draggable and Resizable White Box Component ---
const WhiteBox: React.FC<{ data: WhiteBoxData; onUpdate: (data: WhiteBoxData) => void; containerRef: React.RefObject<HTMLDivElement>; }> = ({ data, onUpdate, containerRef }) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const interaction = useRef({ type: '', startX: 0, startY: 0, startWidth: 0, startHeight: 0, startLeft: 0, startTop: 0 }).current;

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, type: string) => {
        e.preventDefault(); e.stopPropagation();
        if (!containerRef.current || !boxRef.current) return;
        const cRect = containerRef.current.getBoundingClientRect(); const bRect = boxRef.current.getBoundingClientRect();
        interaction.type = type; interaction.startX = e.clientX; interaction.startY = e.clientY;
        interaction.startWidth = bRect.width; interaction.startHeight = bRect.height;
        interaction.startLeft = (bRect.left - cRect.left); interaction.startTop = (bRect.top - cRect.top);
        window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!interaction.type || !containerRef.current || !boxRef.current) return;
        const cRect = containerRef.current.getBoundingClientRect();
        let nW = interaction.startWidth, nH = interaction.startHeight, nL = interaction.startLeft, nT = interaction.startTop;
        const dx = e.clientX - interaction.startX, dy = e.clientY - interaction.startY;
        if (interaction.type === 'drag') { nL += dx; nT += dy; } else {
            if (interaction.type.includes('right')) nW += dx; if (interaction.type.includes('left')) { nW -= dx; nL += dx; }
            if (interaction.type.includes('bottom')) nH += dy; if (interaction.type.includes('top')) { nH -= dy; nT += dy; }
        }
        if (nL < 0) nL = 0; if (nT < 0) nT = 0; if (nW < 50) nW = 50; if (nH < 20) nH = 20;
        if (nL + nW > cRect.width) { if (interaction.type === 'drag') nL = cRect.width - nW; else nW = cRect.width - nL; }
        if (nT + nH > cRect.height) { if(interaction.type === 'drag') nT = cRect.height - nH; else nH = cRect.height - nT; }
        boxRef.current.style.width = `${nW}px`; boxRef.current.style.height = `${nH}px`;
        boxRef.current.style.left = `${nL}px`; boxRef.current.style.top = `${nT}px`;
    };

    const handleMouseUp = () => {
        if (!containerRef.current || !boxRef.current) return;
        const cRect = containerRef.current.getBoundingClientRect(); const bRect = boxRef.current.getBoundingClientRect();
        onUpdate({ ...data, x: ((bRect.left - cRect.left) / cRect.width) * 100, y: ((bRect.top - cRect.top) / cRect.height) * 100, width: (bRect.width / cRect.width) * 100, height: (bRect.height / cRect.height) * 100 });
        interaction.type = ''; window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp);
    };

    const handleTextUpdate = (e: React.FocusEvent<HTMLParagraphElement>) => { onUpdate({ ...data, text: e.currentTarget.innerText }); };
    const resizeHandles = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top', 'bottom', 'left', 'right'];
    return (
        <div ref={boxRef} className="white-box-for-export absolute bg-white border-2 border-dashed border-blue-500 shadow-lg p-2 flex items-center justify-center cursor-move z-20" style={{ left: `${data.x}%`, top: `${data.y}%`, width: `${data.width}%`, height: `${data.height}%`, boxSizing: 'border-box' }} onMouseDown={(e) => handleMouseDown(e, 'drag')}>
            <p contentEditable suppressContentEditableWarning={true} onBlur={handleTextUpdate} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} className="w-full h-full text-center text-black text-lg focus:outline-none bg-transparent" style={{ cursor: 'text' }}>{data.text}</p>
            {resizeHandles.map(handle => (<div key={handle} className={`resize-handle absolute w-3 h-3 bg-blue-600 rounded-full -m-1.5 resize-handle-${handle}`} onMouseDown={(e) => handleMouseDown(e, handle)}/>))}
        </div>
    );
};

// --- Draggable and Resizable Sticker Component ---
const Sticker: React.FC<{ data: StickerData; onUpdate: (data: StickerData) => void; onDelete: () => void; containerRef: React.RefObject<HTMLDivElement>; }> = ({ data, onUpdate, onDelete, containerRef }) => {
    const stickerRef = useRef<HTMLDivElement>(null);
    const interaction = useRef({ type: '', startX: 0, startY: 0, startWidth: 0, startHeight: 0, startLeft: 0, startTop: 0 }).current;

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, type: string) => {
        e.preventDefault(); e.stopPropagation();
        if (!containerRef.current || !stickerRef.current) return;
        const cRect = containerRef.current.getBoundingClientRect(); const sRect = stickerRef.current.getBoundingClientRect();
        interaction.type = type; interaction.startX = e.clientX; interaction.startY = e.clientY;
        interaction.startWidth = sRect.width; interaction.startHeight = sRect.height;
        interaction.startLeft = (sRect.left - cRect.left); interaction.startTop = (sRect.top - cRect.top);
        window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
        if (!interaction.type || !containerRef.current || !stickerRef.current) return;
        const cRect = containerRef.current.getBoundingClientRect();
        let nW = interaction.startWidth, nH = interaction.startHeight, nL = interaction.startLeft, nT = interaction.startTop;
        const dx = e.clientX - interaction.startX, dy = e.clientY - interaction.startY;
        if (interaction.type === 'drag') { nL += dx; nT += dy; } else {
            if (interaction.type.includes('right')) nW += dx; if (interaction.type.includes('left')) { nW -= dx; nL += dx; }
            if (interaction.type.includes('bottom')) nH += dy; if (interaction.type.includes('top')) { nH -= dy; nT += dy; }
        }
        if (nL < 0) nL = 0; if (nT < 0) nT = 0; if (nW < 20) nW = 20; if (nH < 20) nH = 20;
        if (nL + nW > cRect.width) { if (interaction.type === 'drag') nL = cRect.width - nW; else nW = cRect.width - nL; }
        if (nT + nH > cRect.height) { if(interaction.type === 'drag') nT = cRect.height - nH; else nH = cRect.height - nT; }
        stickerRef.current.style.width = `${nW}px`; stickerRef.current.style.height = `${nH}px`;
        stickerRef.current.style.left = `${nL}px`; stickerRef.current.style.top = `${nT}px`;
    };

    const handleMouseUp = () => {
        if (!containerRef.current || !stickerRef.current) return;
        const cRect = containerRef.current.getBoundingClientRect(); const sRect = stickerRef.current.getBoundingClientRect();
        onUpdate({ ...data, x: ((sRect.left - cRect.left) / cRect.width) * 100, y: ((sRect.top - cRect.top) / cRect.height) * 100, width: (sRect.width / cRect.width) * 100, height: (sRect.height / cRect.height) * 100 });
        interaction.type = ''; window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp);
    };
    
    return (
      <div ref={stickerRef} className="absolute group/sticker border-2 border-dashed border-transparent hover:border-blue-500 cursor-move z-10" style={{ left: `${data.x}%`, top: `${data.y}%`, width: `${data.width}%`, height: `${data.height}%` }} onMouseDown={(e) => handleMouseDown(e, 'drag')}>
        <img src={`data:image/svg+xml;base64,${btoa(data.src)}`} alt="sticker" className="w-full h-full object-contain pointer-events-none" />
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover/sticker:opacity-100 no-export" aria-label="Delete sticker"><CloseIcon /></button>
        <div className="resize-handle absolute w-3 h-3 bg-blue-600 rounded-full -m-1.5 bottom-0 right-0 cursor-nwse-resize opacity-0 group-hover/sticker:opacity-100" onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}/>
      </div>
    );
};


const StoryPage: React.FC<StoryPageProps> = ({ pageData, pageNumber, className, onDelete, onUpdate, onEdit, onCut, theme, fontFamily, onDragStart, onDragEnd, isSelected, onSelect, pageFrame, innerBorderStyle }) => {
  const { imageUrl, storyText, pageTitle, pageTitleColor = '#000000' } = pageData;
  const colorInputRef = useRef<HTMLInputElement>(null);
  const pageContentRef = useRef<HTMLDivElement>(null);

  const handleTextUpdate = (e: React.FocusEvent<HTMLParagraphElement>) => {
    onUpdate({ storyText: e.currentTarget.innerText });
  };
  
  const handleTitleUpdate = (e: React.FocusEvent<HTMLHeadingElement>) => {
      onUpdate({ pageTitle: e.currentTarget.innerText });
  };

  const handleStickerUpdate = (updatedSticker: StickerData) => {
    const newStickers = pageData.stickers?.map(s => s.id === updatedSticker.id ? updatedSticker : s) || [];
    onUpdate({ stickers: newStickers });
  };

  const handleStickerDelete = (stickerId: string) => {
    const newStickers = pageData.stickers?.filter(s => s.id !== stickerId) || [];
    onUpdate({ stickers: newStickers });
  };
  
  const isSvgBorder = innerBorderStyle && 'svg' in innerBorderStyle;

  const containerStyle: React.CSSProperties = {
      backgroundColor: theme.textBoxBackground,
  };
  if (isSvgBorder) {
      containerStyle.position = 'relative';
  } else if (innerBorderStyle && 'css' in innerBorderStyle) {
      Object.assign(containerStyle, {
          ...innerBorderStyle.css,
          borderColor: theme.borderColor,
      });
  } else {
      // Default border
      Object.assign(containerStyle, {
          borderWidth: '4px',
          borderStyle: 'solid',
          borderColor: theme.borderColor,
      });
  }


  return (
    <div className="relative group">
       <div className={`relative p-2 sm:p-3 rounded-2xl shadow-2xl w-full max-w-md mx-auto ${className}`} style={{ background: theme.background }}>
        {pageFrame && (
            <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
                backgroundColor: pageFrame.color,
                maskImage: `url("data:image/svg+xml;base64,${btoa(pageFrame.svg)}")`,
                maskSize: '100% 100%',
                WebkitMaskImage: `url("data:image/svg+xml;base64,${btoa(pageFrame.svg)}")`,
                WebkitMaskSize: '100% 100%'
            }} />
        )}
        <div ref={pageContentRef} className="p-2 rounded-xl relative" style={{ background: theme.innerBackground }}>
          {pageTitle && (
            <div className="relative flex items-center justify-center gap-2 mb-2 group/title">
              <h3 contentEditable suppressContentEditableWarning={true} onBlur={handleTitleUpdate} className="text-center text-2xl font-amiri font-bold p-1 rounded-md focus:outline-none focus:bg-white/50" style={{ color: pageTitleColor }}>{pageTitle}</h3>
              <button onClick={() => colorInputRef.current?.click()} className="p-1 rounded-full text-stone-500 hover:bg-stone-200 transition-colors opacity-0 group-hover/title:opacity-100 focus:opacity-100 no-export" aria-label="تغيير لون العنوان"><PaletteIcon /></button>
              <input ref={colorInputRef} type="color" value={pageTitleColor} onChange={(e) => onUpdate({ pageTitleColor: e.target.value })} className="absolute w-0 h-0 opacity-0" aria-hidden="true"/>
            </div>
          )}
          <div className="rounded-lg overflow-hidden shadow-inner" style={containerStyle}>
            {isSvgBorder && (
                <div 
                    className="absolute inset-0 pointer-events-none" 
                    style={{
                        backgroundColor: theme.borderColor,
                        maskImage: `url('data:image/svg+xml;base64,${btoa(innerBorderStyle.svg as string)}')`,
                        maskSize: '100% 100%',
                        WebkitMaskImage: `url('data:image/svg+xml;base64,${btoa(innerBorderStyle.svg as string)}')`,
                        WebkitMaskSize: '100% 100%'
                    }} 
                />
            )}
            <div className="w-full aspect-[9/16] bg-stone-200 flex items-center justify-center relative">
              {imageUrl ? <img src={imageUrl} alt={`Illustration for page ${pageNumber}`} className="w-full h-full object-cover" /> : <div className="text-stone-400">جاري تحميل الصورة...</div>}
            </div>
            <div className="p-4 sm:p-6 border-t-4" style={{ background: theme.textBoxBackground, borderColor: theme.textBoxBorder }}>
              <p contentEditable suppressContentEditableWarning={true} onBlur={handleTextUpdate} dir="rtl" className="text-center text-xl sm:text-2xl lg:text-3xl leading-relaxed p-1 rounded-md focus:outline-none focus:bg-white/50" style={{ color: theme.textColor, fontFamily: fontFamily }}>{storyText}</p>
            </div>
          </div>
          {pageData.whiteBox && <WhiteBox data={pageData.whiteBox} onUpdate={(newData) => onUpdate({ whiteBox: newData })} containerRef={pageContentRef}/>}
          {pageData.stickers?.map(sticker => <Sticker key={sticker.id} data={sticker} onUpdate={handleStickerUpdate} onDelete={() => handleStickerDelete(sticker.id)} containerRef={pageContentRef} />)}
        </div>
        <div className="absolute bottom-4 left-4 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg font-sans no-export" style={{ background: theme.pageNumberBackground, color: theme.pageNumberColor }}>{pageNumber}</div>
      </div>
      <div className="absolute top-2 left-2 no-export z-20">
            <input type="checkbox" checked={isSelected} onChange={onSelect} className="h-6 w-6 rounded-md border-2 border-white text-amber-600 shadow-lg focus:ring-amber-500 cursor-pointer" style={{ accentColor: theme.pageNumberBackground }} aria-label={`تحديد الصفحة ${pageNumber}`}/>
      </div>
      <div className="absolute top-0 right-0 flex gap-2 -translate-y-1/2 translate-x-1/4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 no-export z-30">
        <button draggable onDragStart={onDragStart} onDragEnd={onDragEnd} className="p-2 bg-gray-500 text-white rounded-full shadow-lg hover:bg-gray-600 focus:opacity-100 focus:outline-none transform hover:scale-110 transition-transform cursor-move" aria-label={`تحريك الصفحة ${pageNumber}`}><MoveIcon /></button>
        <button onClick={onEdit} className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:opacity-100 focus:outline-none transform hover:scale-110 transition-transform" aria-label={`تعديل الصفحة ${pageNumber}`}><EditIcon /></button>
        <button onClick={onCut} className="p-2 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 focus:opacity-100 focus:outline-none transform hover:scale-110 transition-transform" aria-label={`قص الصفحة ${pageNumber}`}><CutIcon /></button>
        <button onClick={onDelete} className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 focus:opacity-100 focus:outline-none transform hover:scale-110 transition-transform" aria-label={`حذف الصفحة ${pageNumber}`}><TrashIcon /></button>
      </div>
    </div>
  );
};


export default StoryPage;
