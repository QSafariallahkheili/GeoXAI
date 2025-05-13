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
            float fade = smoothstep((1.0-vUncertainty), 1.0, dist);
            color.a *= (1.0 - fade);
            color = vec4(color.rgb, color.a);

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

