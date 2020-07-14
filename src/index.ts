import { initializeGPU, GPUContext, loadShader } from "./helper";

(async function init() {
    const canvasContainer = document.getElementById('canvas-container');
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    canvasContainer.appendChild(canvas);

    const gpuContext: GPUContext = await initializeGPU();

    const context: GPUCanvasContext = canvas.getContext('gpupresent') as any;

    const swapChainFormat = "bgra8unorm";

    const swapChainDesc: GPUSwapChainDescriptor = {
        device: gpuContext.GPUDevice,
        format: swapChainFormat,
        usage: GPUTextureUsage.OUTPUT_ATTACHMENT | GPUTextureUsage.COPY_SRC
    };

    const swapChain: GPUSwapChain = context.configureSwapChain(swapChainDesc);
    const device = gpuContext.GPUDevice;

    let vertModule: GPUShaderModule = device.createShaderModule({ code: await loadShader('shader.vert.spv') });
    let fragModule: GPUShaderModule = device.createShaderModule({ code: await loadShader('shader.frag.spv') });

    const pipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [] }),
        vertexStage: { module: vertModule, entryPoint: "main" },
        fragmentStage: { module: fragModule, entryPoint: "main" },
        primitiveTopology: "triangle-list",
        colorStates: [{ format: swapChainFormat }],
    });

    function frame() {
        const commandEncoder = device.createCommandEncoder({});
        const textureView = swapChain.getCurrentTexture().createView();

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                attachment: textureView,
                loadValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
            }],
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline);
        passEncoder.draw(3, 1, 0, 0);
        passEncoder.endPass();

        device.defaultQueue.submit([commandEncoder.finish()]);
    }

    function doFrame() {
        frame();
        requestAnimationFrame(doFrame);
    }

    requestAnimationFrame(doFrame);
})();
