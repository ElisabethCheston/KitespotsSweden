
                // - MAPS - //

        // - Basemaps variables - //
    var hybrid = L.esri.basemapLayer('ImageryClarity');
    var topographic = L.esri.basemapLayer('Topographic');
    var streets = L.esri.basemapLayer('Streets');
    
        // - Create an on load ESRI basemap - //
    var map = new L.map('map', {
        center: [62.45,17.45],
        zoom: 5
    }),
    baseImagery = L.layerGroup();
    L.esri.basemapLayer('Topographic').addTo(map);


                // - SEARCH ENGINE - //

    var clusterSpots = L.markerClusterGroup();
        // - Variable for search source(kitespots) - //
    var searchSpots = L.geoJson(kitespots, {
        onEachFeature: function(feature, layer) {
            var popup = '';
            if (feature.properties.name) {
                popup += '<img src="images/kitesurf1.png" style="width:50px;height:50px;"> <p><b> '+feature.properties.name + '</b><br/>' 
                + "Wind Direction: " + feature.properties.windDirection;
            }
            layer.bindPopup(popup);
        }
    });
        // - Create search engine and place it on the map - //
    var selector = L.control({
        position: 'topright',
        opacity: 0.8,
        size: 10
    });
    selector.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'list-group-item');
        div.innerHTML = '<select id = "selectSpot"><option value = "init">KITESPOTS</option></select>';
        return div;
    };
    selector.addTo(map);

        // - Function to browse and choose spots - //
    searchSpots.eachLayer(function(layer) {
        var spotChoice = document.createElement("option");
        spotChoice.innerHTML = layer.feature.properties.name;
        spotChoice.value = layer._leaflet_id;
        L.DomUtil.get("selectSpot").appendChild(spotChoice);
    });
        // - The selectSpot variable for the DomEvent listener. - //
    var selectSpot = L.DomUtil.get("selectSpot");
        // - Select kitespot on click - //
    L.DomEvent.addListener(selectSpot, 'click', function(e) {
        L.DomEvent.stopPropagation(e);
    });
        // - ChangeHandler zooms in on choosen spot with popup.""
    L.DomEvent.addListener(selectSpot, 'change', changeHandler);
        function changeHandler(e) {
        var selected = searchSpots.getLayer(e.target.value);
        clusterSpots.zoomToShowLayer(selected, function() {
            selected.openPopup();       
        });
        }
    clusterSpots.addLayer(searchSpots);
    map.addLayer(clusterSpots);


            // - GET JSON DATA WITH AJAX TO OVERLAY REGION - //

                
    // Get the data and turn it to geojson
    $.ajax({
        url: "https://public.opendatasoft.com/api/records/1.0/search/?dataset=sverige-lan-counties-of-sweden&q=&lang=en&rows=37&start=0&facet=id&facet=lan_namn&facet=geo_point_2d&format=geojson",
        dataType: "json",
        success: function(data) {
            $(data.features).each(function(key, data) {
                regions.addData(data);
            });
             regions.addTo(map);
        },
        error: function(error) {
            console.log('error geojson')
        }
    });

    // Put it on the map
    var regions = L.geoJSON(null, {
    pointToLayer: function (features, latlng) {
        return L.circleMarker(latlng, {
            radius:6,
            opacity: .8
        })            
        .bindPopup("<p><b> " + features.properties.lan_namn + "</b></p>");
    }  
    });



                   // - KITESPOT LAYERS - //

        // - Cluster and popups to kitespots All kitespots - //
    var allspotsCluster = new L.markerClusterGroup();
    var allspots = L.geoJson(kitespots, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                radius:6,
                opacity: .1
            })
            .bindPopup("<p><b> "+feature.properties.name 
            + "</b><br/>" + "Wind Direction: " 
            + feature.properties.windDirection + "</p>" 
            + "<a href ='https://www.google.se/maps/@59.3036556,17.9778991,14z'><b> GET HERE </b></a>"); 
        },
    });
        allspotsCluster.addLayer(allspots);        


                   // - CITIES LAYERS - //

        // - Cluster and popups to kitespots All kitespots - //
    var cities = L.geoJson(cities, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                radius:6,
                opacity: .8
            })
            .bindPopup("<p><b> "+feature.properties.city + "</b><br/>" 
            + "County: " + feature.properties.admin_name + "</p>"
            + "Population: " + feature.properties.population + "</p>" 
            + "<a href ='https://www.google.se/maps/@59.3036556,17.9778991,14z'><b> GET HERE </b></a>"); 
        },
    });
        cities.addTo(map);         


        // - CONTROL LAYERS - //

    var basemapLayers = {
        "Topographic": topographic,
        "Hybrid": hybrid,
        "Streets": streets
    };
    var overlays = {
        'Regions': regions,
        'All': allspots
    };
  
        // - Add it all to the map - //
    L.control.layers(basemapLayers, overlays).addTo(map);
