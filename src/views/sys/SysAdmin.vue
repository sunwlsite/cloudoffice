<template>
    <div>
        <!--        管理员管理-->
        <div style="display: flex;justify-content: center;margin: 10px 0;">
            <el-input v-model="keywords" placeholder="通过用户名搜索..." prefix-icon="el-icon-search"
                      style="width: 500px;margin-right: 10px;" @keydown.enter.native="doSearch"></el-input>
            <el-button type="primary" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </div>
        <div style="display: flex;justify-content: space-around;flex-wrap: wrap;">
            <el-card class="box-card" v-for="(admin,index) in admins" :key="index">
                <div slot="header" class="clearfix">
                    <span>{{admin.name}}</span>
                    <el-button style="float: right; padding: 3px 0;color: red" type="text" icon="el-icon-delete"
                               @click="deleteAdmin(admin)">删除
                    </el-button>
                </div>
                <div>
                    <div style="width: 100%;display: flex;justify-content: center;">
                        <img :src="admin.user_face" :alt="admin.name" :title="admin.name"
                             style="width: 64px;height: 64px;border-radius: 64px;"/>
                    </div>
                    <div style="font-size: 14px;color: #409eff;">
                        <div style="margin-top: 4px;">用户名: {{admin.name}}</div>
                        <div style="margin-top: 4px;">手机号码: {{admin.phone}}</div>
                        <div style="margin-top: 4px;">固定电话: {{admin.telephone}}</div>
                        <div style="margin-top: 4px;">地址: {{admin.address}}</div>
                        <div style="margin-top: 4px;">用户状态:
                            <el-switch v-model="admin.enabled"
                                       active-color="#13ce66"
                                       inactive-color="#ff4949"
                                       active-text="启用"
                                       inactive-text="禁用"
                                       @change="enabledChange(admin)">
                            </el-switch>
                        </div>
                        <div style="margin-top: 4px;">用户角色:
                            <el-tag size="small" type="success" v-for="(role,rindex) in admin.roles" :key="rindex"
                                    style="margin-right: 4px;">{{role.name_zh}}
                            </el-tag>
                            <el-popover
                                    placement="right"
                                    title="角色列表"
                                    width="200"
                                    trigger="click"
                                    @show="showPopover(admin)"
                                    @hide="hidePopover(admin)">
                                <el-select v-model="selectRoles" multiple placeholder="请选择">
                                    <el-option
                                            v-for="(r,index) in allRoles"
                                            :key="index"
                                            :label="r.name_zh"
                                            :value="r.id">
                                    </el-option>
                                </el-select>
                                <el-button slot="reference" type="text" icon="el-icon-more"></el-button>
                            </el-popover>

                        </div>
                        <div>
                            备注: {{admin.remark}}
                        </div>
                    </div>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script>
    export default {
        name: "SysAdmin",
        data() {
            return {
                // 所有操作员信息
                admins: [],
                // 搜索关键字
                keywords: '',
                // 所有角色
                allRoles: [],
                // 选中的角色id数组
                selectRoles: []
            }
        },
        methods: {
            // 获取所有操作员
            initAdmins() {
                this.getRequest('/system/admin/').then(response => {
                    if (response) {
                        this.admins = response;
                    }
                })
            },
            // 搜索
            doSearch() {
                this.getRequest('/system/admin/?keywords=' + this.keywords).then(response => {
                    if (response) {
                        this.admins = response;
                    }
                })
            },
            // 删除
            deleteAdmin(data) {
                // 提示框
                this.$confirm('此操作将永久删除管理员[' + data.name + '], 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 调用删除接口 --- 需修改后端删除接口, 不能删除与员工有关联的数据
                    this.deleteRequest('/system/admin/' + data.id).then(response => {
                        if (response) {
                            // 删除后重新获取,刷新列表
                            this.initAdmins();
                        }
                    })
                }).catch(() => {
                    this.$message.info("已取消删除!");
                })
            },
            // 更新 -- switch改变事件
            enabledChange(admin) {
                this.putRequest('/system/admin/', admin).then(response => {
                    if (response) {
                        this.initAdmins();
                    }
                })
            },
            // 获取所有角色
            initAllRoles() {
                this.getRequest('/system/admin/roles').then(response => {
                    if (response) {
                        this.allRoles = response;
                    }
                })
            },
            // 弹出框事件, 显示时触发
            showPopover(admin) {
                // 调用获取角色接口
                this.initAllRoles();
                // 获取当前卡片中用户的角色信息
                let roles = admin.roles;
                this.selectRoles = [];
                roles.forEach(r => {
                    this.selectRoles.push(r.id);
                })
            },
            // 弹出框事件, 隐藏时触发
            hidePopover(admin) {
                let flag = false;
                let roles = [];
                Object.assign(roles, admin.roles);
                // 用户角色数量与选择的数量不一致, 表示有变更
                if (roles.length !== this.selectRoles.length) {
                    flag = true;
                } else {
                    // 循环用户的角色
                    for (let i = 0; i < roles.length; i++) {
                        let role = roles[i];
                        // 循环选择的角色id
                        for (let a = 0; a < this.selectRoles.length; a++) {
                            let sr = this.selectRoles[a];
                            // 当用户的角色id与选择的角色id相同
                            if (role.id === sr) {
                                // 将用户的角色删除
                                roles.splice(i, 1);
                                i--; // 删除后将索引减1
                                break;
                            }
                            console.log(roles.length);
                        }
                    }
                    // 当用户的角色数组长度经过对比删减后不等于0时,表示有变更
                    if (roles.length !== 0) {
                        flag = true;
                    }
                }
                if (flag) {
                    let url = '/system/admin/role?adminId=' + admin.id;
                    // 遍历所有选中的角色id,拼接至请求地址
                    this.selectRoles.forEach(sr => {
                        url += '&rids=' + sr;
                    })
                    this.putRequest(url).then(response => {
                        if (response) {
                            this.initAdmins();
                        }
                    })
                }
            }
        },
        mounted() {
            this.initAdmins();
        }
    }
</script>

<style scoped>
    .box-card {
        width: 300px;
        margin: 10px 20px;
    }
</style>
