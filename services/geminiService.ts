// تم إزالة الاعتماد على Gemini API وتوفير وظائف بديلة محلية

// نوع وهمي للمحادثة للحفاظ على توافق الواجهة
export type Chat = {
  sendMessage: (params: { message: string }) => Promise<{ text: string }>
};

// Declare Tesseract as a global variable to inform TypeScript that it will be available at runtime.
declare let Tesseract: any;

// مجموعة من الجمل الجاهزة للقصص
const STORY_TEMPLATES = [
  "في يوم من الأيام، كان هناك طفل صغير يحلم بمغامرة كبيرة في عالم سحري.",
  "تحت ضوء القمر، رقصت الأشجار وهمست بأسرار قديمة لم يسمعها أحد من قبل.",
  "اكتشف الأصدقاء كنزاً مخفياً في الغابة، لكنه لم يكن ذهباً بل كان شيئاً أثمن بكثير.",
  "طارت الطيور الملونة عالياً في السماء، تحمل رسائل سحرية بين الغيوم.",
  "عندما فتح الباب السحري، انتقل إلى عالم مليء بالعجائب والمخلوقات الودودة.",
  "همس النهر بقصص قديمة، وأصغت الصخور بانتباه لحكايات المياه المتدفقة.",
  "في قلب المدينة القديمة، كان هناك ساعة عجيبة تستطيع إيقاف الزمن للحظات.",
  "تحولت قطرات المطر إلى ألوان قوس قزح، ملونة العالم بألوان ساحرة.",
  "عندما أغمض عينيه، رأى عالماً كاملاً ينبض بالحياة داخل أحلامه.",
  "كانت النجوم تتحدث مع بعضها البعض، وكان هو الوحيد القادر على فهم لغتها."
];

// صور افتراضية (مسارات وهمية، ستُستبدل بصور حقيقية في التطبيق النهائي)
const DEFAULT_IMAGES = [
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzMzMyI+صورة افتراضية للقصة</dGV4dD48L3N2Zz4=",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmOGZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzMzMyI+صورة قصة جديدة</dGV4dD48L3N2Zz4=",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmOGUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzMzMyI+مغامرة سحرية</dGV4dD48L3N2Zz4="
];


/**
 * Creates and returns a new chat session for generating a story.
 * @returns A Chat instance with local functionality.
 */
export const startStoryChat = (): Chat => {
    // إنشاء كائن محادثة محلي يستخدم القوالب المحددة مسبقاً
    return {
        sendMessage: async ({ message }: { message: string }) => {
            // اختيار جملة عشوائية من القوالب
            const randomIndex = Math.floor(Math.random() * STORY_TEMPLATES.length);
            const storyText = STORY_TEMPLATES[randomIndex];
            
            // محاكاة تأخير الشبكة للواقعية
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return { text: storyText };
        }
    };
};

/**
 * يستمر في القصة باستخدام جمل محلية بدلاً من API
 * @param chat كائن المحادثة المحلي
 * @param prompt طلب المستخدم للجزء التالي من القصة
 * @returns نص القصة المولد محلياً
 */
export const continueStoryText = async (chat: Chat, prompt: string): Promise<string> => {
    try {
        // استخدام كائن المحادثة المحلي
        const response = await chat.sendMessage({ message: prompt });
        return response.text.trim();
    } catch (error) {
        console.error("خطأ في توليد نص القصة:", error);
        // استخدام نص افتراضي في حالة الخطأ
        return "وفجأة، حدث شيء سحري غير متوقع في القصة...";
    }
};

/**
 * يولد صورة للقصة بناءً على طلب المستخدم (باستخدام صور محلية)
 * @param prompt فكرة قصة المستخدم
 * @returns صورة مشفرة بترميز base64 بتنسيق URL بيانات
 */
export const generateStoryImage = async (prompt: string): Promise<string> => {
  try {
    // اختيار صورة عشوائية من الصور الافتراضية
    const randomIndex = Math.floor(Math.random() * DEFAULT_IMAGES.length);
    const imageUrl = DEFAULT_IMAGES[randomIndex];
    
    // محاكاة تأخير الشبكة للواقعية
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return imageUrl;
  } catch (error) {
    console.error("خطأ في توليد صورة القصة:", error);
    // إرجاع صورة افتراضية في حالة الخطأ
    return DEFAULT_IMAGES[0];
  }
};

/**
 * Pre-processes an image to improve OCR accuracy. This involves scaling, grayscaling, and binarization.
 * @param imageUrl The base64 encoded image data URL.
 * @returns A new data URL of the processed image.
 */
const preprocessImageForOCR = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
                return reject(new Error("Could not get canvas context for preprocessing."));
            }

            // Step 1: Scale the image. Tesseract works best on images with 300 DPI. Scaling up helps.
            const scaleFactor = 2;
            canvas.width = img.width * scaleFactor;
            canvas.height = img.height * scaleFactor;

            // Draw the scaled image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Step 2: Grayscale the image
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg; // red
                data[i + 1] = avg; // green
                data[i + 2] = avg; // blue
            }
            
            // Step 3: Binarization (simple thresholding) to make it black and white
            const threshold = 128; 
            for (let i = 0; i < data.length; i += 4) {
                const value = data[i] < threshold ? 0 : 255;
                data[i] = value;
                data[i + 1] = value;
                data[i + 2] = value;
            }

            ctx.putImageData(imageData, 0, 0);

            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (err) => {
            console.error("Failed to load image for preprocessing:", err);
            reject(new Error("فشل في تحميل الصورة للمعالجة."));
        };
        img.src = imageUrl;
    });
};


/**
 * Extracts text from an image using Tesseract.js on the client-side after pre-processing it.
 * @param imageUrl The base64 encoded image data URL.
 * @returns The extracted text as a string.
 */
export const extractTextFromImage = async (imageUrl: string): Promise<string> => {
  if (typeof Tesseract === 'undefined') {
    const errorMessage = "مكتبة Tesseract.js غير محملة. الرجاء التأكد من اتصالك بالإنترنت.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    const processedImageUrl = await preprocessImageForOCR(imageUrl);
    const { data: { text } } = await Tesseract.recognize(
      processedImageUrl,
      'ara', // Specify Arabic language for recognition
      {
        // logger: m => console.log(m) // Optional: for debugging progress
      }
    );
    return text.trim();
  } catch (error) {
    console.error("Error extracting text with Tesseract.js:", error);
    throw new Error("فشل في استخراج النص باستخدام Tesseract.js.");
  }
};