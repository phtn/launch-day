"use client";

import { useEffect, useRef } from "react";

const WORKGROUP_SIZE = 8;
const GRID_SIZE = 256;
const UPDATE_INTERVAL = 60; // Update every 60ms (normal speed of our eyes)

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

      const size = 2048;
      canvas.width = size;
      canvas.height = size;

      const context = canvas.getContext(
        "webgpu",
      ) as unknown as GPUCanvasContext;
      const format = navigator.gpu.getPreferredCanvasFormat();

      if (!context) return;

      context.configure({
        device,
        format,
        alphaMode: "premultiplied",
      });

      const vertices = new Float32Array([
        //   X,    Y,
        -0.8,
        -0.8, // Triangle 1
        0.8,
        -0.8,
        0.8,
        0.8,

        -0.8,
        -0.8, // Triangle 2
        0.8,
        0.8,
        -0.8,
        0.8,
      ]);

      const vertexBuffer = device.createBuffer({
        label: "Cell vertices",
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });

      device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/ 0, vertices);

      const vertexBufferLayout = {
        // Number of bytes to skip forward to the next vertex
        // 2 floats(0.8, 0.8) * 4 bytes (size per float) = 8 bytes
        arrayStride: 8,

        // vertex attributes
        attributes: [
          {
            // Format of the attribute data
            format: "float32x2" as GPUVertexFormat,

            // Number of bytes where the attribute starts
            offset: 0,

            // Arbitrary number between 0 and 15
            // Each location must be unique for each attribute you define.
            // Position, see vertex shader
            shaderLocation: 0,
          },
        ],
      };

      const cellShaderModule = device.createShaderModule({
        label: "Cell shader",
        // @vertex is the position
        // @fragment is the color
        code: `
          struct VertexInput {
            @location(0) pos: vec2f,
            @builtin(instance_index) instance: u32,
          };

          struct VertexOutput {
            @builtin(position) pos: vec4f,
            @location(0) cell: vec2f,
          };

          @group(0) @binding(0) var<uniform> grid: vec2f;
          @group(0) @binding(1) var<storage> cellState: array<u32>;

          @vertex
          fn vertexMain(input: VertexInput) -> VertexOutput {

            let i = f32(input.instance);
            let cell = vec2f(i % grid.x, floor(i / grid.x));
            let state = f32(cellState[input.instance]);

            let offset = cell / grid * 2;
            let gridPos = (input.pos * state + 1) / grid - 1 + offset;

            var output: VertexOutput;
            output.pos = vec4f(gridPos, 0, 1);
            output.cell = cell;

            return output;
          }

          struct FragInput {
            @location(0) cell: vec2f,
          }

          @fragment
          fn fragmentMain(input: FragInput) -> @location(0) vec4f {
            let c = input.cell / (grid / 1.5);
            return vec4f(c, 1.5-c.x, 1);
          }
        `,
      });

      // Create the compute shader that will process the simulation.
      const simulationShaderModule = device.createShaderModule({
        label: "Life simulation shader",
        code: `
          @group(0) @binding(0) var<uniform> grid: vec2f;

          @group(0) @binding(1) var<storage> cellStateIn: array<u32>;
          @group(0) @binding(2) var<storage, read_write> cellStateOut: array<u32>;

          fn cellIndex(cell: vec2u) -> u32 {
            return (cell.y % u32(grid.y)) * u32(grid.x) +
                    (cell.x % u32(grid.x));
          }

          fn cellActive(x: u32, y: u32) -> u32 {
            return cellStateIn[cellIndex(vec2(x, y))];
          }

          @compute @workgroup_size(${WORKGROUP_SIZE}, ${WORKGROUP_SIZE})
          fn computeMain(@builtin(global_invocation_id) cell: vec3u) {
            // Determine how many active neighbors this cell has.
            let activeNeighbors = cellActive(cell.x+1, cell.y+1) +
                                  cellActive(cell.x+1, cell.y) +
                                  cellActive(cell.x+1, cell.y-1) +
                                  cellActive(cell.x, cell.y-1) +
                                  cellActive(cell.x-1, cell.y-1) +
                                  cellActive(cell.x-1, cell.y) +
                                  cellActive(cell.x-1, cell.y+1) +
                                  cellActive(cell.x, cell.y+1);

            let i = cellIndex(cell.xy);

            // Conway's game of life rules:
            switch activeNeighbors {
              case 2: {
                cellStateOut[i] = cellStateIn[i];
              }
              case 3: {
                cellStateOut[i] = 1;
              }
              default: {
                cellStateOut[i] = 0;
              }
            }
          }
        `,
      });

      // Create the bind group layout and pipeline layout.
      const bindGroupLayout = device.createBindGroupLayout({
        label: "Cell Bind Group Layout",
        entries: [
          {
            binding: 0,
            // Add GPUShaderStage.FRAGMENT here if you are using the `grid` uniform in the fragment shader.
            visibility:
              GPUShaderStage.VERTEX |
              GPUShaderStage.COMPUTE |
              GPUShaderStage.FRAGMENT,
            buffer: {}, // Grid uniform buffer
          },
          {
            binding: 1,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
            buffer: { type: "read-only-storage" }, // Cell state input buffer
          },
          {
            binding: 2,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: "storage" }, // Cell state output buffer
          },
        ],
      });

      // Create a uniform buffer that describes the grid.
      const uniformArray = new Float32Array([GRID_SIZE, GRID_SIZE]);
      const uniformBuffer = device.createBuffer({
        label: "Grid Uniforms",
        size: uniformArray.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

      // Create an array representing the active state of each cell.
      const cellStateArray = new Uint32Array(GRID_SIZE * GRID_SIZE);

      // Create a storage buffer to hold the cell state.
      const cellStateStorage = [
        device.createBuffer({
          label: "Cell State A",
          size: cellStateArray.byteLength,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        }),
        device.createBuffer({
          label: "Cell State B",
          size: cellStateArray.byteLength,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        }),
      ];

      // Initialize the cell state array with random values.
      for (let i = 0; i < cellStateArray.length; i++) {
        cellStateArray[i] = Math.random() > 0.42 ? 1 : 0;
      }

      // Make every third cell of the grid alive
      // for (let i = 0; i < cellStateArray.length; i += 3) {
      //   cellStateArray[i] = 1;
      // }
      // Write the cell state array to the storage buffer.
      device.queue.writeBuffer(cellStateStorage[0], 0, cellStateArray);

      // Mark every other cell of the second grid as active.
      for (let i = 0; i < cellStateArray.length; i++) {
        cellStateArray[i] = i % 2;
      }
      device.queue.writeBuffer(cellStateStorage[1], 0, cellStateArray);

      // Create a bind group for the cell state storage buffer.
      const bindGroups = [
        device.createBindGroup({
          label: "Cell Renderer Bind Group",

          layout: bindGroupLayout, // Updated Line
          // layout: pipeline.getBindGroupLayout(0),
          entries: [
            {
              binding: 0,
              resource: { buffer: uniformBuffer },
            },
            {
              binding: 1,
              resource: { buffer: cellStateStorage[0] },
            },
            {
              binding: 2,
              resource: { buffer: cellStateStorage[1] },
            },
          ],
        }),
        device.createBindGroup({
          label: "Cell Renderer Bind Group",
          layout: bindGroupLayout, // Updated Line
          // layout: pipeline.getBindGroupLayout(0),
          entries: [
            {
              binding: 0,
              resource: { buffer: uniformBuffer },
            },
            {
              binding: 1,
              resource: { buffer: cellStateStorage[1] },
            },
            {
              binding: 2,
              resource: { buffer: cellStateStorage[0] },
            },
          ],
        }),
      ];

      const pipelineLayout = device.createPipelineLayout({
        label: "Cell Pipeline Layout",
        bindGroupLayouts: [bindGroupLayout],
      });

      // Render pipeline controls how geometry are drawn and what shaders are used
      const pipeline = device.createRenderPipeline({
        label: "Cell Pipeline",
        layout: pipelineLayout,
        vertex: {
          module: cellShaderModule,
          entryPoint: "vertexMain",
          buffers: [vertexBufferLayout],
        },
        fragment: {
          module: cellShaderModule,
          entryPoint: "fragmentMain",
          targets: [
            {
              format,
            },
          ],
        },
      });

      // Create a compute pipeline that updates the game state.
      const simulationPipeline = device.createComputePipeline({
        label: "Simulation pipeline",
        layout: pipelineLayout,
        compute: {
          module: simulationShaderModule,
          entryPoint: "computeMain",
        },
      });

      let step = 0; // Track how many simulation steps have been run

      // End of WebGPU Configuration

      function updateGrid() {
        const encoder = device.createCommandEncoder();

        const compute = encoder.beginComputePass();
        compute.setPipeline(simulationPipeline);
        compute.setBindGroup(0, bindGroups[step % 2]);

        const workgroupCount = Math.ceil(GRID_SIZE / WORKGROUP_SIZE);
        compute.dispatchWorkgroups(workgroupCount, workgroupCount);

        compute.end();

        step++;

        const render = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: context.getCurrentTexture().createView(),
              loadOp: "clear",
              storeOp: "store",
              clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
            },
          ],
        });

        render.setPipeline(pipeline);
        render.setVertexBuffer(0, vertexBuffer);
        render.setBindGroup(0, bindGroups[step % 2]);
        render.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE); // 6 vertices

        render.end();

        device.queue.submit([encoder.finish()]);
      }

      setInterval(updateGrid, UPDATE_INTERVAL);

      // End of WebGPU adapter
      if (!adapter) {
        console.log("No adapter found");
      }
    };
    initWebGPU();
  }, []);

  return (
    <div className="pt-20">
      <div className="w-full overflow-hidden bg-gray-950 h-[calc(100vh-80px)] flex items-center justify-center">
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
};
