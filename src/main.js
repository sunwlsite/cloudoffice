import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 引入Element-UI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// font-awesome图标
import 'font-awesome/css/font-awesome.css'
// VueX
import store from "./store"


// 全局引入自定义封装请求工具
import {postRequest} from "./utils/api";
import {putRequest} from "./utils/api";
import {getRequest} from "./utils/api";
import {deleteRequest} from "./utils/api";
// 菜单请求工具
import {initMenu} from "./utils/menus";
// 文件下载工具
import {downloadRequest} from "./utils/download";

/*关闭浏览器控制台关于环境的提示*/
Vue.config.productionTip = false
// 装载ElementUI
Vue.use(ElementUI);
// 设置ElementUI全局默认size,此时自定义的size的优先级大于全局
Vue.use(ElementUI, {size: 'small'});

// 以插件的形式使用请求, 这样后续使用就不需要每个页面都导入这些请求了, 直接使用this.XXX以插件的形式使用
Vue.prototype.postRequest = postRequest;
Vue.prototype.putRequest = putRequest;
Vue.prototype.getRequest = getRequest;
Vue.prototype.deleteRequest = deleteRequest;
// 下载
Vue.prototype.downloadRequest = downloadRequest;

// 路由前置守卫(这里有问题,需要梳理路由跳转)
router.beforeEach((to, from, next) => {

    // if (to.path === '/') {
    //     // 访问登录页直接放行
    //     return next();
    // }
    // // 判断是否有token信息
    // if (window.sessionStorage.getItem("token")) {
    //     // 请求初始化菜单
    //     initMenu(router, store);
    //     // 判断是否存在用户信息
    //     if (!window.sessionStorage.getItem("userInfo")) {
    //         // 获取当前登录的用户信息
    //         return getRequest("/admin/info").then(response => {
    //             if (response) {
    //                 // sessionStorage只能存储字符串, 这里需要转换一下
    //                 window.sessionStorage.setItem("userInfo", JSON.stringify(response));
    //                 // VueX更新用户信息
    //                 store.commit('initCurrentAdmin',response);
    //                 return next();
    //             }
    //         })
    //     }
    //     return next();
    // } else {
    //     // 没有token信息
    //     // 未登录的情况直接访问某一需要登录才能看的页面, 先到登录页面再重定向到访问页面
    //     return next('/?redirect=' + to.path);
    // }

    // 解决 Navigation cancelled from“/...“ to “/...“ with a new navigation 报错 : 不使用多个if嵌套,将原有嵌套的if单独做成一个方法
    if (to.path === '/') {
        console.log("访问登录页");
        // 访问登录页直接放行
        return next();
    }
    // 判断是否有token信息
    if (window.sessionStorage.getItem("token")) {
        userInfo();
        console.log("存在token信息");
        // 有token则直接请求初始化菜单
        initMenu(router, store);
        return next();
    } else {
        console.log("无token信息");
        // 没有token信息
        // 未登录的情况直接访问某一需要登录才能看的页面, 先到登录页面再重定向到访问页面
        return next('/?redirect=' + to.path);
    }

})

// 获取用户信息
function userInfo() {
    // 判断是否存在用户信息
    if (!window.sessionStorage.getItem("userInfo")) {
        console.log("无用户信息,获取用户信息!");
        // 不存在则获取当前登录的用户信息
        return getRequest("/admin/info").then(response => {
            if (response) {
                // sessionStorage只能存储字符串, 这里需要转换一下
                window.sessionStorage.setItem("userInfo", JSON.stringify(response));
                // VueX更新用户信息
                store.commit('initCurrentAdmin',response);
                // return next();
            }
        })
    }
}

// 实例化Vue
new Vue({
    // 使用router组件
    router,
    store,
    // ES6语法,渲染App组件
    render: h => h(App)
    // 手动挂载app
}).$mount('#app')
