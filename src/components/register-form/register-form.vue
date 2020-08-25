<template>
  <Form ref="registerForm" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
    <FormItem prop="userName">
      <Input v-model="form.userName" placeholder="请输入用户名">
        <span slot="prepend">
          <Icon :size="16" type="ios-person"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="password">
      <Input type="password" v-model="form.password" placeholder="请输入密码">
        <span slot="prepend">
          <Icon :size="14" type="md-lock"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="confirm">
      <Input type="password" v-model="form.confirm" placeholder="请确认密码">
        <span slot="prepend">
          <Icon :size="14" type="md-lock"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem>
      <Button @click="handleSubmit" type="primary" long>注册</Button>
    </FormItem>
  </Form>
</template>
<script>
export default {
  name: 'RegisterForm',
  props: {
    userNameRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '账号不能为空', trigger: 'blur' }
        ]
      }
    },
    passwordRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '密码不能为空', trigger: 'blur' }
        ]
      }
    },

  },
  data () {
    return {
      form: {
        userName: 'admin',
        password: 'admin',
        confirm: ''
      },
      confirmRules: { required: true,
        message: '不能为空',
        trigger: 'blur',
        validator:(rule, value, callback) => {
          console.log(value);
          console.log(this.form);
          if (this.form.password !== '' && value === '') {
            callback(new Error('确认密码不能为空'));
          } else if (this.form.password !== value) {
            callback(new Error('新密码和确认密码应相同'));
          } else {
            callback();
          }
        }
      }
    }
  },
  computed: {
    rules () {
      return {
        userName: this.userNameRules,
        password: this.passwordRules,
        confirm: this.confirmRules
      }
    }
  },
  methods: {
    handleSubmit () {
      this.$refs.registerForm.validate((valid) => {
        console.log(valid);
        if (valid) {
          this.$emit('on-success-valid', {
            userName: this.form.userName,
            password: this.form.password,
            confirm: this.form.confirm
          })
        }
      })
    }
  }
}
</script>
