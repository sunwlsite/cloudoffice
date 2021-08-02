<template>
    <div>
        <!--        权限组-component-->
        <div class="permissManaTool">
            <el-input placeholder="角色英文名" v-model="role.name" size="small">
                <template slot="prepend">ROLE_</template>
            </el-input>
            <el-input v-model="role.name_zh" placeholder="角色中文名" size="small"></el-input>
            <el-button size="small" type="primary" icon="el-icon-plus" @click="addRole">添加角色</el-button>
        </div>
        <div>
            <!-- el-collapse下拉菜单 -->
            <el-collapse accordion @change="change" v-model="activeName" style="width: 70%">
                <el-collapse-item :title="role.id+'  '+role.name_zh + ' <'+role.name+'>'" :name="role.id"
                                  v-for="(role,index) in roles" :key="index">
                    <el-card class="box-card">
                        <div slot="header" class="clearfix">
                            <span>可访问资源</span>
                            <el-button style="float: right;padding: 4px 0;color: red;" type="text"
                                       icon="el-icon-delete" @click="deleteRole(role)">删除角色
                            </el-button>
                        </div>
                        <div>
                            <!-- 树形控件 -->
                            <el-tree :data="allMenus" :props="defaultProps" show-checkbox
                                     :default-checked-keys="selectedMenus"
                                     node-key="id" ref="treeRef"></el-tree>
                            <!--默认展开 default-expand-all="selectedMenus" -->
                            <div style="display: flex;justify-content: flex-end">
                                <el-button type="primary" size="mini" @click="cancelUpdate">取消修改</el-button>
                                <!--传入当前展开的角色的ID,因为整个菜单是循环出来的,要更新对应的角色菜单需要通过index拿到当前角色-->
                                <el-button type="warning" size="mini" @click="doUpdate(role.id,index)">确认修改</el-button>
                            </div>
                        </div>
                    </el-card>
                </el-collapse-item>
            </el-collapse>
        </div>
    </div>
</template>

<script>
    export default {
        name: "PermissMana",
        data() {
            return {
                // 添加信息
                role: {
                    name: '',
                    name_zh: ''
                },
                // 所有角色
                roles: [],
                // el-collapse下拉菜单
                allMenus: [],
                // 下拉菜单默认展开哪条,-1 不展开
                activeName: -1,
                // 树形控件显示数据
                defaultProps: {
                    children: 'children',
                    label: 'name'
                },
                // 树形控件默认选中
                selectedMenus: [],
            }
        },
        methods: {
            // 获取所有角色信息
            initRoles() {
                this.getRequest('/system/basic/permissions/').then(response => {
                    if (response) {
                        this.roles = response;
                    }
                })
            },
            // 获取所有菜单数据
            initAllMenus() {
                this.getRequest('/system/basic/permissions/menus').then(response => {
                    if (response) {
                        this.allMenus = response;
                    }
                })
            },
            // el-collapse下拉菜单展开关闭事件,这个roleId就是:name="role.id"
            change(roleId) {
                if (roleId) {
                    // 清空树形控件默认选中, 否则可能在展开其它下拉菜单时还显示上次的数据(虽然数据改变了,但是没有及时显示到页面)
                    this.selectedMenus = [];
                    // 获取所有菜单
                    this.initAllMenus();
                    // 获取角色拥有的菜单
                    this.initSelectedMenus(roleId);
                }
            },
            // 获取角色拥有的菜单的ID, 填充进树形控件中
            initSelectedMenus(rid) {
                this.getRequest('/system/basic/permissions/mid/' + rid).then(response => {
                    if (response) {
                        this.selectedMenus = response;
                    }
                })
            },
            // 确认修改角色所拥有的菜单
            doUpdate(rid, index) {
                // 通过ref拿到树形控件,通过index拿到当前操作的树形控件
                let tree = this.$refs.treeRef[index];
                // 通过树形控件的getCheckedKeys拿到当前选中的菜单, 设置true拿到被选中的子节点
                let selectedKeys = tree.getCheckedKeys(true);
                // 设置修改菜单请求路径
                let url = '/system/basic/permissions/?rid=' + rid;
                // 遍历所有被选中的子菜单id, 拼接到URL中
                selectedKeys.forEach(key => {
                    url += '&mids=' + key;
                })
                // 修改请求
                this.postRequest(url).then(response => {
                    if (response) {
                        // 关闭展开
                        this.activeName = -1;
                    }
                })
            },
            // 取消修改
            cancelUpdate() {
                // 关闭展开
                this.activeName = -1;
            },
            // 添加角色
            addRole() {
                if (this.role.name && this.role.name_zh) {
                    this.putRequest('/system/basic/permissions/role', this.role).then(response => {
                        console.log(this.role);
                        console.log(response);
                        if (response) {
                            // 添加完成后重新获取所有角色信息
                            this.initRoles();
                            // 清空输入框
                            this.role.name = '';
                            this.role.name_zh = '';
                        }
                    })
                } else {
                    this.$message.error("添加信息不能为空!");
                }
            },
            // 删除角色
            deleteRole(role) {
                // 提示框
                this.$confirm('此操作将永久删除角色[' + role.name_zh + '], 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 调用删除接口 --- 需修改后端删除接口, 不能删除与员工有关联的数据
                    this.deleteRequest('/system/basic/permissions/role/' + role.id).then(response => {
                        if (response) {
                            // 删除后也需要去重新获取所有职位, 刷新列表
                            this.initRoles();
                        }
                    })
                }).catch(() => {
                    this.$message.info("已取消删除!");
                })
            }
        },
        mounted() {
            this.initRoles();
        }
    }
</script>

<style scoped>
    .permissManaTool {
        display: flex;
        justify-content: flex-start;
        margin-bottom: 10px;
    }

    .permissManaTool .el-input {
        width: 200px;
        margin-right: 8px;
    }
</style>
