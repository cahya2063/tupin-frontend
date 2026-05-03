import Swal from 'sweetalert2'

// ─── Custom styles yang disuntikkan ke SweetAlert2 ───────────────────────────
const baseCustomClass = {
  popup: 'sa-popup',
  title: 'sa-title',
  htmlContainer: 'sa-text',
  confirmButton: 'sa-btn-confirm',
  cancelButton: 'sa-btn-cancel',
  denyButton: 'sa-btn-deny',
  icon: 'sa-icon',
}

const injectStyles = (() => {
  let injected = false
  return () => {
    if (injected) return
    injected = true
    const style = document.createElement('style')
    style.innerHTML = `
      /* Popup container */
      .sa-popup {
        border-radius: 20px !important;
        padding: 2rem 1.75rem !important;
        background: #ffffff !important;
        box-shadow: 0 20px 60px rgba(141, 133, 255, 0.18), 0 4px 20px rgba(0,0,0,0.06) !important;
        font-family: 'Inter', 'Segoe UI', sans-serif !important;
      }

      /* Title */
      .sa-title {
        color: #1a1a2e !important;
        font-size: 1.25rem !important;
        font-weight: 700 !important;
        letter-spacing: -0.01em !important;
        margin-bottom: 0.25rem !important;
      }

      /* Body text */
      .sa-text {
        color: #6b7280 !important;
        font-size: 0.9rem !important;
        line-height: 1.6 !important;
      }

      /* Icon wrapper: hapus border default, ganti dengan lingkaran soft */
      .sa-icon.swal2-success {
        border-color: #d4d0ff !important;
        color: #8d85ff !important;
      }
      .sa-icon.swal2-success .swal2-success-ring {
        border-color: #d4d0ff !important;
      }
      .sa-icon.swal2-success [class^='swal2-success-line'] {
        background-color: #8d85ff !important;
      }

      .sa-icon.swal2-error {
        border-color: #fca5a5 !important;
      }
      .sa-icon.swal2-error [class^='swal2-x-mark-line'] {
        background-color: #e53935 !important;
      }

      .sa-icon.swal2-warning {
        border-color: #fde68a !important;
        color: #f59e0b !important;
      }

      .sa-icon.swal2-info {
        border-color: #c7d2fe !important;
        color: #8d85ff !important;
      }

      .sa-icon.swal2-question {
        border-color: #d4d0ff !important;
        color: #8d85ff !important;
      }

      /* Confirm button */
      .sa-btn-confirm {
        border-radius: 10px !important;
        padding: 0.6rem 1.75rem !important;
        font-weight: 600 !important;
        font-size: 0.875rem !important;
        letter-spacing: 0.01em !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 4px 14px rgba(141, 133, 255, 0.35) !important;
      }
      .sa-btn-confirm:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 20px rgba(141, 133, 255, 0.45) !important;
      }
      .sa-btn-confirm:active {
        transform: translateY(0) !important;
      }

      /* Cancel button */
      .sa-btn-cancel {
        border-radius: 10px !important;
        padding: 0.6rem 1.75rem !important;
        font-weight: 600 !important;
        font-size: 0.875rem !important;
        transition: all 0.2s ease !important;
      }
      .sa-btn-cancel:hover {
        filter: brightness(0.92) !important;
        transform: translateY(-1px) !important;
      }

      /* Deny button */
      .sa-btn-deny {
        border-radius: 10px !important;
        padding: 0.6rem 1.75rem !important;
        font-weight: 600 !important;
        font-size: 0.875rem !important;
        transition: all 0.2s ease !important;
      }
      .sa-btn-deny:hover {
        filter: brightness(0.92) !important;
        transform: translateY(-1px) !important;
      }

      /* Backdrop lebih lembut */
      .swal2-backdrop-show {
        background: rgba(141, 133, 255, 0.12) !important;
        backdrop-filter: blur(4px) !important;
      }
    `
    document.head.appendChild(style)
  }
})()

// ─── Helper: merge dengan customClass & inject style ────────────────────────
function withStyle(options) {
  injectStyles()
  return {
    customClass: baseCustomClass,
    ...options,
  }
}

// ─── Fungsi utama sweetAlert() ───────────────────────────────────────────────
function sweetAlert(options = {}) {
  if (typeof options === 'string') {
    return Swal.fire(withStyle({
      title: options,
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#8d85ff',
    }))
  }

  const defaultOptions = {
    title: 'Notification',
    text: '',
    icon: 'info',
    confirmButtonText: 'OK',
    confirmButtonColor: '#8d85ff',
  }

  return Swal.fire(withStyle({ ...defaultOptions, ...options }))
}

// ─── Preset: Success ─────────────────────────────────────────────────────────
sweetAlert.success = function (subtext = 'Berhasil!', title = 'Sukses!') {
  return Swal.fire(withStyle({
    title,
    text: subtext,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#8d85ff',
  }))
}

// ─── Preset: Error ───────────────────────────────────────────────────────────
sweetAlert.error = function (text = 'Terjadi kesalahan!', title = 'Gagal!') {
  return Swal.fire(withStyle({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#e53935',
  }))
}

// ─── Preset: Warning ─────────────────────────────────────────────────────────
sweetAlert.warning = function (text = 'Perhatikan tindakan Anda!', title = 'Peringatan!') {
  return Swal.fire(withStyle({
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'OK',
    confirmButtonColor: '#f59e0b',
  }))
}

// ─── Preset: Confirm ─────────────────────────────────────────────────────────
sweetAlert.confirm = function ({
  title = 'Apakah Anda yakin?',
  text = 'Tindakan ini tidak dapat dibatalkan!',
  confirmText = 'Ya, lanjutkan!',
  cancelText = 'Batal',
  denyText = 'Tolak',
  icon = 'warning',
  showCancelButton = true,
  showDenyButton = false,
} = {}) {
  return Swal.fire(withStyle({
    title,
    text,
    icon,
    showCancelButton,
    showDenyButton,
    confirmButtonColor: '#8d85ff',
    cancelButtonColor: '#e53935',
    denyButtonColor: '#f59e0b',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    denyButtonText: denyText,
  }))
}

export default sweetAlert
