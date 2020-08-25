
<style lang="less">
  .map-box{
    position: relative;
    background-color: #000;
    width: 100%;
    height: 100%;
    .ivu-divider-small{
      margin: 4px 0;
    }
    &-user{
      position:absolute;
      z-index: 10;
      top: 10px;
      right:10px;
    }
    &-user:hover{
      .map-box-con{
        display: block;
      }
    }
    &-con{
      position: absolute;
      display: none;
      right: 20px;
      top: 0;
      width: 120px;
      padding-right: 20px;
      .box{
        width: 100%;
        font-size: 14px;
        background-color:#0f3a65;
        color:#eee;
        border-radius: 4px;
        padding: 10px;
      }
      .logout{
        cursor: pointer;
        color: #2d8cf0;
        display: inline-block;
        width: 100%;
        text-align:center;
        border: 1px solid rgba(45, 140, 240, 0);
        margin-top: 10px;
      }
      .logout:hover{
        border:1px solid #2d8cf0;
      }
    }
  }
  .map-con{
    width: 300px;
    height: 100%;
    z-index: 10;
    position: absolute;
    top: 0;
    left: 0;
    background-color: #0d131a;
    padding: 20px 0;
    color: #fff;
    &-icons{
      font-size: 30px;color:#fff
    }
    &-title{
      font-size: 18px;
      color: #fff;
      text-align: center;
      padding-bottom: 10px;
    }
  }
  .map-icon{
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    width: 30px;
    height: 200px;
    text-align: center;
    line-height: 200px;
    border: 1px solid #2d8cf0;
    -moz-border-radius-bottomright: 4px;
    background-color: rgba(45, 140, 240, 0.42);
    &-icons{
      font-size: 30px;color:#fff
    }
  }
  .ol-zoom.ol-unselectable.ol-control{
    position: absolute;
    right: 0;
    width: 30px;
    top: 20%;
  }
  .map-button{
    padding: 10px;
    text-align: center;
    span{
      display: inline-block;
      height: 30px;
      line-height: 30px;
      width: 100px;
      font-size: 14px;
      border: 1px solid #2d8cf0;
      border-radius: 6px;
      cursor: pointer;
      background-color: #2d8cf0;
    }
  }
  .map-select{
    margin: 10px;
    padding: 10px;
    border: 1px solid #2d8cf0;
    border-radius: 10px;
    font-size: 14px;
    &-title{
      font-size: 16px;
      padding-bottom: 10px;
    }
  }
</style>
<template>
  <!--  <Layout style="height: 100%" class="main">
      <Sider hide-trigger collapsible :width="256" :collapsed-width="64" v-model="collapsed" class="left-sider" :style="{overflow: 'hidden'}">
        <side-menu accordion ref="sideMenu" :active-name="$route.name" :collapsed="collapsed" @on-select="turnToPage" :menu-list="menuList">
          &lt;!&ndash; 需要放在菜单上面的内容，如Logo，写在side-menu标签内部，如下 &ndash;&gt;
          <div class="logo-con">
            <img v-show="!collapsed" :src="maxLogo" key="max-logo" />
            <img v-show="collapsed" :src="minLogo" key="min-logo" />
          </div>
        </side-menu>
      </Sider>
      <Layout>
        <Header class="header-con">
          <header-bar :collapsed="collapsed" @on-coll-change="handleCollapsedChange">
            <user :message-unread-count="unreadCount" :user-avatar="userAvatar"/>
            <language v-if="$config.useI18n" @on-lang-change="setLocal" style="margin-right: 10px;" :lang="local"/>
            <error-store v-if="$config.plugin['error-store'] && $config.plugin['error-store'].showInHeader" :has-read="hasReadErrorPage" :count="errorCount"></error-store>
            <fullscreen v-model="isFullscreen" style="margin-right: 10px;"/>
          </header-bar>
        </Header>
        <Content class="main-content-con">
          <Layout class="main-layout-con">
            <div class="tag-nav-wrapper">
              <tags-nav :value="$route" @input="handleClick" :list="tagNavList" @on-close="handleCloseTag"/>
            </div>
            <Content class="content-wrapper">
              <keep-alive :include="cacheList">
                <router-view/>
              </keep-alive>
              <ABackTop :height="100" :bottom="80" :right="50" container=".content-wrapper"></ABackTop>
            </Content>
          </Layout>
        </Content>
      </Layout>
    </Layout>-->
  <div class="map-box" id="mainDiv">
    <div class="map-box-user">
      <Avatar style="background-color: #1a3a65" icon="ios-person"/>
      <div class="map-box-con">
        <div class="box">
          <span>用户：测试</span>
          <!--          <Divider size="small"></Divider>-->
          <a class="logout" @click="logout">注销登录</a>
        </div>
      </div>
    </div>
    <div v-if="icons" class="map-con">
      <div>
        <Row>
          <Col span="20" class="map-con-title">图像语义分割处理平台</Col>
          <Col span="4"><Icon type="ios-arrow-back" class="map-con-icons"  @click="setIcons" /></Col>
        </Row>
      </div>
      <div class="map-select">
        <div class="map-select-title"><Icon type="ios-browsers" size="26" color="#2d8cf0"/> 区域选择</div>
        <RadioGroup v-model="disabledGroup">
          <Row>
            <Col span="12">
              <Radio label="绘制"></Radio>
            </Col>
            <Col span="12">
              <Radio label="全图"></Radio>
            </Col>
          </Row>
        </RadioGroup>
      </div>
<!--      <div class="map-select">
        <div class="map-select-title"><Icon type="ios-settings" size="26" color="#2d8cf0" /> 设置</div>
        <RadioGroup v-model="disabledGroup">
          <Row>
            <Col span="12">
              <Radio label="绘制"></Radio>
            </Col>
            <Col span="12">
              <Radio label="全图"></Radio>
            </Col>
          </Row>
        </RadioGroup>
      </div>
      <div class="map-select">
        <div class="map-select-title"><Icon type="logo-buffer" size="26" color="#2d8cf0" /> 数据</div>
        <RadioGroup v-model="disabledGroup">
          <Row>
            <Col span="12">
              <Radio label="绘制"></Radio>
            </Col>
            <Col span="12">
              <Radio label="全图"></Radio>
            </Col>
          </Row>
        </RadioGroup>
      </div>-->
      <div class="map-button">
        <Row>
          <Col span="24"><span>开始编译</span></Col>
<!--          <Col span="12"></Col>-->
        </Row>
      </div>
    </div>
    <div class="map-icon" @click="setIcons"  v-else><Icon class="map-icon-icons" type="ios-arrow-forward"/></div>
  </div>
</template>
<script>
import 'ol/ol.css'
import { mapActions } from 'vuex'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { fromLonLat } from 'ol/proj'
export default {
  name: 'home',
  components: {

  },
  data () {
    return {
      map: '',
      icons: true,
      disabledGroup: '绘制'
    }
  },
  mounted () {
    this.initPointMap()
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
    setIcons () {
      this.icons = !this.icons
    },
    initPointMap () {
      this.map = new Map({
        target: 'mainDiv',
        view: new View({
          center: fromLonLat([119.60753817138888, 30.49043631527778]),
          projection: 'EPSG:3857',
          zoom: 10
        }),
        layers: [
          new TileLayer({
            source: new XYZ({
              // PRCQV0Stg2Pgj9EKapMf6c9zdijg0MQ7
              url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              wrapX: true
            })
          })
        ]
      })
    }
  }
}
</script>
