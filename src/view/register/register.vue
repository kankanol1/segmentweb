<style lang="less">
  @import './register.less';
</style>
<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" title="账号注册" :bordered="false">
        <div class="form-con">
          <register-form @on-success-valid="handleSubmit"></register-form>
          <span>已有账号 <a @click="loginPage">立即登录</a></span>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import RegisterForm from '_c/register-form'
import { mapActions } from 'vuex'
import { Message } from 'iview'

export default {
  components: {
    RegisterForm
  },
  methods: {
    ...mapActions([
      'handleRegister'
    ]),
    handleSubmit ({ userName, password }) {
      this.handleRegister({ userName, password }).then(res => {
        if (res.status === 200) {
          Message.info({
            duration: 4,
            content: '注册成功，即将返回登录页！',
            onClose: () => {
              this.$router.push({
                name: 'login'
              })
            }
          })
        } else {
          Message.info('注册失败，请核对信息后注册！')
        }
      })
    },
    loginPage () {
      this.$router.push({ name: 'login' })
    }
  }
}
</script>

<style>

</style>
