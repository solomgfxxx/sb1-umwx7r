import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Paintbrush, RotateCcw } from 'lucide-react';

interface CanvasProps {
  image: string;
  onMaskChange: (maskDataUrl: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({ image, onMaskChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState(20);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    const maskCtx = maskCanvas?.getContext('2d');
    
    if (!canvas || !ctx || !maskCanvas || !maskCtx) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      // Set both canvases to image dimensions
      const containerWidth = canvas.parentElement?.clientWidth || img.width;
      const scale = containerWidth / img.width;
      setScale(scale);

      canvas.width = img.width;
      canvas.height = img.height;
      maskCanvas.width = img.width;
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      maskCanvas.height = img.height;
      maskCanvas.style.width = '100%';
      maskCanvas.style.height = 'auto';

      // Draw image on main canvas
      ctx.drawImage(img, 0, 0);

      // Initialize mask canvas with black background
      maskCtx.fillStyle = '#000000';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    };
  }, [image]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas?.getContext('2d');
    if (!maskCanvas || !maskCtx) return;

    const { x, y } = getCanvasCoordinates(e);
    maskCtx.beginPath();
    maskCtx.moveTo(x, y);
    maskCtx.lineWidth = brushSize;
    maskCtx.lineCap = 'round';
    maskCtx.strokeStyle = tool === 'brush' ? '#ffffff' : '#000000';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas?.getContext('2d');
    if (!maskCanvas || !maskCtx) return;

    const { x, y } = getCanvasCoordinates(e);
    maskCtx.lineTo(x, y);
    maskCtx.stroke();

    // Update mask
    onMaskChange(maskCanvas.toDataURL('image/png'));
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas?.getContext('2d');
    if (!maskCanvas || !maskCtx) return;

    maskCtx.fillStyle = '#000000';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    onMaskChange('');
  };

  return (
    <div className="canvas-container relative">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      <canvas
        ref={maskCanvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="absolute top-0 left-0 w-full h-full cursor-crosshair"
        style={{ mixBlendMode: 'difference' }}
      />
      
      <div className="canvas-tools">
        <button
          onClick={() => setTool('brush')}
          className={`p-2 rounded ${
            tool === 'brush' ? 'bg-purple-500' : 'bg-gray-700'
          }`}
          title="فرشاة"
        >
          <Paintbrush className="w-5 h-5" />
        </button>
        <button
          onClick={() => setTool('eraser')}
          className={`p-2 rounded ${
            tool === 'eraser' ? 'bg-purple-500' : 'bg-gray-700'
          }`}
          title="ممحاة"
        >
          <Eraser className="w-5 h-5" />
        </button>
        <button
          onClick={clearCanvas}
          className="p-2 rounded bg-gray-700 hover:bg-gray-600"
          title="مسح الكل"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <input
          type="range"
          min="5"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-24"
          title="حجم الفرشاة"
        />
      </div>
    </div>
  );
};

export default Canvas;