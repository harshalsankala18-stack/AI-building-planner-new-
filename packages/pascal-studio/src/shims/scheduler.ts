/**
 * Pure ESM shim for React scheduler.
 * Required for Vite dev mode with @react-three/fiber.
 */
export const unstable_now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
export const unstable_IdlePriority = 5;
export const unstable_ImmediatePriority = 1;
export const unstable_LowPriority = 4;
export const unstable_NormalPriority = 3;
export const unstable_UserBlockingPriority = 2;
export const unstable_Profiling = null;

let taskIdCounter = 1;

export function unstable_scheduleCallback(priorityLevel: number, callback: (options: { didTimeout: boolean; timeRemaining: () => number }) => any, options?: { delay?: number; timeout?: number }) {
  const startTime = unstable_now();
  const delay = options?.delay ?? 0;
  const timeout = options?.timeout ?? (priorityLevel === 1 ? -1 : priorityLevel === 2 ? 250 : priorityLevel === 5 ? 1073741823 : 5000);
  const expirationTime = startTime + delay + timeout;

  const id = taskIdCounter++;
  const task = {
    id,
    callback,
    priorityLevel,
    startTime: startTime + delay,
    expirationTime,
    sortIndex: -1,
    isQueued: true,
  };

  const timerId = setTimeout(() => {
    if (!task.isQueued) return;
    task.isQueued = false;
    const didTimeout = unstable_now() >= expirationTime;
    task.callback({
      didTimeout,
      timeRemaining: () => Math.max(0, 50 - (unstable_now() - startTime)),
    });
  }, Math.max(0, delay));

  (task as any)._timerId = timerId;
  return task;
}

export function unstable_cancelCallback(task: any) {
  if (task) {
    task.callback = null;
    task.isQueued = false;
    if (task._timerId) clearTimeout(task._timerId);
  }
}

export function unstable_forceFrameRate() {}
export function unstable_getCurrentPriorityLevel() {
  return unstable_NormalPriority;
}
export function unstable_next<T>(fn: () => T): T {
  return fn();
}
export function unstable_requestPaint() {}
export function unstable_runWithPriority<T>(priorityLevel: number, fn: () => T): T {
  return fn();
}
export function unstable_shouldYield() {
  return false;
}
export function unstable_wrapCallback<T extends Function>(callback: T): T {
  return callback;
}

const schedulerShim = {
  unstable_now,
  unstable_IdlePriority,
  unstable_ImmediatePriority,
  unstable_LowPriority,
  unstable_NormalPriority,
  unstable_Profiling,
  unstable_UserBlockingPriority,
  unstable_scheduleCallback,
  unstable_cancelCallback,
  unstable_forceFrameRate,
  unstable_getCurrentPriorityLevel,
  unstable_next,
  unstable_requestPaint,
  unstable_runWithPriority,
  unstable_shouldYield,
  unstable_wrapCallback,
};

export default schedulerShim;
