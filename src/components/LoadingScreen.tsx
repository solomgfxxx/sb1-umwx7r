import React from 'react';
import { Wand2 } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <Wand2 className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-bounce" />
        <div className="loading-spinner mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">جاري تحميل السحر...</h2>
        <p className="text-purple-300">نجهز لك تجربة تعديل الصور المستقبلية</p>
      </div>
    </div>
  );
};

export default LoadingScreen;