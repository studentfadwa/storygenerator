import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // استخدام مسار نسبي كقاعدة للتطبيق - مهم لـ GitHub Pages
  base: './',
  
  // لم نعد بحاجة إلى تعريف متغيرات البيئة لمفتاح API
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
