<style>
  .map {
    width: 100%;
    height: 400px;
  }
</style>
<template>
  <div>
    <div id="map" class="map"></div>
    <a id="export-png" class="btn btn-default"><i class="fa fa-download"></i> Download PNG</a>
    <a id="image-download" download="map.png"></a>
    <Button @click="getdata">获取数据</Button>
  </div>

</template>
<script>
import 'ol/ol.css'
import GeoJSON from 'ol/format/GeoJSON'
import Map from 'ol/Map'
import View from 'ol/View'
import { OSM, Vector as VectorSource } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'

import $ from 'jquery'
import { mapActions } from 'vuex'
import axios from '@/libs/api.request'

export default {
  name: 'home',
  components: {},
  data () {
    return {}
  },
  watch: {},
  mounted () {
    var map = new Map({
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        new VectorLayer({
          source: new VectorSource({
            url: 'https://openlayers.org/en/latest/examples/data/geojson/countries.geojson',
            format: new GeoJSON()
          }),
          opacity: 0.5
        })
      ],
      target: 'map',
      view: new View({
        center: [0, 0],
        zoom: 2
      })
    })
    var that = this
    document.getElementById('export-png').addEventListener('click', function () {
      map.on('rendercomplete', function () {
        var mapCanvas = document.createElement('canvas')
        var size = map.getSize()
        mapCanvas.width = size[0]
        mapCanvas.height = size[1]
        var mapContext = mapCanvas.getContext('2d')
        Array.prototype.forEach.call(
          document.querySelectorAll('.ol-layer canvas'),
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

        var formData = new FormData()
        var file = that.dataURLtoFile(mapCanvas.toDataURL(), 'map.png')
        var blob = that.convertBase64UrlToBlob(mapCanvas.toDataURL())
        formData.append('file', file)
        formData.append('blob', blob)
        formData.append('name', 'kankan')
        formData.append('base64', mapCanvas.toDataURL())
        console.log(formData.get('file'))

        axios.request({
          url: 'img',
          data: formData,
          method: 'post'
        }).then(res => {
          console.log(1, res)
        })
      })
      map.renderSync()
    })
  },
  methods: {
    ...mapActions([
      'segmentImg'
    ]),
    getdata () {
      var str = 'https://www.jq22.com/demo/echarts-chinazMap201911172308/china-main-city/'

      $.ajax({
        url: str + '100000.json',
        type: 'GET',
        success: function (returndata) {
          console.log('success', returndata)
        },
        error: function (returndata) {
          console.log('error', returndata)
        }
      })
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
