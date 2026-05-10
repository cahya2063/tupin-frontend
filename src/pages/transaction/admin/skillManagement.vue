<script setup>
import sweetAlert from '@/utils/sweetAlert'
import { apiFetch } from '@/utils/api'

const skills = ref([])
const search = ref('')
const skillLabel = ref('')
const editingSkill = ref(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const deletingId = ref(null)

const filteredSkills = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  if (!keyword)
    return skills.value

  return skills.value.filter(skill =>
    getSkillLabel(skill).toLowerCase().includes(keyword),
  )
})

const totalSkills = computed(() => skills.value.length)
const latestSkill = computed(() => getSkillLabel(skills.value[0]))
const formTitle = computed(() => editingSkill.value ? 'Edit skill' : 'Tambah skill baru')
const submitText = computed(() => editingSkill.value ? 'Simpan perubahan' : 'Tambah skill')

function ensureSuccess(response, fallbackMessage) {
  if (response.status >= 400)
    throw new Error(response.data?.message || fallbackMessage)
}

function getSkillId(skill) {
  return skill?._id || skill?.id
}

function getSkillLabel(skill) {
  return skill?.label || skill?.name || skill?.title || '-'
}

function resetForm() {
  skillLabel.value = ''
  editingSkill.value = null
}

async function getAllSkills() {
  try {
    isLoading.value = true

    const response = await apiFetch('/skills', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    ensureSuccess(response, 'Gagal mengambil daftar skill')
    skills.value = response.data?.skills || response.data?.data || []
  }
  catch (error) {
    sweetAlert.error(error.message || 'Gagal mengambil daftar skill')
  }
  finally {
    isLoading.value = false
  }
}

async function submitSkill() {
  const label = skillLabel.value.trim()

  if (!label) {
    sweetAlert.warning('Nama skill tidak boleh kosong')

    return
  }

  try {
    isSubmitting.value = true

    if (editingSkill.value) {
      const skillId = getSkillId(editingSkill.value)

      const response = await apiFetch(`/skills/${skillId}/update-skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ label }),
      })

      ensureSuccess(response, 'Gagal mengupdate skill')
      sweetAlert.success(response.data?.message || 'Skill berhasil diupdate')
    }
    else {
      const response = await apiFetch(`/skills/create-skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            label,
          },
        }),
      })

      ensureSuccess(response, 'Gagal menambahkan skill')
      sweetAlert.success(response.data?.message || 'Skill berhasil ditambahkan')
    }

    resetForm()
    await getAllSkills()
  }
  catch (error) {
    sweetAlert.error(error.message || 'Gagal menyimpan skill')
  }
  finally {
    isSubmitting.value = false
  }
}

function editSkill(skill) {
  console.log('edit skil : ', skill);
  
  editingSkill.value = skill
  skillLabel.value = getSkillLabel(skill)
}

