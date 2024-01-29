import { Popup } from 'maplibre-gl';
import { createHTMLAttributeTable } from './createHTMLAttributeTable';
let popup = null

export function addPopupToMap(map, layerId, vectorSourceLayer, selectedFeatureId, e) {

    popup?.remove();
    popup = new Popup({ closeOnClick: false });

    const coordinates = [e.lngLat.lng, e.lngLat.lat];
    popup.setLngLat(coordinates);
    popup.setDOMContent(
    createHTMLAttributeTable(
        e.lngLat.lng,
        e.lngLat.lat,
        e.features[0].properties
    )
    );
    popup.addTo(map);
    if (e.features.length > 0) {
        if (selectedFeatureId) {
            map.removeFeatureState({
            source: layerId,
            sourceLayer: vectorSourceLayer,
            id: selectedFeatureId
            });
        }

        selectedFeatureId = e.features[0].id;

        map.setFeatureState({
            source: layerId,
            sourceLayer: vectorSourceLayer,
            id: selectedFeatureId,
        }, {
            clicked: true
        });
    }

    popup.on("close", () => {
        if (selectedFeatureId) {
            map.removeFeatureState({
                source: layerId,
                sourceLayer: vectorSourceLayer,
                id: selectedFeatureId
            });
        }
    })
}