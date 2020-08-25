<style lang="less">
  .map-box {
    position: relative;
    background-color: #000;
    width: 100%;
    height: 100%;

    .ivu-divider-small {
      margin: 4px 0;
    }

    &-user {
      position: absolute;
      z-index: 10;
      top: 10px;
      right: 10px;
    }

    &-user:hover {
      .map-box-con {
        display: block;
      }
    }

    &-con {
      position: absolute;
      display: none;
      right: 20px;
      top: 0;
      width: 120px;
      padding-right: 20px;

      .box {
        width: 100%;
        font-size: 14px;
        background-color: #0f3a65;
        color: #eee;
        border-radius: 4px;
        padding: 10px;
      }

      .logout {
        cursor: pointer;
        color: #2d8cf0;
        display: inline-block;
        width: 100%;
        text-align: center;
        border: 1px solid rgba(45, 140, 240, 0);
        margin-top: 10px;
      }

      .logout:hover {
        border: 1px solid #2d8cf0;
      }
    }
  }

  .map-con {
    width: 300px;
    height: 100%;
    z-index: 10;
    position: absolute;
    top: 0;
    left: 0;
    background-color: #0d131a;
    padding: 20px 0;
    color: #fff;

    &-icons {
      font-size: 30px;
      color: #fff
    }

    &-title {
      font-size: 18px;
      color: #fff;
      text-align: center;
      padding-bottom: 10px;
    }
  }

  .map-icon {
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

    &-icons {
      font-size: 30px;
      color: #fff
    }
  }

  .ol-zoom.ol-unselectable.ol-control {
    position: absolute;
    right: 0;
    width: 30px;
    top: 20%;
  }

  .map-button {
    padding: 10px;
    text-align: center;

    span {
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

  .map-select {
    margin: 10px;
    padding: 10px;
    border: 1px solid #2d8cf0;
    border-radius: 10px;
    font-size: 14px;

    &-title {
      font-size: 16px;
      padding-bottom: 10px;
    }
  }

  .title-box {
    padding-bottom: 10px;

    .titles {
      line-height: 30px;
    }
  }

</style>
<template>
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
          <Col span="4">
            <Icon type="ios-arrow-back" class="map-con-icons" @click="setIcons"/>
          </Col>
        </Row>
      </div>
      <div class="map-select">
        <div class="map-select-title">
          <Icon type="ios-browsers" size="26" color="#2d8cf0"/>
          区域选择
        </div>
        <div class="title-box">
          <Row>
            <Col span="7" class="titles">形状选择：</Col>
            <Col span="14">
              <Select v-model="typeSelect">
                <Option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </Col>

          </Row>
        </div>
        <div class="title-box">
          <Row>
            <Col span="7" class="titles">
              绘制区域：
            </Col>
            <Col span="14">
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

            </Col>
          </Row>
        </div>

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
      <div>
        <span @click="clearSelect">清除</span>
      </div>
    </div>
    <div class="map-icon" @click="setIcons" v-else>
      <Icon class="map-icon-icons" type="ios-arrow-forward"/>
    </div>
  </div>
</template>
<script>
  import {mapActions} from 'vuex';
  import 'ol/ol.css';
  import Draw, {
    createBox,
    createRegularPolygon,
  } from 'ol/interaction/Draw';
  import Map from 'ol/Map';
  import Polygon from 'ol/geom/Polygon';
  import View from 'ol/View';
  import {OSM, Vector as VectorSource} from 'ol/source';
  import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
  import {fromLonLat} from "ol/proj";

  export default {
    name: 'home',
    components: {},
    data() {
      return {
        map: undefined,
        icons: true,
        disabledGroup: '绘制',
        typeSelect: 'Polygon',
        draw: undefined,
        source: undefined,
        cityList: [
          {
            value: 'Circle',
            label: 'Circle'
          }, {
            value: 'Square',
            label: 'Square'
          }, {
            value: 'Box',
            label: 'Box'
          }, {
            value: 'Star',
            label: 'Star'
          }, {
            value: 'None',
            label: 'None'
          },
        ],
        model1: '',
      }
    },
    watch: {
      'typeSelect'(val) {
        this.map.removeInteraction(this.draw);
        this.addInteraction();
      }
    },
    mounted() {
      var raster = new TileLayer({
        source: new OSM(),
      });

      this.source = new VectorSource({wrapX: false});

      var vector = new VectorLayer({
        source: this.source,
      });

      this.map = new Map({
        layers: [raster, vector],
        target: 'mainDiv',
        view: new View({
          center: fromLonLat([119.60753817138888, 30.49043631527778]),
          zoom: 12,
        }),
        /*layers: [
          new TileLayer({
            source: new XYZ({
              //PRCQV0Stg2Pgj9EKapMf6c9zdijg0MQ7
              url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
              wrapX: true
            })
          })
        ]*/
      });

      this.testMap();
      // this.addInteraction();

    },
    methods: {
      testMap() {
        var geometryFunction = createBox();
        this.draw = new Draw({
          source: this.source,
          type: 'Circle',
          geometryFunction: geometryFunction,
        });
        this.map.addInteraction(this.draw);
      },
      ...mapActions([
        'handleLogOut'
      ]),
      logout() {
        this.handleLogOut().then(() => {
          this.$router.push({
            name: 'login'
          })
        })
      },
      setIcons() {
        this.icons = !this.icons;
      },
      clearSelect() {
        // this.map.removeInteraction(draw);
        console.log(this.draw)
        this.map.removeInteraction(this.draw);
        this.testMap();
      },
      initPointMap() {

      },
      addInteraction() {
        var value = this.typeSelect;
        if (value !== 'None') {
          draw = new Draw({
            source: source,
            type: this.typeSelect,
          });
          map.addInteraction(draw);
        }
      }
    },
  }
</script>
