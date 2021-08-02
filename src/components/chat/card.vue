<template>
    <div id="card">
        <header>
            <img class="avatar" v-bind:src="user.user_face" v-bind:alt="user.name">
            <p class="name">{{user.name}}</p>
        </header>
        <footer>
            <input class="search" type="text" v-model="$store.state.filterKey" placeholder="search user...">
        </footer>
    </div>
</template>

<script>
    export default {
        name: 'card',
        data() {
            return {
                // user: {
                //     name: 'Li-yiwei',
                //     img: 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3208455899,1963523311&fm=26&gp=0.jpg'
                // }

                // 聊天界面的左上角个人信息
                user: JSON.parse(window.sessionStorage.getItem('userInfo'))
            }
        }
    }
</script>

<style lang="scss" scoped>
    #card {
        padding: 12px;

        .avatar {
            width: 40px;
            height: 40px;
            vertical-align: middle; /*这个是图片和文字居中对齐*/
        }

        .name {
            display: inline-block;
            padding: 10px;
            margin-bottom: 15px;
            font-size: 16px;
        }

        .search {
            background: #26292E;
            height: 30px;
            line-height: 30px;
            padding: 0 10px;
            border: 1px solid #3a3a3a;
            border-radius: 4px;
            outline: none; /*鼠标点击后不会出现蓝色边框*/
            color: #FFF;
        }
    }
</style>
