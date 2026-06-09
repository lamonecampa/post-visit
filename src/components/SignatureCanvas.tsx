/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Pen, Trash2, Check, RefreshCw } from 'lucide-react';

interface SignatureCanvasProps {
  id: string;
  value: string; // Base64 signature image
  onChange: (base64: string) => void;
  placeholderText?: string;
}

export default function SignatureCanvas({
  id,
  value,
  onChange,
  placeholderText = "Draw signature here..."
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    // If there is an external value (e.g., cleared, or loaded), redraw or match state
    if (!value) {
      clearCanvas();
    } else {
      setHasSignature(true);
      // Optional: draw the loaded image onto canvas if we want, but keeping value is sufficient
    }
  }, [value]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Check if touch event
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent scrolling when drawing on mobile
    if (e.cancelable) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b'; // Slate 800 dark color for ink
    
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (e.cancelable) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveSignature();
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if canvas is blank
    if (!hasSignature) return;

    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange('');
  };

  // Adjust canvas scale for high DPI displays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const width = canvas.parentElement?.clientWidth || 300;
      canvas.width = width;
      canvas.height = 130;
      
      // If we have a stored value, we could redraw it, but for our simple application, clear is fine
      if (value) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = value;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full" id={id}>
      <div className="relative border border-slate-300 rounded-lg bg-slate-50 overflow-hidden shadow-inner h-[130px] group transition-all duration-200 hover:border-violet-400">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        />
        
        {!hasSignature && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none gap-1 bg-transprent select-none">
            <Pen className="w-5 h-5 opacity-60" />
            <span className="text-xs font-medium">{placeholderText}</span>
          </div>
        )}

        {hasSignature && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={clearCanvas}
              className="p-1 rounded bg-white border border-slate-200 shadow hover:bg-red-50 hover:text-red-500 text-slate-500 transition-colors"
              title="Clear signature"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium shadow-sm">
              <Check className="w-3 h-3" /> Signed
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
