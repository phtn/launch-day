"use client";

import { useEffect, useRef } from "react";

export const Content = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const initWebGPU = async () => {
      //
      if (!navigator.gpu) return;

      const adapter = await navigator.gpu.requestAdapter();
      const device = (await adapter?.requestDevice()) as GPUDevice;
      const canvas = canvasRef.current;

      if (!canvas) return;

      const context = canvas.getContext(
        "webgpu",
      ) as unknown as GPUCanvasContext;
      const format = navigator.gpu.getPreferredCanvasFormat();

      if (!context) return;

      context.configure({
        device,
        format,
        alphaMode: "opaque",
      });

      // Clear the canvas to red for a simple visual check
      const encoder = device.createCommandEncoder();
      const textureView = context.getCurrentTexture().createView();

      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: textureView,
            clearValue: { r: 1, g: 1, b: 0, a: 1 },
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      });
      pass.end();

      device.queue.submit([encoder.finish()]);

      if (!adapter) {
        console.log("No adapter found");
      }
    };
    initWebGPU();
  }, []);
  return (
    <div className="">
      <div className="h-20"></div>
      <div className="size-96 border">
        <canvas ref={canvasRef} className="size-96"></canvas>
      </div>
    </div>
  );
};