async function deleteSkill(skill) {
  const skillId = getSkillId(skill)
  const label = getSkillLabel(skill)

  const result = await sweetAlert.confirm({
    title: 'Hapus skill?',
    text: `Skill "${label}" akan dihapus dari daftar.`,
    confirmText: 'Ya, hapus',
    cancelText: 'Batal',
  })

  if (!result.isConfirmed)
    return

  try {
    deletingId.value = skillId

    const response = await apiFetch(`/skills/${skillId}/delete-skills`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    ensureSuccess(response, 'Gagal menghapus skill')
    sweetAlert.success(response.data?.message || 'Skill berhasil dihapus')

    if (editingSkill.value && getSkillId(editingSkill.value) === skillId)
      resetForm()

    await getAllSkills()
  }
  catch (error) {
    sweetAlert.error(error.message || 'Gagal menghapus skill')
  }
  finally {
    deletingId.value = null
  }
}

onMounted(getAllSkills)
</script>

<template>
  <section class="skill-management">
    <div class="skill-hero">
      <div class="hero-content">
        <div class="hero-badge">
          <VIcon icon="ri-settings-3-line" size="18" />
          Admin Skill
        </div>

        <h1>Management Skill</h1>
        <p>Kelola daftar keahlian teknisi agar proses pencarian dan registrasi tetap rapi.</p>
      </div>

      <div class="hero-stats">
        <div class="stat-item">
          <span>Total skill</span>
          <strong>{{ totalSkills }}</strong>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <span>Terbaru</span>
          <strong>{{ latestSkill }}</strong>
        </div>
      </div>
    </div>

    <div class="skill-grid">
      <VCard class="skill-panel form-panel" elevation="0">
        <div class="panel-heading">
          <div>
            <span class="section-kicker">Form Skill</span>
            <h2>{{ formTitle }}</h2>
          </div>
          <VBtn
            v-if="editingSkill"
            icon
            variant="tonal"
            color="#8d58ff"
            size="small"
            @click="resetForm"
          >
            <VIcon icon="ri-close-line" />
          </VBtn>
        </div>

        <VForm @submit.prevent="submitSkill">
          <VTextField
            v-model="skillLabel"
            placeholder="Contoh: AC, Plumbing, Listrik"
            prepend-inner-icon="ri-tools-line"
            variant="outlined"
            color="#8d58ff"
            bg-color="white"
            density="comfortable"
            class="skill-input"
          />

          <div class="form-actions">
            <VBtn
              type="submit"
              color="#8d58ff"
              class="primary-action"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            >
              <VIcon icon="ri-save-3-line" start />
              {{ submitText }}
            </VBtn>

            <VBtn
              v-if="editingSkill"
              variant="text"
              color="#6b7280"
              :disabled="isSubmitting"
              @click="resetForm"
            >
              Batal
            </VBtn>
          </div>
        </VForm>
      </VCard>

      <VCard class="skill-panel list-panel" elevation="0">
        <div class="list-toolbar">
          <div>
            <span class="section-kicker">Daftar Skill</span>
            <h2>{{ filteredSkills.length }} skill ditemukan</h2>
          </div>

          <VTextField
            v-model="search"
            placeholder="Cari skill..."
            prepend-inner-icon="ri-search-line"
            variant="outlined"
            color="#8d58ff"
            density="compact"
            hide-details
            class="search-field"
          />
        </div>

        <div v-if="isLoading" class="loading-state">
          <VProgressCircular indeterminate color="#8d58ff" size="42" />
          <span>Memuat daftar skill...</span>
        </div>

        <div v-else-if="filteredSkills.length === 0" class="empty-state">
          <div class="empty-icon">
            <VIcon icon="ri-inbox-line" size="28" />
          </div>
          <h3>Belum ada skill</h3>
          <p>Tambahkan skill pertama melalui form di sebelah kiri.</p>
        </div>

        <div v-else class="skill-list">
          <div
            v-for="(skill, index) in filteredSkills"
            :key="getSkillId(skill) || index"
            class="skill-row"
          >
            <div class="skill-info">
              <div class="skill-number">
                {{ String(index + 1).padStart(2, '0') }}
              </div>
              <div>
                <h3>{{ getSkillLabel(skill) }}</h3>
                <span>ID: {{ getSkillId(skill) || '-' }}</span>
              </div>
            </div>

            <div class="row-actions">
              <VBtn
                icon
                variant="tonal"
                color="#8d58ff"
                size="small"
                @click="editSkill(skill)"
              >
                <VIcon icon="ri-pencil-line" />
                <VTooltip activator="parent" location="top">
                  Edit skill
                </VTooltip>
              </VBtn>

              <VBtn
                icon
                variant="tonal"
                color="error"
                size="small"
                :loading="deletingId === getSkillId(skill)"
                @click="deleteSkill(skill)"
              >
                <VIcon icon="ri-delete-bin-6-line" />
                <VTooltip activator="parent" location="top">
                  Hapus skill
                </VTooltip>
              </VBtn>
            </div>
          </div>
        </div>
      </VCard>
    </div>
  </section>
</template>

<style scoped>
.skill-management {
  --skill-primary: #8d58ff;
  --skill-primary-dark: #7440eb;
  --skill-primary-soft: #f3efff;
  --skill-border: #ece7f8;
  --skill-text: #25223a;
  --skill-muted: #747087;

  padding-block-end: 24px;
}

.skill-hero {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  border: 1px solid rgba(141, 88, 255, 0.18);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(141, 88, 255, 0.1), rgba(141, 88, 255, 0)),
    #fff;
  box-shadow: 0 18px 45px rgba(38, 28, 76, 0.08);
  gap: 24px;
  padding: 28px;
}

.hero-content {
  max-inline-size: 660px;
}

.hero-badge,
.section-kicker {
  display: inline-flex;
  align-items: center;
  color: var(--skill-primary);
  font-size: 0.78rem;
  font-weight: 700;
  gap: 8px;
  letter-spacing: 0;
  text-transform: uppercase;
}

.skill-hero h1 {
  color: var(--skill-text);
  font-size: clamp(2rem, 4vw, 3.35rem);
  font-weight: 800;
  line-height: 1.05;
  margin-block: 14px 10px;
}

.skill-hero p {
  color: var(--skill-muted);
  font-size: 1rem;
  line-height: 1.7;
  margin: 0;
}

