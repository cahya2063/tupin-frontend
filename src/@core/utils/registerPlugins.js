// src/core/utils/plugins.js

import CoreuiVue from '@coreui/vue-pro'

// Import stylesheet CoreUI (wajib)
import '@coreui/coreui-pro/dist/css/coreui.min.css'

// Import router (misal kamu punya file routes.js)

// Fungsi register
export function registerPlugins1(app) {

  // 👉 CoreUI (ini yang penting)
  app.use(CoreuiVue)
}
