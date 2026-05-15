<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  type: {
    type: String,
    required: true,
    validator: (value) => ['approve', 'reject'].includes(value)
  },
  report: {
    type: Object,
    default: null
  },
  point: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['update:show', 'submit'])

const adminNote = ref('')

// Reset note when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    adminNote.value = ''
  }
})

const isApprove = computed(() => props.type === 'approve')

const modalConfig = computed(() => {
  if (isApprove.value) {
    return {
      title: 'Setujui Laporan',
      description: 'Tambahkan catatan admin sebelum menyetujui laporan ini.',
      icon: 'ri-shield-check-line',
      iconClass: 'icon-approve',
      btnLabel: 'Setujui',
      btnIcon: 'ri-check-line',
      btnClass: 'btn--confirm-approve'
    }
  } else {
    return {
      title: 'Tolak Laporan',
      description: 'Tambahkan catatan admin sebelum menolak laporan ini.',
      icon: 'ri-close-circle-line',
      iconClass: 'icon-reject',
      btnLabel: 'Tolak',
      btnIcon: 'ri-close-line',
      btnClass: 'btn--confirm-reject'
    }
  }
})

function handleSubmit() {
  emits('submit', adminNote.value)
}
</script>

<template>
  <VDialog
    :model-value="props.show"
    @update:model-value="val => emits('update:show', val)"
    max-width="520"
    persistent
  >
    <VCard class="action-dialog-card">
      <div class="action-dialog-header">
        <div class="action-dialog-icon" :class="modalConfig.iconClass">
          <i :class="modalConfig.icon" />
        </div>
        <div>
          <h3>{{ modalConfig.title }}</h3>
          <p>{{ modalConfig.description }}</p>
        </div>
        <button
          class="close-button"
          type="button"
          aria-label="Tutup dialog"
          @click="emits('update:show', false)"
        >
          <i class="ri-close-line" />
        </button>
      </div>

      <VCardText class="action-dialog-body">
        <div class="action-field">
          <label class="action-label" for="adminNote">
            <i class="ri-sticky-note-line" />
            Catatan Admin
            <span class="required-mark">*</span>
          </label>
          <textarea
            id="adminNote"
            v-model="adminNote"
            class="action-textarea"
            rows="4"
            placeholder="Tulis catatan atau keterangan keputusan Anda di sini..."
          />
        </div>

        <div class="action-info-box" v-if="props.report">
          <i class="ri-information-line" />
          <div>
            <strong>Kategori:</strong> {{ props.report.category }}
            &nbsp;·&nbsp;
            <strong>Poin penalti:</strong> {{ props.point }} poin
          </div>
        </div>
      </VCardText>

      <VCardActions class="action-dialog-actions">
        <VBtn
          class="btn--cancel-action"
          variant="flat"
          @click="emits('update:show', false)"
          :disabled="props.loading"
        >
          Batal
        </VBtn>
        <VBtn
          :class="modalConfig.btnClass"
          variant="flat"
          :loading="props.loading"
          @click="handleSubmit"
        >
          <i :class="[modalConfig.btnIcon, 'mr-1']" />
          {{ modalConfig.btnLabel }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
*{
  font-family: 'Quicksand';
}
.action-dialog-card {
  border-radius: 20px !important;
  overflow: hidden;
}

.action-dialog-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 22px 22px 0;
}

.action-dialog-icon {
  display: grid;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 12px;
  font-size: 22px;
}

.icon-approve {
  background: #f0fdf4;
  color: #16a34a;
}

.icon-reject {
  background: #fef2f2;
  color: #dc2626;
}

.action-dialog-header h3 {
  margin: 0 0 4px;
  color: #1f2140;
  font-size: 18px;
  font-weight: 800;
}

.action-dialog-header p {
  margin: 0;
  color: #6c6f85;
  font-size: 13.5px;
  line-height: 1.5;
}

.action-dialog-header .close-button {
  margin-left: auto;
  flex-shrink: 0;
}

.action-dialog-body {
  padding: 20px 22px 8px !important;
}

.action-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.action-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #3d3f56;
  font-size: 13.5px;
  font-weight: 700;
}

.required-mark {
  color: #ef4444;
}

.action-textarea {
  width: 100%;
  min-height: 110px;
  padding: 12px 14px;
  border: 1.5px solid #ddd9ff;
  border-radius: 12px;
  background: #fafafe;
  color: #1f2140;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  outline: none;
}

.action-textarea:focus {
  border-color: #8d85ff;
  box-shadow: 0 0 0 3px rgba(141, 133, 255, 0.12);
}

.action-textarea::placeholder {
  color: #b0b3c8;
}

.action-info-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid #ddd9ff;
  border-radius: 10px;
  background: #f5f3ff;
  color: #5f5fa5;
  font-size: 13px;
  line-height: 1.55;
}

.action-info-box i {
  flex-shrink: 0;
  margin-top: 1px;
  font-size: 16px;
  color: #8d85ff;
}

.action-dialog-actions {
  display: flex;
  gap: 10px;
  padding: 16px 22px 22px !important;
  justify-content: flex-end;
}

.btn--cancel-action {
  background: #f3f4f6;
  color: #4b5563;
  font-weight: 600;
  border-radius: 10px !important;
}

.btn--confirm-approve {
  background: linear-gradient(135deg, #22c55e, #16a34a) !important;
  color: white !important;
  font-weight: 700 !important;
  border-radius: 10px !important;
  padding-inline: 24px !important;
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.35);
  transition: box-shadow 0.2s ease, transform 0.15s ease;
}

.btn--confirm-approve:hover {
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.45);
  transform: translateY(-1px);
}

.btn--confirm-reject {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  color: white !important;
  font-weight: 700 !important;
  border-radius: 10px !important;
  padding-inline: 24px !important;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
  transition: box-shadow 0.2s ease, transform 0.15s ease;
}

.btn--confirm-reject:hover {
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45);
  transform: translateY(-1px);
}
</style>
