import * as ort from 'onnxruntime-node';
import path from 'path';

let session: ort.InferenceSession | null = null;

export async function initModel() {
  if (!session) {
    try {
      const modelPath = path.join(process.cwd(), 'public', 'model', 'model.onnx');
      session = await ort.InferenceSession.create(modelPath);
    } catch (error) {
      console.error('Model initialization error:', error);
      throw error;
    }
  }
  return session;
}

export async function runInference(url: string) {
  try {
    const sess = await initModel();
    const tensor = new ort.Tensor('string', [url], [1]);
    const results = await sess.run({ "inputs": tensor });
    const probabilities = results['probabilities'].data;
    
    return {
      isPhishing: probabilities[1] > 0.5,
      confidence: probabilities[1]
    };
  } catch (error) {
    console.error('Inference error:', error);
    throw error;
  }
}