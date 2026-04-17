/**
 * This is helper function to register plugins like a nuxt
 * To register a plugin just export a const function `defineVuePlugin` that takes `app` as argument and call `app.use`
 * For Scanning plugins it will include all files in `src/plugins` and `src/plugins/**\/index.ts`
 *
 *
 * @param {App} app Vue app instance
 * @returns void
 *
 * @example
 * ```ts
 * // File: src/plugins/vuetify/index.ts
 *
 * import type { App } from 'vue'
 * import { createVuetify } from 'vuetify'
 *
 * const vuetify = createVuetify({ ... })
 *
 * export default function (app: App) {
 *   app.use(vuetify)
 * }
 * ```
 *
 * All you have to do is use this helper function in `main.ts` file like below:
 * ```ts
 * // File: src/main.ts
 * import { registerPlugins } from '@core/utils/plugins'
 * import { createApp } from 'vue'
 * import App from '@/App.vue'
 *
 * // Create vue app
 * const app = createApp(App)
 *
 * // Register plugins
 * registerPlugins(app) // [!code focus]
 *
 * // Mount vue app
 * app.mount('#app')
 * ```
 */
import '@coreui/coreui-pro/dist/css/coreui.min.css'
import CoreuiVue from '@coreui/vue-pro'
import { createVuetify } from 'vuetify'
import {
  VFileUpload,
  // VFileUploadDropzone,
  VFileUploadItem,
  // VFileUploadList,
} from 'vuetify/labs/VFileUpload'

export const vuetify = createVuetify({
  components: {
    VFileUpload,
    // VFileUploadDropzone,
    VFileUploadItem,
    // VFileUploadList,
  },
  theme: {
    defaultTheme: 'myTheme',
    themes: {
      myTheme: {
        dark: false,
        colors: {
          primary: '#8d58ff', // 🔥 ganti warna di sini
          secondary: '#64748b',
          success: '#56ca00',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    },
  },
})
export const registerPlugins = app => {
  const imports = import.meta.glob(['../../plugins/*.{ts,js}', '../../plugins/*/index.{ts,js}'], { eager: true })
  const importPaths = Object.keys(imports).sort()

  importPaths.forEach(path => {
    const pluginImportModule = imports[path]

    pluginImportModule.default?.(app)
  })
}
export function registerPlugins1(app) {

  // 👉 CoreUI (ini yang penting)
  app.use(CoreuiVue)
}
export function registerPlugins2(app){
  app.use(vuetify)
}
