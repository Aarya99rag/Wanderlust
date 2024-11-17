console.log(`api key is ${mapApikey}`);
// Initialize the platform object
var platform = new H.service.Platform({
  apikey: mapApikey,
});

// Obtain the default map types from the platform object
var maptypes = platform.createDefaultLayers();

// Instantiate (and display) the map
var map = new H.Map(
  document.getElementById("mapContainer"),
  maptypes.vector.normal.map,
  {
    zoom: 9,
    center: { lng: coordinates[0], lat: coordinates[1] },
  }
);

// Enable the event system on the map instance:
var mapEvents = new H.mapevents.MapEvents(map);

// Instantiate the default behavior, providing the mapEvents object:
new H.mapevents.Behavior(mapEvents);

// Create a custom SVG icon for the marker
var svgIcon = new H.map.Icon(
  '<svg width="32" height="48" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M16,0C7.163,0,0,7.163,0,16c0,8.836,16,32,16,32s16-23.164,16-32C32,7.163,24.837,0,16,0z" fill="red"/>' +  // Black pin
    '<circle cx="16" cy="16" r="6" fill="white"/>' +  // White circle inside
  '</svg>'
  // <circle cx="20" cy="20" r="15"
);

// Add a marker to the map at the given coordinates
var marker = new H.map.Marker({
  lat: coordinates[1],
  lng: coordinates[0]
}, { icon: svgIcon });

map.addObject(marker);





// // Create the InfoBubble content with some HTML content
// var infoBubbleContent = `
//   <div style="font-size: 14px; color: #333; padding: 10px; background-color: white; border: 1px solid #ccc; border-radius: 5px;">
//     <strong>Marker Title</strong><br>
//     This is an example info bubble with some details about the marker.
//   </div>
// `;

// // Create the Pop-up content with some HTML content
// var popupContent = `
//   <div style="font-size: 14px; color: #333; padding: 10px; background-color: white; border: 1px solid #ccc; border-radius: 5px;">
//     This is a simple pop-up message displayed always.
//   </div>
// `;

// // Get the UI object
// var ui = H.ui.UI.createDefault(map, maptypes);

// // Create the InfoBubble and Pop-up instances using marker's position
// var infoBubble = new H.ui.InfoBubble(marker.getGeometry(), {
//   content: infoBubbleContent
// });

// var popup = new H.ui.InfoBubble(marker.getGeometry(), {
//   content: popupContent
// });

// // Add both the InfoBubble and the Pop-up to the UI
// ui.addBubble(infoBubble);
// ui.addBubble(popup);
