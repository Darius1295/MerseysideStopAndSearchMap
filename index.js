var map = L.map('map').setView([53.48, -3], 10);


L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.geoJson(ms_authorities).addTo(map);


function getColor(d) {
    return d > 9 ? '#800026' :
           d > 7.5  ? '#BD0026' :
           d > 6  ? '#E31A1C' :
           d > 4.5  ? '#FC4E2A' :
           d > 3   ? '#FD8D3C' :
           d > 1.5   ? '#FEB24C' :
           d >= 0   ? '#FED976' :
                      '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.rr),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

L.geoJson(ms_authorities, {style: style}).addTo(map);


var geojson;


function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}



function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}



geojson = L.geoJson(ms_authorities, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);


var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>Black vs. White stop risk ratio</h4>' +  (props ?
        '<b>' + props.name + '</b><br />' + Math.round(props.rr*10)/10  + ' (' + Math.round(props.rr_ci_low*10)/10 + '-' + Math.round(props.rr_ci_upp*10)/10 + ')'
        : 'Hover over a borough');
};

info.addTo(map);


var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1.5, 3, 4.5, 6, 7.5, 9, 10.5],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);
