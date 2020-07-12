import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '../src/assets/css/global.css'

//挂载
import axios from 'axios'
axios.interceptors.request.use(config => {
    // 为请求头添加token验证的authorization字段
    config.headers.Authorization = window.sessionStorage.getItem('token')
    console.log(config);
    return config;
})
Vue.prototype.$http = axios
    //配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'


Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')