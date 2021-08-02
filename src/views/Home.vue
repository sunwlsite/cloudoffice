<template>
    <div>
        <el-container>
            <el-header class="homeHeader">
                <div class="homeTitle">CloudOffice</div>
                <div style="margin-top: 10px;">
                    <el-button type="text" icon="el-icon-bell" size="medium" style="margin-right: 6px;"
                               @click="goChat"></el-button>
                    <el-dropdown class="userInfo" @command="userInfoCommandHandle">
                      <span class="userInfo_face">
                          {{userInfo.name}}<i><img
                              :src="userInfo.user_face"/></i>
                      </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="userInfo">个人中心</el-dropdown-item>
                            <el-dropdown-item command="setting">设置</el-dropdown-item>
                            <el-dropdown-item command="logout">退出</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
            </el-header>
            <el-container>
                <el-aside width="200px">
                    <el-menu router unique-opened> <!--启用路由模式,使用index作为跳转路径-->
                        <!-- 侧边菜单 -->
                        <el-submenu :index="index+''" v-for="(item,index) in routes" :key="index" v-if="!item.hidden">
                            <template slot="title">
                                <i :class="item.iconCls" style="color: #1186ee;margin-right: 5px"></i><!--forestgreen-->
                                <span>{{item.name}}</span>
                            </template>
                            <el-menu-item :index="child.path" v-for="(child,cindex) in item.children" :key="cindex">
                                {{child.name}}
                            </el-menu-item>
                        </el-submenu>
                    </el-menu>
                </el-aside>
                <el-main>
                    <el-breadcrumb separator-class="el-icon-arrow-right"
                                   v-if="this.$router.currentRoute.path !== '/home'">
                        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
                        <el-breadcrumb-item>{{this.$router.currentRoute.name}}</el-breadcrumb-item>
                    </el-breadcrumb>
                    <!--只在首页时显示-->
                    <div v-if="this.$router.currentRoute.path === '/home'">
                        欢迎
                    </div>
                    <router-view style="margin-top: 10px"/>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script>
    export default {
        name: "Home",
        data() {
            return {
                // sessionStorage存储的是字符串,这里需要转换成对象    ==>从VueX中获取
                // userInfo: JSON.parse(window.sessionStorage.getItem('userInfo'))
            }
        },
        methods: {
            // 个人信息下拉菜单 退出登录
            userInfoCommandHandle(command) {
                if (command === 'logout') {
                    // 提示框
                    this.$confirm('此操作将退出系统, 是否继续?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        // 确定则开始执行退出登录操作
                        this.postRequest('/logout');
                        // 退出登录, 移除session中存储的token信息和用户信息
                        window.sessionStorage.removeItem('token');
                        window.sessionStorage.removeItem("userInfo");
                        // 清空VueX中的菜单信息
                        this.$store.commit('initRoutes', []);
                        // 返回登录页面
                        this.$router.replace("/");
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '取消'
                        });
                    });

                }
                if (command === 'userInfo') {
                    this.$router.push('/info');
                }
            },
            // 前往websocket聊天页面
            goChat() {
                this.$router.push('/chat');
            }
        },
        // 计算属性
        computed: {
            routes() {
                // 从VueX中获取routes
                return this.$store.state.routes;
            },
            userInfo(){
                // 从VueX中获取当前用户信息
                return this.$store.state.currentAdmin;
            }
        },
        // 初始化钩子
        created() {
            // 再次拦截
            if (!window.sessionStorage.getItem('token')) {
                this.$message.error("未登录,请登录后再访问!")
                return this.$router.replace("/");
            }
        },
    }
</script>

<style scoped>
    .homeHeader {
        /*背景*/
        background: rgba(22, 24, 24, 0.8);
        /*居中*/
        display: flex;
        align-items: center;
        /*去除空格*/
        justify-content: space-between;
        /*内边距*/
        padding: 0 15px;
        /*并排放置两个带边框的框*/
        box-sizing: border-box;
    }

    .homeTitle {
        font-size: 30px;
        font-family: 宋体;
        color: #ffffff;
    }

    .userInfo {
        /*鼠标悬停 光标样式*/
        cursor: pointer;
        color: white;
        font-family: 微软雅黑;
    }

    .userInfo_face img {
        width: 48px;
        height: 48px;
        /*圆角*/
        border-radius: 24px;
        margin-left: 8px;
    }
</style>
