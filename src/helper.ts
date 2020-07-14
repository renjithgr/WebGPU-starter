export async function initializeGPU(): Promise<GPUContext> {
    let entry: GPU;
    let adapter: GPUAdapter;
    let device: GPUDevice;
    let queue: GPUQueue;
    try {
        entry = navigator.gpu;
        if(!entry) {
            return GPUContext.empty();
        }
        adapter = await entry.requestAdapter();
        device = await adapter.requestDevice();
        queue = device.defaultQueue;
    } catch (e) {
        console.error(e);
        return GPUContext.empty();
    }

    return {
        GPU: entry,
        GPUAdapter: adapter,
        GPUDevice: device,
        queue: queue
    };
}

export class GPUContext {
    public GPU: GPU;
    public GPUAdapter: GPUAdapter;
    public GPUDevice: GPUDevice;
    public queue: GPUQueue;

    public static empty(): GPUContext {
        return {
            GPU: null,
            GPUAdapter: null,
            GPUDevice: null,
            queue: null
        }
    }
}

export function loadShader(shaderPath: string) {
    return fetch(new Request(shaderPath), { method: 'GET', mode: 'cors' })
        .then((res) => res.arrayBuffer().then((arr) => new Uint32Array(arr)));
}
