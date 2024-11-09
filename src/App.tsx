import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Download, Share2, Wand2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import ImageEditor from './components/ImageEditor';
import LoadingScreen from './components/LoadingScreen';
import { processImage } from './utils/api';

export const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [mask, setMask] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setResult(null);
        setMask('');
      };
      reader.onerror = () => {
        toast.error('حدث خطأ أثناء قراءة الملف');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024
  });

  const handleProcess = async () => {
    if (!image || !prompt) {
      toast.error('الرجاء تحميل صورة وإدخال وصف للتعديلات');
      return;
    }

    setLoading(true);
    try {
      const resultImage = await processImage(image, prompt, mask);
      setResult(resultImage);
      toast.success('تم تعديل الصورة بنجاح!', {
        icon: '✨',
        style: {
          background: '#4a148c',
          color: '#fff',
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء معالجة الصورة';
      toast.error(errorMessage);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      try {
        const link = document.createElement('a');
        link.href = result;
        link.download = 'edited-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        toast.error('حدث خطأ أثناء تحميل الصورة');
      }
    }
  };

  const handleShare = async () => {
    if (result) {
      try {
        const blob = await fetch(result).then(r => r.blob());
        const file = new File([blob], 'edited-image.png', { type: 'image/png' });
        
        if (navigator.share) {
          await navigator.share({
            files: [file],
            title: 'صورتي المعدلة',
            text: 'شاهد صورتي المعدلة باستخدام Text Inpainting!'
          });
        } else {
          toast.error('المشاركة غير متوفرة في متصفحك');
        }
      } catch (error) {
        toast.error('حدث خطأ أثناء مشاركة الصورة');
      }
    }
  };

  const handleReset = () => {
    setResult(null);
    setPrompt('');
    setMask('');
  };

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <Wand2 className="h-8 w-8" />
            تعديل الصور بالنصوص
          </h1>
          <p className="text-purple-200 text-lg">
            قم بتحميل صورة وأخبرنا كيف تريد تعديلها
          </p>
        </div>

        {!image ? (
          <div
            {...getRootProps()}
            className={`dropzone p-12 text-center rounded-lg cursor-pointer
              ${isDragActive ? 'bg-purple-900/20' : 'bg-purple-900/10'}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-purple-300 mb-4" />
            <p className="text-purple-100 text-lg">
              {isDragActive
                ? 'اسحب الصورة هنا...'
                : 'اسحب صورة هنا أو انقر للاختيار'}
            </p>
            <p className="text-purple-300 text-sm mt-2">
              PNG, JPG أو JPEG حتى 10MB
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <ImageEditor
              originalImage={image}
              resultImage={result}
              prompt={prompt}
              setPrompt={setPrompt}
              onProcess={handleProcess}
              onReset={handleReset}
              loading={loading}
              onMaskChange={setMask}
            />

            {result && (
              <div className="flex justify-center gap-4 animate-fadeIn">
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  تحميل الصورة
                </button>
                <button
                  onClick={handleShare}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Share2 className="h-5 w-5" />
                  مشاركة
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;