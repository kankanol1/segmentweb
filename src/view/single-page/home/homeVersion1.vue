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
    height: 80%;

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
    /*background-color: #0f3a65;*/

    button {
      margin: 1px 0;
      border: 1px solid #fff;
    }

  }
/*  .ivu-btn-group-vertical .ivu-btn:not(:first-child):not(:last-child){
    border-top-color:#fff;
    border-bottom-color:#fff;

  }*/
 /* .ivu-btn-group-large > .ivu-btn{
    width: 100px;
    text-align: center;
    border-bottom-color: #fff;
  }*/
  #box {
    padding: 10px 0;
    display: none;
    position: absolute;
    width: 100px;
    z-index: 100;
    background-color: #fff;
    list-style: none;
    margin: 0;

    li {
      color: #000;
      padding: 4px 20px;
    }

    li:hover {
      background-color: #eee;
    }

  }

  .imgs{
    width: 100%;
    height:100%;
    .ivu-col.ivu-col-span-12{
      width: 50%;
      height:100%;
      padding: 10px;
      text-align: center;
      color:#2d8cf0;

      .div{
        width: calc(100% - 20px);
        height:100%;
        text-align: center;
        padding: 0 10px;
      }
    }
  }
</style>
<template>
  <div style="width: 100%;height:100%;position:relative">
    <div class="buttons">
      <ButtonGroup vertical size="large">
        <Button @click="drawSelect" type="primary">绘制</Button>
<!--        <Button @click="clearDraw" type="primary" :disabled="source && !source.getFeatures().length>=1">取消绘制</Button>-->
        <Button @click="editSelect" type="primary" :disabled="source && !source.getFeatures().length>=1">编辑</Button>
<!--        <Button @click="cancelEdit" type="primary" :disabled="source && !source.getFeatures().length>=1">取消编辑</Button>-->
        <Button @click="getAll" type="primary">全图</Button>
        <Button @click="clearMap" type="primary" :disabled="(source && !source.getFeatures().length>=1) || !base64">清除</Button>
        <Button @click="startCompute"  :disabled="!base64" type="primary">编译</Button>
      </ButtonGroup>

    </div>
    <div class="map-box" id="map-container">
    </div>
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
    <ul id="box">
      <li @click='deleteF'>删除</li>
      <li @click="selectF">选择</li>
      <li @click="removeF">取消选择</li>
    </ul>
    <Modal
      v-model="modal1"
      fullscreen
      title="图像处理前后对比"
      footer-hide
    >
      <Row class="imgs">
        <Col span="12">
            <h4>编译前的图片</h4>
            <img :src="src1" style="width: 100%;height:100%" alt="">
        </Col>
        <Col span="12">
            <h4>编译后的图片</h4>
            <img :src="src2" style="width: 100%;height: 100%" alt="">
        </Col>
      </Row>
    </Modal>
  </div>

</template>
<script>
import 'ol/ol.css'
import GeoJSON from 'ol/format/GeoJSON'
import Map from 'ol/Map'
import View from 'ol/View'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import DragAndDrop from 'ol/interaction/DragAndDrop'
import { fromLonLat, toLonLat } from 'ol/proj'
import Modify from 'ol/interaction/Modify'
import { Fill, Stroke, Style, Text } from 'ol/style'
import Draw, {
  createBox,
  createRegularPolygon
} from 'ol/interaction/Draw'
import { DragBox, Select } from 'ol/interaction'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'

import OSMSource from 'ol/source/OSM'
import { mapActions } from 'vuex'
import MousePosition from 'ol/control/MousePosition'
import { createStringXY } from 'ol/coordinate'
import { defaults as defaultControls } from 'ol/control'
import { platformModifierKeyOnly } from 'ol/events/condition'
import Feature from 'ol/Feature'
import { Polygon, Point } from 'ol/geom'
import axios from '@/libs/api.request'

