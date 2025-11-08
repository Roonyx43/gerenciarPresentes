<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Lista de Presentes</h2>
      <div class="text-xs text-gray-500">
        Crie, ajuste meta e ative/desative.
      </div>
    </div>

    <form
      class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5"
      @submit.prevent="create"
    >
      <input
        v-model="form.name"
        type="text"
        placeholder="Nome do presente"
        class="input border-2 border-blue-300 rounded-sm p-2 shadow-sm"
        required
      />
      <input
        v-model.number="form.goal_amount"
        type="number"
        step="0.01"
        min="0"
        placeholder="Meta (R$)"
        class="input border-2 border-blue-300 rounded-sm p-2 shadow-sm"
        required
      />
      <button
        class="btn btn-primary bg-blue-400 rounded-sm color-white text-white cursor-pointer shadow-sm"
      >
        Adicionar
      </button>
    </form>

    <div v-if="loading" class="empty">Carregando Lista de Presentes...</div>

    <div v-else-if="gifts.length === 0" class="empty">
      Nada por aqui ainda. Que tal começar criando um presente? 🎁
    </div>

    <div v-else class="grid sm:grid-cols-3 gap-4">
      <article
        v-for="g in gifts"
        :key="g.id"
        class="border-2 border-blue-300 rounded-sm p-4 bg-white shadow-sm"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3
              class="font-semibold"
              :class="
                g.concluido === 'X'
                  ? 'text-gray-400 line-through'
                  : 'text-blue-500'
              "
            >
              {{ g.name }}
            </h3>
            <div class="text-xs text-gray-500">{{ g.descricao }}</div>
          </div>

          <!-- só mostra o chip 'Concluído' -->
          <span
            v-if="g.concluido === 'X'"
            class="border-blue-200 bg-blue-50 text-blue-700 p-1 rounded text-xs"
            title="Este presente foi concluído"
          >
            Concluído
          </span>
        </div>

        <dl class="grid grid-cols-2 gap-2 text-sm mb-2">
          <div>
            <dt class="text-gray-500">Meta</dt>
            <dd class="font-medium text-blue-500">R$ {{ n(g.goal_amount) }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Recebido</dt>
            <dd class="font-medium text-green-500">
              R$ {{ n(g.received_amount) }}
            </dd>
          </div>
        </dl>

        <!-- Imagem do presente (preview + ações) -->
        <div class="mt-3">
          <!-- Com imagem -->
          <div v-if="g.img" class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-14 h-14 rounded-full overflow-hidden ring-[3px] ring-offset-[2px]"
                style="
                  --tw-ring-color: #8a9479;
                  --tw-ring-offset-color: #f6f3ee;
                "
                title="Imagem do presente"
              >
                <img
                  :src="g.img"
                  alt=""
                  class="w-full h-full object-cover"
                  :class="isLocked(g) ? 'grayscale contrast-75 opacity-75' : ''"
                />
              </div>
              <div class="text-xs text-gray-500 hidden sm:block">
                Imagem atual
              </div>
            </div>

            <div class="flex items-center gap-2">
              <!-- Trocar -->
              <label
                :for="'file-' + g.id"
                class="px-3 py-1.5 rounded bg-emerald-700 text-white text-xs hover:bg-emerald-800 cursor-pointer"
                :class="
                  isLocked(g)
                    ? 'opacity-50 pointer-events-none cursor-not-allowed'
                    : ''
                "
                :title="
                  isLocked(g)
                    ? 'Concluído: reabra para alterar a imagem'
                    : 'Trocar imagem'
                "
                >Trocar</label
              >

              <button
                class="px-3 py-1.5 rounded bg-red-500 text-white text-xs hover:bg-red-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                @click="!isLocked(g) && removeImage(g)"
                :disabled="isLocked(g)"
                :title="
                  isLocked(g)
                    ? 'Concluído: reabra para remover'
                    : 'Remover imagem'
                "
              >
                Remover
              </button>
            </div>

            <input
              class="hidden"
              type="file"
              :id="'file-' + g.id"
              accept="image/*"
              @change="(e) => uploadImage(g, e.target.files?.[0])"
              :disabled="isLocked(g)"
            />
          </div>

          <!-- Sem imagem -->
          <div v-else class="flex items-center justify-between">
            <span class="text-xs text-gray-500">Sem imagem</span>

            <label
              :for="'file-' + g.id"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-700 text-white text-xs hover:bg-emerald-800 cursor-pointer"
              :class="
                isLocked(g)
                  ? 'opacity-50 pointer-events-none cursor-not-allowed'
                  : ''
              "
              :title="
                isLocked(g)
                  ? 'Concluído: reabra para adicionar imagem'
                  : 'Selecionar imagem'
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 3a1 1 0 0 1 1 1v7.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4.007 4.007a1 1 0 0 1-1.414 0L7.279 10.707a1 1 0 1 1 1.414-1.414L11 11.586V4a1 1 0 0 1 1-1z"
                />
                <path
                  d="M5 19a2 2 0 0 1-2-2v-2a1 1 0 1 1 2 0v2h14v-2a1 1 0 1 1 2 0v2a2 2 0 0 1-2 2H5z"
                />
              </svg>
              Selecionar imagem
            </label>

            <input
              class="hidden"
              type="file"
              :id="'file-' + g.id"
              accept="image/*"
              @change="(e) => uploadImage(g, e.target.files?.[0])"
              :disabled="isLocked(g)"
            />
          </div>

          <div v-if="uploading === g.id" class="mt-1 text-[11px] text-gray-500">
            Enviando...
          </div>
        </div>

        <!-- Status visual -->
        <div class="w-full my-2">
          <!-- Concluído: ícone de check -->
          <div
            v-if="g.concluido === 'X'"
            class="flex items-center justify-center gap-2 text-green-600"
          >
            <!-- check circle -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5Zm4.03 6.97a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 0 1 1.06-1.06l1.72 1.72 4.97-4.97a.75.75 0 0 1 1.06 0Z"
              />
            </svg>
            <span class="text-sm text-center font-medium">Concluído</span>
          </div>

          <!-- Em aberto: barra de progresso -->
          <div v-else>
            <div
              class="relative h-2 w-full overflow-hidden rounded bg-gray-200"
              role="progressbar"
              :aria-valuenow="pct(g)"
              aria-valuemin="0"
              aria-valuemax="100"
              :title="`${pct(g)}%`"
            >
              <div
                class="h-full bg-blue-500 transition-[width] duration-700 ease-out"
                :style="{ width: pct(g) + '%' }"
              />
            </div>
            <div class="mt-1 text-[11px] leading-4 text-gray-600">
              {{ pct(g) }}% da meta
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 text-center gap-4 p-1">


          <button
            class="btn btn-ghost bg-blue-400 p-2 rounded-sm shadow-sm text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            @click="!isLocked(g) && editGoal(g)"
            :disabled="isLocked(g)"
            :title="
              isLocked(g) ? 'Concluído: reabra para alterar' : 'Editar meta'
            "
          >
            Editar meta
          </button>

          <button
            class="btn btn-danger bg-red-400 p-2 rounded-sm shadow-sm text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            @click="!isLocked(g) && askDelete(g)"
            :disabled="isLocked(g)"
            :title="isLocked(g) ? 'Concluído: reabra para excluir' : 'Excluir'"
          >
            Excluir
          </button>

          <button
            class="btn btn-ghost bg-green-400 p-2 rounded-sm shadow-sm text-white cursor-pointer"
            @click="concluir(g)"
            :title="g.concluido === 'X' ? 'Reabrir' : 'Concluir'"
          >
            {{ g.concluido === "X" ? "Reabrir" : "Concluir" }}
          </button>
        </div>
      </article>
    </div>

    <Modal
      :open="modal.open"
      title="Excluir gift"
      confirm-text="Excluir"
      @close="modal.open = false"
      @confirm="removeGift(modal.id)"
    >
      Ao excluir, gifts com contributions vinculadas podem falhar por restrição
      de chave estrangeira.
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  listGifts,
  createGift,
  updateGift,
  deleteGift,
  uploadGiftImage,
  deleteGiftImage, // 👈 importa
} from "../api";
import { useToasts } from "../composables/useToasts";
import Modal from "./Modal.vue";

