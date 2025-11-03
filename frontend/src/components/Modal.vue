<template>
  <teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/30" @click="$emit('close')"></div>
      <div class="absolute inset-0 grid place-items-center p-4">
        <div class="bg-white rounded-2xl shadow-soft max-w-md w-full p-5">
          <h3 class="text-lg font-semibold mb-2">{{ title }}</h3>
          <p class="text-sm text-gray-600 mb-4" v-if="$slots.default"><slot /></p>
          <div class="flex justify-end gap-2">
            <button class="btn btn-ghost" @click="$emit('close')">Cancelar</button>
            <button class="btn btn-danger" @click="$emit('confirm')">{{ confirmText || 'Confirmar' }}</button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmação' },
  confirmText: { type: String, default: 'Confirmar' }
});
defineEmits(['close', 'confirm']);
</script>
