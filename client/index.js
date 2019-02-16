import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import $ from 'jquery'
import store from './store/store'
/* html to pdf */
import htmlToPDF from './components/javascripts/htmlToPDF'
/* bootstrap */
//import 'bootstrap'
//import 'bootstrap/dist/css/bootstrap.css'
/* xlsx */
import XLSX from 'xlsx'

/* .vue components */
import App from './App.vue'
import Invalid from './components/Invalid.vue'
import Main from './components/Main.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Query from './components/Query.vue'
import List from './components/List.vue'
import Import from './components/Import.vue'
import Detail from './components/Detail.vue'
import Insert from './components/Insert.vue'

import StudentsBasicManage from './components/StudentsBasicManage.vue'
import BasicInfo from './components/StudentsBasicManagePages/BasicInfo.vue'
import Family from './components/StudentsBasicManagePages/Family.vue'
import SchoolRoll from './components/StudentsBasicManagePages/SchoolRoll.vue'
import Course from './components/StudentsBasicManagePages/Course.vue'
import PartyInfo from './components/StudentsBasicManagePages/PartyInfo.vue'
import Scholarship from './components/StudentsBasicManagePages/Scholarship.vue'
import Aid from './components/StudentsBasicManagePages/Aid.vue'
import Loan from './components/StudentsBasicManagePages/Loan.vue'
import Cadre from './components/StudentsBasicManagePages/Cadre.vue'
import Award from './components/StudentsBasicManagePages/Award.vue'
import Paper from './components/StudentsBasicManagePages/Paper.vue'
import Patent from './components/StudentsBasicManagePages/Patent.vue'
import TechProject from './components/StudentsBasicManagePages/TechProject.vue'

import Email from './components/StudentsBasicManagePages/modules/Email.vue'

import BasicInfoInsert from './components/inserts/BasicInfoInsert.vue'
import FamilyInsert from './components/inserts/FamilyInsert.vue'
import PaperInsert from './components/inserts/PaperInsert.vue'
import PatentInsert from './components/inserts/PatentInsert.vue'
import TechProjectInsert from './components/inserts/TechProjectInsert.vue'
import CadreInsert from './components/inserts/CadreInsert.vue'
import AwardInsert from './components/inserts/AwardInsert.vue'


Vue.config.debug = true
Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(htmlToPDF)
//全局注册email组件, 在页面中可以通过<email></email>直接引用
Vue.component('email', Email)

const router = new VueRouter({
  //使用路由的history模式，url栏没有#
  mode: 'history',
  routes: [
    { path: '/', redirect: 'main' },
    { name: 'login', path: '/login', component: Login },
    { name: 'register', path: '/register', component: Register },
    { name: 'main', path: '/main', component: Main },
    {
      name: 'studentsBasicManage',
      path: '/studentsBasicManage',
      component: StudentsBasicManage,
      children: [
        { name: 'basicInfo', path: 'basicInfo', component: BasicInfo },
        { name: 'family', path: 'family', component: Family },
        { name: 'schoolRoll', path: 'schoolRoll', component: SchoolRoll },
        { name: 'course', path: 'course', component: Course },
        { name: 'partyInfo', path: 'partyInfo', component: PartyInfo },
        { name: 'scholarship', path: 'scholarship', component: Scholarship },
        { name: 'aid', path: 'aid', component: Aid },
        { name: 'loan', path: 'loan', component: Loan },
        { name: 'cadre', path: 'cadre', component: Cadre },
        { name: 'award', path: 'award', component: Award },
        { name: 'paper', path: 'paper', component: Paper },
        { name: 'patent', path: 'patent', component: Patent },
        { name: 'techProject', path: 'techProject', component: TechProject },
      ]
    },
    { name: 'query', path: '/query', component: Query },
    { name: 'list', path: '/list', component: List },
    { name: 'import', path: '/import', component: Import },
    { name: 'detail', path: '/detail', component: Detail },
    {
      name: 'insert',
      path: '/insert',
      component: Insert,
      children: [
        { name: 'basicInfoInsert', path: 'basicInfo', component: BasicInfoInsert },
        { name: 'familyInsert', path: 'family', component: FamilyInsert },
        { name: 'paperInsert', path: 'paper', component: PaperInsert },
        { name: 'patentInsert', path: 'patent', component: PatentInsert },
        { name: 'techProjectInsert', path: 'techProject', component: TechProjectInsert },
        { name: 'cadreInsert', path: 'cadre', component: CadreInsert },
        { name: 'awardInsert', path: 'award', component: AwardInsert }
      ]
    },
    //所有未匹配的路径都会加载404页面组件
    { name: 'invalid', path: '*', component: Invalid }
  ]
})

const app = new Vue({
  //router,
  router: router,
  store: store,
  beforeMount: function() {
    this.$store.dispatch('GET', {
      url: '/users/session'
    }).then((res) => {
      app.$store.commit('updateUserStatus', res.body.content.userType)
      app.$store.commit('updateUserInfo', res.body.content)
    }).then(() => {
      //防止回到登陆页面
      if (app.$route.path == '/login') {
        app.$router.replace({ name: 'main'})
      }
      //显示用户信息
      $('#info-account').text(this.$store.getters.getUserAccount)
    }).catch((res) => {
      if (res.status === 441 || res.status === 440){
        app.$router.replace({ name: 'login' })
      }
    })
  },
  //render: h => h(App)
  render: function(h) {
    return h(App)
  }
}).$mount('#app')

/*
不加这个的话，如果已经登陆，再把当前的路径改为'http://localhost:3000/'
还是会跳到登陆页面，所以我用了 APP.vue 的beforemount 方法，每次这么做，
先检查

//更新，现在不需要这个守卫，只需要在beforemount加入判断是否跳入login页面即可，因为跳转到login只能通过地址栏输入，相当于重新加载

router.beforeEach(function(to, from, next){
  app.$store.dispatch('GET', {
    url: 'users/session'
  }).then((res) => {
    app.$store.commit('updateUserStatus', res.body.content.userType)
    app.$store.commit('updateUserInfo', res.body.content)
  }).then(() => {
    //app.$router.replace({name:'main'})
    if ((to.path == '/') || (to.path == '/login')) {
      app.$router.replace({
        name: 'main'
      })
    }
  }).catch((res) => {
    if (res.status === 441 || res.status === 440){
      app.$router.replace({ name: 'login' })
    }
  })

  next()
})
*/