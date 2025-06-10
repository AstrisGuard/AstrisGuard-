export function assessTemporalDrift(timestamp: number): string {
  const now = Date.now();
  const diff = Math.abs(timestamp - now);

  if (diff < 300) return "🟢 Perfect Alignment";
  if (diff < 1000) return "🟡 Acceptable Delay";
  return "🔴 Critical Time Drift";
}

export function simulateDriftDetection(): void {
  const timestamps = [];

  for (let i = 0; i < 100; i++) {
    const drifted = Date.now() + (Math.random() - 0.5) * 3000;
    timestamps.push(drifted);
  }

  timestamps.forEach((ts, idx) => {
    console.log(`Tx #${idx} =>`, assessTemporalDrift(ts));
  });
}

simulateDriftDetection();