// 封装菜单请求工具类

// 导入自定义封装请求
import {getRequest} from "./api";

// 初始化菜单
export const initMenu = (router, store) => {
    console.log("初始化菜单...");
    // 当VueX中已经有了菜单时,不再初始化
    if (store.state.routes.length > 0) {
        console.log("VueX已有菜单...");
        return;
    }
    // 请求菜单数据(后端接口是直接用当前登录的用户ID来查询此用户所能访问的接口)
    getRequest('/menu').then(data => {
        console.log("获取菜单...");
        // 后端返回的数据不能出现component为null的情况, 否则无法动态添加路由
        // 本来我这里返回了最顶级的根路由, component为null, router.addRoute/addRoutes一直添加不进去
        // 后台查的时候去掉component为null的根路由就可以了
        if (data) {
            // 格式化后的Router
            let fmtRoutes = formatRoutes(data);
            // 添加路由
            // console.log("===router.addRoutes==已废弃的方法==>");
            // router.addRoutes(fmtRoutes); // 已废弃, 可以添加一个路由数组
            for (let i = 0; i < fmtRoutes.length; i++) {
                router.addRoute(fmtRoutes[i]); // 只能添加一个路由对象
            }
            // 将路由存入VueX
            store.commit('initRoutes', fmtRoutes);
            // 连接websocket
            store.dispatch('connect');
        }
    }).catch(err => {
        console.log(err)
    })
}


// 格式化菜单
export const formatRoutes = (routes) => {
    let fmRoutes = [];
    routes.forEach(route => {
            // 路由需要的数据
            let {path, component, name, iconCls, children} = route;
            // 子路由有值且为array , component的值不为空
            if (children && children instanceof Array && component !== null) {
                // 递归组装子路由
                children = formatRoutes(children);
            }
            // 格式化菜单
            let fmRouter = {
                path: path,
                name: name,
                iconCls: iconCls,
                children: children,
                component(resolve) {
                    // 返回数据的component是否以特定字符开头, 是则加载对应路径下的组件
                    if (component.startsWith("Home")) {
                        require(['../views/' + component + '.vue'], resolve);
                    } else if (component.startsWith("Emp")) {
                        require(['../views/emp/' + component + '.vue'], resolve);
                    } else if (component.startsWith("Per")) {
                        require(['../views/per/' + component + '.vue'], resolve);
                    } else if (component.startsWith("Sal")) {
                        require(['../views/sal/' + component + '.vue'], resolve);
                    } else if (component.startsWith("Sta")) {
                        require(['../views/sta/' + component + '.vue'], resolve);
                    } else if (component.startsWith("Sys")) {
                        require(['../views/sys/' + component + '.vue'], resolve);
                    }
                }
            }
            // 后端返回的数据不能出现component为null的情况, 否则无法动态添加路由
            fmRoutes.push(fmRouter);
        }
    )
    return fmRoutes;
}
