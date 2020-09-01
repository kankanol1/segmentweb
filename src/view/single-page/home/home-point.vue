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
        <Button @click="clearSelect" ghost>全图</Button>
        <br>
        <Button @click="clearSelect" ghost>清除</Button>
        <br>
        <Button @click="clearSelect" ghost>编译</Button>
      </ButtonGroup>

    </div>
    <div id="year"></div>
  </div>
</template>
<script>
  import 'ol/ol.css';
  import {Map, View} from 'ol';
  import TileLayer from 'ol/layer/Tile';
  import OSMSource from 'ol/source/OSM';
  import {fromLonLat} from 'ol/proj';
  import VectorLayer from 'ol/layer/Vector';
  import VectorSource from 'ol/source/Vector';
  import Stamen from 'ol/source/Stamen';
  import Feature from 'ol/Feature';
  import {circular} from 'ol/geom/Polygon';
  import Point from 'ol/geom/Point';
  import Control from 'ol/control/Control';
  import {Style, Icon, Fill} from 'ol/style';
  import Renderer from 'ol/renderer/webgl/PointsLayer';
  import {clamp} from 'ol/math';

  import {mapActions} from "vuex";

  export default {
    name: 'home',
    components: {},
    data() {
      return {}
    },
    watch: {},
    mounted() {

      const source = new VectorSource();
      const client = new XMLHttpRequest();
      client.open('GET', 'data/meteorites.csv');
      client.onload = function () {
        const csv = client.responseText;
        const features = [];
        let prevIndex = csv.indexOf('\n') + 1;
        let curIndex;
        while ((curIndex = csv.indexOf('\n', prevIndex)) !== -1) {
          const line = csv.substr(prevIndex, curIndex - prevIndex).split(',');
          prevIndex = curIndex + 1;
          const coords = fromLonLat([parseFloat(line[4]), parseFloat(line[3])]);
          if (isNaN(coords[0]) || isNaN(coords[1])) {
            continue;
          }
          features.push(new Feature({
            mass: parseFloat(line[1]) || 0,
            year: parseFloat(line[2]) || 0,
            geometry: new Point(coords),
          }));
        }
        source.addFeatures(features);
      };
      client.send();

      const color = [1, 0, 0, 0.5];

      class CustomLayer extends VectorLayer {
        createRenderer() {
          return new Renderer(this, {
            colorCallback: function (feature, vertex, component) {
              return color[component];
            },
            sizeCallback: function (feature) {
              return 18 * clamp(feature.get('mass') / 200000, 0, 1) + 8;
            },
            fragmentShader: `
  precision mediump float;

  varying vec2 v_texCoord;
  varying vec4 v_color;

  void main(void) {
    vec2 texCoord = v_texCoord * 2.0 - vec2(1.0, 1.0);
    float sqRadius = texCoord.x * texCoord.x + texCoord.y * texCoord.y;
    float value = 2.0 * (1.0 - sqRadius);
    float alpha = smoothstep(0.0, 1.0, value);

    gl_FragColor = v_color;
    gl_FragColor.a *= alpha;
  }`
          });
        }
      }

      const minYear = 1850;
      const maxYear = 2015;
      const span = maxYear - minYear;
      const rate = 10; // years per second

      const start = Date.now();
      let currentYear = minYear;

      const yearElement = document.getElementById('year');
      const map = new Map({
        target: 'map-container',
        layers: [
          new TileLayer({
            source: new Stamen({
              layer: 'toner'
            })
          }),
          /* new VectorLayer({
           // new CustomLayer({
             source: source
           }),*/
          new CustomLayer({
            source: source
          })
        ],
        view: new View({
          center: fromLonLat([110.90649323723949, 36.76492663092782]),
          zoom: 2,
        })
      })

      function render() {
        const elapsed = rate * (Date.now() - start) / 1000;
        currentYear = minYear + (elapsed % span);
        yearElement.innerText = currentYear.toFixed(0);

        map.render();
        requestAnimationFrame(render);
      }

      render();

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
      },
      clearSelect() {
      },
    }
  }
</script>
