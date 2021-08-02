<template>
    <div>
        <!-- 工具栏-->
        <div>
            <div style='display: flex;justify-content: space-between;'>
                <div>
                    <el-input placeholder='输入员工姓名....' prefix-icon='el-icon-search'
                              style='width: 200px;margin-right: 10px;' v-model='empName' :disabled="showAdvSearch"
                              @keydown.enter.native='initEmps' clearable @clear='initEmps'>
                        <!--clearable(可清空input) @clear='initEmps'(清空时触发的事件)-->
                    </el-input>
                    <el-button type='primary' icon='el-icon-search' @click='initEmps' :disabled="showAdvSearch">搜索
                    </el-button>
                    <el-button type='primary' @click="showAdvSearchParam"
                               :icon="showAdvSearch ? 'el-icon-arrow-down' : 'el-icon-arrow-up'">高级搜索
                    </el-button>
                </div>
                <div>
                    <el-button type='success' @click="exportData" style="margin-right: 8px;" icon="el-icon-download">
                        导出数据
                    </el-button>
                    <!-- 上传组件 action提交地址就是后台接口地址 -->
                    <el-upload style="display: inline-flex;margin-right: 8px;"
                               :show-file-list=false
                               :before-upload="beforeUpload"
                               :on-success="onSuccess"
                               :on-error="onError"
                               :disabled="uploadDisabled"
                               :headers="uploadHeaders"
                               action="/employee/basic/import">
                        <el-button type='success' :icon="uploadBtnIcon" :disabled="uploadDisabled">
                            {{uploadBtnText}}
                        </el-button>
                    </el-upload>
                    <el-button type='primary' icon='el-icon-plus' @click='showAddEmpView'>添加员工</el-button>
                </div>
            </div>
            <!-- 高级搜索 - 条件  显示隐藏动画查看CSS部分,参考Vue.js官网  https://cn.vuejs.org/v2/guide/transitions.html -->
            <transition name="slide-fade">
                <div style="border: 1px solid deepskyblue;border-radius: 5px;
                        box-sizing: border-box;padding: 5px;margin:10px 0;" v-show="showAdvSearch">
                    <el-row>
                        <el-col :span="5">
                            政治面貌:
                            <el-select v-model='advSearchVal.politic_id' placeholder='政治面貌' size='mini'
                                       style='width: 130px;'>
                                <el-option
                                        v-for='item in politicsStatus'
                                        :key='item.id'
                                        :label='item.name'
                                        :value='item.id'>
                                </el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="4">
                            民族:
                            <el-select v-model='advSearchVal.nation_id' placeholder='民族...' size='mini'
                                       style='width: 130px;'>
                                <el-option v-for='item in nations'
                                           :key='item.id'
                                           :label='item.name'
                                           :value='item.id'></el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="4">
                            职位:
                            <el-select v-model='advSearchVal.pos_id' placeholder='职位' size='mini'
                                       style='width: 130px;'>
                                <el-option
                                        v-for='item in positions'
                                        :key='item.id'
                                        :label='item.name'
                                        :value='item.id'>
                                </el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="4">
                            职称:
                            <el-select v-model='advSearchVal.job_level_id' placeholder='职称' size='mini'
                                       style='width: 130px;'>
                                <el-option
                                        v-for='item in joblevels'
                                        :key='item.id'
                                        :label='item.name'
                                        :value='item.id'>
                                </el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="7">
                            聘用形式:
                            <el-radio-group v-model='advSearchVal.engage_form'>
                                <el-radio label='劳动合同'>劳动合同</el-radio>
                                <el-radio label='劳务合同'>劳务合同</el-radio>
                            </el-radio-group>
                        </el-col>
                    </el-row>
                    <el-row style="margin-top: 15px;">
                        <el-col :span="2">
                            所属部门:
                        </el-col>
                        <el-col :span="3">
                            <el-popover
                                    placement='right'
                                    title='选择部门...'
                                    width='200'
                                    trigger='manual'
                                    v-model='advSearchDepVisible'>
                                <el-tree default-expand-all :data='allDeps' :props='defaultProps'
                                         @node-click='advSearchDepHandleNodeClick'></el-tree>
                                <div style='width: 130px;display: inline-flex;
                                            border: 1px solid #dedede;height: 28px;
                                            border-radius: 5px;cursor: pointer;
                                            align-items: center;
                                            font-size: 10px;padding-left: 15px;box-sizing: border-box'
                                     @click='showAdvSearchDepView' slot='reference'>
                                    {{inputDepName}}
                                </div>
                            </el-popover>
                        </el-col>
                        <el-col :span="10">
                            入职日期:
                            <el-date-picker
                                    v-model="advSearchVal.beginDateScope"
                                    type="daterange"
                                    size="mini"
                                    value-format="yyyy-MM-dd"
                                    unlink-panels
                                    range-separator="至"
                                    start-placeholder="开始日期"
                                    end-placeholder="结束日期">
                            </el-date-picker>
                        </el-col>
                        <el-col :span="6" :offset="3">
                            <el-button size="mini">取消</el-button>
                            <el-button type="primary" size="mini" icon="el-icon-search" @click="initEmps('advSearch')">
                                搜索
                            </el-button>
                        </el-col>
                    </el-row>
                </div>
            </transition>
        </div>
        <!-- 数据 -->
        <div style='margin-top: 10px;'>
            <el-table
                    :data='emps'
                    stripe
                    border
                    v-loading='loading'
                    element-loading-text='拼命加载中...'
                    element-loading-spinner='el-icon-loading'
                    element-loading-background='rgba(0, 0, 0, 0.8)'
                    style='width: 100%'>
                <!-- 多选框 -->
                <el-table-column type='selection' width='55'></el-table-column>
                <!-- 数据 -->
                <el-table-column prop='work_id' label='工号' width='100'></el-table-column>
                <el-table-column prop='name' label='姓名' width='100' fixed></el-table-column>
                <el-table-column prop='gender' label='性别' width='50'></el-table-column>
                <el-table-column prop='birthday' label='出生日期' width='100'></el-table-column>
                <el-table-column prop='id_card' label='身份证' width='170'></el-table-column>
                <el-table-column prop='wedlock' label='婚姻状况' width='50'></el-table-column>
                <el-table-column prop='nation.name' label='民族' width='50'></el-table-column>
                <el-table-column prop='native_place' label='籍贯' width='80'></el-table-column>
                <el-table-column prop='politicsStatus.name' label='政治面貌' width='50'></el-table-column>
                <el-table-column prop='phone' label='手机号' width='120'></el-table-column>
                <el-table-column prop='email' label='邮箱' width='180'></el-table-column>
                <el-table-column prop='address' label='联系地址' width='300'></el-table-column>
                <el-table-column prop='department.name' label='所属部门' width='60'></el-table-column>
                <el-table-column prop='position.name' label='职位' width='80'></el-table-column>
                <el-table-column prop='joblevel.name' label='职称' width='80'></el-table-column>
                <el-table-column prop='engage_form' label='聘用形式' width='80'></el-table-column>
                <el-table-column prop='tiptop_degree' label='学历' width='60'></el-table-column>
                <el-table-column prop='specialty' label='专业' width='80'></el-table-column>
                <el-table-column prop='work_state' label='在职状态' width='80'></el-table-column>
                <el-table-column prop='begin_date' label='入职日期' width='100'></el-table-column>
                <el-table-column prop='conversion_time' label='转正日期' width='100'></el-table-column>
                <el-table-column prop='begin_contract' label='合同起始日期' width='110'></el-table-column>
                <el-table-column prop='end_contract' label='合同截止日期' width='110'></el-table-column>
                <el-table-column label='合同期限' width='50'>
                    <template slot-scope='scope'>
                        <el-tag>{{scope.row.contract_term}}年</el-tag>
                    </template>
                </el-table-column>
                <!-- 操作栏 -->
                <el-table-column label='操作' width='250' fixed='right'>
                    <template slot-scope='scope'>
                        <el-button size='mini' @click='showEditEmpView(scope.row)'>编辑</el-button>
                        <el-button size='mini' type='primary' @click='handleEdit(scope.$index, scope.row)'>高级资料
                        </el-button>
                        <el-button size='mini' type='danger' @click='deleteEmp(scope.row)'>删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
            <div style='display: flex;justify-content: flex-end;'>
                <el-pagination
                        background
                        hide-on-single-page
                        :page-sizes=[5,10,20,30,50]
                        :page-size="size"
                        @size-change='sizeChange'
                        @current-change='currentChange'
                        layout='sizes,prev, pager, next, jumper, ->, total'
                        :total='total'>
                </el-pagination>
            </div>
        </div>
        <!-- 弹出框 -->
        <el-dialog
                :title='dialogTitle'
                :visible.sync='dialogVisible'
                width='85%'>
            <div>
                <el-form ref='empFormRef' :model='empForm' label-width='120px' :rules="empFormRules">
                    <el-row>
                        <el-col :span='6'>
                            <el-form-item label='姓名:' prop='name'>
                                <el-input v-model='empForm.name' placeholder='姓名...' size='mini'
                                          style='width: 130px;'></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span='6'>
                            <el-form-item label='性别:' prop='gender'>
                                <el-radio-group v-model='empForm.gender'>
                                    <el-radio label='男'>男</el-radio>
                                    <el-radio label='女'>女</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                        <el-col :span='6'>
                            <el-form-item label='出生日期:' prop='birthday'>
                                <el-date-picker
                                        v-model='empForm.birthday'
                                        type='date'
                                        value-format='yyyy-MM-dd'
                                        size='mini'
                                        style='width: 130px;'
                                        placeholder='出生日期'>
                                </el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span='6'>
                            <el-form-item label='政治面貌:' prop='politic_id'>
                                <el-select v-model='empForm.politic_id' placeholder='政治面貌' size='mini'
                                           style='width: 130px;'>
                                    <el-option
                                            v-for='item in politicsStatus'
                                            :key='item.id'
                                            :label='item.name'
                                            :value='item.id'>
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span='6'>
                            <el-form-item label='民族:' prop='nation_id'>
                                <el-select v-model='empForm.nation_id' placeholder='民族...' size='mini'
                                           style='width: 130px;'>
                                    <el-option v-for='item in nations'
                                               :key='item.id'
                                               :label='item.name'
                                               :value='item.id'></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span='6'>
                            <el-form-item label='籍贯:' prop='native_place'>
                                <el-input v-model='empForm.native_place' placeholder='籍贯...' size='mini'
                                          style='width: 130px;' prefix-icon='el-icon-edit'></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span='6'>
                            <el-form-item label='电子邮箱:' prop='email'>
                                <el-input size='mini' style='width: 130px' prefix-icon='el-icon-message'
                                          v-model='empForm.email' placeholder='电子邮箱'></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span='6'>
                            <el-form-item label='联系地址:' prop='address'>
                                <el-input size='mini' style='width: 130px' prefix-icon='el-icon-edit'
                                          v-model='empForm.address' placeholder='联系地址'></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span='6'>
                            <el-form-item label='职位:' prop='pos_id'>
                                <el-select v-model='empForm.pos_id' placeholder='职位' size='mini'
                                           style='width: 130px;'>
                                    <el-option
                                            v-for='item in positions'
                                            :key='item.id'
                                            :label='item.name'
                                            :value='item.id'>
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span='6'>
                            <el-form-item label='职称:' prop='job_level_id'>
                                <el-select v-model='empForm.job_level_id' placeholder='职称' size='mini'
                                           style='width: 130px;'>
                                    <el-option
                                            v-for='item in joblevels'
                                            :key='item.id'
                                            :label='item.name'
                                            :value='item.id'>
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span='6'>
                            <el-form-item label='所属部门:' prop='department_id'>
                                <el-popover
                                        placement='right'
                                        title='选择部门...'
                                        width='200'
                                        trigger='manual'
                                        v-model='visible'>
                                    <el-tree default-expand-all :data='allDeps' :props='defaultProps'
                                             @node-click='handleNodeClick'></el-tree>
                                    <div style='width: 130px;display: inline-flex;
                                            border: 1px solid #dedede;height: 28px;
                                            border-radius: 5px;cursor: pointer;
                                            align-items: center;margin-top: 0.5em;
                                            font-size: 10px;padding-left: 15px;box-sizing: border-box'
                                         @click='showDepView' slot='reference'>
                                        {{inputDepName}}
                                    </div>
                                </el-popover>
                            </el-form-item>
                        </el-col>
                        <el-col :span='6'>
                            <el-form-item label='电话号码:' prop='phone'>
                                <el-input size='mini' style='width: 130px' prefix-icon='el-icon-phone'
                                          v-model='empForm.phone' placeholder='电话号码'></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span='6'>
                            <el-form-item label='工号:' prop='work_id'>
                                <el-input size='mini' style='width: 130px' prefix-icon='el-icon-edit'
                                          v-model='empForm.work_id' placeholder='工号' disabled></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span='6'>
                            <el-form-item label='学历:' prop='tiptop_degree'>
                                <el-select v-model='empForm.tiptop_degree' placeholder='学历' size='mini'
                                           style='width: 130px;'>
                                    <el-option
                                            v-for='item in tiptopDegrees'
                                            :key='item'
                                            :label='item'
                                            :value='item'>
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span='6'>
                            <el-form-item label='毕业院校:' prop='school'>
                                <el-input size='mini' style='width: 130px' prefix-icon='el-icon-edit'
                                          v-model='empForm.school' placeholder='毕业院校名称'></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span='6'>
                            <el-form-item label='专业名称:' prop='specialty'>
                                <el-input size='mini' style='width: 130px' prefix-icon='el-icon-edit'
                                          v-model='empForm.specialty' placeholder='专业名称'></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span='6'>
                            <el-form-item label='入职日期:' prop='begin_date'>
                                <el-date-picker
                                        v-model='empForm.begin_date'
                                        size='mini'
                                        type='date'
                                        value-format='yyyy-MM-dd'
                                        style='width: 130px;'
                                        placeholder='入职日期'>
                                </el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span='6'>
                            <el-form-item label='转正日期:' prop='conversion_time'>
                                <el-date-picker
                                        v-model='empForm.conversion_time'
                                        size='mini'
                                        type='date'
                                        value-format='yyyy-MM-dd'
                                        style='width: 130px;'
                                        placeholder='转正日期'>
                                </el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span='6'>
                            <el-form-item label='合同起始日期:' prop='begin_contract'>
                                <el-date-picker
                                        v-model='empForm.begin_contract'
                                        size='mini'
                                        type='date'
                                        value-format='yyyy-MM-dd'
                                        style='width: 130px;'
                                        placeholder='合同起始日期'>
                                </el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span='6'>
                            <el-form-item label='合同终止日期:' prop='end_contract'>
                                <el-date-picker
                                        v-model='empForm.end_contract'
                                        size='mini'
                                        type='date'
                                        value-format='yyyy-MM-dd'
                                        style='width: 130px;'
                                        placeholder='合同终止日期'>
                                </el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span='8'>
                            <el-form-item label='身份证号码:' prop='id_card'>
                                <el-input size='mini' style='width: 180px' prefix-icon='el-icon-edit'
                                          v-model='empForm.id_card' placeholder='请输入身份证号码'></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span='8'>
                            <el-form-item label='聘用形式:' prop='engage_form'>
                                <el-radio-group v-model='empForm.engage_form'>
                                    <el-radio label='劳动合同'>劳动合同</el-radio>
                                    <el-radio label='劳务合同'>劳务合同</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                        <el-col :span='8'>
                            <el-form-item label='婚姻状况:' prop='wedlock'>
                                <el-radio-group v-model='empForm.wedlock'>
                                    <el-radio label='已婚'>已婚</el-radio>
                                    <el-radio label='未婚'>未婚</el-radio>
                                    <el-radio label='离异'>离异</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                    </el-row>

                </el-form>
            </div>
            <span slot='footer' class='dialog-footer' style="margin-top: 20px;">
                <el-button @click='dialogVisible = false'>取 消</el-button>
                <el-button type='primary' @click='doAddEmp'>确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
    export default {
        name: 'EmpBasic',
        data() {
            return {
                // 所有员工
                emps: [],
                // 加载...
                loading: true,
                // 满足条件的总条数
                total: 0,
                // 当前页页码
                currentPage: 1,
                // 每页条数
                size: 5,
                // 条件 - 员工名称
                empName: '',
                // 弹出框
                dialogVisible: false,
                // 员工信息 - 页面使用表单,可以方便验证数据
                empForm: {
                    name: '',
                    address: '',
                    begin_contract: '',
                    begin_date: '',
                    birthday: '',
                    contract_term: 0,
                    conversion_time: '',
                    email: '',
                    end_contract: '',
                    engage_form: '',
                    gender: '',
                    id_card: '',
                    native_place: '',
                    not_work_date: '',
                    phone: '',
                    school: '',
                    specialty: '',
                    tiptop_degree: '',
                    wedlock: '',
                    work_age: '',
                    // 工号
                    work_id: null,
                    work_state: '在职',
                    department_id: null,
                    job_level_id: null,
                    nation_id: null,
                    politic_id: null,
                    pos_id: null,
                    salary_id: 0,
                },
                // 选择器数据放入sessionStorage,避免多次与数据库交互
                // 民族s
                nations: [],
                // 职称s
                joblevels: [],
                // 政治面貌s
                politicsStatus: [],
                // 职位s
                positions: [],
                // 学历s
                tiptopDegrees: ['中专', '高中', '大专', '本科', '研究生', '博士'],
                // 部门 -- 树形控件
                visible: false,
                defaultProps: {
                    children: 'children',
                    label: 'name'
                },
                // 部门s
                allDeps: [],
                // 部门名称 -- 树形控件回显
                inputDepName: '',
                // 添加员工表单校验
                empFormRules: {
                    name: [{required: true, message: '请输入用户名', trigger: 'blur'}],
                    gender: [{required: true, message: '请选择性别', trigger: 'blur'}],
                    birthday: [{required: true, message: '请选择出生日期', trigger: 'blur'}],
                    politic_id: [{required: true, message: '请选择政治面貌', trigger: 'blur'}],
                    nation_id: [{required: true, message: '请选择民族', trigger: 'blur'}],
                    native_place: [{required: true, message: '请输入籍贯', trigger: 'blur'}],
                    email: [{required: true, message: '请输入邮箱地址', trigger: 'blur'}, {
                        type: 'email',
                        message: '邮箱格式不正确',
                        trigger: 'blur'
                    }],
                    address: [{required: true, message: '请输入员工地址', trigger: 'blur'}],
                    pos_id: [{required: true, message: '请选择职位', trigger: 'blur'}],
                    job_level_id: [{required: true, message: '请选择职称', trigger: 'blur'}],
                    department_id: [{required: true, message: '请选择部门', trigger: 'blur'}],
                    phone: [{required: true, message: '请输入电话号码', trigger: 'blur'}],
                    work_id: [{required: true, message: '请输入工号', trigger: 'blur'}],
                    tiptop_degree: [{required: true, message: '请输入学历', trigger: 'blur'}],
                    school: [{required: true, message: '请输入毕业院校', trigger: 'blur'}],
                    specialty: [{required: true, message: '请输入专业', trigger: 'blur'}],
                    begin_date: [{required: true, message: '请选择入职日期', trigger: 'blur'}],
                    conversion_time: [{required: true, message: '请选择转正日期', trigger: 'blur'}],
                    begin_contract: [{required: true, message: '请选择合同起始日期', trigger: 'blur'}],
                    end_contract: [{required: true, message: '请选择合同结束日期', trigger: 'blur'}],
                    id_card: [{required: true, message: '请输入身份证号码', trigger: 'blur'}, {
                        pattern: /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/,
                        message: '身份证号码格式不正确',
                        trigger: 'blur'
                    }],
                    engage_form: [{required: true, message: '请选择聘用形式', trigger: 'blur'}],
                    wedlock: [{required: true, message: '请选择婚姻状况', trigger: 'blur'}],

                    // workState: [{required: true, message: '请输入工作状态', trigger: 'blur'}],
                    // contractTerm: [{required: true, message: '请输入合同期限', trigger: 'blur'}],
                    // notworkDate: [{required: true, message: '请输入离职日期', trigger: 'blur'}],
                    // workAge: [{required: true, message: '请输入工龄', trigger: 'blur'}],
                },
                // 弹出框标题
                dialogTitle: '',
                // 弹出框状态  0-添加  1-编辑
                dialogStatus: 0,
                // 上传相关
                uploadBtnText: '导入数据',
                uploadBtnIcon: 'el-icon-upload2',
                uploadDisabled: false,
                // 上传请求头
                uploadHeaders: {
                    Authorization: window.sessionStorage.getItem('token')
                },
                // 高级搜索条件栏
                showAdvSearch: false,
                // 高级搜索条件
                advSearchVal: {
                    politic_id: '',
                    nation_id: '',
                    pos_id: '',
                    engage_form: '',
                    job_level_id: '',
                    department_id: '',
                    beginDateScope: null,
                },
                // 高级搜索 部门 - 树形控件
                advSearchDepVisible: false
            }
        },
        methods: {
            // 分页查询所有员工
            initEmps(type) {
                let url = '/employee/basic/?currentPage=' + this.currentPage + '&size=' + this.size;
                if (type && type === 'advSearch') {
                    if (this.advSearchVal.politic_id) {
                        url += '&politic_id=' + this.advSearchVal.politic_id;
                    }
                    if (this.advSearchVal.nation_id) {
                        url += '&nation_id=' + this.advSearchVal.nation_id;
                    }
                    if (this.advSearchVal.department_id) {
                        url += '&department_id=' + this.advSearchVal.department_id;
                    }
                    if (this.advSearchVal.beginDateScope) {
                        url += '&beginDateScope=' + this.advSearchVal.beginDateScope;
                    }
                    if (this.advSearchVal.engage_form) {
                        url += '&engage_form=' + this.advSearchVal.engage_form;
                    }
                    if (this.advSearchVal.job_level_id) {
                        url += '&job_level_id=' + this.advSearchVal.job_level_id;
                    }
                    if (this.advSearchVal.pos_id) {
                        url += '&pos_id=' + this.advSearchVal.pos_id;
                    }
                } else {
                    url += '&name=' + this.empName;
                }
                this.getRequest(url).then(response => {
                    if (response) {
                        this.emps = response.data;
                        this.total = response.total;
                        this.loading = false;
                    }
                })
            },
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
            // 添加员工 -- 弹出框
            showAddEmpView() {
                this.dialogTitle = '添加员工';
                this.dialogStatus = 0;
                console.log(this.dialogTitle + this.dialogStatus);
                // 先清除表单中的数据
                this.empForm = {
                    name: '',
                    address: '',
                    begin_contract: '',
                    begin_date: '',
                    birthday: '',
                    contract_term: 0,
                    conversion_time: '',
                    email: '',
                    end_contract: '',
                    engage_form: '',
                    gender: '',
                    id_card: '',
                    native_place: '',
                    not_work_date: '',
                    phone: '',
                    school: '',
                    specialty: '',
                    tiptop_degree: '',
                    wedlock: '',
                    work_age: '',
                    // 工号
                    work_id: null,
                    work_state: '在职',
                    department_id: null,
                    job_level_id: null,
                    nation_id: null,
                    politic_id: null,
                    pos_id: null,
                    salary_id: 0,
                };
                // 清除部门
                this.inputDepName = '';
                // 获取工号
                this.getMaxWorkId();
                this.dialogVisible = true;
            },
            // 员工数据 -- 弹出框面板枚举数据初始化
            initSelectData() {
                // 先去session中找数据, 没有时再请求数据库获取
                // 民族
                if (!window.sessionStorage.getItem('nations')) {
                    this.getRequest('/employee/basic/nations').then(response => {
                        if (response) {
                            this.nations = response;
                            // 将数据对象转为JSON字符串存入session
                            window.sessionStorage.setItem('nations', JSON.stringify(response));
                        }
                    })
                } else {
                    // session中的JSON字符串转为数据对象
                    this.nations = JSON.parse(window.sessionStorage.getItem('nations'));
                }
                // 职称
                if (!window.sessionStorage.getItem('joblevels')) {
                    this.getRequest('/employee/basic/jobLevels').then(response => {
                        if (response) {
                            this.joblevels = response;
                            // 将数据对象转为JSON字符串存入session
                            window.sessionStorage.setItem('joblevels', JSON.stringify(response));
                        }
                    })
                } else {
                    // session中的JSON字符串转为数据对象
                    this.joblevels = JSON.parse(window.sessionStorage.getItem('joblevels'));
                }
                // 政治面貌
                if (!window.sessionStorage.getItem('politicsStatus')) {
                    this.getRequest('/employee/basic/politicsStatus').then(response => {
                        if (response) {
                            this.politicsStatus = response;
                            // 将数据对象转为JSON字符串存入session
                            window.sessionStorage.setItem('politicsStatus', JSON.stringify(response));
                        }
                    })
                } else {
                    // session中的JSON字符串转为数据对象
                    this.politicsStatus = JSON.parse(window.sessionStorage.getItem('politicsStatus'));
                }
                // 职位
                if (!window.sessionStorage.getItem('positions')) {
                    this.getRequest('/employee/basic/positions').then(response => {
                        if (response) {
                            this.positions = response;
                            // 将数据对象转为JSON字符串存入session
                            window.sessionStorage.setItem('positions', JSON.stringify(response));
                        }
                    })
                } else {
                    // session中的JSON字符串转为数据对象
                    this.positions = JSON.parse(window.sessionStorage.getItem('positions'));
                }
                // 部门
                if (!window.sessionStorage.getItem('allDeps')) {
                    this.getRequest('/employee/basic/departments').then(response => {
                        if (response) {
                            this.allDeps = response;
                            window.sessionStorage.setItem('allDeps', JSON.stringify(response));
                        }
                    })
                } else {
                    this.allDeps = JSON.parse(window.sessionStorage.getItem('allDeps'));
                }
            },
            // 工号
            getMaxWorkId() {
                this.getRequest('/employee/basic/maxWorkId').then(response => {
                    if (response) {
                        this.empForm.work_id = response.data;
                    }
                })
            },
            // 显示部门弹出框
            showDepView() {
                this.visible = !this.visible;
            },
            // 部门树形控件点击事件
            handleNodeClick(data) {
                this.inputDepName = data.name;
                this.empForm.department_id = data.id;
                this.visible = !this.visible;
            },
            // 添加员工 and  编辑员工 以dialogStatus判断 0-添加 1-编辑
            doAddEmp() {
                if (this.dialogStatus === 0) {
                    // 添加员工
                    this.$refs.empFormRef.validate((valid) => {
                        if (valid) {
                            this.postRequest('/employee/basic/', this.empForm).then(response => {
                                if (response) {
                                    this.initEmps();
                                    this.dialogVisible = false;
                                }
                            })
                        }
                    })
                }
                if (this.dialogStatus === 1) {
                    // 编辑员工
                    this.$refs.empFormRef.validate((valid) => {
                        if (valid) {
                            this.putRequest('/employee/basic/', this.empForm).then(response => {
                                if (response) {
                                    this.initEmps();
                                    this.dialogVisible = false;
                                }
                            })
                        }
                    })
                }
            },
            // 删除员工
            deleteEmp(data) {
                // 提示框
                this.$confirm('此操作将永久删除员工[' + data.name + '], 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 调用删除接口 --- 需修改后端删除接口, 不能删除与员工有关联的数据
                    this.deleteRequest('/employee/basic/' + data.id).then(response => {
                        if (response) {
                            // 删除后也需要手动将删除的部门从树形控件中移除
                            this.initEmps();
                        }
                    })
                }).catch(() => {
                    this.$message.info("已取消删除!");
                })
            },
            // 编辑员工 -- 弹出框
            showEditEmpView(data) {
                this.dialogTitle = '编辑员工';
                this.dialogStatus = 1;
                console.log(this.dialogTitle + this.dialogStatus);
                this.empForm = data;
                this.inputDepName = data.department.name;
                this.dialogVisible = true;
            },
            // 导出数据
            exportData() {
                this.downloadRequest('/employee/basic/export');
            },
            // 导入数据 --- 上传组件
            // 上传组件 -- 上传之前的钩子
            beforeUpload() {
                this.uploadBtnText = '上传中...';
                this.uploadBtnIcon = 'el-icon-loading';
                this.uploadDisabled = true;
            },
            // 上传组件 -- 上传时的钩子
            // onProgress() {
            //     this.beforeUpload();
            // },
            // 上传组件 -- 上传成功的钩子
            onSuccess(response) {
                this.uploadBtnIcon = 'el-icon-upload2';
                this.uploadBtnText = '导入数据';
                this.uploadDisabled = false;
                // 导入成功后重新获取数据
                this.initEmps();
                if (response.code === 200) {
                    this.$notify.success({
                        title: '导入数据',
                        message: response.message,
                        position: 'bottom-right',
                        duration: 3000
                    });
                    // this.$message.success(response.message);
                } else {
                    this.$notify.error({
                        title: '导入数据',
                        message: response.message,
                        position: 'bottom-right',
                        duration: 3000
                    });
                }
            },
            // 上传组件 -- 上传失败的钩子
            onError(err) {
                this.uploadBtnIcon = 'el-icon-upload2';
                this.uploadBtnText = '导入数据';
                this.uploadDisabled = false;
                this.$notify.error({
                    title: '导入数据',
                    message: err.message,
                    position: 'bottom-right',
                    duration: 3000
                });
            },
            // 高级搜索 - 展开搜索条件按钮
            showAdvSearchParam() {
                this.showAdvSearch = !this.showAdvSearch;
                // 清除搜索条件
                this.advSearchVal.politic_id = '';
                this.advSearchVal.nation_id = '';
                this.advSearchVal.pos_id = '';
                this.advSearchVal.beginDateScope = null;
                this.advSearchVal.job_level_id = '';
                // 清除部门信息
                this.advSearchVal.department_id = '';
                this.inputDepName = '';
            },
            // 高级搜索 - 部门树形控件控制
            showAdvSearchDepView() {
                this.advSearchDepVisible = !this.advSearchDepVisible;
            },
            // 高级搜索 - 部门树形控件节点点击事件
            advSearchDepHandleNodeClick(data) {
                this.inputDepName = data.name;
                this.advSearchVal.department_id = data.id;
                this.advSearchDepVisible = !this.advSearchDepVisible;
            },
        }
        ,
        mounted() {
            this.initEmps();
            this.initSelectData();
        }
    }
</script>

<style scoped>


    /******* 参考Vue.js官网  https://cn.vuejs.org/v2/guide/transitions.html  *********/

    /* 可以设置不同的进入和离开动画 */
    /* 设置持续时间和动画函数 */
    .slide-fade-enter-active {
        transition: all .8s ease;
    }

    .slide-fade-leave-active {
        transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    }

    .slide-fade-enter, .slide-fade-leave-to
        /* .slide-fade-leave-active for below version 2.1.8 */
    {
        transform: translateX(10px);
        opacity: 0;
    }
</style>