export default {
  name: 'home',
  components: {},
  data () {
    return {

      modal1: false,
      src1: undefined,
      src2: undefined,

      source: undefined,
      map: undefined,
      layer: undefined,
      dragAndDrop: undefined,
      modify: undefined,
      draw: undefined,
      format: undefined,
      view: undefined,
      select: undefined,
      selectedFeatures: undefined,
      selected: [],
      coordinate: [],
      file: undefined,
      blob: undefined,
      base64: undefined
    }
  },
  watch: {},
  mounted () {
    // this.selfMenu();//自定义右键菜单

    var mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: 'EPSG:4326',
      className: 'custom-mouse-position',
      target: document.getElementById('mousePosition'),
      undefinedHTML: '&nbsp;'
    })

    this.map = new Map({
      controls: defaultControls().extend([mousePositionControl])
    })
    this.initMap2()

    this.map.on('click', (e) => {
      // && that.source
      //         console.log(e);
      console.log('click: ', this.source && this.source.getFeatures())
      console.log('click: ', this.select && this.select.getFeatures())
      /* if(){
          this.clearMap();

        } */
      // this.source.getFeatures().length>=1 && this.source.removeFeature(this.source.getFeatures()[0]);
      // console.log("click: ",that.source && that.source.getKeys());

      // console.log("click: ", that.select.getFeatures());
      // console.log("click: ", that.draw,that.draw&&that.draw.getKeys());
      // console.log("click: ",toLonLat(e.coordinate,'EPSG:3857'));
    })
    this.map.on('dblclick', function (e) {
      console.log('dblclick: ', toLonLat(e.coordinate, 'EPSG:3857'))
    })
    this.map.on('change', function (e) {
      console.log('change: ', toLonLat(e.coordinate, 'EPSG:3857'))
    })

    this.map.on('pointermove', e => {
      this.coordinate = e.coordinate
    })

    this.map.on('movestart', e => {
      // this.source.getFeatures().length>=1 && this.source.removeFeature(this.source.getFeatures()[0]);
      console.log('movestart')
      // this.clearSelect();
    })
    this.map.on('moveend', e => {
      console.log('moveend')
      // this.clearMap();
    })
    this.map.on('pointerdrag', e => {
      console.log('pointerdrag')
      // this.clearMap();
      console.log()
    })
    /* map.on('moveend', e => {
        var zoom = this.map.getView().getZoom();
        console.log(zoom);
        document.getElementById('box').style.transform = 'scale('+(zoom/5)+')';

      }) */
  },
  methods: {
    ...mapActions([
      'handleLogOut'
    ]),
    initMap2 () {
      var polyCoords = []
      var labelCoords = []
      var feature = new Feature({
        geometry: new Polygon(polyCoords),
        labelPoint: new Point(labelCoords),
        name: 'My Polygon'
      })

      this.source = new VectorSource()

      this.layer = new VectorLayer({
        source: this.source,
        style: function () {
          return new Style({
            fill: new Fill({
              color: 'rgba(0,255,0,0)'
            }),
            stroke: new Stroke({
              color: 'rgba(255,0,0,1)'
            })
          })
        }
      })
      /* var layers = new TileLayer({//瓦片图layer
          // extent: mapExtent,//范围，即卫星图的坐标边界，可以用arcgis打开tif文件即可查到
          source: new XYZ({//
            // attributions: [new ol.Attribution({html: 'IUE'})],//右下角版权显示的
            url: "map/{z}/{x}/{y}.png",//图片访问地址、规则， z代表zoom（层级）
            tilePixelRatio: 1.000000,
            minZoom: mapMinZoom,//最小层级
            maxZoom: mapMaxZoom//最大层级，超过最大、最小层级该图层将不会显示
          })
        }); */
      let dragAndDrop = new DragAndDrop({
        source: this.source,
        formatConstructors: [GeoJSON]
      })
      this.modify = new Modify({
        source: this.source
      })
      this.draw = new Draw({
        type: 'Circle', // 'Point'，'LineString'，'LinearRing'， 'Polygon'，'MultiPoint'，'MultiLineString'，'MultiPolygon'， 'GeometryCollection'，'Circle'
        source: this.source,
        geometryFunction: createBox()// 创建矩形
        // geometryFunction: createRegularPolygon(),//创建中心矩形
      })
      /* draw.once('drawstart ',e=>{
          console.log("_________________________4_______________________");
          console.log("drawstart");
        }); */
      // this.darw = draw;
      this.view = new View({
        center: fromLonLat([110.90649323723949, 36.76492663092782]),
        zoom: 6
      })
      this.select = new Select()
      /* this.select.on('select', (e) => {
          // var res = document.getElementById('box');      //找到id为box的div
          // res.style.display = 'block';
          // console.log(e.selected);
          // console.log(this.select.getFeatures(), e.selected);
          // getFeatures
          this.selected = e.selected;
        }); */
      var layer0 = new TileLayer({
        source: new OSMSource()
      })

      this.map.setTarget('map-container')
      this.map.setView(this.view)
      this.map.addLayer(layer0)
      this.map.addLayer(this.layer)

      this.map.addInteraction(this.select)
      this.map.addInteraction(this.draw)
      // this.map.addInteraction(this.modify);
    },
    deleteF () { // 删除图层
      // console.log(this.selected);
      /* this.selected.map(i=>{
           var polygon = i.getGeometry().getCoordinates()
           console.log(polygon);
           // this.source.removeFeature(i);
         }); */
      var sourceF = this.source.getFeatures()
      var flag = -1

      sourceF.map((i, j) => {
        var polygon = i.getGeometry().getCoordinates()[0]
        if (this.isInPolygon(this.coordinate, polygon)) {
          flag = j
        }
      })

      flag >= 0 && this.source.removeFeature(sourceF[flag])
    },
    checkAll () { // 监测点击最上层图层
      var flag = false
      var sourceF = this.source.getFeatures()
      sourceF.map((i, j) => {
        var polygon = i.getGeometry().getCoordinates()[0]
        if (this.isInPolygon(this.coordinate, polygon)) {
          flag = true
        }
      })
      return flag
    },
    removeF () { // 移除图层
      var sourceF = this.source.getFeatures()
      sourceF.map((i, j) => {
        var polygon = i.getGeometry().getCoordinates()[0]
        if (this.isInPolygon(this.coordinate, polygon)) {
          // this.select.removeFeature(i);
          console.log(this.select)
        }
      })
    },
    selectF () { // 选择图层
      var sourceF = this.source.getFeatures()
      sourceF.map((i, j) => {
        var polygon = i.getGeometry().getCoordinates()[0]
        if (this.isInPolygon(this.coordinate, polygon)) {
          console.log(this.select)
          // this.select.addFeature_(i)
        }
      })
    },
    getAll () { // 全图保存编译
      var map = this.map
      var that = this
      map.on('rendercomplete', function () {
        var mapCanvas = document.createElement('canvas')
        var size = map.getSize()
        mapCanvas.width = size[0]
        mapCanvas.height = size[1]
        var mapContext = mapCanvas.getContext('2d')
        Array.prototype.forEach.call(
          document.querySelectorAll('.ol-layer canvas'),
          // document.querySelectorAll('.ol-unselectable .ol-layers'),

          function (canvas) {
            if (canvas.width > 0) {
              var opacity = canvas.parentNode.style.opacity
              mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity)
              var transform = canvas.style.transform
              // Get the transform parameters from the style's transform matrix
              var matrix = transform
                .match(/^matrix\(([^\(]*)\)$/)[1]
                .split(',')
                .map(Number)
                // Apply the transform to the export map context
              CanvasRenderingContext2D.prototype.setTransform.apply(
                mapContext,
                matrix
              )
              mapContext.drawImage(canvas, 0, 0)
            }
          }
        )
        that.base64 = mapCanvas.toDataURL()
      })
      map.renderSync()
    },
    getInitMap () {
      this.map._this.once('postcompose', function (event) {
        var canvas = event.context.canvas
        if (navigator.msSaveBlob) {
          navigator.msSaveBlob(canvas.msToBlob(), 'map.png')
        } else {
          canvas.toBlob(function (blob) {
            saveAs(blob, 'map.png')
          })
        }
      })
      this.map._this.renderSync()
    },
    isInPolygon (checkPoint, polygonPoints) { // 检验点是否在区域内部
      var counter = 0
      var i
      var xinters
      var p1, p2
      var pointCount = polygonPoints.length
      p1 = polygonPoints[0]

      for (i = 1; i <= pointCount; i++) {
        p2 = polygonPoints[i % pointCount]
        if (
          checkPoint[0] > Math.min(p1[0], p2[0]) &&
            checkPoint[0] <= Math.max(p1[0], p2[0])
        ) {
          if (checkPoint[1] <= Math.max(p1[1], p2[1])) {
            if (p1[0] != p2[0]) {
              xinters =
                  (checkPoint[0] - p1[0]) *
                  (p2[1] - p1[1]) /
                  (p2[0] - p1[0]) +
                  p1[1]
              if (p1[1] == p2[1] || checkPoint[1] <= xinters) {
                counter++
              }
            }
          }
        }
        p1 = p2
      }
      if (counter % 2 == 0) {
        return false
      } else {
        return true
      }
    },
    dataURLtoFile (dataurl, filename) { // base64转化为FIle
      // 将base64转换为文件，dataurl为base64字符串，
      // filename为文件名（必须带后缀名，如.jpg,.png）
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], filename, { type: mime })
    },
    convertBase64UrlToBlob (urlData) { // base64转化为blob
      var bytes = window.atob(urlData.split(',')[1]) // 去掉url的头，并转换为byte

      // 处理异常,将ascii码小于0的转换为大于0
      var ab = new ArrayBuffer(bytes.length)
      var ia = new Uint8Array(ab)
      for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i)
      }

      return new Blob([ab], { type: 'image/png' })
    },

    selfMenu () { // 自定义右键菜单
      document.oncontextmenu = function () {
        return false
      } // 禁止鼠标右键菜单显示

      var res = document.getElementById('box') // 找到id为box的div
      document.body.onmouseup = (e) => { // 在body里点击触发事件
        if (e.button === 2 && this.checkAll()) { // 如果button=1（鼠标左键），button=2（鼠标右键），button=0（鼠标中间键）
          res.style.top = e.offsetY + 'px' // 鼠标点击时给div定位Y轴
          res.style.left = e.offsetX + 'px' // 鼠标点击时给div定位X轴
          res.style.display = 'block' // 显示div盒子
        } else {
          res.style.display = 'none' // 否则不显示div盒子
        }
      }
    },
    logout () { // 退出
      this.handleLogOut().then(() => {
        this.$router.push({
          name: 'login'
        })
      })
    },
    drawSelect () {
      console.log(this.draw, this.map)
      // this.draw & this.map.addInteraction(this.draw);
    },
    clearSelect () {
      this.draw & this.map & this.map.removeInteraction(this.draw)
    },
    clearMap () {
      this.source & this.source.clear()
      this.base64 = undefined
    },
    clearDraw () {
      this.draw & this.map.removeInteraction(this.draw)
    },
    editSelect () {
      this.modify & this.map.addInteraction(this.modify)
    },
    cancelEdit () {
      this.modify & this.map.removeInteraction(this.modify)
    },
    startCompute () {
      var formData = new FormData()
      var file = this.dataURLtoFile(this.base64, 'map.png')
      var blob = this.convertBase64UrlToBlob(this.base64)
      formData.append('file', file)
      formData.append('blob', blob)
      formData.append('base64', this.base64)
      axios.request({
        url: 'img',
        data: formData,
        method: 'post'
      }).then(res => {
        if (res.status === 200) {
          this.src1 = this.base64
          this.src2 = res.data.base64
          this.modal1 = true
        }
      })
    },
    initMap () {
      this.source = new VectorSource()
      this.layer = new VectorLayer({
        source: this.source
      })
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
                 }), */
            source: new OSMSource()
          })
        ]
      })

      this.dragAndDrop = new DragAndDrop({// 文件
        source: this.source,
        formatConstructors: [GeoJSON]
      })
      this.modify = new Modify({// 调整
        source: this.source
      })
      this.draw = new Draw({// 画笔
        type: 'Polygon',
        source: this.source
      })

      this.map.addLayer(this.layer)
      this.map.addInteraction(this.dragAndDrop)
      this.map.addInteraction(this.modify)
      this.map.addInteraction(this.draw)
      this.format = new GeoJSON({ featureProjection: 'EPSG:3857' })
    }

  }
}
</script>
<style>

  .custom-mouse-position {
    position: relative;
    top: calc(100% - 22px);
    border-radius: 4px;
    padding: 2px 10px;
    color: #000;
    width: 140px;
    background-color: #fff;
  }
</style>
