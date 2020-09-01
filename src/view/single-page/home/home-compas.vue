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
    <div></div>
  </div>
</template>
<script>
import 'ol/ol.css'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSMSource from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import { circular } from 'ol/geom/Polygon'
import Point from 'ol/geom/Point'
import Control from 'ol/control/Control'
import { Style, Icon, Fill } from 'ol/style'

import { mapActions } from 'vuex'
import Kompas from 'kompas'

export default {
  name: 'home',
  components: {},
  data () {
    return {}
  },
  watch: {},
  mounted () {
    const style = new Style({
      fill: new Fill({
        color: 'rgba(0,0,255,0.2)'
      }),
      image: new Icon({
        src: '../../../data/location-heading.svg',
        imgSize: [27, 55],
        rotateWithView: true
      })
    })

    const source = new VectorSource()
    const layer = new VectorLayer({
      source: source
    })
    layer.setStyle(style)

    const compass = new Kompas()
    // start watching
    compass.watch()
    compass.on('heading', function (heading) {
      style.getImage().setRotation(Math.PI / 180 * heading)
    })
    // stop watching
    // kompas.clear();

    const map = new Map({
      target: 'map-container',
      layers: [
        new TileLayer({
          source: new OSMSource()
        })
      ],
      view: new View({
        // center: fromLonLat([119.60753817138888, 30.49043631527778]),
        center: [13038389.943647558, 4391360.940714571],
        zoom: 14
      })
    })

    map.addLayer(layer)

    navigator.geolocation.watchPosition(
      function (pos) {
        const coords = [pos.coords.longitude, pos.coords.latitude]
        const accuracy = circular(coords, pos.coords.accuracy)
        source.clear(true)
        source.addFeatures([
          new Feature(accuracy.transform('EPSG:4326', map.getView().getProjection())),
          new Feature(new Point(fromLonLat(coords)))
        ])
      },
      function (error) {
        alert(`ERROR: ${error.message}`)
      },
      { enableHighAccuracy: true }
    )
    map.on('click', function (evt) {
      console.log(evt)
    })

    const locate = document.createElement('div')
    locate.className = 'ol-control ol-unselectable locate'
    locate.innerHTML = `<button title="Locate me">◎</button>`
    locate.addEventListener('click', function () {
      if (!source.isEmpty()) {
        map.getView().fit(source.getExtent(), {
          maxZoom: 18,
          duration: 500
        })
      }
    })
    map.addControl(new Control({
      element: locate
    }))
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
    drawSelect () {
    },
    clearSelect () {
    }
  }
}
</script>
