
const CACHE_NAME = 'storybook-generator-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './index.tsx',
  './index.css',
  './App.tsx',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/app-icon.svg',
  './screenshots/screenshot1.jpg',
  './screenshots/screenshot2.jpg',
  // تضمين المكونات الأساسية
  './components/StoryGenerator.tsx',
  './components/StoryPage.tsx',
  './components/TitlePage.tsx',
  './components/TemplateSelector.tsx',
  './components/ThemeSelector.tsx',
  './components/ColorCustomizer.tsx',
  './components/ChatModal.tsx',
  './components/Loader.tsx',
  './components/icons.tsx',
  // تضمين الخدمات
  './services/geminiService.ts',
  // تضمين الموارد الخارجية المهمة
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;700&family=Markazi+Text:wght@400;700&family=Tajawal:wght@400;700&display=swap',
  'https://cdn.jsdelivr.net/npm/tesseract.js@v5.0.5/dist/tesseract.min.js',
  'https://www.transparenttextures.com/patterns/az-subtle.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا وجدنا استجابة في التخزين المؤقت، نعيدها
        if (response) {
          return response;
        }
        
        // نسخة من الطلب لأننا قد نستخدمها مرتين
        const fetchRequest = event.request.clone();
        
        // محاولة جلب المورد من الشبكة
        return fetch(fetchRequest)
          .then(response => {
            // التحقق من أن الاستجابة صالحة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // نسخة من الاستجابة لأن الجسم يمكن استخدامه مرة واحدة فقط
            const responseToCache = response.clone();
            
            // إضافة الاستجابة إلى التخزين المؤقت للاستخدام المستقبلي
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            // في حالة فشل الشبكة، نحاول تقديم صفحة غير متصلة
            console.error('Fetching failed:', error);
            
            // يمكن هنا تقديم صفحة غير متصلة من التخزين المؤقت
            return caches.match('./offline.html');
          });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});