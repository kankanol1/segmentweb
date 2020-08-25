<template>
  <div class="user-avatar-dropdown">
    <Dropdown @on-click="handleClick" style="position: relative">
     <!-- <Badge :dot="!!messageUnreadCount">
        <Avatar :src="userAvatar"/>
      </Badge>-->
<!--      <Icon :size="18" type="md-arrow-dropdown"></Icon>-->
      <Avatar style="background-color: #1a3a65" icon="ios-person"/>
      <DropdownMenu style="background-color: #0f3a65;position: absolute;right: 0;top:0px" slot="list">
        <!--<DropdownItem name="message">
          消息中心<Badge style="margin-left: 10px" :count="messageUnreadCount"></Badge>
        </DropdownItem>-->
<!--        <DropdownItem name="logout">-->
        <DropdownItem name="logout">
          <span style="color:#fff">退出登录</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script>
import './user.less'
import { mapActions } from 'vuex'
export default {
  name: 'User',
  props: {
    userAvatar: {
      type: String,
      default: ''
    },
    messageUnreadCount: {
      type: Number,
      default: 0
    }
  },
  methods: {
    ...mapActions([
      'handleLogOut'
    ]),
    logout () {
      this.handleLogOut().then(() => {
        this.$router.push({
          name: 'login'
        })
      })
    },
    message () {
      this.$router.push({
        name: 'message_page'
      })
    },
    handleClick (name) {
      switch (name) {
        case 'logout': this.logout()
          break
        case 'message': this.message()
          break
      }
    }
  }
}
</script>
