<template>
  <div style="width: 100%;height: 100%">
    <div id="map" class="map"></div>
    <div id="info">No countries selected</div>
  </div>

</template>

<script>
  import 'ol/ol.css'
  import GeoJSON from 'ol/format/GeoJSON';
  import Map from 'ol/Map';
  import View from 'ol/View'
  import {DragBox, Select} from 'ol/interaction';
  import {OSM, Vector as VectorSource} from 'ol/source';
  import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
  import {platformModifierKeyOnly} from 'ol/events/condition';

  import {fromLonLat, toLonLat} from 'ol/proj'

  export default {
    name: "test",
    components: {},
    data() {
      return {}
    },
    watch: {},
    mounted() {
      var vectorSource = new VectorSource({
        url: 'https://openlayers.org/en/latest/examples/data/geojson/countries.geojson',
        format: new GeoJSON(),
      });


      var map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          new VectorLayer({
            source: vectorSource
          })
        ],
        view: new View({
          center: [0, 0],
          zoom: 0,
          constrainRotation: 16,
        })
      });

      var select = new Select();
      map.addInteraction(select);
      var selectedFeatures = select.getFeatures();
      var dragBox = new DragBox({
        condition: platformModifierKeyOnly,
      })
      map.addInteraction(dragBox);

      dragBox.on('boxend', function () {
        var rotation = map.getView().getRotation();
        var oblique = rotation % (Math.PI / 2) !== 0;
        var candidateFeatures = oblique ? [] : selectedFeatures;
        var extent = dragBox.getGeometry().getExtent();
        vectorSource.forEachFeatureIntersectingExtent(extent, function (feature) {
          candidateFeatures.push(feature);
        });

        if (oblique) {
          var anchor = [0, 0];
          var geometry = dragBox.getGeometry().clone();
          geometry.rotate(-rotation, anchor);
          var extent$1 = geometry.getExtent();
          candidateFeatures.forEach(function (feature) {
            var geometry = feature.getGeometry().clone();
            geometry.rotate(-rotation, anchor);
            if (geometry.intersectsExtent(extent$1)) {
              selectedFeatures.push(feature);
            }
          });
        }
      });
      dragBox.on("boxstart", function () {
        selectedFeatures.clear();
      });

      var infoBox = document.getElementById('info');
      selectedFeatures.on(['add', 'remove'], function () {
        var names = selectedFeatures.getArray().map(function (feature) {
          console.log(feature);
          return feature.get('name');
        });
        if (names.length > 0) {
          infoBox.innerHTML = names.join(', ');
        } else {
          infoBox.innerHTML = 'No countries selected';
        }
      })


    },
    methods: {}
  }
</script>

<style scoped>

  .map {
    width: 100%;
    height: 400px;
  }

  .ol-dragbox {
    background-color: rgba(255, 255, 255, 0.4);
    border-color: rgba(100, 150, 0, 1);
  }
</style>
