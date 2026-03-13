mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
   container: 'map',
   center: vetplace.geometry.coordinates,
   zoom: 13,
   style: 'mapbox://styles/mapbox/standard',
});

new mapboxgl.Marker()
   .setLngLat(vetplace.geometry.coordinates)
   .setPopup(
      new mapboxgl.Popup({offset:25})
      .setHTML(
         `<h3>${vetplace.name}</h3><p>${vetplace.location}</p>`
      )
   )
   .addTo(map);

