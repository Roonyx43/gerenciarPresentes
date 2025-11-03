import { reactive } from 'vue';

const state = reactive({ items: [] });
let id = 0;

export function useToasts() {
  const show = (payload) => {
    const t = { id: ++id, type: payload.type || 'ok', title: payload.title, desc: payload.desc };
    state.items.push(t);
    setTimeout(() => dismiss(t.id), payload.timeout ?? 2500);
  };
  const dismiss = (tid) => {
    const i = state.items.findIndex(t => t.id === tid);
    if (i >= 0) state.items.splice(i, 1);
  };
  return {
    toasts: state.items,
    show,
    dismiss
  };
}
