<!-- 登录页 -->
<template>
    <div class="loginComponents">
        <el-form class="loginContainer" ref="loginFormRef" :model="loginForm" :rules="loginRules"
                 v-loading="loading"
                 element-loading-text="正在登录...."
                 element-loading-spinner="el-icon-loading"
                 element-loading-background="rgba(0, 0, 0, 0.8)">
            <h3 class="loginTitle">系统登录</h3>
            <el-form-item prop="username">
                <el-input type="text" v-model="loginForm.username" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input type="password" auto-complete="false" v-model="loginForm.password"
                          placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item prop="code" style="border: crimson solid 0px">
                <el-input type="text" v-model="loginForm.code" placeholder="点击图片更换验证码"
                          style="width: 250px;margin-right: 5px"></el-input>
                <img class="loginCaptcha" :src="captchaUrl" @click="updateCaptcha">
            </el-form-item>
            <el-form-item>
                <el-checkbox class="loginRememberMe" v-model="RememberMe">记住我</el-checkbox>
                <el-button type="primary" style="width: 100%" @click="submitLogin">登录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>

    export default {
        name: "Login",
        data() {
            return {
                // 验证码路径
                captchaUrl: '/captcha?time=' + new Date(),
                // 表单属性
                loginForm: {
                    username: 'admin',
                    password: '123',
                    // 验证码
                    code: ''
                },
                // 记住我
                RememberMe: true,
                // 表单校验规则
                loginRules: {
                    username: [
                        {required: true, message: '请输入用户名', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ],
                    code: [
                        {required: true, message: '请输入验证码', trigger: 'blur'}
                    ]
                },
                // loading加载
                loading: false
            }
        },
        methods: {
            // 刷新验证码
            updateCaptcha() {
                this.captchaUrl = '/captcha?time=' + new Date();
                // 获取验证码文本 - 仅测试时开放
                // this.getRequest('/captchaText').then(res=>{
                //     this.loginForm.code = res;
                // })
            },
            // 登录
            submitLogin() {
                this.loading = true;
                this.$refs.loginFormRef.validate((valid) => {
                    if (valid) {
                        this.postRequest('/login', this.loginForm).then(response => {
                            if (response) {
                                // 保存token
                                window.sessionStorage.setItem('token', response.data.tokenHead + response.data.token);
                                // push与replace的区别: push允许浏览器后退,replace是替换页面,浏览器无法后退
                                // this.$router.replace("/home");
                                // 存储用户想要访问的页面
                                let path = this.$route.query.redirect;
                                // console.log("跳转到" + path);
                                // 当访问页面存在时, 先引导用户跳转到登录, 待用户登录后跳回用户想访问的页面
                                this.$router.replace((path === undefined || path === '/') ? '/home' : path);
                                this.loading = false;
                            }
                            this.loading = false;
                        }).catch(err => {
                            this.loading = false;
                        })
                    } else {
                        this.loading = false;
                        this.$message.error('请输入登录信息!');
                        return false;
                    }
                });
            }
        },
    }
</script>

<style scoped>
    .loginContainer {
        border-radius: 15px;
        background-clip: padding-box;
        margin: 90px auto;
        width: 358px;
        padding: 15px 35px 15px 35px;
        background-color: #fff;
        border: 1px solid #cacaca;
        box-shadow: 0 0 25px #cac6c6;
    }

    .loginTitle {
        margin: 0px auto 40px auto;
        text-align: center;
    }

    .loginCaptcha {
        margin-bottom: -15px;
        width: 102px;
        height: 40px;
    }

    .loginRememberMe {
        text-align: left;
        margin: 0px 0px 2px 0px;
    }
</style>
