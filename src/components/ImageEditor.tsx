import React from 'react';
import { RefreshCcw, Wand2 } from 'lucide-react';
import Canvas from './Canvas';

interface ImageEditorProps {
  originalImage: string;
  resultImage: string | null;
  prompt: string;
  setPrompt: (prompt: string) => void;
  onProcess: () => void;
  onReset: () => void;
  loading: boolean;
  onMaskChange: (maskDataUrl: string) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  originalImage,
  resultImage,
  prompt,
  setPrompt,
  onProcess,
  onReset,
  loading,
  onMaskChange
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <Canvas image={originalImage} onMaskChange={onMaskChange} />
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
            حدد المنطقة المراد تعديلها
          </div>
        </div>
        
        <div className="relative">
          <img
            src={resultImage || originalImage}
            alt="الصورة المعدلة"
            className={`w-full h-full object-cover rounded-lg ${
              loading ? 'animate-pulse' : resultImage ? 'magic-transition' : ''
            }`}
          />
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
            {resultImage ? 'الصورة المعدلة' : 'معاينة'}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-white text-lg mb-2">
            اكتب وصفاً للتعديلات المطلوبة
          </label>
          <div className="relative">
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="input-text h-24 resize-none pr-12"
              placeholder="مثال: أضف سيارة زرقاء في الخلفية"
              disabled={loading}
            />
            <Wand2 className="absolute top-3 right-3 text-purple-400 w-6 h-6" />
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onProcess}
            disabled={!prompt || loading}
            className="btn-primary"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCcw className="h-5 w-5 animate-spin" />
                جاري المعالجة...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                تطبيق السحر
              </span>
            )}
          </button>
          
          {resultImage && (
            <button onClick={onReset} className="btn-secondary">
              إعادة تعيين
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;