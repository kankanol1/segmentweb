<template>
  <div>
    <div id="map" class="map"></div>
    <div id="info" style="display: none;"></div>
    <label for="track">
      track position
      <input id="track" type="checkbox"/>
    </label>
    <p>
      position accuracy : <code id="accuracy"></code>&nbsp;&nbsp;
      altitude : <code id="altitude"></code>&nbsp;&nbsp;
      altitude accuracy : <code id="altitudeAccuracy"></code>&nbsp;&nbsp;
      heading : <code id="heading"></code>&nbsp;&nbsp;
      speed : <code id="speed"></code>
    </p>
  </div>

</template>

<script>
  import 'ol/ol.css'
  import Feature from 'ol/Feature';
  import Geolocation from 'ol/Geolocation';
  import Map from 'ol/Map';
  import Point from 'ol/geom/Point';
  import View from 'ol/View';
  import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';

  import {OSM, Vector as VectorSource} from 'ol/source';
  import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
  import {fromLonLat, toLonLat} from 'ol/proj'

  export default {
    name: "test",
    components: {},
    data() {
      return {}
    },
    watch: {},
    mounted() {
      var view = new View({
        center: [0, 0],
        zoom: 2,
      });


      var map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: view,
      });

      var geolocation = new Geolocation({
        trackingOptions: {
          enableHighAccuracy: true,
        },
        projection: view.getProjection(),
      });

      function el(id) {
        return document.getElementById(id)

      }

      el('track').addEventListener('change', function () {
        geolocation.setTracking(this.checked)
      });

      geolocation.on('change', function () {
        el('accuracy').innerText = geolocation.getAccuracy() + ' [m]';
        el('altitude').innerText = geolocation.getAltitude() + ' [m]';
        el('altitudeAccuracy').innerText = geolocation.getAltitudeAccuracy() + ' [m]';
        el('heading').innerText = geolocation.getHeading() + ' [rad]';
        el('speed').innerText = geolocation.getSpeed() + ' [m/s]';
      })
      geolocation.on('error', function (error) {
        var info = document.getElementById('info');
        info.innerHTML = error.message;
        info.style.display = '';

      });

      var accuracyFeature = new Feature();
      geolocation.on("change:accuracyGeometry", function () {
        accuracyFeature.setGeometry(geolocation.getAccuracyGeometry())
      });
      var positionFearture = new Feature();
      positionFearture.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({
              color: '#3399cc',
            }),
            stroke: new Stroke({
                color: '#fff',
                width: 2
              }),

          })
        })
      );
      geolocation.on("change:position",function(){
        var coordinates = geolocation.getPosition();
        positionFearture.setGeometry(coordinates)?new Point(coordinates):null;
      });

      new VectorLayer({
        map:map,
        source:new VectorSource({
          features:[accuracyFeature,positionFearture],
        })
      })


    },
    methods: {}
  }
</script>

<style scoped>
  #map {
    width: 100%;
    height: 300px;
  }
</style>
