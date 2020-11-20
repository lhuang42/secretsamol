import Vue from 'vue'
import App from './App.vue'
import Buefy from 'buefy'
import VueResource from 'vue-resource';
import '@mdi/font/css/materialdesignicons.min.css';

Vue.config.productionTip = false

Vue.use(Buefy)
Vue.use(VueResource)
Vue.http.options.root = process.env.SERVER_ROOT

new Vue({
  render: h => h(App)
}).$mount('#app')
