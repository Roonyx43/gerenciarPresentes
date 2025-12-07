<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Contribuições</h2>
      <div class="text-xs text-gray-500">Marque pago/não pago ou exclua.</div>
    </div>

    <div class="mb-4 grid md:grid-cols-3 gap-3">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar por padrinho, txid..."
        class="input border-2 border-blue-300 rounded-sm p-2 shadow-sm"
      />
      <select
        v-model="status"
        class="input border-2 border-blue-300 rounded-sm p-2 shadow-sm"
      >
        <option value="">Todos os status</option>
        <option value="pending">pending</option>
        <option value="paid">paid</option>
        <option value="canceled">canceled</option>
      </select>
      <button
        class="flex items-center justify-center w-full bg-blue-400 text-white py-2 rounded-sm shadow-sm cursor-pointer md:col-span-1"
        @click="reload"
        :disabled="loading"
      >
        {{ loading ? "Carregando..." : "Recarregar" }}
      </button>
    </div>

    <div class="overflow-auto rounded-sm shadow border-2 p-3 border-blue-300">
      <table class="min-w-full text-sm">
        <thead class="bg-white sticky top-0">
          <tr class="text-left text-gray-600">
            <th class="p-3">Padrinho</th>
            <th class="p-3">Valor</th>
            <th class="p-3">Gift</th>
            <th class="p-3">Status</th>
            <th class="p-3">Criado</th>
            <th class="p-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="p-6 text-center text-gray-500">
              Carregando contribuições...
            </td>
          </tr>

          <tr
            v-for="c in filtered"
            :key="c.id"
            class="border-t bg-white/60 backdrop-blur"
          >
            <td class="p-3">
              <div class="font-medium">{{ c.padrinho_name }}</div>
              <div class="text-xs text-gray-500">txid: {{ c.txid }}</div>
            </td>
            <td class="p-3 text-green-500">R$ {{ fix2(c.amount) }}</td>
            <td class="p-3">{{ c.gift_name || "-" }}</td>
            <td class="p-3">
              <span :class="badgeClass(c.status)" class="badge shadow-sm">
                {{ statusLabel(c.status) }}
              </span>
            </td>
            <td class="p-3">{{ formatDate(c.created_at) }}</td>
            <td class="p-3">
              <div class="flex flex-wrap gap-2">
                <button
                  class="btn btn-primary p-2 bg-green-500 text-white rounded-sm cursor-pointer shadow-sm"
                  @click="togglePaid(c.id)"
                  :disabled="busy[c.id]"
                  title="Alternar pending ⇄ paid"
                >
                  Pago/Não pago
                </button>
                <button
                  class="btn btn-danger p-2 bg-red-500 text-white rounded-sm cursor-pointer shadow-sm"
                  @click="askDelete(c.id)"
                  :disabled="busy[c.id]"
                  title="Excluir Contribuição?"
                >
                  Excluir
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="!loading && filtered.length === 0">
            <td colspan="7" class="p-6 text-center text-gray-500">
              Sem resultados. Tenta outro termo ou filtro.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal
      :open="modal.open"
      title="Excluir Contribuição?"
      confirm-text="Excluir"
      @close="modal.open = false"
      @confirm="removeContribution(modal.id)"
    >
      Se a contribuição estava paga, o valor será abatido do presente vinculado.
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  listContributions,
  toggleContributionPaid,
  deleteContribution,
} from "../api";
import { useToasts } from "../composables/useToasts";
import Modal from "./Modal.vue";

const { show } = useToasts();

const contributions = ref([]);
const loading = ref(false);
const busy = ref({});
const search = ref("");
const status = ref("");
const modal = ref({ open: false, id: null });

const reload = async () => {
  loading.value = true;
  try {
    contributions.value = await listContributions();
  } finally {
    loading.value = false;
  }
};

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase();
  return contributions.value.filter((c) => {
    const okTerm =
      !term ||
      String(c.padrinho_name).toLowerCase().includes(term) ||
      String(c.txid).toLowerCase().includes(term);
    const okStatus = !status.value || c.status === status.value;
    return okTerm && okStatus;
  });
});

const togglePaid = async (id) => {
  busy.value = { ...busy.value, [id]: true };
  try {
    contributions.value = await toggleContributionPaid(id);
    show({ title: "Status atualizado" });
  } catch (e) {
    show({ type: "error", title: "Falha ao alternar status" });
  } finally {
    busy.value = { ...busy.value, [id]: false };
  }
};

const askDelete = (id) => {
  modal.value = { open: true, id };
};

const removeContribution = async (id) => {
  busy.value = { ...busy.value, [id]: true };
  try {
    contributions.value = await deleteContribution(id);
    show({ title: "Contribution excluída" });
  } catch {
    show({ type: "error", title: "Falha ao excluir. Verifique vínculos." });
  } finally {
    busy.value = { ...busy.value, [id]: false };
    modal.value.open = false;
  }
};

const formatDate = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleString();
};
const fix2 = (v) => Number(v).toFixed(2);

const badgeClass = (s) => {
  if (s === "paid") return "border-green-200 bg-green-50 text-green-700 p-2 rounded-sm";
  if (s === "pending") return "border-yellow-200 bg-yellow-50 text-yellow-700 p-2 rounded-sm";
  if (s === "canceled") return "border-gray-200 bg-gray-50 text-gray-600 p-2 rounded-sm";
  return "border-gray-200 bg-gray-50 text-gray-600";
};

const statusLabel = (s) => {
  if (s === "paid") return "Pago";
  if (s === "pending") return "Pendente";
  if (s === "canceled") return "Cancelado";
  return s;
};

onMounted(reload);
</script>
