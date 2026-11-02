export function toScreenTimeResult(record) {
  return {
    usedMs: record.usedMs,
    limitMs: record.limitMs,
    remainingMs: record.remainingMs,
    exhausted: record.isExhausted,
  };
}
