<template>
    <div>
        <div style="display: flex;justify-content: space-between;margin-bottom: 10px;">
            <el-button type="primary" icon="el-icon-plus" @click="showAddSalView">添加工资账套
            </el-button>
            <el-button type="success" icon="el-icon-refresh" @click="initSalTableData">刷新</el-button>
        </div>
        <div>
            <el-table :data="salTableData" stripe border style="width: 100%">
                <el-table-column type="selection" width="50"></el-table-column>
                <el-table-column prop="name" label="账套名称" width="100"></el-table-column>
                <el-table-column prop="basicSalary" label="基本工资" width="80"></el-table-column>
                <el-table-column prop="lunchSalary" label="午餐补助" width="60"></el-table-column>
                <el-table-column prop="trafficSalary" label="交通补助" width="60"></el-table-column>
                <el-table-column prop="bonus" label="奖金" width="80"></el-table-column>
                <el-table-column prop="createDate" label="启用时间" width="100"></el-table-column>
                <el-table-column label="养老金" align="center">
                    <el-table-column prop="pensionBase" label="基数" width="60"></el-table-column>
                    <el-table-column prop="pensionPer" label="比例" width="60"></el-table-column>
                </el-table-column>
                <el-table-column label="医疗保险" align="center">
                    <el-table-column prop="medicalBase" label="基数" width="60"></el-table-column>
                    <el-table-column prop="medicalPer" label="比例" width="60"></el-table-column>
                </el-table-column>
                <el-table-column label="公积金" align="center">
                    <el-table-column prop="accumulationFundBase" label="基数" width="60"></el-table-column>
                    <el-table-column prop="accumulationFundPer" label="比例" width="60"></el-table-column>
                </el-table-column>
                <!--                <el-table-column prop="allSalary" label="应发工资" width="100"></el-table-column>-->
                <el-table-column label="操作" style="display: flex;justify-content: center;">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" @click="editSal(scope.row)">编辑</el-button>
                        <el-button type="danger" size="mini" @click="deleteSal(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <el-dialog
                :title="dialogTitle"
                :visible.sync="dialogVisible"
                width="50%">
            <div style="display: flex;justify-content: space-around;align-items: center;">
                <el-steps direction="vertical" :active="activeStepIndex">
                    <el-step :title="step" v-for="(step,index) in addSalStepsName" :key="index"></el-step>
                </el-steps>
                <el-input :placeholder="'请输入'+addSalStepsName[index]+'...'" v-for="(value,title,index) in salayData"
                          :key="index"
                          v-model="salayData[title]"
                          v-show="activeStepIndex === index" style="width: 200px;"></el-input>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="backStep">{{activeStepIndex === 10? '取消':'上一步'}}</el-button>
                <el-button type="primary" @click="nextStep">{{activeStepIndex === 10? '提交':'下一步'}}</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "SalSob",
        data() {
            return {
                // 所有工资账套数据
                salTableData: [],
                // 对话框
                dialogVisible: false,
                dialogTitle: '',
                // 添加账套步骤名称
                addSalStepsName: [
                    '账套名称', '基本工资',
                    '午餐补助', '交通补助',
                    '奖金',
                    '养老金基数', '养老金比例',
                    '医疗保险基数', '医疗保险比例',
                    '公积金基数', '公积金比例',
                ],
                // 激活的步骤
                activeStepIndex: 0,
                // 步骤数据
                salayData: {
                    name: '未指定名称',
                    basicSalary: 0,
                    lunchSalary: 0,
                    trafficSalary: 0,
                    bonus: 0,
                    pensionBase: 0,
                    pensionPer: 0,
                    medicalBase: 0,
                    medicalPer: 0,
                    accumulationFundBase: 0,
                    accumulationFundPer: 0
                }
            }
        },
        methods: {
            // 初始化工资账套表格数据
            initSalTableData() {
                this.getRequest('/salary/sob/').then(response => {
                    if (response) {
                        this.salTableData = response;
                    }
                })
            },
            // 添加工资账套对话框
            showAddSalView() {
                this.dialogTitle = '添加工资账套';
                // 还原激活步骤为第一步
                this.activeStepIndex = 0;
                // 清除已有的添加数据
                this.salayData = {
                    name: '',
                    basicSalary: 0,
                    lunchSalary: 0,
                    trafficSalary: 0,
                    bonus: 0,
                    pensionBase: 0,
                    pensionPer: 0,
                    medicalBase: 0,
                    medicalPer: 0,
                    accumulationFundBase: 0,
                    accumulationFundPer: 0
                };
                // 显示
                this.dialogVisible = true;
            },
            // 步骤条 下一步
            nextStep() {
                // 共10个步骤, 当激活index为10时提交数据
                if (this.activeStepIndex === 10) {
                    // 如果salayData的id存在,说明这是一个更新操作,否则默认为添加操作
                    if (this.salayData.id) {
                        this.putRequest('/salary/sob/',this.salayData).then(response=>{
                            if(response){
                                this.initSalTableData();
                                // 关闭对话框
                                this.dialogVisible = false;
                            }
                        })
                    } else {
                        this.postRequest('/salary/sob/', this.salayData).then(response => {
                            if (response) {
                                // 添加完成后重新获取所有数据
                                this.initSalTableData();
                                // 关闭对话框
                                this.dialogVisible = false;
                            }
                        })
                    }
                    return;
                }
                // 每点击下一步激活下一步的index
                this.activeStepIndex++;
            },
            // 步骤条 上一步
            backStep() {
                // 激活的步骤index为0时不允许上一步
                if (this.activeStepIndex === 0) {
                    return;
                } else if (this.activeStepIndex === 10) {
                    // 关闭对话框
                    this.dialogVisible = false;
                    return;
                }
                // 每点击上一步激活上一步的index
                this.activeStepIndex--;
            },
            // 编辑账套 - 对话框
            editSal(data) {
                this.showAddSalView();
                this.dialogTitle = '编辑工资账套';
                // 显示
                // this.dialogVisible = true;
                console.log(data);
                // this.salayData = data;
                // data与salayData定义的属性顺序可能不一样,这里一一赋值
                this.salayData.id = data.id;
                this.salayData.name = data.name;
                this.salayData.basicSalary = data.basicSalary;
                this.salayData.lunchSalary = data.lunchSalary;
                this.salayData.trafficSalary = data.trafficSalary;
                this.salayData.bonus = data.bonus;
                this.salayData.pensionBase = data.pensionBase;
                this.salayData.pensionPer = data.pensionPer;
                this.salayData.medicalBase = data.medicalBase;
                this.salayData.medicalPer = data.medicalPer;
                this.salayData.accumulationFundBase = data.accumulationFundBase;
                this.salayData.accumulationFundPer = data.accumulationFundPer;
            },
            // 删除账套
            deleteSal(data) {
                // 提示框
                this.$confirm('此操作将永久删除账套[' + data.name + '], 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 调用删除接口 --- 需修改后端删除接口, 不能删除与员工有关联的数据
                    this.deleteRequest('/salary/sob/' + data.id).then(response => {
                        if (response) {
                            this.initSalTableData();
                        }
                    })
                }).catch(() => {
                    this.$message.info("已取消删除!");
                })
            }
        },
        mounted() {
            this.initSalTableData();
        }
    }
</script>

<style scoped>

</style>
