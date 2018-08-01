// click functions for map filters
$('.search').click(function(evt){
  evt.preventDefault();
    $('.filter-container').addClass('active');
    $('#primary_nav_wrap .search-filter a.reset').toggle();
    $('.filter-geo').slideToggle(800);
    $('#listings').hide(300);
  return false;
});
$('.heading a').click(function(evt){
  evt.preventDefault();
    $('.heading').addClass('active');
    $('#listings').slideToggle(800);
    $('.filter-geo').hide(300);
  return false;
});


var listings = document.getElementById('listings');
var siblings;

/**
 * [setActive description]
 * @param {[type]} el [description]
 */
function setActive(el) {
  siblings = listings.getElementsByTagName('div');
  for (var i = 0; i < siblings.length; i++) {
    siblings[i].className = siblings[i].className
      .replace(/active/, '').replace(/\s\s*$/, '');
  }

  el.className += ' active';
}

/*  ==========  menu json  ==========*/
// array
var country = [];
var zip = [];
var stateProvince = [];
var ressellerType = [];
var city = [];


// array geojson
/**
 * [fillArray description]
 * @param  {[type]} property    [description]
 * @param  {[type]} arrayToFill [description]
 * @return {[type]}             [description]
 */
function fillArray(property, arrayToFill) {
  for (var i = 0; i < geojsonFeature.features.length; i++) {
    var element = geojsonFeature.features;
    arrayToFill.push(element[i].properties[property]);
  }
  return arrayToFill;
}
// label array
var propertiesObj = {
  country: {
    propertyName: 'country',
    arrayName: country,
    propertyClass: '.filter-country'
  },
  ressellerType: {
    propertyName: 'ressellerType',
    arrayName: ressellerType,
    propertyClass: '.filter-resseller'
  },
  stateProvince: {
    propertyName: 'stateProvince',
    arrayName: stateProvince,
    propertyClass: '.filter-state'
  },
  zip: {
    propertyName: 'zip',
    arrayName: zip,
    propertyClass: '.filter-zip'
  },
  city: {
    propertyName: 'city',
    arrayName: city,
    propertyClass: '.filter-city'
  }
};

// With JavaScript 1.6 / ECMAScript 5 you can use the native filter method of an Array
// http://stackoverflow.com/questions/1960473/unique-values-in-an-array
/**
 * [onlyUnique description]
 * @param  {[type]} value [description]
 * @param  {[type]} index [description]
 * @param  {[type]} self  [description]
 * @return {[type]}       [description]
 */
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

// filters to unique elements from arrays of properties
// and appends to the DOM a list with ul li of same names

/**
 * [listElementConstructor description]
 * @param  {[type]} propertyClass [description]
 * @param  {[type]} arrayName     [description]
 * @param  {[type]} propertyName  [description]
 */
function listElementConstructor(propertyClass, arrayName, propertyName) {
  var unique = arrayName.filter(onlyUnique);
  console.log(unique);
  for (var i = 0; i < unique.length; i++) {
    var appender = propertyClass.toString() + ' ul';

    $('<li />', {html: unique[i]})
      .appendTo(appender)
      .addClass(unique[i])
      .attr({
        'data-filter': propertyName,
        'data-value': unique[i]
      });
  }
}

// list menu
var prop;
for (prop in propertiesObj) {
  if (propertiesObj.hasOwnProperty) {
    fillArray(propertiesObj[prop].propertyName, propertiesObj[prop].arrayName);
    listElementConstructor(propertiesObj[prop].propertyClass,
      propertiesObj[prop].arrayName, propertiesObj[prop].propertyName);
  }
}

/* ==========  load map  ==========*/

var map = new L.map('map', {
  zoom: 7
});

var layer = new L.tileLayer('https://api.mapbox.com/styles/v1/brenthack35/cj6qgoqbv3hor2ss0mrnes6mp/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYnJlbnRoYWNrMzUiLCJhIjoiY2o1bXRreHB5MzhnazJ3bno4YTJqbm9pMyJ9.KVsWHfogkWPDje5qyUSpNg', {
  attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'
});

