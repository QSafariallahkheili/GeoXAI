import { LayerExtension } from '@deck.gl/core';
import {ScatterplotLayer, /*GeoJsonLayer*/} from '@deck.gl/layers';

export class OpacityEffect extends LayerExtension {
  getShaders() {
    return {
      inject: {
        // Declare varying to pass position
        'vs:#decl': `
          varying vec2 unitCirclePos;
        `,
        // Pass vertex position in unit circle space
        'vs:#main-end': `
          unitCirclePos = positions.xy;
        `,
        // Receive in fragment
        'fs:#decl': `
          varying vec2 unitCirclePos;
        `,
        // Modify final color (fade by distance from center)
        'fs:DECKGL_FILTER_COLOR': `
          float dist = length(unitCirclePos);
          float alpha = smoothstep(1.0, 0.0, dist); // fades from 1 → 0
          color = vec4(color.rgb, color.a * alpha);
        `
      }
    };
  }
}

export class CustomScatterplotLayer extends ScatterplotLayer {
    static componentName = 'CustomScatterplotLayer';

    initializeState() {
      super.initializeState();
  
      const attributeManager = this.getAttributeManager();
      attributeManager.addInstanced({
        instanceUncertainty: {
          size: 1,
          type: 5126,
          accessor: 'getUncertainty',
          defaultValue: 1.0
        }
      });
    }
  
    draw({uniforms}) {
        //const attribute = this.getAttributeManager().getAttributes().instanceUncertainty;
        //console.log('GPU attribute:', attribute);
        super.draw({uniforms});
    }
  
    getShaders() {
        // Leverage the base shaders and inject custom logic
        const shaders = super.getShaders();
        shaders.inject = {
          // Declare attribute and varying in vertex shader
          'vs:#decl': `
            attribute float instanceUncertainty;
            varying float vUncertainty;
            varying vec2 vUV;
          `,
          // Pass attribute into varying before position calculation
          'vs:DECKGL_FILTER_GL_POSITION': `
            vUncertainty = instanceUncertainty;
             vUV = geometry.uv;
          `,
          // Declare varying in fragment shader
          'fs:#decl': `
            varying float vUncertainty;
             varying vec2 vUV;
          `,
          // Modify the color output: apply radial fade + attribute-based alpha
          'fs:DECKGL_FILTER_COLOR': `
            float dist = length(vUV);

// Define how much thickness to preserve for the outline
float outlineThreshold = 0.98;

// Edge area is everything from outlineThreshold to 1.0
float isEdge = smoothstep(outlineThreshold, 1.0, dist);

// Now apply the fade only to the *non-edge* (interior)
float fade = smoothstep((1.0 - vUncertainty), 1.0, dist);

// Combine: fade the inner area, but preserve the edge
color.a *= mix(1.0 - fade, 1.0, isEdge);

          `
        };
        return shaders;
      }
}

export class CustomFuzzyCircleLayer extends ScatterplotLayer {
  static componentName = 'CustomFuzzyCircleLayer';

  initializeState() {
    super.initializeState();

    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instanceUncertainty: {
        size: 1,
        type: 5126,
        accessor: 'getUncertainty',
        defaultValue: 1.0
      }
    });
  }

  draw({uniforms}) {
      //const attribute = this.getAttributeManager().getAttributes().instanceUncertainty;
      //console.log('GPU attribute:', attribute);
      super.draw({uniforms});
  }

  getShaders() {
      // Leverage the base shaders and inject custom logic
      const shaders = super.getShaders();
      shaders.inject = {
        // Declare attribute and varying in vertex shader
        'vs:#decl': `
          attribute float instanceUncertainty;
          varying float vUncertainty;
          varying vec2 vUV;
        `,
        // Pass attribute into varying before position calculation
        'vs:DECKGL_FILTER_GL_POSITION': `
          vUncertainty = instanceUncertainty;
           vUV = geometry.uv;
        `,
        // Declare varying in fragment shader
        'fs:#decl': `
          varying float vUncertainty;
           varying vec2 vUV;
        `,
        // Modify the color output: apply radial fade + attribute-based alpha
        'fs:DECKGL_FILTER_COLOR': `
         float dist = length(vUV);

          // Clamp uncertainty in [0,1] to avoid surprises
          float u = clamp(vUncertainty, 0.0, 1.0);

          // edgeWidth increases with uncertainty → more blend
          float edgeWidth = mix(0.02, 1.0, u);  // u=0 → sharp, u=1 → fuzzy
          float inkIntensity = mix(0.2, 1.0, u); // darkness of ink

          // Border mask: 0 in center, 1 at outer edge
          float border = smoothstep(1.0 - edgeWidth, 1.0, dist);

          // Black ink color
          vec3 inkColor = vec3(0.0);

          // Blend original color with black on border
          color.rgb = mix(color.rgb, inkColor, border * inkIntensity);

        `
      };
      return shaders;
    }
}

