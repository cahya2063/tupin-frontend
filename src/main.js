import { createApp } from 'vue'
import App from '@/App.vue'
import { registerPlugins, registerPlugins1 } from '@core/utils/plugins'
import './style.css'
// Styles
import '@core/scss/template/index.scss'
import '@layouts/styles/index.scss'

// Create vue app
const app = createApp(App)

// Register plugins
registerPlugins(app)
registerPlugins1(app)

// Mount vue app
app.mount('#app')
