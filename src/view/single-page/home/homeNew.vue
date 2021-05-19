<style scoped lang="less">
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
</style>

<template>
  <div class="all">
    <div id="map" class="map">
      <div style="position:fixed;left:45%;z-index:10;text-align: center">
        <Button @click="initMap()">初始化选区</Button>
        <Button @click="save()" :loading="loadingQ">{{loadingQ?'编译中...':'全图编译'}}</Button>
        <Button @click="selectA()" :loading="loadingX">{{loadingX?'编译中...':'选取编译'}}</Button>
        <Button @click="openPicture">图片编译</Button>
      </div>
    </div>
    <Modal
      v-model="modal1"
      fullscreen
      title="图像处理前后对比"
      footer-hide
    >
      <div class="all-img">
        <div class="all-img-item all-img-title">
          <div><h2>编译前的图片</h2></div>
          <div><h2 style="text-align: center">编译后的图片</h2></div>
        </div>
        <div class="all-img-item all-img-body">
          <div><img class="img" :src="src1" alt=""></div>
          <div><img class="img" :src="src2" alt=""></div>
        </div>
      </div>
    </Modal>
    <Modal v-model="modal2"  fullscreen title="图像处理前后对比" footer-hide>
      <upload-file/>
    </Modal>
      <user-setting/>

  </div>

</template>
<script>

import 'ol/ol.css'
import GeoJSON from 'ol/format/GeoJSON'
import Map from 'ol/Map'
import View from 'ol/View'
import { Source, OSM, Vector as VectorSource, XYZ } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import * as olExtent from 'ol/extent'

import $ from 'jquery'
import MousePosition from 'ol/control/MousePosition'
import { createStringXY } from 'ol/coordinate'
import Feature from 'ol/Feature'

import { mapActions } from 'vuex'
import { Fill, Stroke, Style } from 'ol/style'
import Modify from 'ol/interaction/Modify'
import Draw, { createBox } from 'ol/interaction/Draw'
import { fromLonLat, toLonLat } from 'ol/proj'
import axios from '@/libs/api.request'
import {
  Select,
  Translate,
  defaults as defaultInteractions
} from 'ol/interaction'

