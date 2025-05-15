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


const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.zIndex = 1;
tooltip.style.pointerEvents = 'none';
document.body.append(tooltip);

export function addDeckglPopupToMap({ object, x, y }, prop1, prop2, prop3) {
   
    if (object?.properties) {
      tooltip.style.display = 'block';
      tooltip.style.left = `${x + 10}px`; // add small offset for cursor
      tooltip.style.top = `${y + 10}px`;
      tooltip.style.position = 'absolute';
      tooltip.style.background = 'rgba(0, 0, 0, 0.6)';
      tooltip.style.color = '#fff';
      tooltip.style.padding = '10px';
      tooltip.style.borderRadius = '8px';
      tooltip.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
      tooltip.style.pointerEvents = 'none'; // prevents flicker when moving cursor

      const props = object.properties;
      let html = `
        <div><strong>${prop1}: </strong> ${props?.[prop1]?.toFixed?.(3) ?? 'N/A'}</div>
        <div><strong>${prop2}: </strong> ${props?.[prop2]?.toFixed?.(3) ?? 'N/A'}</div>
        `;

        if (prop3 && props?.[prop3] !== undefined) {
        html += `<div><strong>${prop3}: </strong> ${props[prop3] ?? 'N/A'}</div>`;
        }

        tooltip.innerHTML = html;
    } else {
      tooltip.style.display = 'none';
    }
}
