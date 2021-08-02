<template>
    <div style="width: 50%;">
        <!--        部门管理-component-->
        <div>
            <el-input placeholder="输入部门进行搜索..." v-model="filterText" size="small"
                      prefix-icon="el-icon-search" style="margin-bottom: 12px;"></el-input>
            <!-- 树形控件 --><!--节点方法filter-node-method-->
            <el-tree :data="deps" :props="defaultProps" :filter-node-method="filterNode" :expand-on-click-node="false"
                     ref="treeRef">
                <!--定义节点操作按钮-->
                <span slot-scope="{node,data}" style="display: flex;justify-content: space-between;width: 100%;">
                    <span>{{data.name}}</span><!--树形控件绑定了defaultProps,此处data.name与node.label相等-->
                    <span>
                        <el-button type="primary" size="mini" @click="()=>showAddDep(data)"
                                   class="depBtn">添加部门</el-button>
                        <el-button type="danger" size="mini" @click="()=>deleteDep(data)"
                                   class="depBtn">删除部门</el-button>
                    </span>
                </span>
            </el-tree>

        </div>

        <el-dialog title="添加部门"
                   :visible.sync="dialogVisible"
                   width="30%">
            <table>
                <tr>
                    <td>
                        <el-tag>上级部门</el-tag>
                    </td>
                    <td>
                        {{pName}}
                    </td>
                </tr>
                <tr>
                    <td>
                        <el-tag>部门名称</el-tag>
                    </td>
                    <td>
                        <el-input v-model="addDep.name" size="small" placeholder="输入部门名称..."
                                  style="margin-left: 8px;"></el-input>
                    </td>
                </tr>
            </table>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="doAddDep">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "DepMana",
        data() {
            return {
                // 搜索关键字
                filterText: '',
                // 所有部门数据
                deps: [],
                // 树形控件显示数据
                defaultProps: {
                    children: 'children',
                    label: 'name'
                },
                // 弹出框
                dialogVisible: false,
                // 添加部门
                addDep: {
                    name: '',
                    parent_id: -1
                },
                pName: '',
            }
        },
        methods: {
            // 获取所有部门数据
            initDeps() {
                this.getRequest('/system/basic/department/').then(response => {
                    if (response) {
                        this.deps = response;
                    }
                })
            },
            // 拦截节点
            filterNode(value, data) {
                // 观察者事件获取到值时,显示值,否则显示所有
                if (!value) return true;
                return data.name.indexOf(value) !== -1;
            },
            // 添加部门按钮点击事件
            showAddDep(data) {
                // 当添加部门弹出框打开时, 将节点数据赋值给addDep
                this.pName = data.name;
                this.addDep.parent_id = data.id;
                this.dialogVisible = true;
            },
            // 删除部门按钮点击事件
            deleteDep(data) {
                if (data.is_parent === '1') {
                    this.$message.error("该部门下还有子部门,无法删除!")
                } else {
                    // 提示框
                    this.$confirm('此操作将永久删除部门[' + data.name + '], 是否继续?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        // 调用删除接口 --- 需修改后端删除接口, 不能删除与员工有关联的数据
                        this.deleteRequest('/system/basic/department/' + data.id).then(response => {
                            if (response) {
                                // 删除后也需要手动将删除的部门从树形控件中移除
                                this.removeDepFromDeps(null, this.deps, data.id);
                            }
                        })
                    }).catch(() => {
                        this.$message.info("已取消删除!");
                    })
                }
            },
            // 添加部门
            doAddDep() {
                this.postRequest('/system/basic/department/', this.addDep).then(response => {
                    if (response) {
                        this.addDepToDeps(this.deps, response.data);
                        this.initAddDep();
                    }
                })
            },
            // 初始化添加数据
            initAddDep() {
                this.addDep = {
                    name: '',
                    parent_id: -1
                };
                this.pName = '';
                this.dialogVisible = false;
            },
            // 手动将添加的部门数据添加进树形控件
            addDepToDeps(deps, dep) {
                for (let i = 0; i < deps.length; i++) {
                    // 父部门
                    let d = deps[i];
                    // 判断当前id是否等于要添加数据的父id
                    if (d.id === dep.parent_id) {
                        // 在当前部门的子部门中添加信息, 并将添加后的信息重新赋值给当前部门
                        d.children = d.children.concat(dep);
                        // 如果当前部门有子部门,将当前部门的is_parent改为1
                        if(d.children.length > 0){
                            d.is_parent = 1;
                        }
                        return;
                    } else {
                        // 递归
                        this.addDepToDeps(d.children, dep);
                    }
                }
            },
            // 手动将删除的部门数据从树形控件中移除
            removeDepFromDeps(p, deps, did) {
                for (let i = 0; i < deps.length; i++) {
                    let d = deps[i];
                    // 当要删除的数据id与遍历出来的id一致时,表示这个数组中这个id就是我们需要删除的id
                    if (d.id === did) {
                        // 从当前需要删除的id开始
                        deps.splice(i, 1);
                        // 如果当前部门没有子部门了,更新deps的数据,将当前部门的is_parent改为0
                        if (deps.length === 0) {
                            p.is_parent = 0;
                        }
                        return;
                    } else {
                        // 递归
                        this.removeDepFromDeps(d, d.children, did);
                    }
                }
            }
        },
        // 观察者事件
        watch: {
            // 当filterText的值有变化时,通过ref去调用filter方法
            // 在树形控件中有:filter-node-method="filterNode"做拦截,当filterText的值与树形控件中节点匹配时,自动展开至此节点
            filterText(val) {
                // 当filterText有值时,会自动去找树形控件中匹配的值
                this.$refs.treeRef.filter(val);
            }
        },
        mounted() {
            this.initDeps();
        }
    }
</script>

<style scoped>
    .depBtn {
        padding: 2px;
    }
</style>
