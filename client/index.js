import Vue from 'vue'
import Router from 'vue-router'

import App from './App.vue'
import Hello from './components/Hello.vue'

Vue.config.debug = true
Vue.use(Router)

const router = new Router({
  routes: [
    { name: 'hello', path: '/hello', component: Hello }
  ]
})

new Vue({
  el: '#app',
  router,
  render (createElement) {
    return createElement(App)
  }
})
