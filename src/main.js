import Vue from 'vue';
import App from './App';
import 'amfe-flexible';
import { router } from './router';
import { PullRefresh, List, Toast, NavBar, Icon, Swipe, SwipeItem, Popup, Picker, Dialog, DatetimePicker, Lazyload } from 'vant';//下拉刷新  

Vue.use(Swipe).use(SwipeItem).use(Popup); Vue.use(DatetimePicker);
Vue.use(Icon);
Vue.use(NavBar);
Vue.use(List);
Vue.use(Toast);
Vue.use(Picker);
Vue.use(PullRefresh);
Vue.use(Lazyload);
Vue.use(Dialog);
import { native } from './core/native/app'

import { cache } from './core/cache'
Vue.prototype.$native = native;

Vue.prototype.$cache = cache;
import ToastFull from '@/core/toast'
Vue.use(ToastFull);
import 'vant/lib/button/style';
// eslint-disable-next-line no-unused-vars
import * as filters from './filter.js';
window.$vm = new Vue({
  router,
  el: '#app',
  render: h => h(App)
});
