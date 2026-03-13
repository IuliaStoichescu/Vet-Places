mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/standard',
        center: [23.106111,53.5775],
        zoom: 4
    });

    map.on('load', () => {
        map.addSource('vetplaces', {
            type: 'geojson',
            generateId: true,
            data: allVetplaces,
            cluster: true,
            clusterMaxZoom: 14, 
            clusterRadius: 50 
        });

        map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'vetplaces',
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    '#80ffdb',
                    100,
                    '#64dfdf',
                    300,
                    '#48bfe3',
                    500,
                    '#5390d0',
                    700,
                    '#6930c3'
                ],
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    20,
                    100,
                    30,
                    750,
                    40
                ],
                'circle-emissive-strength': 1
            }
        });

        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'vetplaces',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': ['get', 'point_count_abbreviated'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            }
        });

        map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'vetplaces',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': '#11b4da',
                'circle-radius': 4,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff',
                'circle-emissive-strength': 1
            }
        });

        map.addInteraction('click-clusters', {
            type: 'click',
            target: { layerId: 'clusters' },
            handler: (e) => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ['clusters']
                });
                const clusterId = features[0].properties.cluster_id;
                map.getSource('vetplaces').getClusterExpansionZoom(
                    clusterId,
                    (err, zoom) => {
                        if (err) return;

                        map.easeTo({
                            center: features[0].geometry.coordinates,
                            zoom: zoom
                        });
                    }
                );
            }
        });

        // When a click event occurs on a feature in
        // the unclustered-point layer, open a popup at
        // the location of the feature, with
        // description HTML from its properties.
        map.addInteraction('click-unclustered-point', {
            type: 'click',
            target: { layerId: 'unclustered-point' },
            handler: (e) => {
               const text = e.feature.properties.popUpText;
                const coordinates = e.feature.geometry.coordinates.slice();
                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(
                        text
                    )
                    .addTo(map);
            }
        });

        // Change the cursor to a pointer when the mouse is over a cluster of POIs.
        map.addInteraction('clusters-mouseenter', {
            type: 'mouseenter',
            target: { layerId: 'clusters' },
            handler: () => {
                map.getCanvas().style.cursor = 'pointer';
            }
        });

        // Change the cursor back to a pointer when it stops hovering over a cluster of POIs.
        map.addInteraction('clusters-mouseleave', {
            type: 'mouseleave',
            target: { layerId: 'clusters' },
            handler: () => {
                map.getCanvas().style.cursor = '';
            }
        });

        // Change the cursor to a pointer when the mouse is over an individual POI.
        map.addInteraction('unclustered-mouseenter', {
            type: 'mouseenter',
            target: { layerId: 'unclustered-point' },
            handler: () => {
                map.getCanvas().style.cursor = 'pointer';
            }
        });

        // Change the cursor back to a pointer when it stops hovering over an individual POI.
        map.addInteraction('unclustered-mouseleave', {
            type: 'mouseleave',
            target: { layerId: 'unclustered-point' },
            handler: () => {
                map.getCanvas().style.cursor = '';
            }
        });
    });