<template>
  <!-- Lenis aplicado ao scroll raiz da página -->
  <VueLenis :root="true" :options="{ duration: 1.1 }">
    <!-- Fundo azul claro, limpo e profissional -->
    <div class="min-h-screen bg-linear-to-b from-blue-50 via-white to-blue-100">
      <div class="max-w-6xl mx-auto px-6 py-12 space-y-12">
        
        <!-- Header -->
        <header class="rounded-3xl p-8 bg-linear-to-r from-blue-300 to-blue-500 shadow-[0_6px_40px_rgba(0,0,0,0.05)]">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="h-12 w-12 rounded-2xl bg-blue-600 grid place-items-center text-white shadow-[0_10px_25px_rgba(37,99,235,0.3)]">
                <!-- ícone presente -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M20.25 7.5H3.75m8.25 0V21m0-13.5H7.5a2.25 2.25 0 1 1 0-4.5c2.25 0 4.5 4.5 4.5 4.5Zm0 0h4.5a2.25 2.25 0 1 0 0-4.5c-2.25 0-4.5 4.5-4.5 4.5Z" />
                </svg>
              </div>
              <div>
                <h1 class="title text-3xl font-semibold text-gray-100">Lista de Presentes</h1>
                <p class="text-gray-200">Gerencie a lista de presentes e contribuições.</p>
              </div>
            </div>
          </div>
        </header>

        <!-- Grid principal -->
        <section class="grid grid-cols-1 gap-10">
          <!-- Contributions -->
          <div class="space-y-4">
            <div class="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_50px_rgba(0,0,0,0.12)] transition">
              <ContributionsList />
            </div>
          </div>

          <!-- Gifts -->
          <div class="space-y-4">
            <div class="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_50px_rgba(0,0,0,0.12)] transition">
              <GiftsManager />
            </div>
          </div>

          <div class="space-y-4">
            <div class="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_50px_rgba(0,0,0,0.12)] transition">
              <TopContributors />
            </div>
          </div>
        </section>

        <!-- Toasts -->
        <Toasts />
      </div>
    </div>
  </VueLenis>
</template>

<script setup>
import { VueLenis } from 'lenis/vue'

import ContributionsList from './components/ContributionsList.vue'
import GiftsManager from './components/GiftsManager.vue'
import Toasts from './components/Toasts.vue'
import TopContributors from './components/TopContributions.vue'
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Prata&display=swap');

.title {
  font-family: 'Great Vibes', serif;
}
</style>