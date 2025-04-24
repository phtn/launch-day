export const cellShader = `
  // @vertex is the position
  // @fragment is the color
  struct VertexInput {
    @location(0) pos: vec2f,
    @builtin(instance_index) instance: u32,
  };

  struct VertexOutput {
    @builtin(position) pos: vec4f,
    @location(0) cell: vec2f,
    @location(1) age: f32,
  };

  @group(0) @binding(0) var<uniform> grid: vec2f;
  @group(0) @binding(1) var<storage> cellState: array<f32>;

  @vertex
  fn vertexMain(input: VertexInput) -> VertexOutput {
    let i = f32(input.instance);
    let cell = vec2f(i % grid.x, floor(i / grid.x));
    let state = cellState[input.instance];
    let age = state;

    let offset = cell / grid * 2;
    let gridPos = (input.pos * step(0.1, state) + 1) / grid - 1 + offset;

    var output: VertexOutput;
    output.pos = vec4f(gridPos, 0, 1);
    output.cell = cell;
    output.age = age;
    return output;
  }

  struct FragInput {
    @location(0) cell: vec2f,
    @location(1) age: f32,
  }

  @fragment
  fn fragmentMain(input: FragInput) -> @location(0) vec4f {
    // Create a color that fades from bright yellow to dark red based on age
    let brightness = input.age;
    return vec4f(
      brightness,           // R: Full red when active
      brightness * 0.8,     // G: Slightly less green for warmth
      brightness * 0.2,     // B: Small amount of blue
      1.0                   // A: Full opacity
    );
  }
  `;

export const simulationShader = (size: number) => `
  @group(0) @binding(0) var<uniform> grid: vec2f;
  @group(0) @binding(1) var<storage> cellStateIn: array<f32>;
  @group(0) @binding(2) var<storage, read_write> cellStateOut: array<f32>;

  fn cellIndex(cell: vec2u) -> u32 {
    return (cell.y % u32(grid.y)) * u32(grid.x) +
            (cell.x % u32(grid.x));
  }

  fn cellActive(x: u32, y: u32) -> u32 {
    return u32(cellStateIn[cellIndex(vec2(x, y))] > 0.1);
  }

  @compute @workgroup_size(${size}, ${size})
  fn computeMain(@builtin(global_invocation_id) cell: vec3u) {
    let i = cellIndex(cell.xy);
    let wasActive = cellStateIn[i] > 0.1;

    let activeNeighbors = cellActive(cell.x+1, cell.y+1) +
                          cellActive(cell.x+1, cell.y) +
                          cellActive(cell.x+1, cell.y-1) +
                          cellActive(cell.x, cell.y-1) +
                          cellActive(cell.x-1, cell.y-1) +
                          cellActive(cell.x-1, cell.y) +
                          cellActive(cell.x-1, cell.y+1) +
                          cellActive(cell.x, cell.y+1);

    let currentAge = cellStateIn[i];

    // Update age and state based on Conway's rules
    switch activeNeighbors {
      case 2: {
        // Stay alive but age
        cellStateOut[i] = wasActive ? max(currentAge - 0.01, 0.1) : 0.0;
      }
      case 3: {
        // Become alive or stay alive
        cellStateOut[i] = 1.0; // Reset to full brightness
      }
      default: {
        // Die or stay dead
        cellStateOut[i] = 0.0;
      }
    }
  }
  `;

export const originalCellShader = `
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
            let c = input.cell / grid;
            return vec4f(c, 1-c.x, 1);
          }
        `;

export const originalSimulationShader = (size: number) => `
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

          @compute @workgroup_size(${size}, ${size})
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
        `;
