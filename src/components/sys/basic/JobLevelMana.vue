<template>
    <div>
        <!--        职称管理-component-->
        <div style="margin-bottom: 20px;">
            <el-input v-model="jobLevel.name" placeholder="添加职称..." prefix-icon="el-icon-plus" style="width: 200px;"
                      size="small"></el-input>
            <el-select v-model="jobLevel.title_level" placeholder="选择职称等级" size="small"
                       style="width: 100px;margin: 0 5px;">
                <el-option v-for="item in title_levels" :key="item" :label="item" :value="item"></el-option>
            </el-select>
            <el-button size="small" type="primary" icon="el-icon-plus" @click="addJobLevel">添加</el-button>
        </div>
        <div style="margin-bottom: 10px;">
            <el-table
                    :data="jobLevels"
                    @selection-change="handleSelectionChange"
                    stripe
                    border
                    size="small"
                    style="width: 70%">
                <el-table-column
                        type="selection"
                        width="60">
                </el-table-column>
                <el-table-column
                        prop="id"
                        label="编号"
                        width="60">
                </el-table-column>
                <el-table-column
                        prop="name"
                        label="职称"
                        width="120">
                </el-table-column>
                <el-table-column
                        prop="title_level"
                        label="职称等级"
                        width="80">
                </el-table-column>
                <el-table-column
                        prop="create_date"
                        label="创建时间"
                        width="150">
                </el-table-column>
                <el-table-column
                        prop="enabled"
                        label="是否启用"
                        width="80">
                    <template slot-scope="scope">
                        <!--JSON.parse(scope.row.enabled)  将字符串转为boolean值-->
                        <el-tag v-if="JSON.parse(scope.row.enabled)" type="success">已启用</el-tag>
                        <el-tag v-else type="danger">未启用</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button
                                size="mini"
                                @click="showEditView(scope.$index, scope.row)">编辑
                        </el-button>
                        <el-button
                                size="mini"
                                type="danger"
                                @click="handleDelete(scope.$index, scope.row)">删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-button type="danger" size="small" :disabled="this.multipleSelection.length === 0" @click="deleteMany">批量删除
        </el-button>

        <!-- 编辑弹出框 -->
        <el-dialog title="编辑职称"
                   :visible.sync="dialogVisible"
                   width="30%">
            <table>
                <tr>
                    <td>
                        <el-tag>职称名称</el-tag>
                    </td>
                    <td>
                        <el-input v-model="updateJobLevel.name" size="small" style="margin-left: 8px;"></el-input>
                    </td>
                </tr>
                <tr>
                    <td>
                        <el-tag>职称等级</el-tag>
                    </td>
                    <td>
                        <el-select v-model="updateJobLevel.title_level" placeholder="选择职称等级" size="small"
                                   style="margin-left: 8px;">
                            <el-option v-for="item in title_levels" :key="item" :label="item" :value="item">{{item}}
                            </el-option>
                        </el-select>
                    </td>
                </tr>
                <tr>
                    <td>
                        <el-tag>是否启用</el-tag>
                    </td>
                    <td>
                        <el-switch v-model="updateJobLevel.enabled"
                                   active-color="#13ce66"
                                   inactive-color="#ff4949"
                                   active-text="启用"
                                   inactive-text="禁用"
                                   style="margin-left: 8px;">
                        </el-switch>
                    </td>
                </tr>
            </table>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="doUpdateJob">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "JobLevelMana",
        data() {
            return {
                // 添加信息
                jobLevel: {
                    name: '',
                    title_level: ''
                },
                // 职称等级
                title_levels: ['初级', '中级', '高级'],
                // 所有信息
                jobLevels: [],
                // 编辑框
                dialogVisible: false,
                // 更新信息
                updateJobLevel: {
                    name: '',
                    title_level: '',
                    enabled: ''
                },
                // 多选
                multipleSelection: []
            }
        },
        methods: {
            // 获取所有职称
            initJobLevels() {
                this.getRequest('/system/basic/joblevel/').then(response => {
                    if (response) {
                        this.jobLevels = response;
                        // 清空输入框中的信息
                        this.jobLevel.name = '';
                        this.jobLevel.title_level = '';
                    }
                })
            },
            // 添加职称
            addJobLevel() {
                if (this.jobLevel.name && this.jobLevel.title_level) {
                    this.postRequest('/system/basic/joblevel/', this.jobLevel).then(response => {
                        if (response) {
                            this.initJobLevels();
                        }
                    })
                } else {
                    this.$message.error("添加信息不能为空!");
                }
            },
            // 显示编辑界面
            showEditView(index, data) {
                // 将当前行的信息赋值给updatePos
                // this.updatePos = data; // 这里使用直接赋值的形式会使编辑时显示的值与输入框的值一同修改,当取消时显示的值会保留输入值,只有刷新页面才能显示正确的值
                // 不使用直接赋值的方式, 使用数据拷贝的方式
                Object.assign(this.updateJobLevel, data);
                // 时间因为格式可能会有问题, 且更新后台会自己处理这个参数, 这里直接设置为空
                this.updateJobLevel.create_date = '';
                // 转换字符串为boolean值
                this.updateJobLevel.enabled = JSON.parse(data.enabled);
                this.dialogVisible = true;
            },
            // 更新信息
            doUpdateJob() {
                this.dialogVisible = false;
                this.putRequest('/system/basic/joblevel/', this.updateJobLevel).then(response => {
                    if (response) {
                        // 重新查询所有信息, 显示更新后的信息
                        this.initJobLevels();
                        // 关闭编辑界面
                        this.dialogVisible = false;
                    }
                })
            },
            // 删除职称
            handleDelete(index, data) {
                // 提示框
                this.$confirm('此操作将永久删除职称[' + data.name + '], 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 调用删除接口 --- 需修改后端删除接口, 不能删除与员工有关联的数据
                    this.deleteRequest('/system/basic/joblevel/' + data.id).then(response => {
                        if (response) {
                            // 删除后也需要去重新获取所有职位, 刷新列表
                            this.initJobLevels();
                        }
                    })
                }).catch(() => {
                    this.$message.info("已取消删除!");
                })
            },
            // 多选
            handleSelectionChange(rows) {
                // 将选择的值赋值给multipleSelection
                this.multipleSelection = rows;
            },
            // 批量删除
            deleteMany() {
                // 提示框
                this.$confirm('此操作将永久删除这[' + this.multipleSelection.length + ']条职称, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let ids = '?';
                    this.multipleSelection.forEach(item => {
                        ids += 'ids=' + item.id + '&';
                    })
                    // 调用批量删除接口 --- 需修改后端删除接口, 不能删除与员工有关联的数据
                    this.deleteRequest('/system/basic/joblevel/' + ids).then(response => {
                        if (response) {
                            // 批量删除后也需要去重新获取所有职位, 刷新列表
                            this.initJobLevels();
                        }
                    })
                }).catch(() => {
                    this.$message.info("已取消删除!");
                })
            }
        },
        mounted() {
            // 加载所有信息
            this.initJobLevels();
        }
    }
</script>

<style scoped>

</style>
