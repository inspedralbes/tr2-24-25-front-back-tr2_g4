/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Importar Pinia y el plugin de persistencia
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'

const app = createApp(App)

// Crear Pinia
const pinia = createPinia()

// Registrar el plugin de persistencia en Pinia
pinia.use(piniaPersist)

// Usar Pinia en la aplicación
app.use(pinia)

// Registrar otros plugins como Vuetify
registerPlugins(app)

app.mount('#app')
