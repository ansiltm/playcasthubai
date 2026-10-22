import { create } from 'zustand';

export const useRequestActivity = create<{ pending: number }>(() => ({ pending: 0 }));

// Each request owns an idempotent cleanup, so concurrent requests cannot hide
// one another's loader and failures/cancellations cannot leave it stuck.
export function beginRequest() {
  useRequestActivity.setState(state => ({ pending: state.pending + 1 }));
  let finished = false;
  return () => {
    if (finished) return;
    finished = true;
    useRequestActivity.setState(state => ({ pending: Math.max(0, state.pending - 1) }));
  };
}
