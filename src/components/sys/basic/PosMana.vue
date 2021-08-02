<template>
    <div>
        <!--        职位管理-component-->
        <div>
            <el-input
                    class="addPosInput"
                    size="small"
                    placeholder="添加职位..."
                    suffix-icon="el-icon-plus"
                    @keydown.enter.native="addPosition"
                    v-model="position.name">
                <!--键盘回车事件 @keydown.enter.native-->
            </el-input>
            <el-button icon="el-icon-plus" type="primary" size="small" @click="addPosition">添加</el-button>
        </div>
        <div class="posManaMain">
            <el-table
                    :data="positionList"
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
                        label="职位"
                        width="120">
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
                        <el-tag v-else="scope.row.enable" type="danger">未启用</el-tag>
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
        <el-dialog title="编辑职位"
                   :visible.sync="dialogVisible"
                   width="30%">
            <table>
                <tr>
                    <td>
                        <el-tag>职位名称</el-tag>
                    </td>
                    <td>
                        <el-input v-model="updatePos.name" class="updatePosInput" size="small"></el-input>
                    </td>
                </tr>
                <tr>
                    <td>
                        <el-tag>是否启用</el-tag>
                    </td>
                    <td>
                        <el-switch v-model="updatePos.enabled"
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
                <el-button type="primary" @click="doUpdatePos">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "PosMana",
        data() {
            return {
                // 添加信息
                position: {
                    name: ''
                },
                // 所有信息
                positionList: [],
                // 编辑框
                dialogVisible: false,
                // 更新信息
                updatePos: {
                    name: '',
                    enabled: ''
                },
                // 多选
                multipleSelection: []
            }
        },
        methods: {
            // 获取所有职位
            initPositionList() {
                this.getRequest('/system/basic/pos/').then(response => {
                    if (response) {
                        this.positionList = response
                    }
                })
            },
            // 添加
            addPosition() {
                // 点击添加, 当名称不为空时调用添加职位接口
                if (this.position.name) {
                    this.postRequest('/system/basic/pos/', this.position).then(response => {
                        if (response) {
                            // 调用成功后再次去获取所有职位,将添加的职位也显示出来
                            this.initPositionList();
                            // 清空输入框
                            this.position.name = '';
                        }
                    })
                } else {
                    this.$message.error("职位名称不能为空!");
                }
            },
            // 显示编辑界面
            showEditView(index, data) {
                // 将当前行的信息赋值给updatePos
                // this.updatePos = data; // 这里使用直接赋值的形式会使编辑时显示的值与输入框的值一同修改,当取消时显示的值会保留输入值,只有刷新页面才能显示正确的值
                // 不使用直接赋值的方式, 使用数据拷贝的方式
                Object.assign(this.updatePos, data);
                // 时间因为格式可能会有问题, 且更新后台会自己处理这个参数, 这里直接设置为空
                this.updatePos.create_date = '';
                // 转换字符串为boolean值
                this.updatePos.enabled = JSON.parse(data.enabled);
                this.dialogVisible = true;
            },
            // 更新信息
            doUpdatePos() {
                this.dialogVisible = false;
                this.putRequest('/system/basic/pos/', this.updatePos).then(response => {
                    if (response) {
                        // 重新查询所有信息, 显示更新后的信息
                        this.initPositionList();
                        // 关闭编辑界面
                        this.dialogVisible = false;
                    }
                })
            },
            // 删除
            handleDelete(index, data) {
                // 提示框
                this.$confirm('此操作将永久删除职位[' + data.name + '], 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 调用删除接口 --- 需修改后端删除接口, 不能删除与员工有关联的数据
                    this.deleteRequest('/system/basic/pos/' + data.id).then(response => {
                        if (response) {
                            // 删除后也需要去重新获取所有职位, 刷新列表
                            this.initPositionList();
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
                this.$confirm('此操作将永久删除这[' + this.multipleSelection.length + ']条职位, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let ids = '?';
                    this.multipleSelection.forEach(item => {
                        ids += 'ids=' + item.id + '&';
                    })
                    // 调用批量删除接口 --- 需修改后端删除接口, 不能删除与员工有关联的数据
                    this.deleteRequest('/system/basic/pos/' + ids).then(response => {
                        if (response) {
                            // 批量删除后也需要去重新获取所有职位, 刷新列表
                            this.initPositionList();
                        }
                    })
                }).catch(() => {
                    this.$message.info("已取消删除!");
                })
            }
        },
        // created() {
        //     this.initPositionList();
        // }
        // 页面要加载的数据一般放在mounted钩子中, 这里就不放在create中了
        mounted() {
            this.initPositionList();
        }
    }
</script>

<style scoped>
    .addPosInput {
        width: 200px;
        margin-right: 10px;
    }

    .posManaMain {
        margin-top: 20px;
        margin-bottom: 10px;
    }

    .updatePosInput {
        width: 200px;
        margin-left: 10px;
    }
</style>
