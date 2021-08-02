import Vue from "vue";
import Vuex from "vuex";


import {getRequest} from "../utils/api";
import SockJs from 'sockjs-client';
import Stomp from 'stompjs';
import {Notification} from 'element-ui';

Vue.use(Vuex);

const now = new Date();

const store = new Vuex.Store({
    // 属性
    state: {
        // 菜单
        routes: [],
        // 当前用户信息
        currentAdmin: JSON.parse(window.sessionStorage.getItem('userInfo')),

        // 集成vue-Chat-------->
        //
        sessions: {},
        // 自己定义数组,存放获取的其它用户
        admins: [],
        // 当前选中的用户
        currentSession: null,
        filterKey: '',
        stomp: null,
        // 小红点
        isDot: {}
    },
    // 改变属性 -- 同步执行
    mutations: {
        // 初始化菜单信息
        initRoutes(state, data) {
            console.log("菜单进入VueX...");
            state.routes = data;
        },
        // 更新当前用户信息
        initCurrentAdmin(state, data) {
            console.log("用户信息进入VueX...");
            state.currentAdmin = data;
        },


        // 集成vue-Chat----------->
        changeCurrentSession(state, currentSession) {
            state.currentSession = currentSession;
            // 小红点
            Vue.set(state.isDot, state.currentAdmin.username + '#' + state.currentSession.username, false);
        },
        addMessage(state, msg) {
            let mss = state.sessions[state.currentAdmin.username + '#' + msg.to];
            if (!mss) {
                // 此种方式Vue监听不到值的改变
                // state.sessions[state.currentAdmin.username + '#' + msg.to] = [];
                // 手动提交sessions的改变
                Vue.set(state.sessions, state.currentAdmin.username + '#' + msg.to, []);
            }
            // 存入sessions
            state.sessions[state.currentAdmin.username + '#' + msg.to].push({
                content: msg.content,
                date: new Date(),
                self: !msg.notSelf
            })
        },
        INIT_DATA(state) {
            // 浏览器本地的历史聊天记录 -- 消息已经在store改变时被VueX的监听获取到并存入了localStorage中
            let data = localStorage.getItem('vue-chat-session');
            if (data) {
                state.sessions = JSON.parse(data);
            }
            // 持久化直接从数据库读取
        },
        // 改变admins的值
        INIT_ADMINS(state, data) {
            state.admins = data;
        }
    },
    // 改变属性 -- 异步执行
    actions: {
        // 集成vue-Chat----------->
        // 获取用户列表与之前存入localStorage的消息
        initData(context) {
            // 从localStorage中获取消息
            context.commit('INIT_DATA');
            // 调用后台接口获取用户列表
            getRequest('/chat/admin').then(response => {
                if (response) {
                    context.commit('INIT_ADMINS', response);
                }
            })
        },

        // 连接websocket
        connect(context) {
            // 连接至/ws/ep端点
            context.state.stomp = Stomp.over(new SockJs('/ws/ep'));
            // 获取token
            let token = window.sessionStorage.getItem("token")
            // 将token传入连接   {'Authorization': token} ==> 后端定义
            context.state.stomp.connect({'Authorization': token}, success => {
                // 订阅消息频道(发送的地址 /queue/chat ,默认需要加上/user) msg就是消息
                context.state.stomp.subscribe('/user/queue/chat', msg => {
                    // 接收消息
                    // console.log(msg.body);
                    // 消息转为对象
                    let receiveMsg = JSON.parse(msg.body);
                    // -------- 消息提示 start ------
                    // 情况一: 谁都没有选中此时currentSession为null, 需要提示
                    // if (!context.state.currentSession)
                    // 情况二: 当前接收到的消息的发送人与当前聊天的人不是同一人, 需要提示
                    // if (receiveMsg.from !== context.state.currentSession.username)
                    if (!context.state.currentSession || receiveMsg.from !== context.state.currentSession.username) {
                        console.log(receiveMsg);
                        // 消息弹窗提示
                        Notification.info({
                            title: '[' + receiveMsg.formNickName + ']发来一条消息!',
                            message: receiveMsg.content.length > 10 ? receiveMsg.content.substr(0, 10) : receiveMsg.content,
                            position: 'bottom-right',
                        });
                        // 小红点提示
                        Vue.set(context.state.isDot, context.state.currentAdmin.username + '#' + receiveMsg.from, true);
                    }
                    // 设置不是自己的消息
                    receiveMsg.notSelf = true;
                    // 接收消息,转换消息接收人
                    receiveMsg.to = receiveMsg.from;
                    // 提交接收到的消息
                    context.commit('addMessage', receiveMsg);
                })
            }, error => {

            })
        }
    }
})

// 监听
store.watch(function (state) {
    return state.sessions
}, function (val) {
    // 当session有变化时
    console.log('CHANGE: ', val);
    // 存入localStorage中 key为vue-chat-session
    localStorage.setItem('vue-chat-session', JSON.stringify(val));
    // 思考,持久化从此处入手,将消息存入数据库
}, {
    deep: true/*这个貌似是开启watch监测的判断,官方说明也比较模糊*/
})


export default store;
