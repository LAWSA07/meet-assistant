/**
 * AudioWorkletProcessor for real-time audio processing
 * Replaces deprecated createScriptProcessor for better performance
 */
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  /**
   * Convert Float32Array to 16-bit PCM Int16Array
   * @param {Float32Array} input - Input audio data
   * @returns {Int16Array} 16-bit PCM audio data
   */
  floatTo16BitPCM(input) {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  }

  /**
   * Process audio data - runs in separate thread
   * @param {Float32Array} inputs - Input audio buffers
   * @param {Float32Array} outputs - Output audio buffers (unused)
   * @param {Object} parameters - Custom parameters
   * @returns {boolean} Keep processor alive
   */
  process(inputs, outputs, parameters) {
    const inputChannel = inputs[0];
    
    if (!inputChannel || inputChannel.length === 0) {
      return true;
    }

    // Convert float audio to 16-bit PCM
    const pcmData = this.floatTo16BitPCM(inputChannel);
    
    // Send PCM data to main thread
    this.port.postMessage(pcmData.buffer, [pcmData.buffer]);
    
    return true;
  }
}

// Register the processor
registerProcessor('pcm-processor', PCMProcessor); 