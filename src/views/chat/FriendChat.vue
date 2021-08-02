<template>
    <div id="app">
        <div class="sidebar">
            <card></card>
            <list></list>
        </div>
        <div class="main">
            <message></message>
            <usertext></usertext>
        </div>
    </div>
</template>

<script>
    import card from '../../components/chat/card.vue'
    import list from '../../components/chat/list.vue'
    import message from '../../components/chat/message.vue'
    import usertext from '../../components/chat/usertext.vue'

    export default {
        name: 'FriendChat',
        data() {
            return {}
        },
        mounted: function () {
            // 获取用户列表与消息
            this.$store.dispatch('initData');
        },
        components: {
            card,
            list,
            message,
            usertext
        }
    }
</script>

<!-- vue-Chat的样式使用的sass写的,要生效需要安装sass -->
<!-- npm install sass-loader --save-dev -->
<!-- npm install node-sass --save-dev -->
<!-- 使用与vue-Chat一样的sass依赖
    "node-sass": "^4.5.0",
    "sass-loader": "^5.0.1",
-->
<style lang="scss" scoped>
    #app {
        margin: 20px auto;
        width: 800px;
        height: 600px;
        overflow: hidden;
        border-radius: 10px;

        .sidebar, .main {
            height: 100%;
        }

        .sidebar {
            float: left;
            color: #f4f4f4;
            background-color: #2e3238;
            width: 200px;
        }

        .main {
            position: relative;
            overflow: hidden;
            background-color: #eee;
        }
    }
</style>
