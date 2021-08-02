<template>
    <div id="uesrtext">
        <textarea placeholder="按 Ctrl + Enter 发送" v-model="content" v-on:keyup="addMessage"></textarea>
    </div>
</template>

<script>
    import {mapState} from 'vuex'

    export default {
        name: 'uesrtext',
        data() {
            return {
                content: ''
            }
        },
        computed: mapState([
            // 当前选中的用户
            "currentSession"
        ]),
        methods: {
            addMessage(e) {
                if (e.ctrlKey && e.keyCode === 13 && this.content.length) {
                    // 消息对象
                    let msgObject = new Object();
                    // 发送给谁
                    msgObject.to = this.currentSession.username;
                    // 消息
                    msgObject.content = this.content;
                    // 发送消息 /ws/chat是后端接口地址
                    this.$store.state.stomp.send('/ws/chat', {}, JSON.stringify(msgObject));
                    // 提交消息至VueX
                    this.$store.commit('addMessage', msgObject);
                    // 清空消息
                    this.content = '';
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    #uesrtext {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 100%;
        height: 30%;
        border-top: solid 1px #DDD;

        > textarea {
            padding: 10px;
            width: 100%;
            height: 100%;
            border: none;
            outline: none;
        }
    }
</style>
