<template>
    <div>
        <el-tabs v-model="activeName" type="card">
            <!-- 使用组件直接<组件名称></组件名称> -->
            <el-tab-pane label="部门管理" name="DepMana">
                <DepMana></DepMana>
            </el-tab-pane>
            <el-tab-pane label="职位管理" name="PosMana">
                <PosMana></PosMana>
            </el-tab-pane>
            <el-tab-pane label="职称管理" name="JobLevelMana">
                <JobLevelMana></JobLevelMana>
            </el-tab-pane>
            <el-tab-pane label="奖惩规则" name="EcMane">
                <EcMane></EcMane>
            </el-tab-pane>
            <el-tab-pane label="权限组" name="PermissMana">
                <PermissMana></PermissMana>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
    // 导入组件
    import DepMana from "../../components/sys/basic/DepMana";
    import EcMane from "../../components/sys/basic/EcMane";
    import JobLevelMana from "../../components/sys/basic/JobLevelMana";
    import PermissMana from "../../components/sys/basic/PermissMana";
    import PosMana from "../../components/sys/basic/PosMana";

    export default {
        name: "SysBasic",
        data() {
            return {
                activeName: 'DepMana'
            }
        },
        methods: {},
        // 设置组件
        components: {
            DepMana,
            EcMane,
            JobLevelMana,
            PermissMana,
            PosMana
        }
    }
</script>

<style scoped>

</style>
