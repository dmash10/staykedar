import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

interface ParticleSystem {
  particles: THREE.Points;
  velocities: THREE.Vector3[];
}

const RainParticles = () => {
  const { camera } = useThree();
  const rainRef = useRef<ParticleSystem>();
  
  useEffect(() => {
    // Increase particle count for more dense rain
    const particleCount = 5000; // Increased from 3500 for much heavier rain
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];
    const sizes = new Float32Array(particleCount);
    
    // Create a wider and taller area for rain to appear
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;      // Wider x spread
      positions[i * 3 + 1] = Math.random() * 40 + 5;      // Higher starting point
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;  // Deeper z spread
      
      // Varied velocities for more realistic rain
      const speed = 0.4 + Math.random() * 0.5;  // Increased speed for more dramatic rain
      // Add slight angle to rain for wind effect
      velocities.push(new THREE.Vector3(
        -0.1 - Math.random() * 0.1,  // Stronger wind from right to left
        -speed,                      // Faster downward velocity
        0.03 * (Math.random() - 0.5) // Slight z variation
      ));
      
      // Much larger raindrop sizes for better visibility
      sizes[i] = 0.1 + Math.random() * 0.2; // Significantly increased size for better visibility
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create custom shader material for better-looking raindrops
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color('#ffffff') }, // Pure white for maximum visibility
        pointTexture: { value: createRaindropTexture() }
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = vec3(1.0, 1.0, 1.0); // Pure white color
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (400.0 / -mvPosition.z); // Increased size multiplier
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        void main() {
          gl_FragColor = vec4(color, 1.0) * texture2D(pointTexture, gl_PointCoord);
          if (gl_FragColor.a < 0.2) discard; // Lower threshold to keep more pixels
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    rainRef.current = { particles, velocities };
    
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, []);
  
  useFrame(() => {
    if (!rainRef.current) return;
    
    const positions = rainRef.current.particles.geometry.attributes.position;
    const velocities = rainRef.current.velocities;
    
    for (let i = 0; i < positions.count; i++) {
      // Update positions based on velocity
      positions.setX(i, positions.getX(i) + velocities[i].x);
      positions.setY(i, positions.getY(i) + velocities[i].y);
      positions.setZ(i, positions.getZ(i) + velocities[i].z);
      
      // Reset particles that go below the view
      if (positions.getY(i) < -10) {
        positions.setY(i, 40);  // Reset to top
        positions.setX(i, (Math.random() - 0.5) * 50);  // Random x position
        positions.setZ(i, (Math.random() - 0.5) * 50);  // Random z position
      }
      
      // Reset particles that drift too far horizontally
      if (positions.getX(i) < -30) {
        positions.setX(i, 30);
      }
    }
    
    positions.needsUpdate = true;
  });
  
  return rainRef.current ? <primitive object={rainRef.current.particles} /> : null;
};

// Create a custom texture for raindrops
function createRaindropTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64; // Larger canvas for more detail
  canvas.height = 64;
  const context = canvas.getContext('2d');
  
  if (context) {
    // Create elongated raindrop shape with much higher opacity
    const gradient = context.createLinearGradient(0, 0, 0, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)'); // Full opacity at top
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.8)'); // High opacity in middle
    gradient.addColorStop(1, 'rgba(220, 240, 255, 0.0)'); // Fade out tail
    
    context.fillStyle = gradient;
    context.beginPath();
    context.ellipse(32, 24, 5, 24, 0, 0, Math.PI * 2); // Much longer and wider raindrops
    context.fill();
    
    // Add a bright highlight at the top for extra visibility
    const highlightGradient = context.createRadialGradient(32, 16, 0, 32, 16, 8);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    
    context.fillStyle = highlightGradient;
    context.beginPath();
    context.arc(32, 16, 8, 0, Math.PI * 2);
    context.fill();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default RainParticles; 