
import React from 'react';
import StoryGenerator from './components/StoryGenerator';

function App() {
  return (
    <div className="min-h-screen bg-black text-stone-200 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="relative text-center mb-8">
          {/* Text-based logo as requested */}
          <div 
            className="absolute top-0 right-0 h-14 w-14 sm:h-16 sm:w-16 rounded-2xl shadow-md bg-amber-800 border-2 border-amber-300 flex items-center justify-center"
            aria-label="شعار المطور a.shalhoub"
          >
            <span className="font-sans font-bold text-white text-sm tracking-tight">
              a.shalhoub
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-amber-400 font-amiri">مولّد صفحات القصص</h1>
          <p className="text-stone-400 mt-2 text-lg">حوّل أفكارك إلى صفحات قصص مصورة وساحرة</p>
        </header>
        <main>
          <StoryGenerator />
        </main>
        <footer className="text-center mt-12 text-stone-400 text-sm">
          <p>تصميم وتطوير: a.shalhoub</p>
          <p>تم الإنشاء بواسطة: a.shalhoub</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
