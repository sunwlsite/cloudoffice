<template>
    <div>
        <!--        个人中心-->
        <el-card class="box-card" style="width: 400px;">
            <div slot="header" class="clearfix">
                <span>{{admin.name}}</span>
            </div>
            <div style="font-size: 15px;">
                <!-- 用户头像 -->
                <div style="display: flex;justify-content: center;margin-bottom: 10px;border: 0px solid black;">
                    <!-- 上传组件 action提交地址就是后台接口地址 -->
                    <el-upload action="/admin/userface" style="border: 0px solid red;"
                               :show-file-list=false
                               :on-success="onSuccess"
                               :on-error="onError"
                               :before-upload="beforeUpload"
                               :disabled="uploadDisabled"
                               :headers="uploadHeaders"
                               :data="admin">
                        <div style="width: 100px;height: 100px;border-radius: 50px;border: 0px solid red;"
                             v-loading="loading">
                            <img title="点击上传头像" :src="admin.user_face" :alt="admin.name"
                                 @load="loadImage"
                                 @error="imgLoadError"
                                 style="width: 100px;height: 100px;border-radius: 50px;border: 0px solid #9ca59c;"/>
                        </div>
                    </el-upload>
                </div>

                <!-- 用户其它数据 -->
                <div style="padding-left: 80px;margin-bottom: 10px;">电话号码:
                    <el-tag type="success" size="medium">{{admin.telephone}}</el-tag>
                </div>
                <div style="padding-left: 80px;margin-bottom: 10px;">手机号码:
                    <el-tag type="success" size="medium">{{admin.phone}}</el-tag>
                </div>
                <div style="padding-left: 80px;margin-bottom: 10px;">联系地址:
                    <el-tag type="success" size="medium">{{admin.address}}</el-tag>
                </div>
                <div style="padding-left: 80px;margin-bottom: 10px;">用户角色:
                    <el-tag type="warning" size="medium" v-for="(role,index) in admin.roles">{{role.name_zh}}</el-tag>
                </div>
                <div style="display: flex;justify-content: space-around;">
                    <el-button type="warning" @click="showEditInfoView">修改信息</el-button>
                    <el-button type="danger" @click="showEditPwdView">修改密码</el-button>
                </div>
            </div>
        </el-card>

        <!-- 修改信息 弹出框 -->
        <el-dialog title="修改信息"
                   :visible.sync="dialogVisible"
                   width="28%">
            <table>
                <tr>
                    <td>
                        <el-tag>用户昵称</el-tag>
                    </td>
                    <td>
                        <el-input v-model="editAdmin.name" size="small" placeholder="输入昵称..."></el-input>
                    </td>
                </tr>
                <tr>
                    <td>
                        <el-tag>电话号码</el-tag>
                    </td>
                    <td>
                        <el-input v-model="editAdmin.telephone" size="small" placeholder="输入电话号码..."></el-input>
                    </td>
                </tr>
                <tr>
                    <td>
                        <el-tag>手机号码</el-tag>
                    </td>
                    <td>
                        <el-input v-model="editAdmin.phone" size="small" placeholder="输入手机号码..."></el-input>
                    </td>
                </tr>
                <tr>
                    <td>
                        <el-tag>联系地址</el-tag>
                    </td>
                    <td>
                        <el-input v-model="editAdmin.address" size="small" placeholder="输入联系地址..."></el-input>
                    </td>
                </tr>
            </table>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="updateInfo">确定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑信息 弹出框 -->
        <el-dialog title="修改密码"
                   :visible.sync="pwdDialogVisible"
                   width="28%">
            <el-form :model="pwdEditForm" status-icon :rules="pwdEditFormRules" ref="ruleForm" label-width="100px"
                     class="demo-ruleForm">
                <el-form-item label="请输入旧密码" prop="oldPass">
                    <el-input type="password" v-model="pwdEditForm.oldPass" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="请输入新密码" prop="pass">
                    <el-input type="password" v-model="pwdEditForm.pass" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="请确认新密码" prop="checkPass">
                    <el-input type="password" v-model="pwdEditForm.checkPass" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
                    <el-button @click="resetForm('ruleForm')">重置</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>

    export default {
        name: "AdminInfo",
        data() {
            // 自定义的校验规则一定要放置在return之前,否则调用不到
            let validatePass = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入密码'));
                } else {
                    if (this.pwdEditForm.checkPass !== '') {
                        this.$refs.ruleForm.validateField('checkPass');
                    }
                    callback();
                }
            };
            let validatePass2 = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请再次输入密码'));
                } else if (value !== this.pwdEditForm.pass) {
                    callback(new Error('两次输入密码不一致!'));
                } else {
                    callback();
                }
            };
            return {
                // 当前用户信息
                admin: {},
                // 修改信息对话框
                dialogVisible: false,
                // 修改信息数据
                editAdmin: {},
                // 修改密码对话框
                pwdDialogVisible: false,
                // 修改密码表单
                pwdEditForm: {
                    pass: '',
                    checkPass: '',
                    oldPass: ''
                },
                // 修改密码校验
                pwdEditFormRules: {
                    oldPass: [
                        {validator: validatePass, trigger: 'blur'}
                    ],
                    pass: [
                        {validator: validatePass, trigger: 'blur'}
                    ],
                    checkPass: [
                        {validator: validatePass2, trigger: 'blur'}
                    ]
                },
                // 上传请求头
                uploadHeaders: {
                    Authorization: window.sessionStorage.getItem('token')
                },
                // 头像加载
                loading: true,
                // 头像上传
                uploadDisabled: false,
            };
        },
        methods: {
            // 获取当前用户信息
            initAdmin() {
                this.getRequest('/admin/info').then(response => {
                    if (response) {
                        this.admin = response;
                        // 拷贝对象,直接用editAdmin接收response的话相当于又和admin一样了,在修改editAdmin时会同步修改admin
                        this.editAdmin = Object.assign({}, this.admin);
                        // 将修改后的用户信息存入session
                        window.sessionStorage.setItem("userInfo", JSON.stringify(response));
                        // 更新VueX用户信息
                        this.$store.commit('initCurrentAdmin', response);
                    }
                })
            },
            // 修改信息 - 对话框
            showEditInfoView() {
                this.dialogVisible = true;
            },
            // 修改信息
            updateInfo() {
                this.putRequest('/admin/info', this.editAdmin).then(response => {
                    if (response) {
                        this.initAdmin();
                        this.dialogVisible = false;
                    }
                })
            },
            // 修改密码 - 对话框
            showEditPwdView() {
                this.pwdDialogVisible = true;
            },
            // 表单提交 修改密码
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        // 获取当前用户ID
                        this.pwdEditForm.adminId = this.admin.id;
                        this.putRequest('/admin/pass', this.pwdEditForm).then(response => {
                            if (response) {
                                // 调用后台退出接口
                                this.postRequest('/logout');
                                // 清空用户信息
                                window.sessionStorage.removeItem('userInfo');
                                window.sessionStorage.removeItem('token');
                                // 清空菜单数据
                                this.$store.commit('initRoutes', []);
                                // 其它session信息基本上都是枚举信息,像民族,部门,职称,职位,这些就不清空了
                                // 跳转到登录页
                                this.$router.replace('/');
                                this.$message.info('请重新登录!');
                            }
                        })
                    } else {
                        return false;
                    }
                });
            },
            // 表单重置 - 修改密码
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
            // 上传头像 -- 上传之前的钩子
            beforeUpload() {
                this.uploadDisabled = true;
                this.loading = true;
            },
            // 上传头像 -- 上传成功的钩子
            onSuccess(response) {
                this.initAdmin();
                if (response.code === 200) {
                    this.$notify.success({
                        title: '上传头像',
                        message: response.message,
                        position: 'bottom-right',
                        duration: 3000
                    });
                } else {
                    this.$notify.error({
                        title: '上传头像',
                        message: response.message,
                        position: 'bottom-right',
                        duration: 3000
                    });
                }
                this.uploadDisabled = false;
                // 关闭加载条
                this.loading = false;
            },
            // 上传组件 -- 上传失败的钩子
            onError(err) {
                this.uploadDisabled = false;
                this.$notify.error({
                    title: '上传头像',
                    message: err,
                    position: 'bottom-right',
                    duration: 3000
                });
                this.uploadDisabled = false;
                // 关闭加载条
                this.loading = false;
            },
            // 头像图片 -- 加载完成
            loadImage() {
                this.loading = false;
            },
            // 头像图片 -- 加载失败
            imgLoadError() {
                this.loading = false;
            }
        },
        mounted() {
            this.initAdmin();
        }
    }
</script>

<style scoped>

</style>