const { show } = useToasts();
const gifts = ref([]);
const loading = ref(false);
const form = ref({ name: "", goal_amount: "", descricao: "" });
const modal = ref({ open: false, id: null });
const uploading = ref(null);

const load = async () => {
  loading.value = true;
  try {
    gifts.value = await listGifts();
  } finally {
    loading.value = false;
  }
};

const create = async () => {
  if (!form.value.name || !form.value.goal_amount) return;
  try {
    gifts.value = await createGift({
      name: form.value.name,
      goal_amount: form.value.goal_amount,
      descricao: form.value.descricao,
    });
    form.value = { name: "", goal_amount: "", descricao: "" };
    show({ title: "Gift criado!" });
  } catch {
    show({ type: "error", title: "Falha ao criar gift" });
  }
};

const toggleActive = async (g) => {
  try {
    gifts.value = await updateGift(g.id, { is_active: !g.is_active });
    show({ title: g.is_active ? "Gift desativado" : "Gift ativado" });
  } catch {
    show({ type: "error", title: "Falha ao atualizar gift" });
  }
};

const concluir = async (g) => {
  // Se já está concluído, reabre (manda null/""), senão marca "X"
  const proximoValor = g.concluido === "X" ? null : "X";

  try {
    gifts.value = await updateGift(g.id, { concluido: proximoValor });
    show({
      title: proximoValor === "X" ? "Gift concluído" : "Gift reaberto",
    });
  } catch (e) {
    console.error(e);
    show({ type: "error", title: "Falha ao atualizar conclusão" });
  }
};

