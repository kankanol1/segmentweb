<style lang="less">
  #year {
    position: absolute;
    bottom: 1em;
    left: 1em;
    color: white;
    -webkit-text-stroke: 1px black;
    font-size: 2em;
    font-weight: bold;
  }

  .divObj {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 10;
  }

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
    top: 30%;
    left: calc(~'100% - 30px');
  }

  .locate {
    top: calc(~'30% + 6em');
    left: calc(~'100% - 30px');
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

  .buttons {
    position: absolute;
    z-index: 10;
    top: 20%;

    left: 0;
    background-color: #0f3a65;

    button {
      width: 100px;
      text-align: center;
    }
  }
</style>
<template>
  <div class="map-box" id="map-container">
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

    <div class="buttons">
      <ButtonGroup>
        <Button @click="drawSelect" ghost>绘制</Button>
        <br>
        <Button @click="clearDraw" ghost>取消绘制</Button>
        <br>
        <Button @click="editSelect" ghost>编辑</Button>
        <br>
        <Button @click="cancelEdit" ghost>取消编辑</Button>
        <br>
        <Button @click="clearSelect" ghost>全图</Button>
        <br>
        <Button @click="clearMap" ghost>清除</Button>
        <br>
        <Button @click="startCompute" ghost>编译</Button>
      </ButtonGroup>

    </div>
  </div>
</template>
<script>
  import 'ol/ol.css';
  import GeoJSON from 'ol/format/GeoJSON';
  import Map from 'ol/Map';
  import View from 'ol/View';
  import VectorLayer from 'ol/layer/Vector';
  import VectorSource from 'ol/source/Vector';
  import DragAndDrop from 'ol/interaction/DragAndDrop';
  import {fromLonLat} from 'ol/proj';
  import Modify from 'ol/interaction/Modify';
  import {Fill, Stroke, Style, Text} from 'ol/style';
  import Draw from 'ol/interaction/Draw';
  import TileLayer from "ol/layer/Tile";
  import XYZ from "ol/source/XYZ";
  import 'ol/ol.css';
  import OSMSource from 'ol/source/OSM';
  import {mapActions} from "vuex";

  export default {
    name: 'home',
    components: {},
    data() {
      return {
        source: undefined,
        map: undefined,
        layer: undefined,
        dragAndDrop: undefined,
        modify: undefined,
        draw: undefined,
        format: undefined,
      }
    },
    watch: {},
    mounted() {
      this.initMap2();
    },
    methods: {
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
      drawSelect() {
        this.draw & this.map.addInteraction(this.draw);
      },
      clearSelect() {
        this.draw & this.map.removeInteraction(this.draw);
      },
      clearMap() {
        this.source & this.source.clear()
      },
      clearDraw() {
        this.draw & this.map.removeInteraction(this.draw);
      },
      editSelect() {
        this.modify & this.map.addInteraction(this.modify);
      },
      cancelEdit() {
        this.modify & this.map.removeInteraction(this.modify);
      },
      startCompute() {
        if (this.source) {
          this.map.once('postcompose', function(event) {
            //获取map中的canvas,并转换为图片
            console.log(event);
            var canvas = event.context.canvas;
            if (navigator.msSaveBlob) {
              navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
            } else {
              canvas.toBlob(function(blob) {
                saveAs(blob, 'map.png');
              });
            }
          });
          this.map.renderSync();
        } else {
         Message.warning('请选择编译区')
        }



      },
      initMap() {
        this.source = new VectorSource();
        this.layer = new VectorLayer({
          source: this.source,
        });
        this.map = new Map({
          view: new View({
            center: fromLonLat([119.60753817138888, 30.49043631527778]),
            zoom: 6
          }),
          layers: [
            new TileLayer({
              /* source: new XYZ({
                 url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                 wrapX: true
               }),*/
              source: new OSMSource()
            })
          ]
        });

        this.dragAndDrop = new DragAndDrop({// 文件
          source: this.source,
          formatConstructors: [GeoJSON]
        });
        this.modify = new Modify({//调整
          source: this.source,
        });
        this.draw = new Draw({//画笔
          type: 'Polygon',
          source: this.source,
        });

        this.map.addLayer(this.layer);
        this.map.addInteraction(this.dragAndDrop);
        this.map.addInteraction(this.modify);
        this.map.addInteraction(this.draw);
        this.format = new GeoJSON({featureProjection: 'EPSG:3857'});

      },
      initMap2() {
        this.source = new VectorSource();
        const layer = new VectorLayer({
          source: this.source,
          style: function () {
            return new Style({
              fill: new Fill({
                color: 'rgba(198,23,210,0.3)'
              }),
              stroke: new Stroke({
                color: 'rgba(255,255,255,0.8)'
              })
            });
          }
        });
        let dragAndDrop = new DragAndDrop({
          source: this.source,
          formatConstructors: [GeoJSON]
        });
        this.modify = new Modify({
          source: this.source
        });
        this.draw = new Draw({
          type: 'Polygon',
          source: this.source
        });

        this.map = new Map({
          target: 'map-container',
          layers: [
            new TileLayer({
              source: new OSMSource()
            })
          ],
          view: new View({
            center: fromLonLat([110.90649323723949, 36.76492663092782]),
            zoom: 6
          })
        });

        this.map.addLayer(layer);
        this.map.addInteraction(dragAndDrop);
        // this.map.addInteraction( this.modify);
        // this.map.addInteraction(this.draw);
      }
    }
  }
</script>
