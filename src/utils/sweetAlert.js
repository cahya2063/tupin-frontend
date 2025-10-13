import Swal from 'sweetalert2'

/**
 * Fungsi utama sweetAlert()
 * Bisa dipakai untuk alert umum, atau lewat preset seperti sweetAlert.success()
 */
function sweetAlert(options = {}) {
  // Jika parameter berupa string → alert cepat
  if (typeof options === 'string') {
    return Swal.fire({
      title: options,
      icon: 'info',
      confirmButtonText: 'OK'
    })
  }

  // Default config
  const defaultOptions = {
    title: 'Notification',
    text: '',
    icon: 'info',
    confirmButtonText: 'OK'
  }

  return Swal.fire({ ...defaultOptions, ...options })
}

/**
 * Preset: Success Alert
 */
sweetAlert.success = function (text = 'Berhasil!', title = 'Sukses!') {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#16a34a'
  })
}

/**
 * Preset: Error Alert
 */
sweetAlert.error = function (text = 'Terjadi kesalahan!', title = 'Gagal!') {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#dc2626'
  })
}

/**
 * Preset: Warning Alert
 */
sweetAlert.warning = function (text = 'Perhatikan tindakan Anda!', title = 'Peringatan!') {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'OK',
    confirmButtonColor: '#eab308'
  })
}

/**
 * Preset: Confirm Alert (dengan hasil .then)
 */
sweetAlert.confirm = function ({
  title = 'Apakah Anda yakin?',
  text = 'Tindakan ini tidak dapat dibatalkan!',
  confirmText = 'Ya, lanjutkan!',
  cancelText = 'Batal',
  icon = 'warning'
} = {}) {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText
  })
}

export default sweetAlert
