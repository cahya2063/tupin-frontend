<script setup>
import { apiFetch } from '@/utils/api';
import sweetAlert from '@/utils/sweetAlert';
import { backendUrl, config, editor } from '@/utils/tools';
import { Ckeditor } from '@ckeditor/ckeditor5-vue';
import { ref, watch } from 'vue';

const props = defineProps({
  visible: Boolean,
  selectedJob: Object
});

const emit = defineEmits(['close']);

const showActionForm = ref(false);
const adminNote = ref('');

async function deleteReportedJob(){
  try {
    const response = await apiFetch(`/jobs/${props.selectedJob._id}/delete-jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deletedNote: adminNote.value
      })
    })
    console.log('response hapus : ', response.data);
    

    emit('close')
    sweetAlert.success(response.data.message)
  } catch (error) {
    emit('close')
    sweetAlert.error(error.message)
  }

}

watch(() => props.visible, (newVal) => {
    if (newVal) {
        showActionForm.value = false;
        
        adminNote.value = '';
    }
});

function closeDetail() {
    emit('close');
}

function prepareAction() {
    showActionForm.value = true;
}

function cancelAction() {
    showActionForm.value = false;
    adminNote.value = '';
}
</script>

<template>
  <v-dialog :model-value="visible" @update:model-value="(val) => { if(!val) closeDetail() }" max-width="800" scrollable>
    <v-card class="rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between pa-5 pb-3 bg-white">
        <div class="text-h6 font-weight-bold" style="color: #2f2a3d;">Detail Laporan Pekerjaan</div>
        <v-btn variant="text" density="comfortable" @click="closeDetail">x</v-btn>
      </v-card-title>
      <v-divider></v-divider>

      <v-card-text class="pa-0" style="max-height: 75vh;">
        <div class="pa-5" v-if="selectedJob">
          <v-row>
            <v-col cols="12" md="7">
              <!-- Job Info Section -->
              <div class="mb-5">
                <h3 class="text-h5 font-weight-bold mb-2">{{ selectedJob.title }}</h3>
                <v-chip size="small" color="#8d85ff" variant="tonal" class="mb-4 font-weight-bold">
                  {{ selectedJob.category }}
                </v-chip>

                <div class="d-flex align-center mb-2">
                  <v-icon color="#8d85ff" size="20" class="mr-3">mdi-map-marker</v-icon>
                  <span class="text-body-1">{{ selectedJob.destination?.destinationName }}</span>
                </div>
                <div class="d-flex align-center mb-4">
                  <v-icon color="#8d85ff" size="20" class="mr-3">mdi-calendar</v-icon>
                  <span class="text-body-1" v-if="selectedJob.deadline">{{ selectedJob.deadline.start_date }} s/d {{ selectedJob.deadline.end_date }}</span>
                </div>
                
                <div class="text-subtitle-2 font-weight-bold mb-2 text-grey-darken-2">Deskripsi Pekerjaan:</div>
                <div class="content-box pa-4 rounded-lg mb-4 text-body-2" v-html="selectedJob.description"></div>
              </div>

              <!-- Photos -->
              <div class="mb-5" v-if="selectedJob.photos && selectedJob.photos.length > 0">
                <div class="text-subtitle-2 font-weight-bold mb-2 text-grey-darken-2">Foto / Lampiran:</div>
                <v-row>
                  <v-col v-for="(photo, index) in selectedJob.photos" :key="index" cols="6" sm="4">
                    <v-img 
                      :src="`${backendUrl}/uploads/jobs/${photo}`" 
                      cover 
                      aspect-ratio="1"
                      class="rounded-lg bg-grey-lighten-2 border"
                    ></v-img>
                  </v-col>
                </v-row>
              </div>
            </v-col>
            
            <v-col cols="12" md="5">
              <!-- Report Details -->
              <div class="report-alert pa-4 rounded-lg h-100 d-flex flex-column">
                <div class="d-flex align-center mb-3">
                  <v-icon color="error" class="mr-2" size="28">mdi-shield-alert</v-icon>
                  <span class="text-h6 font-weight-bold text-error">Info Pelanggaran</span>
                </div>
                <div class="text-subtitle-2 font-weight-bold text-grey-darken-3 mb-1">Alasan dilaporakan:</div>
                <p class="mb-4 text-body-1">{{ selectedJob.moderation?.deletedReason || 'Tidak disertakan' }}</p>

                <div class="text-subtitle-2 font-weight-bold text-grey-darken-3 mb-1">Dilaporkan pada:</div>
                <p class="mb-0 text-body-2">{{ new Date(selectedJob.moderation?.deletedAt).toLocaleString() || '-' }}</p>
              </div>
            </v-col>
          </v-row>

          <!-- Action Form (CKEditor) -->
          <v-expand-transition>
            <div v-if="showActionForm" class="action-form-container mt-6 p-4 border rounded-lg pa-5 bg-success-lighten-5 border-success">
              <div class="d-flex align-center mb-3">
                <v-icon color="success" class="mr-2">
                  mdi-check-circle
                </v-icon>
                <div class="text-h6 font-weight-bold text-success">
                  Data Laporan
                </div>
              </div>
              
              <div class="text-body-2 mb-2 font-weight-medium text-grey-darken-3">Tambahkan catatan validasi (opsional):</div>
              
              <div class="ckeditor-wrapper bg-white">
                <ckeditor
                  v-if="editor && config"
                  v-model="adminNote"
                  :editor="editor"
                  :config="config"
                />
              </div>

              <div class="d-flex justify-end mt-5 gap-2">
                <v-btn 
                  variant="outlined" 
                  color="grey-darken-1" 
                  class="text-none rounded-lg font-weight-bold" 
                  @click="cancelAction"
                >
                  Batal
                </v-btn>
                <v-btn 
                  color="success" 
                  variant="flat" 
                  class="text-none rounded-lg ml-3 px-6 font-weight-bold"
                  @click="deleteReportedJob"
                >
                  Kirim Keputusan
                </v-btn>
              </div>
            </div>
          </v-expand-transition>
        </div>
      </v-card-text>

      <v-divider v-if="!showActionForm"></v-divider>
      <v-card-actions v-if="!showActionForm" class="pa-5 bg-grey-lighten-4">
        <v-spacer></v-spacer>
        <v-btn 
          color="success" 
          variant="flat" 
          class="text-none rounded-lg px-6 font-weight-bold ml-3" 
          @click="prepareAction"
        >
          Terima Laporan
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
* {
  font-family: 'Quicksand';
}
.content-box {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
}
.report-alert {
  background-color: #fff5f5;
  border: 1px solid #ffcdd2;
}
.border-success {
  border: 1px solid #81c784;
}
.bg-success-lighten-5 {
  background-color: #f1f8e9;
}
.ckeditor-wrapper {
  border: 1px solid #cfd8dc;
  border-radius: 8px;
  overflow: hidden;
}
.ckeditor-wrapper:focus-within {
  border-color: #8d85ff;
  box-shadow: 0 0 0 2px rgba(141, 133, 255, 0.2);
}

/* Ensure CKEditor inherits minimum height and styles */
:deep(.ck-editor__editable_inline) {
  min-height: 180px;
}
</style>
