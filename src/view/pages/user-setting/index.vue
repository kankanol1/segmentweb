<template>
  <div class="map-box-user">
    <Poptip placement="left-start" trigger="hover">
      <div slot="title">用户：{{userInfo.name||'测试'}}</div>
      <div slot="content" style="text-align: center">
        <Row>
          <Col><a class="logout" @click="changePass">密码修改</a></Col>
          <Col><a class="logout" @click="logout">注销登录</a></Col>
        </Row>
      </div>
      <Avatar icon="ios-person"/>
    </Poptip>
    <Modal title="密码修改" v-model="modals" footer-hide>
      <Form ref="formInline" :model="formInline" :rules="ruleInline">
        <FormItem prop="password1">
          <Input type="password" v-model="formInline.password1" placeholder="旧密码">
            <Icon type="ios-lock-outline"></Icon>
          </Input>
        </FormItem>
        <FormItem prop="password">
          <Input type="password" v-model="formInline.password" placeholder="新密码">
            <Icon type="ios-lock-outline"></Icon>
          </Input>
        </FormItem>
        <FormItem prop="confirm">
          <Input type="password" v-model="formInline.confirm" placeholder="确认新密码">
            <Icon type="ios-lock-outline"></Icon>
          </Input>
        </FormItem>
        <FormItem style="text-align: center">
          <Button type="primary" @click="handleSubmit('formInline')">提交</Button>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { setToken, getToken } from '@/libs/util'

export default {
  name: 'index',
  data () {
    const validatePassCheck = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('重新输入'))
      } else if (value !== this.formInline.password) {
        callback(new Error('密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      modals: false,
      userInfo: {
        avatar: 'https://avatars0.githubusercontent.com/u/20942571?s=460&v=4',
        name: 'test',
        password: 'test',
        token: 'admin'
      },
      formInline: {
        password1: '',
        password: '',
        confirm: ''
      },
      ruleInline: {
        password1: [
          { required: true, message: '请输入旧密码', trigger: 'blur' }
          // { type: 'string', min: 6, message: 'The password length cannot be less than 6 bits', trigger: 'blur' }
        ],
        password: [
          { type: 'string', min: 6, required: true, message: '密码长度不低于6位.', trigger: 'blur' }
        ],
        confirm: [
          { validator: validatePassCheck, type: 'string', min: 6, required: true, message: '密码不一致.', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    if (sessionStorage.getItem('userInfo') && JSON.parse(sessionStorage.getItem('userInfo'))) {
      this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
    } else {
      this.$router.push({ name: 'login' })
    }
  },
  methods: {
    ...mapActions([
      'handleLogOut'
    ]),
    logout () { // 退出
      this.handleLogOut().then(() => {
        this.$router.push({
          name: 'login'
        })
      })
    },
    changePass () {
      this.modals = true
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.$Message.success('Success!')
          this.modals = false
        }
      })
    }
  }
}
</script>

<style scoped lang="less">
  .avatar-box {
    position: absolute;
    right: 10px;
    top: 10px;
  }
</style>
