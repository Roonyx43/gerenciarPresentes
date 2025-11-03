<template>
  <div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2 w-[95%] max-w-md">
    <transition-group name="toast" tag="div">
      <div v-for="t in toasts" :key="t.id"
           class="rounded-xl shadow-soft border p-3 flex items-start gap-3"
           :class="t.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'">
        <div class="pt-0.5">
          <svg v-if="t.type === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M12 9v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-brand-600" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M4.5 12.75l6 6 9-13.5"/>
          </svg>
        </div>
        <div class="text-sm">
          <p class="font-medium" v-text="t.title"/>
          <p class="text-gray-600" v-if="t.desc" v-text="t.desc"/>
        </div>
        <button class="ml-auto text-xs text-gray-500 hover:text-gray-700" @click="dismiss(t.id)">Fechar</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToasts } from '../composables/useToasts';
const { toasts, dismiss } = useToasts();
</script>

<style>
.toast-enter-active, .toast-leave-active { transition: all .18s ease; }
.toast-enter-from { opacity: 0; transform: translateY(8px); }
.toast-leave-to   { opacity: 0; transform: translateY(8px); }
</style>