const editGoal = async (g) => {
  const novo = prompt("Nova meta (R$):", Number(g.goal_amount).toFixed(2));
  if (novo == null) return;
  const v = Number(novo);
  if (isNaN(v) || v < 0) return alert("Valor inválido.");
  try {
    gifts.value = await updateGift(g.id, { goal_amount: v });
    show({ title: "Meta atualizada" });
  } catch {
    show({ type: "error", title: "Falha ao atualizar meta" });
  }
};

const editDesc = async (g) => {
  const atual = (g.descricao ?? "").toString();
  const novo = prompt("Nova descrição:", atual);
  if (novo == null) return; // cancelou
  const desc = novo.trim();
  // opcional: valida tamanho
  if (desc.length > 1000) return alert("Descrição muito longa (máx 1000).");
  try {
    gifts.value = await updateGift(g.id, { descricao: desc || null });
    show({ title: "Descrição atualizada" });
  } catch {
    show({ type: "error", title: "Falha ao atualizar descrição" });
  }
};

const askDelete = (g) => {
  modal.value = { open: true, id: g.id };
};
const removeGift = async (id) => {
  try {
    gifts.value = await deleteGift(id);
    show({ title: "Gift excluído" });
  } catch {
    show({ type: "error", title: "Falha ao excluir gift" });
  } finally {
    modal.value.open = false;
  }
};

const pct = (g) => {
  const goal = Number(g.goal_amount) || 0;
  const got = Number(g.received_amount) || 0;
  if (goal <= 0) return 0;
  const p = Math.min(100, Math.round((got / goal) * 100));
  return isFinite(p) ? p : 0;
};
const n = (v) => Number(v).toFixed(2);

const isLocked = (g) => g?.concluido === "X";

// === Upload via backend ===
async function uploadImage(g, file) {
  if (!file) return;
  uploading.value = g.id;
  try {
    gifts.value = await uploadGiftImage(g.id, file); // 👈 axios + baseURL certa
    show({ title: "Imagem atualizada!" });
  } catch (e) {
    console.error(e);
    show({ type: "error", title: "Falha no upload da imagem" });
  } finally {
    uploading.value = null;
  }
}

async function removeImage(g) {
  try {
    gifts.value = await deleteGiftImage(g.id); // 👈 axios + baseURL certa
    show({ title: "Imagem removida" });
  } catch (e) {
    console.error(e);
    show({ type: "error", title: "Falha ao remover imagem" });
  }
}

onMounted(load);
</script>