/* ==========  geoJSON layer  ==========*/

var locations;

/**
 * [wholeMarkersLayer description]
 */
function wholeMarkersLayer() {
  // geojson layer
  locations = L.geoJson(geojsonFeature, {
    pointToLayer: function(feature, latlng) {
      // plugin maki-icons
      var orangeIcon = L.MakiMarkers.icon({
        icon: 'marker',
        color: '#08c',
        size: 'm'
      });
      // var blueIcon = L.MakiMarkers.icon({
      //   icon: "fast-food",
      //   color: "#2D3CCC",
      //   size: "m"
      // });
      // console.log(feature);

      // features
      // if (feature.properties.state == 'PA')
      //   return L.marker(latlng, {icon: blueIcon});
      // else
      //   return L.marker(latlng, {icon: purpleIcon});
      return L.marker(latlng, {
        icon: orangeIcon
      });
    }
  }).addTo(map);
}

wholeMarkersLayer();

/* ==========  features create  ==========*/
// features
locations.eachLayer(function(e) {
  // Shorten locale.feature.properties to just `prop` so we're not
  // writing this long form over and over again.
  var prop = e.feature.properties;

  // Each marker on the map.
  var popup = '<div>' + '<strong>' + prop.name + '</strong>' + '<br>' + 'NPN# ' + prop.npn + '<br>'+ prop.address + '<br>' + '<a href="mailto:'+prop.email+'">' + prop.email + '</a>' + '<br>' + prop.phone;

  var listing = listings.appendChild(document.createElement('div'));
  listing.className = 'item';

  var link = listing.appendChild(document.createElement('a'));
  link.href = '#';
  link.className = 'title';

  link.innerHTML = '<strong>' + prop.name + '</strong>' + '<br>' + prop.address;
  if (prop.crossStreet) {
    link.innerHTML += '<br /><small class="quiet">' +
      prop.crossStreet +
      '</small>';
    popup += '<br /><small class="quiet">' + prop.crossStreet + '</small>';
  }

  var details = listing.appendChild(document.createElement('div'));
  details.innerHTML = prop.city;
  if (prop.phone) {
    details.innerHTML += ' &middot; ' + prop.phone;
  }

  link.onclick = function() {
    setActive(listing);

    // When a menu item is clicked, animate the map to center
    // its associated locale and open its popup.
    map.setView(e.getLatLng(), 16);
    e.openPopup();
    return false;
  };

  // // Marker interaction
  e.on('click', function(a) {
    // 1. center the map on the selected marker.
    map.panTo([a.latlng.lat, a.latlng.lng]);
    map.panTo(e.getLatLng());
    // 2. Set active the markers associated listing.
    setActive(listing);
  });

  popup += '</div>';
  e.bindPopup(popup);
});

map.fitBounds(locations.getBounds());
map.addLayer(layer);

