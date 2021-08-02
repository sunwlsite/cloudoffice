import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "../views/Login";
import Home from "../views/Home";
import FriendChat from "../views/chat/FriendChat";
import AdminInfo from "../views/AdminInfo";


// 装载路由
Vue.use(VueRouter)


// 配置路由
const routes = [
    {
        path: '/',
        name: 'Login',
        component: Login,
        hidden: true,
    },
    {
        path: '/home',
        name: 'Home',
        component: Home,
        children: [
            {
                path: '/chat',
                name: '在线聊天',
                component: FriendChat,
                hidden: true
            },
            {
                path: '/info',
                name: '个人中心',
                component: AdminInfo,
                hidden: true
            }
        ]
    },
    {
        path: '*',
        redirect: '/home'
    }
]

// new vueRouter的实例, 做成函数
const router = new VueRouter({
    // 使用上面的配置
    routes
})

// 导出实例, 让其它组件可以导入这个路由
export default router
