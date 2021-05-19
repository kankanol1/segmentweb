<style lang="less">
  @import './login.less';
</style>

<template>
  <div class="login">
    <h1 style="text-align: center;color:#fff;position: fixed;top:20px;left:20px">土地资源系统</h1>
    <div class="login-con">
      <Card icon="log-in" title="欢迎登录" :bordered="false">
        <div class="form-con">
          <login-form :loading="loading" @on-success-valid="handleSubmit"></login-form>
          <span>还没有账户？
            <a @click="registerPage">立即注册</a>
          </span>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import LoginForm from '_c/login-form'
import { mapActions } from 'vuex'
import { setToken, getToken } from '@/libs/util'
export default {
  components: {
    LoginForm
  },
  data () {
    return {
      loading: false
    }
  },
  methods: {
    ...mapActions([
      'handleLogin',
      'getUserInfo'
    ]),
    handleSubmit ({ userName, password }) {
      this.loading = true
      this.handleLogin({ userName, password }).then(res => {
        if (!res.code) {
          this.$Message.warning(res.msg)
          this.loading = false
        } else {
          this.getUserInfo().then(res => {
            const token = getToken()
            sessionStorage.setItem('username', userName)
            sessionStorage.setItem('userInfo', JSON.stringify(res))
            if (token !== userName) {
              setToken(userName)
            }
            this.$router.push({
              name: this.$config.homeName
            }).finally(() => {
              this.loading = false
            })
          })
        }
      })
    },
    registerPage () {
      this.$router.push({ name: 'register' })
    }
  }
}
</script>
