mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/light-v11", // style URL
  center: campgrounds.geometry.coordinates, // starting position [lng, lat]
  zoom: 8, // starting zoom
});
map.addControl(new mapboxgl.NavigationControl());

const marker1 = new mapboxgl.Marker()
  .setLngLat(campgrounds.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({
      offset: 25,
      className: "my-class",
    }).setHTML(`<h3>${campgrounds.title}</h3><p>${campgrounds.location}</p>`)
  )
  .addTo(map);
