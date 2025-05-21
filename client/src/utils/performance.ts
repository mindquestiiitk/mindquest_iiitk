/**
 * Performance monitoring utilities
 */

// Use the browser's performance API if available
const perf = typeof window !== 'undefined' && window.performance ? window.performance : null;

/**
 * Measure the time it takes to execute a function
 * @param name Name of the measurement
 * @param fn Function to measure
 * @returns Result of the function
 */
export function measure<T>(name: string, fn: () => T): T {
  if (!perf) return fn();
  
  const start = perf.now();
  try {
    return fn();
  } finally {
    const end = perf.now();
    console.debug(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
  }
}

/**
 * Start a performance measurement
 * @param name Name of the measurement
 * @returns A function to end the measurement
 */
export function startMeasure(name: string): () => void {
  if (!perf) return () => {};
  
  const start = perf.now();
  return () => {
    const end = perf.now();
    console.debug(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
  };
}

/**
 * Performance monitoring API
 */
export const performance = {
  measure,
  startMeasure,
};
