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
  export default {
    components: {
      RegisterForm
    },
    methods: {
      ...mapActions([
        'handleRegister',
        'getUserInfo'
      ]),
      handleSubmit ({ userName, password,confirm }) {
        console.log(userName, password,confirm );
        this.handleRegister({ userName, password,confirm }).then(res => {
          console.log(res);
          /*this.getUserInfo().then(res => {
            /!*this.$router.push({
              name: this.$config.homeName
            })*!/
          })*/
        })
      },
      loginPage(){
        this.$router.push({name: "login"})
      }
    }
  }
</script>

<style>

</style>
