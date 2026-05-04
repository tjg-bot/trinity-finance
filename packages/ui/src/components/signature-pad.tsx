"use client";

import * as React from "react";
import { useRef, useState, useCallback } from "react";
import { cn } from "../utils";

interface SignaturePadProps {
  onChange?: (dataUrl: string | null) => void;
  className?: string;
  disabled?: boolean;
}

export function SignaturePad({ onChange, className, disabled }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0]!;
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      setIsDrawing(true);
      lastPos.current = getPos(e);
    },
    [disabled]
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing || disabled) return;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const pos = getPos(e);

      ctx.beginPath();
      ctx.strokeStyle = "#0B2545";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (lastPos.current) {
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }

      lastPos.current = pos;
      setHasSig(true);
    },
    [isDrawing, disabled]
  );

  const stopDraw = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPos.current = null;
    const canvas = canvasRef.current;
    if (canvas && hasSig) {
      onChange?.(canvas.toDataURL("image/png"));
    }
  }, [isDrawing, hasSig, onChange]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
    onChange?.(null);
  }, [onChange]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="relative rounded-md border-2 border-dashed border-gray-300 bg-white">
        <canvas
          ref={canvasRef}
          width={560}
          height={140}
          className={cn(
            "w-full touch-none rounded-md",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-crosshair"
          )}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {!hasSig && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            Sign here
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Draw your signature above</span>
        {hasSig && !disabled && (
          <button
            type="button"
            onClick={clear}
            className="text-red-500 hover:underline"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
