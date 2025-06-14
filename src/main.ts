// import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/assets/scss/main.scss'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import ru from 'element-plus/es/locale/lang/ru'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus, {
  locale: ru,
})
app.use(createPinia())
app.use(router)

app.mount('#app')