export class CustomDeckglPieLayer extends ScatterplotLayer {
  static componentName = 'CustomDeckglPieLayer';

  initializeState() {
    super.initializeState();

    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instanceBreakdown: {
        size: 4,
        type: 5126,
        accessor: 'getBreakdown',
        defaultValue: [0.25, 0.5, 0.75, 1.0]
      },
      instanceColorIndex: {
        size: 4,
        type: 5126,
        accessor: 'getColorIndex',
        defaultValue: [0, 1, 2, 3]
      }
    });
  }

  getShaders() {
    const shaders = super.getShaders();
    shaders.inject = {
      // VERTEX SHADER
      'vs:#decl': `
        attribute vec4 instanceBreakdown;
        attribute vec4 instanceColorIndex;
        varying vec4 vBreakdown;
        varying vec4 vColorIndex;
        varying vec2 unitCirclePos;
      `,
      'vs:#main-end': `
        vBreakdown = instanceBreakdown;
        vColorIndex = instanceColorIndex;
        unitCirclePos = positions.xy;
      `,

      // FRAGMENT SHADER
      'fs:#decl': `
        varying vec4 vBreakdown;
        varying vec4 vColorIndex;
        varying vec2 unitCirclePos;

        uniform vec3 uColors[11];
        vec3 getColor(float index) {
          if (index < 0.5) return uColors[0];
          else if (index < 1.5) return uColors[1];
          else if (index < 2.5) return uColors[2];
          else if (index < 3.5) return uColors[3];
          else if (index < 4.5) return uColors[4];
          else if (index < 5.5) return uColors[5];
          else if (index < 6.5) return uColors[6];
          else if (index < 7.5) return uColors[7];
          else if (index < 8.5) return uColors[8];
          else if (index < 9.5) return uColors[9];
          else return uColors[10];
        }
      `,
      'fs:DECKGL_FILTER_COLOR': `
        float angle = atan(unitCirclePos.y, unitCirclePos.x);
        float r = (angle / 3.1415927 / 2.0) + 0.5;
        
        vec3 finalColor;

        if (r <= vBreakdown[0]) {
  finalColor = getColor(vColorIndex[0]);
} else if (r <= vBreakdown[1]) {
  finalColor = getColor(vColorIndex[1]);
} else if (r <= vBreakdown[2]) {
  finalColor = getColor(vColorIndex[2]);
} else {
  finalColor = getColor(vColorIndex[3]);
}

        float dist = length(unitCirclePos);
        float alpha = smoothstep(1.0, 0.0, dist);
        color = vec4(finalColor, 1.0);
      `
    };
    return shaders;
  }

  draw({ uniforms }) {
  const { colors } = this.props;

  // Convert hex colors to [r, g, b] values and flatten into one array
  const colorArray = new Float32Array(colors.flatMap(hex => {
    const bigint = parseInt(hex.slice(1), 16);
    return [
      ((bigint >> 16) & 255) / 255,
      ((bigint >> 8) & 255) / 255,
      (bigint & 255) / 255
    ];
  }));

  uniforms.uColors = colorArray;

  super.draw({ uniforms });
}
}