import UploadFile from '@/view/pages/upload-file/index.vue'
import UserSetting from '@/view/pages/user-setting/index.vue'
export default {
  name: 'home',
  components: { UploadFile, UserSetting },
  data () {
    return {
      modal1: false,
      modal2: false,
      loadingX: false,
      loadingQ: false,
      src1: undefined,
      src2: undefined,

      map: undefined,
      source: undefined,
      layer: undefined,
      modify: undefined,
      view: undefined,
      draw: undefined,
      translate: undefined,
      selected: undefined,
      select: new Select({
        style: new Style({
          fill: new Fill({
            color: 'rgba(0,255,0,0)'
          }),
          stroke: new Stroke({
            color: 'rgba(255,0,255,1)',
            lineCap: 'square', // butt round square
            lineJoin: 'bevel', // bevel，round或miter
            width: 2
          })
        })
      }),
      mapUrl: {
        /****
           * 高德地图
           * lang可以通过zh_cn设置中文，en设置英文，size基本无作用，scl设置标注还是底图，scl=1代表注记，
           * scl=2代表底图（矢量或者影像），style设置影像和路网，style=6为影像图，
           * vec——街道底图
           * img——影像底图
           * roadLabel---路网+标注
           */
        'aMap-img': 'http://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
        'aMap-vec': 'http://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        'aMap-roadLabel': 'http://webst0{1-4}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
        /***
           * 天地图 要key的
           * vec——街道底图
           * img——影像底图
           * ter——地形底图
           * cva——中文注记
           * cta/cia——道路+中文注记 ---roadLabel
           */
        'tian-img': 'http://t{0-7}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=789500186382ea9e548354462ba06673',
        'tian-roadLabel': 'http://t{0-7}.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=789500186382ea9e548354462ba06673',
        'tian-label': 'http://t{0-7}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=789500186382ea9e548354462ba06673',
        'tian-vec': 'http://t{0-7}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=789500186382ea9e548354462ba06673',
        'tian-ter': 'http://t{0-7}.tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=789500186382ea9e548354462ba06673',
        /***
           *geoq地图
           * http://cache1.arcgisonline.cn
           * http://map.geoq.cn
           * vec：标准彩色地图
           * gray、blue、warm
           * line 中国轮廓图
           * china 中国轮廓图+标注
           * Hydro 水系
           * green 植被
           */
        'geoq-vec': 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}',
        'geoq-gray': 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}',
        'geoq-blue': 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
        'geoq-warm': 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}',
        'geoq-line': 'http://cache1.arcgisonline.cn/arcgis/rest/services/SimpleFeature/ChinaBoundaryLine/MapServer/tile/{z}/{y}/{x}', // 不稳定
        'geoq-china': 'http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/administrative_division_boundaryandlabel/MapServer/tile/{z}/{y}/{x}', // 不稳定
        'geoq-Hydro': 'http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/WorldHydroMap/MapServer/tile/{z}/{y}/{x}', // 不稳定
        'geoq-green': 'http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/vegetation/MapServer/tile/{z}/{y}/{x}', // 不稳定
        /***
           * Google
           * m 街道
           * s 影像
           */
        'google-vec': 'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}',
        'google-img': 'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}'

      }
    }
  },
  watch: {},
  mounted () {
    this.select.on('select', (e) => {
      this.selected = e.selected[0]
    })
    var translate = new Translate({
      features: this.select.getFeatures()
    })

    translate.on('translatestart', (e) => {
      // 拖动开始的监听函数
      // console.log("拖动开始的监听函数", e);
    })
    translate.on('translateend', (e) => {
      // 拖到结束监听函数
      // console.log("拖到结束监听函数");
    })

    this.map = new Map({
      interactions: defaultInteractions().extend([this.select, translate]),
      target: 'map',
      layers: [
        new TileLayer({
          source: new XYZ({
            crossOrigin: 'anonymous',
            // url: this.mapUrl["tian-img"],//这里是引用的本地
            url: this.mapUrl['aMap-img'], // 这里是引用的本地
            wrapX: true
          })
        })
      ],
      view: new View({
        center: [12954117.957530862, 4852701.975139299],
        zoom: 6
      })
    })
    this.initMap()
    this.map.on('movestart', e => {
      // console.log(this.map.getView().getCenter());
    })
    this.map.on('click', e => {
      // console.log(e.coordinate);
      // console.log(this.select.getFeatures());
      // this.source && console.log(this.source.getFeatures()[this.source.getFeatures().length - 1].getGeometry());
    })
  },
  methods: {
    ...mapActions([
      'segmentImg'
    ]),
    moveScroller () {
      $('.all-img-body>div').each(function () {
        let that = this
        this.addEventListener('scroll', function (event) {
          $(that).siblings().each(function () {
            $(this).scrollTop(event.target.scrollTop)
            $(this).scrollLeft(event.target.scrollLeft)
          })
        })
      })
    },
    showPix () {
      this.map && console.log(JSON.stringify(this.map.getPixelFromCoordinate(this.map.getView().getCenter())))
    },
    initMap () {
      this.source && this.source.clear()
      // this.draw && this.draw.clear();
      // https://openlayers.org/en/latest/examples/geojson.html

      // console.log(geojsonObjects);
      // var center = this.map.get
      var a = this.map.getView().getCenter()// 地图中心点
      this.map.getView().setZoom(6)// 地图中心点
      var dis1 = 1e6 * 0.618
      var dis2 = 1e6
      var a1 = [a[0] - dis1, a[1] - dis2]
      var a2 = [a[0] - dis1, a[1] + dis2]
      var a3 = [a[0] + dis1, a[1] + dis2]
      var a4 = [a[0] + dis1, a[1] - dis2]
      var geojson = {
        'type': 'Feature',
        'geometry': {
          'type': 'MultiPolygon',
          'coordinates': [[[a4, a3, a2, a1, a4]]]
          // "coordinates": geojsonObjects.geometry.coordinates,
        }
      }
      this.source = new VectorSource({
        features: new GeoJSON().readFeatures(geojson)
      })

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
      /*  this.select = new Select();
          // console.log(this.select,this.select.getFeatures());
          this.translate = Translate({//拖拽移动interaction
            features:  this.select.getFeatures()//拖拽的为选择的要素
          }); */
      // 这样是动态给map插入这个属性，这个研究了好久，非常实用。
      // 如果不是动态插入的直接在map里面添加： map = new ol.Map({interactions: ol.interaction.defaults().extend([iTranslate])}
      /* this.translate.on('translatestart',(e)=>{
           //拖动开始的监听函数
         })
         this.translate.on('translateend',(e)=>{
           //拖到结束监听函数
         }) */
      this.modify = new Modify({ source: this.source })
      this.view = new View({ center: fromLonLat([110.90649323723949, 36.76492663092782]), zoom: 6 })
      this.draw = new Draw({ type: 'Circle', source: this.source, geometryFunction: createBox() })

      // this.map.setTarget('map');
      // this.map.setView(this.view);
      this.map.addLayer(this.layer)
      // this.map.addLayer(pointLayer);
      // this.map.addInteraction(this.draw);
      // this.map.addInteraction(this.modify);
      // this.map.addInteraction(this.select);
      // this.map.addInteraction(this.translate);

      // 添加控制器
      var mousePositionControl = new MousePosition({
        coordinateFormat: createStringXY(4),
        projection: 'EPSG:4326',
        className: 'custom-mouse-position',
        target: document.getElementById('mousePosition'),
        undefinedHTML: '&nbsp;'
      })
      // this.map.addControl(mousePositionControl);
    },

    selectA () {
      var map = this.map
      var that = this
      this.$Message.destroy()
      if (this.selected) {
        this.loadingX = true
        var feature = this.selected
        var geometry = feature.getGeometry()
        var ext = geometry.getExtent()
        var r = map.getView().getResolutionForExtent(ext, map.getSize())// 根据范围获取分辨率
        map.getView().setResolution(r)
        var centerone = olExtent.getCenter(ext)
        map.getView().setCenter(centerone)

        map.once('postrender', function (e) {
          var extents = that.selected.getGeometry().getCoordinates()[0][0].map(i => {
            return e.target.getPixelFromCoordinate(i)
          })
          var start = extents[2]
          var end = extents[4]
          map.once('postcompose', function (event) {
            var mapCanvas = document.createElement('canvas')
            var mapContext = mapCanvas.getContext('2d')
            var aa = document.querySelectorAll('.ol-layer canvas')[0]
            mapCanvas.width = Math.abs(end[0] - start[0])
            mapCanvas.height = Math.abs(end[1] - start[1])
            setTimeout(() => { // 防止地图瓦片刷新
              mapContext.drawImage(aa, start[0], start[1], Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1]), 0, 0, Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1]))
              that.src1 = mapCanvas.toDataURL()
              that.sendFile(mapCanvas.toDataURL(), 'loadingX')
            }, 2000)
            map.updateSize()// 容器改变重新加载地图
          })
        })
      } else {
        this.initMap()
        this.$Message.info('请点击框选图层!')
      }
    },
    save () {
      this.source && this.source.clear()
      var that = this
      var map = this.map

      this.loadingQ = true
      map.once('rendercomplete', function (e) {
        var mapCanvas = document.createElement('canvas')
        var size = map.getSize()
        mapCanvas.width = size[0]
        mapCanvas.height = size[1]
        var mapContext = mapCanvas.getContext('2d')
        var aa = document.querySelectorAll('.ol-layer canvas')[0]
        mapContext.drawImage(aa, 0, 0)
        that.src1 = mapCanvas.toDataURL()
        that.sendFile(mapCanvas.toDataURL(), 'loadingQ')
      })
      map.renderSync()
    },
    sendFile (img, loadingName) {
      var formData = new FormData()
      var file = this.dataURLtoFile(img, 'map.png')
      var blob = this.convertBase64UrlToBlob(img)
      formData.append('file', file)
      formData.append('blob', blob)
      formData.append('base64', img)
      axios.request({
        url: 'img',
        data: formData,
        method: 'post'
      }).then(res => {
        if (res.status === 200) {
          this.src1 = img
          this.src2 = res.data.base64
          this.modal1 = true
          this.moveScroller()
        }
      }).finally(() => this[loadingName] = false)
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

    openPicture () {
      this.modal2 = true
    }

  }
}
</script>
<style lang="less" scoped>
  #map {
    width: 100%;
    height: calc(100vh);
  }

  .all-img {
    &-item {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
    }

    &-title {
      text-align: center;
    }

    &-body {
      height: ~"calc(100vh - 150px)";

      div {
        height: 100%;
        overflow-x: auto;
        text-align: center;

        img {
          display: block;
        }
      }
    }
  }

  .all {
    position: relative;
    .all-box {
      overflow: auto;
      height: 100%;

      .img {

      }
    }

  }

</style>
<style>
  .ol-zoom.ol-unselectable.ol-control{
    margin-top: 100px;
  }
/*  .custom-mouse-position {
    position: relative;
    top: calc(100% - 22px);
    border-radius: 4px;
    padding: 2px 10px;
    color: #000;
    width: 140px;
    background-color: #fff;
  }*/
</style>
