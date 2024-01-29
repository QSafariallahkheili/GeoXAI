const size = 200;
 
export function addPulseLayer(map, layerId, lng, lat) {
    const pulsingDot = {
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),
        
    
        onAdd: function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');
        },
        
        // Call once before every frame where the icon will be used.
        render: function () {
            const duration = 1000;
            const t = (performance.now() % duration) / duration;
        
            const radius = (size / 2) * 0.1;
            const outerRadius = (size / 2) * 0.7 * t + radius;
            const context = this.context;
        
            // Draw the outer circle.
            context.clearRect(0, 0, this.width, this.height);
            context.beginPath();
            context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
            );
            context.fillStyle = `rgba(121, 7, 222, ${1 - t})`;
            context.fill();
        
            // Draw the inner circle.
            context.beginPath();
            context.arc(
            this.width / 2,
            this.height / 2,
            radius,
            0,
            Math.PI * 2
            );
            context.fillStyle = 'rgba(121, 7, 222, 1)';
            context.strokeStyle = 'white';
            context.lineWidth = 2 + 4 * (1 - t);
            context.fill();
            context.stroke();
        
            // Update this image's data with data from the canvas.
            this.data = context.getImageData(
            0,
            0,
            this.width,
            this.height
            ).data;
        
            // Continuously repaint the map, resulting
            // in the smooth animation of the dot.
            map.triggerRepaint();
        
            // Return `true` to let the map know that the image was updated.
            return true;
        }
    };
    
    if (map.hasImage(layerId)===false){
        map.addImage(layerId, pulsingDot, { pixelRatio: 2 });
    }
    let pulseLayer = map.getLayer(layerId);

    if(typeof pulseLayer !== 'undefined') {
    
        map.removeLayer(layerId).removeSource(layerId);
    }
    map.addSource(layerId, {
        'type': 'geojson',
        'data': {
        'type': 'FeatureCollection',
        'features': [
            {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [lng,lat]
            }
            }
        ]
        }
    });
    map.addLayer({
        'id': layerId,
        'type': 'symbol',
        'source': layerId,
        'layout': {
        'icon-image': layerId
        }
    });
}
   