import * as THREE from 'three';

// Cloud vertex shader - simplified
const cloudVertexShader = `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Cloud fragment shader - heavily optimized for performance
const cloudFragmentShader = `
  uniform float time;
  uniform vec3 fogColor;
  uniform float fogNear;
  uniform float fogFar;
  uniform sampler2D noiseTexture;
  uniform float brightness;
  uniform vec3 cloudColor;
  uniform float cloudDensity;
  uniform float scaleFactor1;
  uniform float timeFactor1;
  uniform float strength1;
  uniform float timeFactor2;
  uniform float scaleFactor2;
  uniform float strength2;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  // Simplified noise function
  float noise(vec2 st) {
    return texture2D(noiseTexture, st).r;
  }
  
  // Very basic FBM with only 3 octaves for more detail
  float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    // 3 octaves for more detail but still good performance
    for (int i = 0; i < 3; i++) {
      value += amplitude * noise(st * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    
    return value;
  }
  
  void main() {
    // Calculate distance from center (for circular cloud shape)
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);
    
    // Create base cloud shape with more defined edges
    float alpha = smoothstep(0.5, 0.2, dist);
    
    // Calculate time-based distortion for cloud edge movement (contraction/expansion)
    float edgeTime = time * 0.8;
    float edgeDistortion = sin(edgeTime + vUv.x * 4.0) * 0.05 + sin(edgeTime * 0.7 + vUv.y * 5.0) * 0.05;
    
    // Apply edge distortion to alpha for contraction/expansion effect
    alpha = smoothstep(0.5 + edgeDistortion, 0.2 - edgeDistortion, dist);
    
    // Add more complex noise for cloud texture with time-based movement
    // Use different speeds for different noise layers to create more dynamic movement
    vec2 noiseCoord1 = vUv * 3.0 + vec2(time * 0.06, time * 0.03);
    vec2 noiseCoord2 = vUv * 5.0 + vec2(-time * 0.08, time * 0.05);
    float noise1 = fbm(noiseCoord1);
    float noise2 = fbm(noiseCoord2);
    
    // Add a third noise layer for more dynamic movement
    vec2 noiseCoord3 = vUv * 4.0 + vec2(time * -0.05, -time * 0.06);
    float noise3 = fbm(noiseCoord3);
    
    // Add a fourth noise layer for even more complex movement
    vec2 noiseCoord4 = vUv * 6.0 + vec2(sin(time * 0.03) * 0.5, cos(time * 0.04) * 0.5);
    float noise4 = fbm(noiseCoord4);
    
    // Combine noises with time-varying weights for more dynamic timelapse effect
    float noiseBlend = sin(time * 0.15) * 0.2 + 0.5;
    float combinedNoise = mix(
      mix(noise1, noise2, 0.5 + sin(time * 0.3) * 0.2),
      mix(noise3, noise4, 0.5 + cos(time * 0.4) * 0.2),
      noiseBlend
    );
    
    // Combine for final cloud shape with more defined edges and time-based variation
    float cloudShape = alpha * (combinedNoise * 0.8 + 0.2);
    
    // Apply density and brightness with slight time variation for "breathing" effect
    float timeVaryingDensity = cloudDensity * (1.0 + sin(time * 0.3) * 0.15);
    cloudShape = pow(cloudShape, 1.0 / timeVaryingDensity);
    
    float timeVaryingBrightness = brightness * (1.0 + sin(time * 0.25) * 0.15);
    cloudShape = clamp(cloudShape * timeVaryingBrightness, 0.0, 1.0);
    
    // Sharper lighting effect for more defined clouds
    vec3 finalColor = cloudColor;
    
    // Final color with more defined alpha
    gl_FragColor = vec4(finalColor, cloudShape);
    
    // Apply simple fog
    #ifdef USE_FOG
      float depth = gl_FragCoord.z / gl_FragCoord.w;
      float fogFactor = smoothstep(fogNear, fogFar, depth);
      gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor * 0.5);
    #endif
  }
`;

// Create cloud shader material
export const createCloudMaterial = (isDark: boolean = true) => {
  // Create noise texture with more resolution for better fog detail
  const size = 64; // Increased from 32 for better detail
  const data = new Uint8Array(size * size * 4);
  
  // Generate more detailed noise texture
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      
      // More varied noise calculation
      const value = Math.floor(Math.random() * 255);
      
      data[i] = value;
      data[i+1] = value;
      data[i+2] = value;
      data[i+3] = 255;
    }
  }
  
  const noiseTexture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  noiseTexture.wrapS = THREE.RepeatWrapping;
  noiseTexture.wrapT = THREE.RepeatWrapping;
  noiseTexture.needsUpdate = true;
  
  // Choose cloud color - softer, more atmospheric colors
  const cloudColor = isDark 
    ? new THREE.Color('#464963') // Darker gray for storm clouds
    : new THREE.Color('#b8b8c5'); // Darker gray for normal clouds
  
  // Create shader material
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      noiseTexture: { value: noiseTexture },
      fogColor: { value: new THREE.Color('#0a1a3f') },
      fogNear: { value: 10 },
      fogFar: { value: 30 },
      brightness: { value: isDark ? 1.3 : 1.5 }, // Reduced brightness
      cloudColor: { value: cloudColor },
      cloudDensity: { value: isDark ? 1.6 : 1.4 }, // Increased density for more defined look
      // Add new uniforms for animation controls with values from the image
      scaleFactor1: { value: 18.0 },
      timeFactor1: { value: 0.002 },
      strength1: { value: 0.15 },
      timeFactor2: { value: 0.005 },
      scaleFactor2: { value: 6.0 },
      strength2: { value: 0.2 }
    },
    vertexShader: cloudVertexShader,
    fragmentShader: cloudFragmentShader,
    transparent: true,
    fog: true,
    depthWrite: false,
    blending: THREE.NormalBlending // Changed back to normal blending for more defined clouds
  });
  
  return material;
};

export default createCloudMaterial; 