.hero-stats {
  display: flex;
  align-items: center;
  align-self: center;
  border: 1px solid var(--skill-border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 12px 28px rgba(141, 88, 255, 0.1);
  min-inline-size: 280px;
  padding: 18px;
}

.stat-item {
  flex: 1;
  min-inline-size: 0;
}

.stat-item span {
  display: block;
  color: var(--skill-muted);
  font-size: 0.78rem;
  font-weight: 600;
  margin-block-end: 8px;
}

.stat-item strong {
  display: block;
  overflow: hidden;
  color: var(--skill-text);
  font-size: 1.45rem;
  font-weight: 800;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-divider {
  align-self: stretch;
  background: var(--skill-border);
  inline-size: 1px;
  margin-inline: 18px;
}

.skill-grid {
  display: grid;
  align-items: start;
  gap: 22px;
  grid-template-columns: minmax(280px, 380px) minmax(0, 1fr);
  margin-block-start: 22px;
}

.skill-panel {
  border: 1px solid var(--skill-border);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 16px 42px rgba(38, 28, 76, 0.07);
  padding: 22px;
}

.panel-heading,
.list-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-block-end: 20px;
}

.panel-heading h2,
.list-toolbar h2 {
  color: var(--skill-text);
  font-size: 1.3rem;
  font-weight: 800;
  line-height: 1.25;
  margin-block: 6px 0;
}

.skill-input {
  margin-block-start: 6px;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.primary-action {
  box-shadow: 0 12px 24px rgba(141, 88, 255, 0.24);
  font-weight: 700;
}

.search-field {
  inline-size: min(100%, 280px);
}

.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(141, 88, 255, 0.28);
  border-radius: 8px;
  background: var(--skill-primary-soft);
  color: var(--skill-muted);
  min-block-size: 260px;
}

.loading-state {
  flex-direction: column;
  font-weight: 600;
  gap: 14px;
}

.empty-state {
  flex-direction: column;
  padding: 34px 20px;
  text-align: center;
}

.empty-icon {
  display: grid;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 12px 24px rgba(141, 88, 255, 0.16);
  color: var(--skill-primary);
  inline-size: 58px;
  place-items: center;
  block-size: 58px;
  margin-block-end: 16px;
}

.empty-state h3 {
  color: var(--skill-text);
  font-size: 1.15rem;
  font-weight: 800;
  margin: 0;
}

.empty-state p {
  color: var(--skill-muted);
  margin-block: 8px 0;
}

.skill-list {
  display: grid;
  gap: 12px;
}

.skill-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--skill-border);
  border-radius: 8px;
  background: #fff;
  gap: 16px;
  padding: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.skill-row:hover {
  border-color: rgba(141, 88, 255, 0.36);
  box-shadow: 0 12px 28px rgba(141, 88, 255, 0.12);
  transform: translateY(-1px);
}

.skill-info {
  display: flex;
  align-items: center;
  min-inline-size: 0;
  gap: 14px;
}

.skill-number {
  display: grid;
  flex: 0 0 auto;
  border-radius: 8px;
  background: var(--skill-primary-soft);
  color: var(--skill-primary);
  font-size: 0.82rem;
  font-weight: 800;
  inline-size: 42px;
  place-items: center;
  block-size: 42px;
}

.skill-info h3 {
  overflow: hidden;
  color: var(--skill-text);
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
  margin: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skill-info span {
  display: block;
  overflow: hidden;
  color: var(--skill-muted);
  font-size: 0.78rem;
  margin-block-start: 3px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
}

@media (max-width: 1180px) {
  .skill-hero {
    flex-direction: column;
  }

  .hero-stats {
    align-self: stretch;
  }

  .skill-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 740px) {
  .skill-management {
    padding-block-end: 12px;
  }

  .skill-hero,
  .skill-panel {
    padding: 18px;
  }

  .hero-stats,
  .list-toolbar,
  .panel-heading,
  .skill-row {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-stats {
    gap: 14px;
  }

  .stat-divider {
    block-size: 1px;
    inline-size: 100%;
    margin: 0;
  }

  .search-field {
    inline-size: 100%;
  }

  .skill-row {
    gap: 14px;
  }

  .skill-info {
    align-items: flex-start;
  }

  .row-actions {
    justify-content: flex-end;
  }
}

@media (max-width: 420px) {
  .skill-hero h1 {
    font-size: 2rem;
  }

  .form-actions .v-btn,
  .primary-action {
    inline-size: 100%;
  }

  .row-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .row-actions .v-btn {
    inline-size: 100%;
  }
}
</style>
