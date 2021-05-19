<template>
  <div style="width: 100%;height: 100%">
    <div id="map" class="map"></div>
  </div>

</template>

<script>
  import 'ol/ol.css'
  import Draw, {
    createBox,
    createRegularPolygon,
  } from 'ol/interaction/Draw';
  import Map from 'ol/Map';
  import Feature from 'ol/Feature';
  import {Fill, Stroke, Style, Text,Icon} from 'ol/style'
  import {Polygon,Point,LineString} from 'ol/geom';
  import {Translate} from 'ol/interaction';//interaction.Translate
  import View from 'ol/View';
  import Collection from 'ol/Collection';
  import {OSM, Vector as VectorSource} from 'ol/source';
  import {Tile,Tile as TileLayer,Vector as VectorLayer} from 'ol/layer';

  export default {
    name: "test",
    components: {},
    data() {
      return {}
    },
    watch: {},
    mounted() {
      var coord1 = [-5707673.76, -3499420.81];
      var coord2 = [-6707673.76, -3499420.81];

      var lineStyle = new Style({
        stroke: new Stroke({
          color: '#ffcc33',
          width: 3,
          lineDash:[10,10]
        })
      });
      var styleMarker = new Style({
        image: new Icon({
          scale: .7, anchor: [0.5, 1],
          src: 'marker.png'
        })
      });

      var marker1 = new Point(coord1);
      var featureMarker1 = new Feature(marker1);
      var marker2 = new Point(coord2);
      var featureMarker2 = new Feature(marker2);

      var line = new LineString([coord1, coord2]);
      var lineFeature = new Feature(line);

      var vector = new VectorSource({
        source: new VectorSource({
          features: [lineFeature, featureMarker1, featureMarker2]
        }),
        style: [lineStyle, styleMarker]
      });

      var map = new Map({
        target: 'map',
        layers: [new Tile({ source: new OSM() }), vector],
        view: new View({ center: coord1, zoom: 5 })
      });

      var translate1 = new Translate({
        features: new Collection([featureMarker1])
      });
      var translate2 = new interaction.Translate({
        features: new Collection([featureMarker2])
      });
      map.addInteraction(translate1);
      map.addInteraction(translate2);

      var coordMarker1, coordMarker2;
      translate1.on('translatestart', function (evt) {
        coordMarker2 = marker2.getCoordinates();
      });
      translate1.on('translating', function (evt) {
        line.setCoordinates([coordMarker2, evt.coordinate]);
      });
      translate2.on('translatestart', function (evt) {
        coordMarker1 = marker1.getCoordinates();
      });
      translate2.on('translating', function (evt) {
        line.setCoordinates([coordMarker1, evt.coordinate]);
      });

      map.on('pointermove', function(e) {
        if (e.dragging) return;
        var hit = map.hasFeatureAtPixel(map.getEventPixel(e.originalEvent));
        map.getTargetElement().style.cursor = hit ? 'pointer' : '';
      });

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
