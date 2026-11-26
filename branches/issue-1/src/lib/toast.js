/* 轻量 Toast（事件驱动） */
let listener = null;

export function toast(msg, isErr = false) {
  if (listener) listener(msg, isErr);
}

export function setToastListener(fn) { listener = fn; }
