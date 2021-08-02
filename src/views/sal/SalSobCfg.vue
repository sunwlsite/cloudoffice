<template>
    <div>
        <!--        员工账套设置-->
        <div></div>
        <div>
            <el-table
                    :data='emps'
                    stripe
                    border
                    style='width: 100%'>
                <!-- 多选框 -->
                <el-table-column type='selection' width='55'></el-table-column>
                <!-- 数据 -->
                <el-table-column prop='name' label='姓名' width='100' fixed></el-table-column>
                <el-table-column prop='work_id' label='工号' width='100'></el-table-column>
                <el-table-column prop='gender' label='性别' width='50'></el-table-column>
                <el-table-column prop='email' label='邮箱' width='180'></el-table-column>
                <el-table-column prop='phone' label='手机号' width='120'></el-table-column>
                <el-table-column prop='department.name' label='所属部门' width='160'></el-table-column>
                <el-table-column label='工资账套' width=''>
                    <template slot-scope="scope">
                        <el-tooltip placement="right" v-if="scope.row.salary">
                            <div slot="content">
                                <table>
                                    <tr>
                                        <td>基本工资</td>
                                        <td>{{scope.row.salary.basicSalary}}</td>
                                    </tr>
                                    <tr>
                                        <td>交通补助</td>
                                        <td>{{scope.row.salary.trafficSalary}}</td>
                                    </tr>
                                    <tr>
                                        <td>午餐补助</td>
                                        <td>{{scope.row.salary.lunchSalary}}</td>
                                    </tr>
                                    <tr>
                                        <td>奖金</td>
                                        <td>{{scope.row.salary.bonus}}</td>
                                    </tr>
                                    <tr>
                                        <td>养老金基数</td>
                                        <td>{{scope.row.salary.pensionBase}}</td>
                                    </tr>
                                    <tr>
                                        <td>养老金比例</td>
                                        <td>{{scope.row.salary.pensionPer}}</td>
                                    </tr>
                                    <tr>
                                        <td>医疗保险基数</td>
                                        <td>{{scope.row.salary.medicalBase}}</td>
                                    </tr>
                                    <tr>
                                        <td>医疗保险比例</td>
                                        <td>{{scope.row.salary.medicalPer}}</td>
                                    </tr>
                                    <tr>
                                        <td>公积金基数</td>
                                        <td>{{scope.row.salary.accumulationFundBase}}</td>
                                    </tr>
                                    <tr>
                                        <td>公积金比例</td>
                                        <td>{{scope.row.salary.accumulationFundPer}}</td>
                                    </tr>
                                </table>
                            </div>
                            <el-tag type="success">{{scope.row.salary.name}}...</el-tag>
                        </el-tooltip>
                        <el-tag v-else type="warning">此员工未设置工资账套</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label='操作'>
                    <template slot-scope="scope">
                        <el-popover
                                @show="showEditProp(scope.row.salary)"
                                @hide="hideEditProp(scope.row)"
                                placement="left"
                                title="编辑工资账套"
                                width="200"
                                trigger="click">
                            <div>
                                <el-select v-model="currentSalary" placeholder="请选择" size="mini" clearable>
                                    <el-option
                                            v-for="item in allSalary"
                                            :key="item.id"
                                            :label="item.name"
                                            :value="item.id">
                                    </el-option>
                                </el-select>
                            </div>
                            <el-button type="danger" slot="reference">修改工资账套</el-button>
                        </el-popover>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
            <div style='display: flex;justify-content: flex-end;margin-top: 8px;'>
                <el-pagination
                        background
                        hide-on-single-page
                        :page-sizes=[5,10,20,30,50]
                        :page-size='size'
                        @size-change='sizeChange'
                        @current-change='currentChange'
                        layout='sizes,prev, pager, next, jumper, ->, total'
                        :total='total'>
                </el-pagination>
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: "SalSobCfg",
        data() {
            return {
                // 所有员工账套数据
                emps: [],
                // 分页
                currentPage: 1,
                size: 5,
                total: 0,
                // 所有工资账套
                allSalary: [],
                // 当前工资账套
                currentSalary: null,
            }
        },
        methods: {
            // 初始化员工账套
            initEmps() {
                this.getRequest('/salary/sobcfg/?currentPage=' + this.currentPage + '&size=' + this.size).then(response => {
                    if (response) {
                        this.emps = response.data;
                        this.total = response.total;
                    }
                })
            },
            // 分页
            // el-pagination事件 currentPage 改变时会触发  当前页数会自动带进来,不需要额外拿
            currentChange(currentPage) {
                // 用currentPage接收当前页
                this.currentPage = currentPage;
                // 当前页页码改变时重新获取新页码的数据
                this.initEmps();
            },
            // el-pagination事件 pageSize 改变时会触发 同样,默认会将size带进来,我们直接使用就可以了
            sizeChange(size) {
                this.size = size;
                // 每页显示条数改变时也重新去获取数据
                this.initEmps();
            },
            // 获取所有工资账套
            initSalarys() {
                this.getRequest('/salary/sobcfg/salaries').then(response => {
                    if (response) {
                        this.allSalary = response;
                    }
                })
            },
            // el-popover事件 @show 显示时触发
            showEditProp(data) {
                if (data) {
                    this.currentSalary = data.id;
                } else {
                    this.currentSalary = null;
                }
            },
            // 编辑工资账套  el-popover事件 @hide 隐藏时触发
            hideEditProp(data) {
                // 当员工的账套信息为null时,改变salary_id,为判断是否更新做准备
                if (data.salary === null) {
                    data.salary_id = null;
                } else {
                    data.salary_id = data.salary.id
                }
                if (this.currentSalary !== data.salary_id) {
                    this.putRequest('/salary/sobcfg/?eid=' + data.id + '&sid=' + this.currentSalary).then(response => {
                        if (response) {
                            this.initEmps();
                        }
                    })
                }
            }
        },
        mounted() {
            this.initEmps();
            this.initSalarys();
        }
    }
</script>

<style scoped>

</style>
