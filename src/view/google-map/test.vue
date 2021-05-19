<template>
  <div style="width: 100%;height: 100%">
    <div id="map" class="map"></div>
    <form class="form-inline">
      <label>Shape type &nbsp;</label>
      <select id="type">
        <option value="Circle">Circle</option>
        <option value="Square">Square</option>
        <option value="Box">Box</option>
        <option value="Star">Star</option>
        <option value="None">None</option>
      </select>
    </form>
  </div>

</template>

<script>
import 'ol/ol.css'
import Draw, {
  createBox,
  createRegularPolygon
} from 'ol/interaction/Draw'
import Map from 'ol/Map'
import Polygon from 'ol/geom/Polygon'
import View from 'ol/View'
import { OSM, Vector as VectorSource } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'

export default {
  name: 'test',
  components: {},
  data () {
    return {}
  },
  watch: {},
  mounted () {
    var raster = new TileLayer({
      source: new OSM()
    })
    var source = new VectorSource({ wrapX: false })
    var vector = new VectorLayer({
      source: source
    })
    var map = new Map({
      layers: [raster, vector],
      target: 'map',
      view: new View({
        center: [-11000000, 4600000],
        zoom: 4
      })
    })

    var typeSelect = document.getElementById('type')
    var draw

    function addInteraction () {
      var value = typeSelect.value
      if (value !== 'None') {
        var geometryFunction
        if (value === 'Square') {
          value = 'Circle'
          geometryFunction = createRegularPolygon(4)
        } else if (value === 'Box') {
          value = 'Circle'
          geometryFunction = createBox()
        } else if (value === 'Star') {
          value = 'Circle'
          geometryFunction = function (coordinates, geometry) {
            var center = coordinates[0]
            var last = coordinates[1]
            var dx = center[0] - last[0]
            var dy = center[1] - last[1]
            var radius = Math.sqrt(dx * dx + dy * dy)
            var rotation = Math.atan2(dy, dx)
            var newCoordinates = []
            var numPoints = 12
            for (var i = 0; i < numPoints; ++i) {
              var angle = rotation + (i * 2 * Math.PI) / numPoints
              var fraction = i % 2 === 0 ? 1 : 0.5
              var offsetX = radius * fraction * Math.cos(angle)
              var offsetY = radius * fraction * Math.sin(angle)
              newCoordinates.push([center[0] + offsetX, center[1] + offsetY])
            }
            newCoordinates.push(newCoordinates[0].slice())
            if (!geometry) {
              geometry = new Polygon([newCoordinates])
            } else {
              geometry.setCoordinates([newCoordinates])
            }
            return geometry
          }
        }
        draw = new Draw({
          source: source,
          type: value,
          geometryFunction: geometryFunction
        })
        map.addInteraction(draw)
      }
    }

    typeSelect.onchange = function () {
      map.removeInteraction(draw)
      addInteraction()
    }

    addInteraction()
  },
  methods: {}
}
</script>

<style>
  #map {
    width: 100%;
    height: 400px;
  }

</style>