/* filter */
//  console.log(document.getElementsByClassName('.filter-country'));
var filterPressed;
$('.filter-master ul li').click(function(event) {
  $(this).addClass('active');
  map.removeLayer(locations);
  filterPressed = event.target.dataset.filter;
  var prop = event.target.dataset.value;

  locations = L.geoJson(locations.toGeoJSON(), {
    pointToLayer: function(feature, latlng) {
      var orangeIcon = L.MakiMarkers.icon({
        icon: 'marker',
        color: '#08c',
        size: 'm'
      });
      return L.marker(latlng, {
        icon: orangeIcon
      });
    },
    filter: function(feature) {
      return feature.properties[filterPressed] === prop;
    }
  });
  map.fitBounds(locations.getBounds());
  map.addLayer(locations);

  /* ==========  features create  ==========*/
  // features
  locations.eachLayer(function(e) {
    // Shorten locale.feature.properties to just `prop` so we're not
    // writing this long form over and over again.
    var prop = e.feature.properties;

    // Each marker on the map.
    var popup = '<div>' + '<strong>' + prop.name + '</strong>' + '<br>' + 'NPN# ' + prop.npn + '<br>'+ prop.address + '<br>' + '<a href="mailto:'+prop.email+'">' + prop.email + '</a>' + '<br>' + prop.phone;

    var listing = listings.appendChild(document.createElement('div'));
    listing.className = 'item';

    var link = listing.appendChild(document.createElement('a'));
    link.href = '#';
    link.className = 'title';

    link.innerHTML = '<strong>' + prop.name + '</strong>' + '<br>' + prop.address;
    if (prop.crossStreet) {
      link.innerHTML += '<br /><small class="quiet">' +
        prop.crossStreet +
        '</small>';
      popup += '<br /><small class="quiet">' + prop.crossStreet + '</small>';
    }

    var details = listing.appendChild(document.createElement('div'));
    details.innerHTML = prop.city;
    if (prop.phone) {
      details.innerHTML += ' &middot; ' + prop.phone;
    }

    link.onclick = function() {
      setActive(listing);

      // When a menu item is clicked, animate the map to center
      // its associated locale and open its popup.
      map.setView(e.getLatLng(), 16);
      e.openPopup();
      return false;
    };

    // // Marker interaction
    e.on('click', function(a) {
      // 1. center the map on the selected marker.
      map.panTo([a.latlng.lat, a.latlng.lng]);
      map.panTo(e.getLatLng());
      // 2. Set active the markers associated listing.
      setActive(listing);
    });

    popup += '</div>';
    e.bindPopup(popup);
  });

});

$('.filter-reset').click(function() {
  map.removeLayer(locations);
  $('.filter-master ul li').removeClass('active');
  // console.log('poroc');
  // console.log($(event.target.parentElement).hasClass('filter-reset'));
  // if ($(event.target.parentElement).hasClass('filter-reset')){
  wholeMarkersLayer();
  map.fitBounds(locations.getBounds());

  /* ==========  features create  ==========*/
  // features
  locations.eachLayer(function(e) {
    // Shorten locale.feature.properties to just `prop` so we're not
    // writing this long form over and over again.
    var prop = e.feature.properties;

    // Each marker on the map.
    var popup = '<div>' + '<strong>' + prop.name + '</strong>' + '<br>' + 'NPN# ' + prop.npn + '<br>'+ prop.address + '<br>' + '<a href="mailto:'+prop.email+'">' + prop.email + '</a>' + '<br>' + prop.phone;

    var listing = listings.appendChild(document.createElement('div'));
    listing.className = 'item';

    var link = listing.appendChild(document.createElement('a'));
    link.href = '#';
    link.className = 'title';

    link.innerHTML = '<strong>' + prop.name + '</strong>' + '<br>' + prop.address;
    if (prop.crossStreet) {
      link.innerHTML += '<br /><small class="quiet">' +
        prop.crossStreet +
        '</small>';
      popup += '<br /><small class="quiet">' + prop.crossStreet + '</small>';
    }

    var details = listing.appendChild(document.createElement('div'));
    details.innerHTML = prop.city;
    if (prop.phone) {
      details.innerHTML += ' &middot; ' + prop.phone;
    }

    link.onclick = function() {
      setActive(listing);

      // When a menu item is clicked, animate the map to center
      // its associated locale and open its popup.
      map.setView(e.getLatLng(), 16);
      e.openPopup();
      return false;
    };

    // // Marker interaction
    e.on('click', function(a) {
      // 1. center the map on the selected marker.
      map.panTo([a.latlng.lat, a.latlng.lng]);
      map.panTo(e.getLatLng());
      // 2. Set active the markers associated listing.
      setActive(listing);
    });

    popup += '</div>';
    e.bindPopup(popup);
  });

});

// L.geoJson(someFeatures, {
//     filter: function(feature, layer) {
//         return feature.properties.show_on_map;
//     }
// }).addTo(map);

// data filter tip
// data filter value
