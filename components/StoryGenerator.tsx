
import React, { useState, useCallback, useRef, useEffect } from 'react';
import StoryPage from './StoryPage';
import TitlePage from './TitlePage';
import Loader from './Loader';
import { DownloadIcon, PdfIcon, UploadIcon, PaletteIcon, AddIcon, EditIcon, CutIcon, FontIcon, MoveIcon, PdfUploadIcon, WhiteBoxIcon, EyeIcon, BrushIcon, ChatIcon, FrameIcon, StickerIcon, InnerBorderIcon, SaveIcon } from './icons';
import { Document, Packer, Paragraph, AlignmentType, ImageRun } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ColorCustomizer, { ThemeColors } from './ColorCustomizer';
import TemplateSelector from './TemplateSelector';
import * as pdfjsLib from 'pdfjs-dist';
import { extractTextFromImage } from '../services/geminiService';
import ChatModal from './ChatModal';


// Configure the pdf.js worker to enable PDF processing in the browser.
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.mjs';
}

// --- ASSET DEFINITIONS ---
const frameAssets = [
    { name: 'بسيط', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V158 H0Z M5 5 H95 V153 H5Z" fill-rule="evenodd"/></svg>' },
    { name: 'مزدوج', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V158 H0Z M3 3 H97 V155 H3Z M6 6 H94 V152 H6Z" fill-rule="evenodd"/></svg>' },
    { name: 'زوايا دائرية', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="100" height="158" rx="10" /><rect x="5" y="5" width="90" height="148" rx="5" fill="white"/></svg>'},
    { name: 'مشطوب', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 10 L10 0 H90 L100 10 V148 L90 158 H10 L0 148Z M5 12 L12 5 H88 L95 12 V146 L88 153 H12 L5 146Z" fill-rule="evenodd"/></svg>'},
    { name: 'متموج', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 Q 5 10 10 10 T 20 10 T 30 10 T 40 10 T 50 10 T 60 10 T 70 10 T 80 10 T 90 10 T 100 0 V158 Q 95 148 90 148 T 80 148 T 70 148 T 60 148 T 50 148 T 40 148 T 30 148 T 20 148 T 10 148 T 0 158Z M10 15 H90 V143 H10Z" fill-rule="evenodd"/></svg>' },
    { name: 'نقاط', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="158" fill="white"/><path d="M0,0 h100 v2 h-100z M0,156 h100 v2 h-100z M0,0 v158 h2 v-158z M98,0 v158 h2 v-158z" stroke-width="2" stroke-dasharray="4 4" fill-rule="evenodd"/></svg>'},
    { name: 'زخرفة زاوية', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V158 H0Z M5 5 H95 V153 H5Z M5 5 L20 5 L5 20Z M95 5 L80 5 L95 20Z M5 153 L20 153 L5 138Z M95 153 L80 153 L95 138Z" fill-rule="evenodd"/></svg>'},
    { name: 'خطوط داخلية', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V158 H0Z M8 8 H92 V150 H8Z M11 11 H89 V147 H11Z" fill-rule="evenodd"/></svg>'},
    { name: 'سينمائي', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V158 H0Z M10 10 H90 V148 H10Z" fill-rule="evenodd"/></svg>'},
    { name: 'كتاب قديم', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V158 H0Z M4 4 H96 V154 H4Z M5 5 V153 H4V5Z M96 5 V153 H95V5Z" fill-rule="evenodd"/></svg>'},
    { name: 'فقاعات', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,0 H100 V158 H0Z" /><circle cx="10" cy="15" r="8" fill="white"/><circle cx="90" cy="30" r="10" fill="white"/><circle cx="15" cy="140" r="12" fill="white"/><circle cx="85" cy="150" r="6" fill="white"/><circle cx="50" cy="10" r="5" fill="white"/><circle cx="50" cy="150" r="5" fill="white"/></svg>'},
    { name: 'شرائط', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 L15 0 L0 15ZM100 0 L85 0 L100 15ZM0 158 L15 158 L0 143ZM100 158 L85 158 L100 143Z M0 0 H100 V158 H0Z M5 5 H95 V153 H5Z" fill-rule="evenodd"/></svg>'},
    { name: 'ورق ممزق', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V158 H0Z M5 5 H95 V153 H5Z" stroke-width="1" stroke-dasharray="1 3 2 1" fill-rule="evenodd"/></svg>'},
    { name: 'معين', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V158 H0Z M10 10 L50 4 L90 10 L96 79 L90 148 L50 154 L10 148 L4 79Z" fill-rule="evenodd"/></svg>'},
    { name: 'قوس', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V158 H0Z M10 158 V20 Q 50 0 90 20 V158Z" fill-rule="evenodd"/></svg>'},
    { name: 'زهور', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V158 H0Z M5 5 H95 V153 H5Z M10 10 a 5 5 0 0 1 0 10 a 5 5 0 0 1 0 -10 M85 10 a 5 5 0 0 1 0 10 a 5 5 0 0 1 0 -10 M10 148 a 5 5 0 0 1 0 -10 a 5 5 0 0 1 0 10 M85 148 a 5 5 0 0 1 0 -10 a 5 5 0 0 1 0 10" fill-rule="evenodd"/></svg>'},
    { name: 'نجمة', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V158 H0Z M50 5 L55 25 L75 25 L60 40 L65 60 L50 45 L35 60 L40 40 L25 25 L45 25Z" fill-rule="evenodd"/></svg>'},
    { name: 'إطار صورة', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V158 H0Z M20 20 H80 V138 H20Z M22 22 H78 V136 H22Z" fill-rule="evenodd"/></svg>'},
    { name: 'غيوم', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V158 H0Z M0 20 a 10 10 0 0 1 10 -10 H90 a 10 10 0 0 1 10 10 V138 a 10 10 0 0 1 -10 10 H10 a 10 10 0 0 1 -10 -10Z" fill-rule="evenodd"/></svg>'},
    { name: 'ختم بريدي', svg: '<svg viewBox="0 0 100 158" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="158" fill="white"/><path d="M0,0 h100 v158 h-100z" stroke-width="4" stroke-dasharray="8 3" fill="none"/></svg>'},
];

const stickerAssets = [
    { name: 'شجرة', svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="45" y="60" width="10" height="40" fill="#8B4513"/><circle cx="50" cy="40" r="30" fill="#228B22"/><circle cx="35" cy="45" r="20" fill="#3CB371"/><circle cx="65" cy="45" r="20" fill="#3CB371"/></svg>' },
    { name: 'وردة', svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 90 V40" stroke="#228B22" stroke-width="5"/><path d="M50 60 l-15 -10" stroke="#228B22" stroke-width="4"/><ellipse cx="50" cy="30" rx="20" ry="15" fill="#FF69B4"/><ellipse cx="50" cy="25" rx="15" ry="10" fill="#FF1493"/></svg>' },
    { name: 'عصفور', svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M20,50 C20,20 80,20 80,50 C80,80 50,80 50,100 C50,80 20,80 20,50Z" fill="#87CEEB"/><circle cx="65" cy="40" r="5" fill="black"/><path d="M75,45 Q85,40 90,35" stroke="#FFD700" stroke-width="5" fill="none"/></svg>' },
    { name: 'شمس', svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="30" fill="#FFD700"/><line x1="50" y1="10" x2="50" y2="0" stroke="#FFD700" stroke-width="5"/><line x1="50" y1="90" x2="50" y2="100" stroke="#FFD700" stroke-width="5"/><line x1="10" y1="50" x2="0" y2="50" stroke="#FFD700" stroke-width="5"/><line x1="90" y1="50" x2="100" y2="50" stroke="#FFD700" stroke-width="5"/><line x1="22" y1="22" x2="15" y2="15" stroke="#FFD700" stroke-width="5"/><line x1="78" y1="78" x2="85" y2="85" stroke="#FFD700" stroke-width="5"/><line x1="22" y1="78" x2="15" y2="85" stroke="#FFD700" stroke-width="5"/><line x1="78" y1="22" x2="85" y2="15" stroke="#FFD700" stroke-width="5"/></svg>' },
    { name: 'نجمة لامعة', svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 61,39 98,39 68,62 79,96 50,75 21,96 32,62 2,39 39,39" fill="#FFD700"/></svg>' },
    { name: 'قلب', svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 95 C 20 70, 20 40, 50 40 C 80 40, 80 70, 50 95 L 50 95 Z M 50 40 C 40 20, 20 25, 25 50 C 30 75, 50 70, 50 40 Z M 50 40 C 60 20, 80 25, 75 50 C 70 75, 50 70, 50 40 Z" fill="#FF4500"/></svg>'},
];

const innerBorderAssets: (InnerBorderStyle | InnerBorderCssStyle)[] = [
  { name: 'صلب رفيع', css: { borderStyle: 'solid', borderWidth: '2px' } },
  { name: 'صلب متوسط', css: { borderStyle: 'solid', borderWidth: '4px' } },
  { name: 'صلب عريض', css: { borderStyle: 'solid', borderWidth: '8px' } },
  { name: 'مزدوج رفيع', css: { borderStyle: 'double', borderWidth: '4px' } },
  { name: 'مزدوج متوسط', css: { borderStyle: 'double', borderWidth: '6px' } },
  { name: 'مزدوج عريض', css: { borderStyle: 'double', borderWidth: '10px' } },
  { name: 'منقط رفيع', css: { borderStyle: 'dotted', borderWidth: '2px' } },
  { name: 'منقط متوسط', css: { borderStyle: 'dotted', borderWidth: '4px' } },
  { name: 'منقط عريض', css: { borderStyle: 'dotted', borderWidth: '6px' } },
  { name: 'متقطع رفيع', css: { borderStyle: 'dashed', borderWidth: '2px' } },
  { name: 'متقطع متوسط', css: { borderStyle: 'dashed', borderWidth: '4px' } },
  { name: 'متقطع عريض', css: { borderStyle: 'dashed', borderWidth: '6px' } },
  { name: 'أخدود متوسط', css: { borderStyle: 'groove', borderWidth: '6px' } },
  { name: 'أخدود عريض', css: { borderStyle: 'groove', borderWidth: '10px' } },
  { name: 'حافة متوسط', css: { borderStyle: 'ridge', borderWidth: '6px' } },
  { name: 'حافة عريض', css: { borderStyle: 'ridge', borderWidth: '10px' } },
  { name: 'داخلي متوسط', css: { borderStyle: 'inset', borderWidth: '6px' } },
  { name: 'داخلي عريض', css: { borderStyle: 'inset', borderWidth: '10px' } },
  { name: 'خارجي متوسط', css: { borderStyle: 'outset', borderWidth: '6px' } },
  { name: 'خارجي عريض', css: { borderStyle: 'outset', borderWidth: '10px' } },
  { name: 'مزيج', css: { borderStyle: 'solid double dashed dotted', borderWidth: '5px' } },
  { name: 'مخفي', css: { borderStyle: 'hidden' } },
  { name: 'متعرج', svg: '<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V100 H0Z M5 5 L10 10 L5 15 L10 20 L5 25 L10 30 L5 35 L10 40 L5 45 L10 50 L5 55 L10 60 L5 65 L10 70 L5 75 L10 80 L5 85 L10 90 L5 95 H95 V5 L90 10 L95 15 L90 20 L95 25 L90 30 L95 35 L90 40 L95 45 L90 50 L95 55 L90 60 L95 65 L90 70 L95 75 L90 80 L95 85 L90 90 L95 95 H5" fill-rule="evenodd"/></svg>' },
  { name: 'متموج', svg: '<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V100 H0Z M5,5 Q10 0, 15 5 T25 5 T35 5 T45 5 T55 5 T65 5 T75 5 T85 5 T95 5 V95 Q90 100, 85 95 T75 95 T65 95 T55 95 T45 95 T35 95 T25 95 T15 95 T5 95Z" fill-rule="evenodd"/></svg>' },
  { name: 'اسكالوب', svg: '<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V100 H0Z M5 5 H95 A5 5 0 0 0 95 5 V95 H5 A5 5 0 0 0 5 95Z" fill-rule="evenodd"/></svg>' },
  { name: 'غرزات', svg: '<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V100 H0Z" fill="white"/><path d="M5 5 H95 V95 H5Z" fill="none" stroke="black" stroke-width="2" stroke-dasharray="8 4"/></svg>' },
  { name: 'سلاسل', svg: '<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V100 H0Z M5 5 H95 V95 H5Z" stroke-width="1" fill="none" stroke="black"/><circle cx="5" cy="5" r="2" fill="black"/><circle cx="95" cy="5" r="2" fill="black"/><circle cx="5" cy="95" r="2" fill="black"/><circle cx="95" cy="95" r="2" fill="black"/></svg>'},
  { name: 'فقاعات صغيرة', svg: '<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V100 H0Z M10 10 H90 V90 H10Z" fill-rule="evenodd"/><circle cx="5" cy="20" r="3" /><circle cx="5" cy="50" r="3" /><circle cx="5" cy="80" r="3" /><circle cx="95" cy="35" r="3" /><circle cx="95" cy="65" r="3" /><circle cx="20" cy="5" r="3" /><circle cx="50" cy="5" r="3" /><circle cx="80" cy="5" r="3" /><circle cx="35" cy="95" r="3" /><circle cx="65" cy="95" r="3" /></svg>'},
  { name: 'مثلثات', svg: '<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V100 H0Z M5 5 L10 15 L15 5 H85 L90 15 L95 5 V95 L85 85 L95 75 V95 H5 L15 85 L5 75Z" fill-rule="evenodd"/></svg>' },
  { name: 'قرميد', svg: '<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V100 H0Z M0 0 H10 V10 H0ZM20 0 H30 V10 H20Z M40 0 H50 V10 H40Z M60 0 H70 V10 H60Z M80 0 H90 V10 H80Z M10 10 H20 V20 H10Z M30 10 H40 V20 H30Z M50 10 H60 V20 H50Z M70 10 H80 V20 H70Z M90 10 H100 V20 H90Z" fill-rule="evenodd"/></svg>'},
  { name: 'كروم', svg: '<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V100 H0Z M10 10 C 20 20, 20 80, 10 90 H90 C 80 80, 80 20, 90 10Z" fill-rule="evenodd"/></svg>'},
  { name: 'خط مزدوج متقطع', svg: '<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 H100 V100 H0Z" fill="white" /><path d="M5 5 H95 V95 H5Z" fill="none" stroke="black" stroke-width="2" stroke-dasharray="10 5"/><path d="M10 10 H90 V90 H10Z" fill="none" stroke="black" stroke-width="1" stroke-dasharray="5 10"/></svg>'}
];
// --- END ASSET DEFINITIONS ---

// --- TEMPLATE DEFINITIONS ---
interface StoryTemplate {
  name: string;
  theme: ThemeColors;
  font: string;
  pageFrame: { svg: string; color: string } | null;
  innerBorderStyle: InnerBorderStyle | InnerBorderCssStyle | null;
}

const defaultTheme: ThemeColors = {
  title: { background: '#78350f', borderColor: '#fcd34d', titleColor: '#ffffff', subtitleColor: '#fde68a' },
  story: { background: '#fcd34d', borderColor: '#92400e', innerBackground: '#fefce8', textBoxBackground: '#ffffff', textBoxBorder: '#92400e', textColor: '#292524', pageNumberBackground: '#92400e', pageNumberColor: '#ffffff' }
};

const defaultTemplate: Omit<StoryTemplate, 'name'> = {
    theme: defaultTheme,
    font: "'Cairo', sans-serif",
    pageFrame: null,
    innerBorderStyle: null
};

const predefinedTemplates: StoryTemplate[] = [
    { name: 'القالب الافتراضي', ...defaultTemplate },
    { name: 'غابة مسحورة', ...defaultTemplate, theme: { title: { background: '#064e3b', borderColor: '#a7f3d0', titleColor: '#ecfdf5', subtitleColor: '#d1fae5' }, story: { background: '#6ee7b7', borderColor: '#065f46', innerBackground: '#f0fdf4', textBoxBackground: '#ffffff', textBoxBorder: '#047857', textColor: '#1f2937', pageNumberBackground: '#065f46', pageNumberColor: '#ffffff' }}},
    { name: 'حلم محيطي', ...defaultTemplate, theme: { title: { background: '#1e3a8a', borderColor: '#93c5fd', titleColor: '#eff6ff', subtitleColor: '#dbeafe' }, story: { background: '#60a5fa', borderColor: '#1d4ed8', innerBackground: '#f0f9ff', textBoxBackground: '#ffffff', textBoxBorder: '#1e40af', textColor: '#1e293b', pageNumberBackground: '#1e40af', pageNumberColor: '#ffffff' }}},
    { name: 'أعجوبة كونية', ...defaultTemplate, theme: { title: { background: '#312e81', borderColor: '#a5b4fc', titleColor: '#e0e7ff', subtitleColor: '#c7d2fe' }, story: { background: '#818cf8', borderColor: '#4338ca', innerBackground: '#f5f3ff', textBoxBackground: '#1e1b4b', textBoxBorder: '#4f46e5', textColor: '#eef2ff', pageNumberBackground: '#4338ca', pageNumberColor: '#f5f3ff' }}},
    { name: 'ورق عتيق', ...defaultTemplate, font: "'Amiri', serif", theme: { title: { background: '#7f5539', borderColor: '#e6ccb2', titleColor: '#f5f5f5', subtitleColor: '#ede0d4' }, story: { background: '#ddb892', borderColor: '#7f5539', innerBackground: '#fefae0', textBoxBackground: '#fdf6e7', textBoxBorder: '#9c6644', textColor: '#4b3832', pageNumberBackground: '#7f5539', pageNumberColor: '#ffffff' }}},
    { name: 'يوم مشمس', ...defaultTemplate, theme: { title: { background: '#f59e0b', borderColor: '#fef08a', titleColor: '#fffbeb', subtitleColor: '#fef9c3' }, story: { background: '#facc15', borderColor: '#ca8a04', innerBackground: '#fefce8', textBoxBackground: '#ffffff', textBoxBorder: '#eab308', textColor: '#334155', pageNumberBackground: '#d97706', pageNumberColor: '#ffffff' }}},
    { name: 'سماء ليلية', ...defaultTemplate, theme: { title: { background: '#111827', borderColor: '#4f46e5', titleColor: '#e5e7eb', subtitleColor: '#9ca3af' }, story: { background: '#374151', borderColor: '#4f46e5', innerBackground: '#1f2937', textBoxBackground: '#111827', textBoxBorder: '#818cf8', textColor: '#d1d5db', pageNumberBackground: '#4f46e5', pageNumberColor: '#e5e7eb' }}},
];
// --- END TEMPLATE DEFINITIONS ---


// --- SELECTOR COMPONENTS ---

const FontSelector: React.FC<{ setFont: (font: string) => void; onClose: () => void; isOpen: boolean; }> = ({ setFont, onClose, isOpen }) => {
  if (!isOpen) return null;
  const availableFonts = [
    { name: 'كايرو (افتراضي)', family: "'Cairo', sans-serif", className: 'font-cairo' },
    { name: 'أميري', family: "'Amiri', serif", className: 'font-amiri' },
    { name: 'تجول', family: "'Tajawal', sans-serif", className: 'font-tajawal' },
    { name: 'مركزي', family: "'Markazi Text', serif", className: 'font-markazi' },
  ];
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-stone-50 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-amber-900 mb-4 text-center font-amiri">اختر خط القصة</h3>
        <div className="space-y-2">{availableFonts.map(({ name, family, className }) => (<button key={name} onClick={() => { setFont(family); onClose(); }} className={`w-full text-right p-3 rounded-lg hover:bg-stone-200 transition-colors text-stone-700 text-lg ${className}`}>{name}</button>))}</div>
        <button onClick={onClose} className="mt-6 w-full bg-amber-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-900 transition-colors">إغلاق</button>
      </div>
    </div>
  );
};

const FrameSelector: React.FC<{ pageFrame: { svg: string; color: string; } | null; setPageFrame: (frame: { svg: string; color: string } | null) => void; isOpen: boolean; onClose: () => void; }> = ({ pageFrame, setPageFrame, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-stone-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-amber-900 mb-4 text-center font-amiri">اختر إطار الصفحة</h3>
                <div className="flex items-center justify-center gap-4 mb-4 border-b pb-4">
                    <label htmlFor="frame-color-picker" className="font-semibold text-stone-700">لون الإطار:</label>
                    <input id="frame-color-picker" type="color" value={pageFrame?.color || '#000000'} onChange={e => setPageFrame(pageFrame ? { ...pageFrame, color: e.target.value } : { svg: frameAssets[0].svg, color: e.target.value })} className="w-12 h-10 p-1 bg-white border border-stone-300 rounded-md cursor-pointer"/>
                    <button onClick={() => setPageFrame(null)} className="px-3 py-2 bg-stone-200 rounded-md text-sm font-semibold hover:bg-stone-300">إزالة الإطار</button>
                </div>
                <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 p-2">
                    {frameAssets.map(asset => (
                        <button key={asset.name} onClick={() => setPageFrame({ svg: asset.svg, color: pageFrame?.color || '#78350f' })} title={asset.name} className="aspect-[9/16] border-2 border-stone-200 rounded-lg hover:border-amber-500 hover:scale-105 transition-transform relative bg-white p-2">
                            <div className="w-full h-full" style={{ backgroundColor: pageFrame?.color || '#78350f', maskImage: `url('data:image/svg+xml;base64,${btoa(asset.svg)}')`, maskSize: '100% 100%', WebkitMaskImage: `url('data:image/svg+xml;base64,${btoa(asset.svg)}')`, WebkitMaskSize: '100% 100%' }}/>
                            {pageFrame?.svg === asset.svg && <div className="absolute inset-0 border-4 border-amber-500 rounded-md"/>}
                        </button>
                    ))}
                </div>
                 <button onClick={onClose} className="mt-6 w-full bg-amber-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-900 transition-colors">إغلاق</button>
            </div>
        </div>
    );
};

const StickerSelector: React.FC<{ isOpen: boolean; onClose: () => void; onSelectSticker: (svg: string, applyToAll: boolean) => void; }> = ({ isOpen, onClose, onSelectSticker }) => {
    if (!isOpen) return null;
    const [applyToAll, setApplyToAll] = useState(false);

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-stone-50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-amber-900 mb-4 text-center font-amiri">اختر ملصقًا</h3>
                <p className="text-center text-sm text-stone-600 mb-2">اختر ملصقًا لإضافته إلى الصفحات المحددة حاليًا.</p>
                <div className="flex items-center justify-center gap-2 mb-4 p-2 bg-stone-100 rounded-md">
                    <input type="checkbox" id="apply-sticker-to-all" checked={applyToAll} onChange={e => setApplyToAll(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                    <label htmlFor="apply-sticker-to-all" className="text-sm font-medium text-stone-700">تطبيق على كل الصفحات</label>
                </div>
                <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 p-2">
                    {stickerAssets.map(asset => (
                        <button key={asset.name} onClick={() => onSelectSticker(asset.svg, applyToAll)} title={asset.name} className="p-2 border-2 border-stone-200 rounded-lg hover:border-amber-500 hover:scale-110 transition-transform bg-white flex items-center justify-center">
                            <img src={`data:image/svg+xml;base64,${btoa(asset.svg)}`} alt={asset.name} className="w-full h-full object-contain"/>
                        </button>
                    ))}
                </div>
                 <button onClick={onClose} className="mt-6 w-full bg-amber-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-900 transition-colors">إغلاق</button>
            </div>
        </div>
    );
};

const InnerBorderSelector: React.FC<{
    currentStyle: InnerBorderStyle | InnerBorderCssStyle | null;
    setStyle: (style: InnerBorderStyle | InnerBorderCssStyle | null) => void;
    isOpen: boolean;
    onClose: () => void;
    borderColor: string;
}> = ({ currentStyle, setStyle, isOpen, onClose, borderColor }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-stone-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-amber-900 mb-4 text-center font-amiri">اختر نمط الإطار الداخلي</h3>
                <div className="flex flex-col sm:flex-row items-center justify-center text-center gap-4 mb-4 border-b pb-4">
                     <p className="font-semibold text-stone-700 text-sm">سيستخدم الإطار لون "الإطار الخارجي" من قسم تخصيص الألوان.</p>
                    <button onClick={() => setStyle(null)} className="px-3 py-2 bg-stone-200 rounded-md text-sm font-semibold hover:bg-stone-300 flex-shrink-0">إزالة النمط (العودة للافتراضي)</button>
                </div>
                <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 p-2">
                    {innerBorderAssets.map(asset => (
                        <button key={asset.name} onClick={() => setStyle(asset)} title={asset.name} className="h-24 border-2 bg-stone-100 border-stone-200 rounded-lg hover:border-amber-500 hover:scale-105 transition-transform relative flex items-center justify-center p-2 text-center text-sm text-stone-600">
                             {'svg' in asset ? (
                                <div className="absolute inset-2" style={{ backgroundColor: borderColor, maskImage: `url('data:image/svg+xml;base64,${btoa(asset.svg)}')`, maskSize: '100% 100%', WebkitMaskImage: `url('data:image/svg+xml;base64,${btoa(asset.svg)}')`, WebkitMaskSize: '100% 100%' }} />
                            ) : (
                                <div className="absolute inset-2" style={{ ...asset.css, borderColor }}></div>
                            )}
                            <span className="relative z-10">{asset.name}</span>
                            {currentStyle?.name === asset.name && <div className="absolute inset-0 border-4 border-amber-500 rounded-md"/>}
                        </button>
                    ))}
                </div>
                 <button onClick={onClose} className="mt-6 w-full bg-amber-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-900 transition-colors">إغلاق</button>
            </div>
        </div>
    );
};

// --- END SELECTOR COMPONENTS ---

interface WhiteBoxData { x: number; y: number; width: number; height: number; text: string; }
interface StickerData { id: string; src: string; x: number; y: number; width: number; height: number; }
interface StoryPageData {
  id: string;
  imageUrl: string;
  storyText: string;
  pageTitle?: string;
  pageTitleColor?: string;
  whiteBox?: WhiteBoxData;
  extractedText?: string;
  stickers?: StickerData[];
}
export type InnerBorderStyle = { name: string; svg: string };
export type InnerBorderCssStyle = { name: string; css: React.CSSProperties };


const StoryGenerator: React.FC = () => {
  const [storyTitle, setStoryTitle] = useState<string>('');
  const [storySubtitle, setStorySubtitle] = useState<string>('');
  const [isTitleSet, setIsTitleSet] = useState<boolean>(false);
  const [addEndPage, setAddEndPage] = useState<boolean>(false);
  const [endPageContent, setEndPageContent] = useState({ title: 'النهاية', subtitle: '' });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [customText, setCustomText] = useState<string>('');
  const [pageTitleInput, setPageTitleInput] = useState<string>('');
  const [pageTitleColorInput, setPageTitleColorInput] = useState<string>(defaultTheme.story.textColor);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [storyPages, setStoryPages] = useState<StoryPageData[]>([]);

  // Individual style states
  const [theme, setTheme] = useState<ThemeColors>(defaultTheme);
  const [storyFont, setStoryFont] = useState<string>(defaultTemplate.font);
  const [pageFrame, setPageFrame] = useState<{ svg: string; color: string } | null>(defaultTemplate.pageFrame);
  const [innerBorderStyle, setInnerBorderStyle] = useState<InnerBorderStyle | InnerBorderCssStyle | null>(defaultTemplate.innerBorderStyle);
  
  // Template states
  const [userTemplates, setUserTemplates] = useState<StoryTemplate[]>([]);

  // Modal visibility states
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [isFontSelectorOpen, setIsFontSelectorOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isFrameSelectorOpen, setIsFrameSelectorOpen] = useState(false);
  const [isStickerSelectorOpen, setIsStickerSelectorOpen] = useState(false);
  const [isInnerBorderSelectorOpen, setIsInnerBorderSelectorOpen] = useState(false);
  
  const [insertionIndex, setInsertionIndex] = useState<number | null>(null);
  const [editingPageIndex, setEditingPageIndex] = useState<number | null>(null);
  const [cutPageIndex, setCutPageIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [pageSelectionInput, setPageSelectionInput] = useState<string>('');

  const controlsRef = useRef<HTMLDivElement>(null);
  const pageTitleColorInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    try {
        const savedTemplates = localStorage.getItem('storybook-user-templates');
        if (savedTemplates) {
            setUserTemplates(JSON.parse(savedTemplates));
        }
    } catch (e) {
        console.error("Failed to load user templates from localStorage", e);
    }
  }, []);

  const saveUserTemplates = (templates: StoryTemplate[]) => {
      try {
        setUserTemplates(templates);
        localStorage.setItem('storybook-user-templates', JSON.stringify(templates));
      } catch (e) {
          console.error("Failed to save user templates to localStorage", e);
          setError("لم نتمكن من حفظ القالب. قد تكون مساحة التخزين ممتلئة.");
      }
  };
  
  const applyTemplate = (template: Omit<StoryTemplate, 'name'>) => {
    setTheme(template.theme);
    setStoryFont(template.font);
    setPageFrame(template.pageFrame);
    setInnerBorderStyle(template.innerBorderStyle);
  };

  const clearInputs = () => {
      setCustomText('');
      setUploadedFiles([]);
      setPageTitleInput('');
      setPageTitleColorInput(theme.story.textColor);
      setInsertionIndex(null);
      setEditingPageIndex(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        if (files.length > 100) {
            setError('لا يمكنك رفع أكثر من 100 صورة دفعة واحدة.');
            setUploadedFiles([]);
            e.target.value = '';
            return;
        }
        const allowedTypes = ['image/jpeg', 'image/png'];
        const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
        if (invalidFiles.length > 0) {
            setError('الرجاء رفع ملفات صور من نوع PNG أو JPG فقط.');
            setUploadedFiles([]);
            e.target.value = '';
            return;
        }
        setError(null);
        setUploadedFiles(files);
    }
  };

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
  });
  
  const handleAddOrUpdatePages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const isEditing = editingPageIndex !== null;

    try {
        if (isEditing) {
            if (!customText.trim()) throw new Error('الرجاء كتابة نص القصة.');
            let imageUrlValue = storyPages[editingPageIndex].imageUrl;
            if (uploadedFiles.length > 0) {
                imageUrlValue = await toBase64(uploadedFiles[0]);
            }
            const newPageData = { imageUrl: imageUrlValue, storyText: customText, pageTitle: pageTitleInput, pageTitleColor: pageTitleColorInput };
            setStoryPages(pages => pages.map((p, i) => i === editingPageIndex ? { ...p, ...newPageData } : p));
        } else {
            if (uploadedFiles.length === 0) throw new Error('الرجاء رفع صورة واحدة على الأقل لإنشاء صفحة جديدة.');
            if (storyPages.length + uploadedFiles.length > 500) throw new Error(`لا يمكن إضافة ${uploadedFiles.length} صفحات. ستتجاوز الحد الأقصى البالغ 500 صفحة.`);
            
            const newPagesPromises = uploadedFiles.map(file => toBase64(file).then(imageUrl => ({
                id: `${Date.now()}-${Math.random()}`,
                imageUrl,
                storyText: uploadedFiles.length === 1 && customText.trim() ? customText : '',
                pageTitle: uploadedFiles.length === 1 ? pageTitleInput : '',
                pageTitleColor: pageTitleColorInput,
                stickers: [],
            })));
            
            const newPages = await Promise.all(newPagesPromises);

            const newStoryPages = [...storyPages];
            const finalInsertionIndex = insertionIndex !== null ? insertionIndex + 1 : storyPages.length;
            newStoryPages.splice(finalInsertionIndex, 0, ...newPages);
            setStoryPages(newStoryPages);
        }
        clearInputs();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ الصفحة.');
    } finally {
      setIsLoading(false);
    }
  }, [editingPageIndex, uploadedFiles, customText, pageTitleInput, pageTitleColorInput, storyPages, insertionIndex, theme.story.textColor]);

  const handleDeletePage = (indexToDelete: number) => { setStoryPages(pages => pages.filter((_, index) => index !== indexToDelete)); };
  
  const handleUpdatePage = (indexToUpdate: number, updates: Partial<StoryPageData>) => { setStoryPages(pages => pages.map((page, index) => index === indexToUpdate ? { ...page, ...updates } : page)); };

  const handleInitiateInsertion = (index: number) => { clearInputs(); setInsertionIndex(index); controlsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  const handleEditPage = (index: number) => {
    const page = storyPages[index];
    setEditingPageIndex(index);
    setInsertionIndex(null);
    setCustomText(page.storyText);
    setUploadedFiles([]);
    setPageTitleInput(page.pageTitle || '');
    setPageTitleColorInput(page.pageTitleColor || theme.story.textColor);
    controlsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  const handleCutPage = (index: number) => { setCutPageIndex(index === cutPageIndex ? null : index); };
  
  const handlePastePage = (pasteToIndex: number) => {
    if (cutPageIndex === null) return;
    const pageToMove = storyPages[cutPageIndex];
    let pagesWithoutCut = storyPages.filter((_, i) => i !== cutPageIndex);
    const adjustedPasteIndex = cutPageIndex < pasteToIndex ? pasteToIndex - 1 : pasteToIndex;
    pagesWithoutCut.splice(adjustedPasteIndex, 0, pageToMove);
    setStoryPages(pagesWithoutCut);
    setCutPageIndex(null);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
      e.dataTransfer.setData("page-index", index.toString());
      setTimeout(() => {
          setDraggedIndex(index);
      }, 0);
  };

  const handleDragEnd = () => {
      setDraggedIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      const draggedItemIndexStr = e.dataTransfer.getData("page-index");
      if (draggedItemIndexStr === '') return;

      const draggedItemIndex = parseInt(draggedItemIndexStr, 10);
      if (draggedItemIndex === dropIndex) {
          return;
      }

      const items = [...storyPages];
      const [draggedItemContent] = items.splice(draggedItemIndex, 1);
      items.splice(dropIndex, 0, draggedItemContent);
      setStoryPages(items);
  };

  const handleExport = async (format: 'word' | 'pdf') => {
    if (!isTitleSet) return;
    setIsExporting(true);
    setError(null);
    document.body.classList.add('export-mode');
    const ignoreElements = (element: Element) => element.classList.contains('no-export');
    try {
        const pageElements = document.querySelectorAll('.story-page-for-export');
        if (pageElements.length === 0) throw new Error("لم يتم العثور على صفحات للتصدير.");
        if (format === 'pdf') {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
            for (let i = 0; i < pageElements.length; i++) {
                const canvas = await html2canvas(pageElements[i] as HTMLElement, { useCORS: true, scale: 2, backgroundColor: '#f5f5f4', ignoreElements });
                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = pdf.internal.pageSize.getWidth(); const pdfHeight = pdf.internal.pageSize.getHeight();
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                if (i < pageElements.length - 1) { pdf.addPage(); }
            }
            pdf.save(`${storyTitle || 'قصتي'}.pdf`);
        } else { // Word export
            const paragraphs: Paragraph[] = [];
            for (let i = 0; i < pageElements.length; i++) {
                const canvas = await html2canvas(pageElements[i] as HTMLElement, { useCORS: true, scale: 2, backgroundColor: '#f5f5f4', ignoreElements });
                const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
                const imageBuffer = Uint8Array.from(atob(dataUrl.split(',')[1]), c => c.charCodeAt(0));
                paragraphs.push(new Paragraph({ children: [new ImageRun({ type: "jpg", data: imageBuffer, transformation: { width: 595, height: 842 } })], alignment: AlignmentType.CENTER, ...(i > 0 && { pageBreakBefore: true }) }));
            }
            const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
            const blob = await Packer.toBlob(doc);
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${storyTitle || 'قصتي'}.docx`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
        }
    } catch (err) { console.error(`Error exporting to ${format}:`, err); setError(`حدث خطأ أثناء تصدير ملف ${format}.`);
    } finally { 
        setIsExporting(false);
        document.body.classList.remove('export-mode');
    }
  };
    
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const numPages = pdf.numPages;

        if (numPages === 0) {
            throw new Error("ملف PDF فارغ أو لا يمكن قراءته.");
        }
        
        const metadata = await pdf.getMetadata();
        const info = metadata.info as any;
        const pdfTitle = info?.Title || file.name.replace(/\.pdf$/i, '');
        
        const importedPages: StoryPageData[] = [];

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.5 });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (!context) {
                console.warn(`Could not get canvas context for page ${i}`);
                continue;
            }
            
            await page.render({ canvas, canvasContext: context, viewport: viewport }).promise;
            const imageUrl = canvas.toDataURL('image/jpeg', 0.95);
            
            importedPages.push({
                id: `${Date.now()}-pdf-${i}`,
                imageUrl: imageUrl,
                storyText: '',
                pageTitle: '',
                pageTitleColor: theme.story.textColor,
                stickers: [],
            });
        }
        
        // The first imported page is the title page. Discard it and use the metadata title.
        importedPages.shift(); 

        setStoryPages(importedPages);
        setStoryTitle(pdfTitle);
        setStorySubtitle(''); 
        setIsTitleSet(true);
        
    } catch (err) {
        console.error("Error processing PDF:", err);
        const errorMessage = err instanceof Error ? err.message : 'فشل في معالجة ملف PDF.';
        setError(`خطأ في رفع الـ PDF: ${errorMessage}`);
    } finally {
        setIsLoading(false);
        e.target.value = '';
    }
  };

  const handleReset = () => {
    setStoryTitle(''); setStorySubtitle(''); setIsTitleSet(false); setStoryPages([]);
    setError(null); setAddEndPage(false); applyTemplate(defaultTemplate); setCutPageIndex(null);
    clearInputs();
  };

  const handleToggleSelectPage = (index: number) => {
    setSelectedPages(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(index)) {
            newSelection.delete(index);
        } else {
            newSelection.add(index);
        }
        return newSelection;
    });
  };

  useEffect(() => {
    const selectionString = Array.from(selectedPages).map(i => i + 1).join(', ');
    setPageSelectionInput(selectionString);
  }, [selectedPages]);

  const parseAndSetSelection = (input: string) => {
    const newSelection = new Set<number>();
    const parts = input.split(',').map(p => p.trim());
    parts.forEach(part => {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n, 10));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    if (i > 0 && i <= storyPages.length) newSelection.add(i - 1);
                }
            }
        } else {
            const num = parseInt(part, 10);
            if (!isNaN(num) && num > 0 && num <= storyPages.length) {
                newSelection.add(num - 1);
            }
        }
    });
    setSelectedPages(newSelection);
  };
  
  const handleSelectAll = () => {
    setSelectedPages(new Set(storyPages.map((_, i) => i)));
  };

  const handleAddWhiteBox = () => {
    if (selectedPages.size === 0) {
        setError("الرجاء تحديد صفحة واحدة على الأقل لإضافة صندوق.");
        return;
    }
    const newPages = [...storyPages];
    selectedPages.forEach(index => {
        if (!newPages[index].whiteBox) {
            newPages[index] = { ...newPages[index], whiteBox: { x: 10, y: 10, width: 80, height: 25, text: '' } };
        }
    });
    setStoryPages(newPages);
    setError(null);
  };

  const handleAddSticker = (stickerSrc: string, applyToAll: boolean = false) => {
    const pagesToUpdate = applyToAll
        ? new Set(storyPages.map((_, i) => i))
        : selectedPages;

    if (pagesToUpdate.size === 0) {
        setError("الرجاء تحديد صفحة واحدة على الأقل أو اختر 'تطبيق على الكل' لإضافة ملصق.");
        setTimeout(() => setError(null), 3000);
        return;
    }

    const newPages = [...storyPages];
    pagesToUpdate.forEach(index => {
        const page = newPages[index];
        const stickers = page.stickers ? [...page.stickers] : [];
        stickers.push({
            id: `${Date.now()}-${Math.random()}`,
            src: stickerSrc,
            x: 40,
            y: 40,
            width: 20,
            height: 20,
        });
        newPages[index] = { ...page, stickers };
    });
    setStoryPages(newPages);
    setError(null);
    setIsStickerSelectorOpen(false);
  };


  const handleExtractTextForAllSelected = async () => {
    if (selectedPages.size === 0) {
        setError("الرجاء تحديد صفحة واحدة على الأقل لاستخراج النص.");
        return;
    }
    setIsLoading(true);
    setError(null);

    const promises = Array.from(selectedPages).map(async (index) => {
        const page = storyPages[index];
        try {
            const text = await extractTextFromImage(page.imageUrl);
            return { index, success: true, text };
        } catch (e) {
            console.error(`Failed to extract text for page ${index + 1}:`, e);
            const errorMessage = e instanceof Error ? e.message : 'فشل استخراج النص.';
            return { index, success: false, text: `خطأ: ${errorMessage}` };
        }
    });

    const results = await Promise.all(promises);
    
    setStoryPages(currentPages => {
        const newPages = [...currentPages];
        results.forEach(result => {
            if (result.success) {
                const page = newPages[result.index];
                const whiteBox = page.whiteBox ?? { x: 10, y: 10, width: 80, height: 25, text: '' };
                whiteBox.text = result.text;
                newPages[result.index] = {
                    ...page,
                    whiteBox,
                    extractedText: undefined // Clear bottom text area on success
                };
            } else {
                // On failure, show the error message at the bottom
                const page = newPages[result.index];
                newPages[result.index] = {
                    ...page,
                    extractedText: result.text
                };
            }
        });
        return newPages;
    });

    setIsLoading(false);
  };
  
  const handleApplyStyles = () => {
    if (selectedPages.size < 2) {
        setError("لتطبيق النمط، الرجاء تحديد صفحة مصدر وصفحة هدف واحدة على الأقل (صفحتان أو أكثر).");
        return;
    }
    const sourceIndex = selectedPages.values().next().value;
    const sourcePage = storyPages[sourceIndex];
    if (!sourcePage.whiteBox) {
        setError(`الصفحة المصدر (${sourceIndex + 1}) لا تحتوي على صندوق أبيض لنسخ تنسيقه.`);
        return;
    }

    const newPages = [...storyPages];
    selectedPages.forEach(index => {
        if (index !== sourceIndex) {
            newPages[index] = { ...newPages[index], whiteBox: { ...sourcePage.whiteBox } };
        }
    });
    setStoryPages(newPages);
    setError(null);
  };

  const renderControls = () => {
    const isEditing = editingPageIndex !== null;
    const addButtonText = isEditing ? 'حفظ التغييرات' : (uploadedFiles.length > 1 ? `أضف ${uploadedFiles.length} صفحات` : 'أضف الصفحة');
    return (
      <>
        <h2 className="text-xl font-bold text-amber-900 mb-2 text-center">
            {isEditing ? `تعديل الصفحة ${editingPageIndex + 1}` : (insertionIndex !== null ? `إضافة صفحة بعد الصفحة ${insertionIndex + 1}` : `أضف صفحة جديدة`)}
        </h2>
        {(insertionIndex !== null || isEditing) && (
          <button onClick={clearInputs} className="text-sm text-center w-full mb-4 text-blue-600 hover:underline">
             {isEditing ? 'إلغاء التعديل والعودة للإضافة' : 'إلغاء (والإضافة إلى نهاية القصة بدلاً من ذلك)'}
          </button>
        )}
        <div className="flex flex-col gap-4">
            <label htmlFor="image-upload" className="font-semibold text-amber-800">{isEditing ? 'تغيير الصورة (اختياري)' : 'ارفع صورة أو صور (حتى 100)'}</label>
            <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full min-h-32 border-2 border-stone-300 border-dashed rounded-lg cursor-pointer bg-stone-50 hover:bg-stone-100 p-2">
                {uploadedFiles.length > 0 ? ( <div className="text-center"><p className="font-semibold text-amber-900">{uploadedFiles.length} صور محددة</p><p className="text-xs text-stone-600 max-w-full truncate">{uploadedFiles.map(f => f.name).join(', ')}</p></div> ) : isEditing && storyPages[editingPageIndex] ? ( <img src={storyPages[editingPageIndex].imageUrl} alt="Current" className="h-24 w-auto object-contain rounded-lg"/> ) : ( <div className="flex flex-col items-center justify-center pt-5 pb-6"> <UploadIcon /> <p className="mb-2 text-sm text-stone-500"><span className="font-semibold">انقر للرفع</span></p> <p className="text-xs text-stone-500">PNG, JPG (9:16)</p> </div> )}
                <input id="image-upload" type="file" multiple className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
            </label>
            <label htmlFor="custom-text" className="font-semibold text-amber-800">{isEditing ? 'تعديل نص القصة' : 'نص القصة (فقط للصفحة الأولى عند رفع عدة صور)'}</label>
            <textarea id="custom-text" value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="اكتب هنا النص الذي سيظهر أسفل صورتك..." className="w-full p-3 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-300 resize-none h-24 placeholder:text-stone-800 text-black font-bold" rows={3}/>
        </div>
        <div className="mt-4">
            <label htmlFor="page-title-input" className="font-semibold text-amber-800">عنوان الصفحة (اختياري)</label>
            <div className="relative mt-1">
                <input type="text" id="page-title-input" value={pageTitleInput} onChange={(e) => setPageTitleInput(e.target.value)} placeholder="مثال: في الحديقة السرية" className="w-full p-3 pr-4 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-300" style={{ paddingLeft: '3.5rem', color: pageTitleColorInput }} />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3" title="اختر لون العنوان"><button type="button" onClick={() => pageTitleColorInputRef.current?.click()} className="p-1 rounded-full text-stone-500 hover:bg-stone-200 transition-colors" aria-label="اختر لون العنوان"><PaletteIcon /></button><input ref={pageTitleColorInputRef} type="color" value={pageTitleColorInput} onChange={(e) => setPageTitleColorInput(e.target.value)} className="w-0 h-0 opacity-0" aria-hidden="true" /></div>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button onClick={handleAddOrUpdatePages} disabled={isLoading || isExporting} className="flex items-center justify-center gap-3 w-full bg-amber-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-amber-900 transition-transform transform hover:scale-105 disabled:bg-stone-400 disabled:cursor-not-allowed disabled:scale-100 shadow-md hover:shadow-lg">
                {isLoading ? (isEditing ? 'جاري الحفظ...' : 'جاري الإضافة...') : ( <> <AddIcon /> <span>{addButtonText}</span> </> )}
            </button>
        </div>
      </>
    );
  };
  
  const PasteButton = ({ onPaste }: {onPaste: () => void}) => (
    <div className="flex justify-center items-center my-2 no-export">
        <button onClick={onPaste} className="w-full border-2 border-dashed border-blue-400 text-blue-600 font-semibold rounded-lg py-2 hover:bg-blue-100 transition-colors">
            لصق هنا
        </button>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-8">
      <div ref={controlsRef} className="w-full max-w-2xl bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-stone-200 scroll-mt-4">
        {!isTitleSet ? (
          <>
            <form onSubmit={(e) => { e.preventDefault(); if (storyTitle.trim()) setIsTitleSet(true); }} className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-amber-900 mb-2 text-center">ابدأ قصة جديدة</h2>
                <div><label htmlFor="story-title" className="font-semibold text-amber-800">عنوان القصة</label><input type="text" id="story-title" value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} placeholder="مثال: مغامرة الفانوس السحري" className="mt-1 w-full p-3 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-300" required /></div>
                <div><label htmlFor="story-subtitle" className="font-semibold text-amber-800">العنوان الفرعي (اختياري)</label><input type="text" id="story-subtitle" value={storySubtitle} onChange={(e) => setStorySubtitle(e.target.value)} placeholder="مثلاً: بقلم فلان أو نبذة عن القصة" className="mt-1 w-full p-3 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-300" /></div>
                <button type="submit" disabled={!storyTitle.trim() || isLoading} className="flex items-center justify-center gap-3 w-full bg-amber-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-amber-900 transition-transform transform hover:scale-105 disabled:bg-stone-400 disabled:cursor-not-allowed disabled:scale-100 shadow-md hover:shadow-lg">ابدأ المغامرة</button>
            </form>
            <div className="relative flex items-center justify-center my-4">
                <span className="flex-grow border-t border-stone-300"></span>
                <span className="flex-shrink mx-4 text-stone-500 font-semibold">أو</span>
                <span className="flex-grow border-t border-stone-300"></span>
            </div>
            <button type="button" onClick={() => document.getElementById('pdf-upload-input')?.click()} disabled={isLoading} className="flex items-center justify-center gap-3 w-full bg-green-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-800 transition-transform transform hover:scale-105 disabled:bg-stone-400 disabled:cursor-not-allowed disabled:scale-100 shadow-md hover:shadow-lg">
                <PdfUploadIcon />
                <span>رفع وتعديل PDF محفوظ</span>
            </button>
            <input type="file" id="pdf-upload-input" className="hidden" accept="application/pdf" onChange={handlePdfUpload} />
          </>
        ) : (cutPageIndex !== null ? (
            <div className="text-center">
                <h3 className="text-lg font-bold text-amber-900">تم قص الصفحة {cutPageIndex + 1}</h3>
                <p className="text-stone-600">اختر الآن المكان الذي تريد لصقها فيه.</p>
                <button onClick={() => setCutPageIndex(null)} className="mt-2 text-sm text-blue-600 hover:underline">إلغاء القص</button>
            </div>
        ) : renderControls())}
        {isTitleSet && (<button onClick={handleReset} disabled={isLoading || isExporting} className="w-full mt-4 bg-stone-200 text-stone-700 font-bold py-3 px-5 rounded-lg hover:bg-stone-300 transition-colors disabled:bg-stone-100 disabled:text-stone-400">ابدأ قصة جديدة</button>)}
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
      </div>
      
      {isTitleSet && (
        <div className="w-full max-w-5xl flex flex-col items-center gap-4 border-t-2 border-amber-200 pt-8">
             <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <button onClick={() => handleExport('word')} disabled={isExporting || storyPages.length === 0} className="flex items-center justify-center gap-2 bg-blue-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-transform transform hover:scale-105 disabled:bg-stone-400 shadow-md"><DownloadIcon /><span>Word</span></button>
              <button onClick={() => handleExport('pdf')} disabled={isExporting || storyPages.length === 0} className="flex items-center justify-center gap-2 bg-red-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-800 transition-transform transform hover:scale-105 disabled:bg-stone-400 shadow-md"><PdfIcon /><span>PDF</span></button>
              <button onClick={() => setIsColorPickerOpen(true)} disabled={isExporting} className="flex items-center justify-center gap-2 bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 transition-transform transform hover:scale-105 disabled:bg-stone-400 shadow-md"><PaletteIcon /><span>الألوان</span></button>
              <button onClick={() => setIsTemplateSelectorOpen(true)} disabled={isExporting} className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 disabled:bg-stone-400 shadow-md"><PaletteIcon /><span>النماذج</span></button>
              <button onClick={() => setIsFontSelectorOpen(true)} disabled={isExporting} className="flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-transform transform hover:scale-105 disabled:bg-stone-400 shadow-md"><FontIcon /><span>الخط</span></button>
              <button onClick={() => setIsFrameSelectorOpen(true)} disabled={isExporting} className="flex items-center justify-center gap-2 bg-orange-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-700 transition-transform transform hover:scale-105 disabled:bg-stone-400 shadow-md"><FrameIcon /><span>الإطارات</span></button>
              <button onClick={() => setIsStickerSelectorOpen(true)} disabled={isExporting} className="flex items-center justify-center gap-2 bg-pink-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-700 transition-transform transform hover:scale-105 disabled:bg-stone-400 shadow-md"><StickerIcon /><span>الملصقات</span></button>
              <button onClick={() => setIsInnerBorderSelectorOpen(true)} disabled={isExporting} className="flex items-center justify-center gap-2 bg-lime-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-lime-700 transition-transform transform hover:scale-105 disabled:bg-stone-400 shadow-md"><InnerBorderIcon /><span>الإطار الداخلي</span></button>
              <button onClick={() => setIsChatModalOpen(true)} disabled={isExporting} className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 disabled:bg-stone-400 shadow-md"><ChatIcon /><span>المساعد</span></button>
            </div>
            
            <div className="w-full max-w-4xl p-4 mt-6 bg-stone-100 text-stone-800 rounded-lg shadow-inner no-export">
                <h3 className="text-lg font-bold text-amber-900 text-center mb-3">أدوات التعديل الجماعي</h3>
                <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
                    <input type="text" value={pageSelectionInput} onChange={e => setPageSelectionInput(e.target.value)} onBlur={() => parseAndSetSelection(pageSelectionInput)} placeholder="أدخل أرقام الصفحات (مثال: 1, 3-5)" className="flex-grow w-full sm:w-auto p-2 border border-stone-300 rounded-md" />
                    <div className="flex gap-2">
                        <button onClick={handleSelectAll} className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-semibold hover:bg-blue-200">تحديد الكل</button>
                        <button onClick={() => setSelectedPages(new Set())} className="px-3 py-2 bg-stone-200 rounded-md text-sm font-semibold hover:bg-stone-300">إلغاء التحديد</button>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-4 pt-3 border-t border-stone-300">
                    <button onClick={handleAddWhiteBox} disabled={isLoading} className="p-2 rounded-full hover:bg-stone-200 disabled:opacity-50" title="إضافة صندوق أبيض للصفحات المحددة"><WhiteBoxIcon /></button>
                    <button onClick={handleExtractTextForAllSelected} disabled={isLoading} className="p-2 rounded-full hover:bg-stone-200 disabled:opacity-50" title="استخراج النص من صور الصفحات المحددة"><EyeIcon /></button>
                    <button onClick={handleApplyStyles} disabled={isLoading} className="p-2 rounded-full hover:bg-stone-200 disabled:opacity-50" title="تطبيق نمط الصندوق والنص على الصفحات المحددة"><BrushIcon /></button>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 mt-4 w-full max-w-sm">
                <div className="flex items-center gap-2"><input type="checkbox" id="add-end-page" checked={addEndPage} onChange={(e) => setAddEndPage(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" /><label htmlFor="add-end-page" className="text-stone-700 font-semibold">إضافة صفحة النهاية وتخصيصها</label></div>
                {addEndPage && (
                    <div className="w-full mt-2 p-3 border border-stone-200 rounded-lg bg-stone-50 flex flex-col gap-2">
                        <input type="text" value={endPageContent.title} onChange={e => setEndPageContent(c => ({...c, title: e.target.value}))} placeholder="عنوان النهاية" className="w-full p-2 border border-stone-300 rounded-md" />
                        <input type="text" value={endPageContent.subtitle} onChange={e => setEndPageContent(c => ({...c, subtitle: e.target.value}))} placeholder="عنوان فرعي للنهاية (اختياري)" className="w-full p-2 border border-stone-300 rounded-md" />
                    </div>
                )}
            </div>
        </div>
      )}

      {isLoading && <Loader />}
      <ColorCustomizer isOpen={isColorPickerOpen} theme={theme} setTheme={setTheme} onClose={() => setIsColorPickerOpen(false)} onReset={() => applyTemplate(defaultTemplate)} />
      <TemplateSelector 
        isOpen={isTemplateSelectorOpen} 
        onClose={() => setIsTemplateSelectorOpen(false)}
        predefinedTemplates={predefinedTemplates}
        userTemplates={userTemplates}
        onSelectTemplate={(t) => applyTemplate(t)}
        onSaveTemplate={(name) => saveUserTemplates([...userTemplates, { name, theme, font: storyFont, pageFrame, innerBorderStyle }])}
        onDeleteTemplate={(index) => saveUserTemplates(userTemplates.filter((_, i) => i !== index))}
      />
      <FontSelector isOpen={isFontSelectorOpen} setFont={setStoryFont} onClose={() => setIsFontSelectorOpen(false)} />
      <FrameSelector isOpen={isFrameSelectorOpen} pageFrame={pageFrame} setPageFrame={setPageFrame} onClose={() => setIsFrameSelectorOpen(false)} />
      <StickerSelector isOpen={isStickerSelectorOpen} onClose={() => setIsStickerSelectorOpen(false)} onSelectSticker={handleAddSticker} />
      <InnerBorderSelector isOpen={isInnerBorderSelectorOpen} onClose={() => setIsInnerBorderSelectorOpen(false)} currentStyle={innerBorderStyle} setStyle={setInnerBorderStyle} borderColor={theme.story.borderColor} />
      <ChatModal isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} />
      
      <div className="w-full">
        {isTitleSet && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-12 gap-x-8 p-4">
                <div className="relative group"><TitlePage title={storyTitle} subtitle={storySubtitle} className="story-page-for-export" theme={theme.title} onEdit={() => { setIsTitleSet(false); controlsRef.current?.scrollIntoView({ behavior: 'smooth' }); }} pageFrame={pageFrame} /></div>
                
                {cutPageIndex !== null && cutPageIndex === 0 && <PasteButton onPaste={() => handlePastePage(0)} />}

                {storyPages.map((page, index) => (
                  <div
                    key={page.id}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className={`relative group/page-container transition-opacity duration-300 ${cutPageIndex === index ? 'opacity-40' : ''} ${draggedIndex === index ? 'opacity-40' : ''}`}>
                        <StoryPage
                          pageData={page}
                          pageNumber={index + 1}
                          onDelete={() => handleDeletePage(index)}
                          onUpdate={(updates) => handleUpdatePage(index, updates)}
                          onEdit={() => handleEditPage(index)}
                          onCut={() => handleCutPage(index)}
                          theme={theme.story}
                          fontFamily={storyFont}
                          className="story-page-for-export"
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragEnd={handleDragEnd}
                          isSelected={selectedPages.has(index)}
                          onSelect={() => handleToggleSelectPage(index)}
                          pageFrame={pageFrame}
                          innerBorderStyle={innerBorderStyle}
                        />
                        <div className="absolute inset-x-0 -bottom-5 h-10 flex justify-center items-center opacity-0 group-hover/page-container:opacity-100 transition-opacity duration-300 no-export">
                          <button onClick={() => handleInitiateInsertion(index)} className="p-2 bg-amber-800 text-white rounded-full shadow-lg hover:bg-amber-900 hover:scale-110 transition-all transform z-10" aria-label={`إضافة صفحة بعد الصفحة ${index + 1}`}><AddIcon /></button>
                        </div>
                    </div>
                    {page.extractedText && (
                        <div className="mt-4 p-3 bg-white text-stone-800 rounded-lg shadow-md border border-stone-200">
                            <h4 className="font-bold mb-1">النص المستخرج:</h4>
                            <p className="text-sm whitespace-pre-wrap">{page.extractedText}</p>
                        </div>
                    )}
                    {cutPageIndex !== null && <PasteButton onPaste={() => handlePastePage(index + 1)} />}
                  </div>
                ))}

                {addEndPage && (<TitlePage title={endPageContent.title} subtitle={endPageContent.subtitle} className="story-page-for-export" theme={theme.title} pageFrame={pageFrame} />)}
            </div>
        )}
      </div>
    </div>
  );
};

export default StoryGenerator;
