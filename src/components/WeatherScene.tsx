import { useEffect, useRef, useState, useContext, createContext } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import createCloudMaterial from './CloudShader';
import RainParticles from './RainParticles';

interface ParticleSystem {
  particles: THREE.Points;
  velocities: THREE.Vector3[];
}

interface WeatherSceneProps {
  condition: string;
  temperature: number;
}

// Fixed animation parameters - these will be used internally without UI controls
const animationParams = {
  scaleFactor1: 18,
  timeFactor1: 0.002,
  strength1: 0.15,
  timeFactor2: 0.005,
  scaleFactor2: 6.0,
  strength2: 0.2
};

const SnowParticles = () => {
  const { camera } = useThree();
  const snowRef = useRef<ParticleSystem>();
  
  useEffect(() => {
    const particleCount = 300;
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.03,
        -0.03 - Math.random() * 0.03,
        (Math.random() - 0.5) * 0.03
      ));
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: '#ffffff',
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    
    const particles = new THREE.Points(geometry, material);
    snowRef.current = { particles, velocities };
    
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, []);
  
  useFrame(() => {
    if (!snowRef.current) return;
    
    const positions = snowRef.current.particles.geometry.attributes.position;
    const velocities = snowRef.current.velocities;
    
    for (let i = 0; i < positions.count; i++) {
      positions.setX(i, positions.getX(i) + velocities[i].x);
      positions.setY(i, positions.getY(i) + velocities[i].y);
      positions.setZ(i, positions.getZ(i) + velocities[i].z);
      
      if (positions.getY(i) < -10) {
        positions.setY(i, 10);
        positions.setX(i, (Math.random() - 0.5) * 20);
        positions.setZ(i, (Math.random() - 0.5) * 20);
      }
    }
    positions.needsUpdate = true;
  });
  
  return snowRef.current ? <primitive object={snowRef.current.particles} /> : null;
};

const CloudParticles = () => {
  const { camera } = useThree();
  const cloudRef = useRef<THREE.Group>();
  const materialRef = useRef<THREE.ShaderMaterial>();
  
  useEffect(() => {
    const group = new THREE.Group();
    
    // Create procedural cloud material - use darker clouds
    const cloudMaterial = createCloudMaterial(true); // true for darker clouds
    materialRef.current = cloudMaterial;
    
    // Create cloud planes at different depths and positions
    const createCloud = (posX: number, posY: number, posZ: number, scale: number, rotation: number) => {
      // Create a plane for the cloud
      const planeGeometry = new THREE.PlaneGeometry(scale, scale, 1, 1);
      const cloudMesh = new THREE.Mesh(planeGeometry, cloudMaterial);
      
      // Position and rotate the cloud
      cloudMesh.position.set(posX, posY, posZ);
      cloudMesh.rotation.z = rotation;
      cloudMesh.lookAt(camera.position);
      
      return cloudMesh;
    };
    
    // Create a cloud cluster - multiple planes at different depths for volumetric effect
    const createCloudCluster = (posX: number, posY: number, posZ: number, scale: number) => {
      const cluster = new THREE.Group();
      
      // Increased number of layers for more volumetric, foggy effect
      const layers = 10; 
      
      for (let i = 0; i < layers; i++) {
        // Vary position slightly for each layer to create more volume
        const layerScale = scale * (0.8 + Math.random() * 0.6);
        const offsetX = (Math.random() - 0.5) * scale * 0.5; // Increased spread
        const offsetY = (Math.random() - 0.5) * scale * 0.4; // Increased spread
        const offsetZ = (i - layers/2) * 0.3; // Increased depth
        const rotation = Math.random() * Math.PI * 2;
        
        const cloudLayer = createCloud(
          offsetX, 
          offsetY, 
          offsetZ, 
          layerScale, 
          rotation
        );
        
        // Make clouds more transparent for foggy effect
        cloudLayer.material.opacity = 0.7 + Math.random() * 0.3;
        
        cluster.add(cloudLayer);
      }
      
      // Position the entire cluster
      cluster.position.set(posX, posY, posZ);
      
      // Add animation data to the cluster
      const animData = {
        speedX: (Math.random() - 0.5) * 0.02 * animationParams.strength1,
        speedY: (Math.random() - 0.5) * 0.005 * animationParams.strength1,
        amplitude: Math.random() * 0.3 + 0.1,
        frequency: Math.random() * 0.001 * animationParams.timeFactor1 + 0.0005 * animationParams.timeFactor1,
        phase: Math.random() * Math.PI * 2,
        originalY: posY,
        rotationSpeed: (Math.random() - 0.5) * 0.001 * animationParams.strength2,
        scaleVariation: Math.random() * 0.5 + 0.5 // For scale factor control
      };
      
      // @ts-ignore - add custom property for animation
      cluster.userData.animData = animData;
      
      return cluster;
    };
    
    // Create a dramatically simplified sky with fewer cloud formations
    
    // 1. Create a large cloud formation in the center - much larger
    const mainCloudCluster = createCloudCluster(0, 5, 0, 12);
    group.add(mainCloudCluster);
    
    // 2. Create a second large cloud formation slightly offset - much larger
    const secondaryCloudCluster = createCloudCluster(8, 6, -5, 10);
    group.add(secondaryCloudCluster);
    
    // 3. Create more medium-sized clouds in different positions - larger
    const numMediumClusters = 6;
    for (let i = 0; i < numMediumClusters; i++) {
      const angle = (i / numMediumClusters) * Math.PI * 2;
      const distance = 15 + Math.random() * 10;
      
      const posX = Math.cos(angle) * distance;
      const posY = 4 + Math.random() * 3;
      const posZ = Math.sin(angle) * distance;
      const scale = 6 + Math.random() * 4;
      
      const cloudCluster = createCloudCluster(posX, posY, posZ, scale);
      group.add(cloudCluster);
    }
    
    // 4. Create more small clouds in different positions - larger
    const numSmallClusters = 5;
    for (let i = 0; i < numSmallClusters; i++) {
      const angle = (i / numSmallClusters) * Math.PI * 2 + Math.random() * 0.5;
      const distance = 8 + Math.random() * 25;
      
      const posX = Math.cos(angle) * distance;
      const posY = 3 + Math.random() * 5;
      const posZ = Math.sin(angle) * distance;
      const scale = 4 + Math.random() * 3;
      
      const cloudCluster = createCloudCluster(posX, posY, posZ, scale);
      group.add(cloudCluster);
    }
    
    // 5. Add some clouds at different heights - larger
    const numHighClouds = 3;
    for (let i = 0; i < numHighClouds; i++) {
      const angle = (i / numHighClouds) * Math.PI * 2 + Math.random();
      const distance = 12 + Math.random() * 15;
      
      const posX = Math.cos(angle) * distance;
      const posY = 7 + Math.random() * 3;
      const posZ = Math.sin(angle) * distance;
      const scale = 5 + Math.random() * 3;
      
      const cloudCluster = createCloudCluster(posX, posY, posZ, scale);
      group.add(cloudCluster);
    }
    
    // 6. Add some clouds at lower heights - larger
    const numLowClouds = 3;
    for (let i = 0; i < numLowClouds; i++) {
      const angle = (i / numLowClouds) * Math.PI * 2 + Math.random() * 1.5;
      const distance = 10 + Math.random() * 20;
      
      const posX = Math.cos(angle) * distance;
      const posY = 1 + Math.random() * 2;
      const posZ = Math.sin(angle) * distance;
      const scale = 4 + Math.random() * 3;
      
      const cloudCluster = createCloudCluster(posX, posY, posZ, scale);
      group.add(cloudCluster);
    }
    
    // 7. Add even more clouds at the bottom of the screen - larger
    const numBottomClouds = 8;
    for (let i = 0; i < numBottomClouds; i++) {
      const angle = (i / numBottomClouds) * Math.PI * 2 + Math.random() * 0.8;
      const distance = 8 + Math.random() * 15;
      
      const posX = Math.cos(angle) * distance;
      const posY = -1 - Math.random() * 3;
      const posZ = Math.sin(angle) * distance - 2;
      const scale = 3 + Math.random() * 4;
      
      const cloudCluster = createCloudCluster(posX, posY, posZ, scale);
      group.add(cloudCluster);
    }
    
    // 8. Add some distant clouds at the very bottom - larger
    const numDistantBottomClouds = 6;
    for (let i = 0; i < numDistantBottomClouds; i++) {
      const angle = (i / numDistantBottomClouds) * Math.PI * 2 + Math.random();
      const distance = 12 + Math.random() * 18;
      
      const posX = Math.cos(angle) * distance;
      const posY = -3 - Math.random() * 3;
      const posZ = Math.sin(angle) * distance;
      const scale = 5 + Math.random() * 4;
      
      const cloudCluster = createCloudCluster(posX, posY, posZ, scale);
      group.add(cloudCluster);
    }
    
    // 9. Add some clouds in the middle-bottom area - larger
    const numMiddleBottomClouds = 5;
    for (let i = 0; i < numMiddleBottomClouds; i++) {
      const angle = (i / numMiddleBottomClouds) * Math.PI * 2 + Math.random() * 1.2;
      const distance = 10 + Math.random() * 12;
      
      const posX = Math.cos(angle) * distance;
      const posY = -2 - Math.random() * 2;
      const posZ = Math.sin(angle) * distance - 1;
      const scale = 4 + Math.random() * 4;
      
      const cloudCluster = createCloudCluster(posX, posY, posZ, scale);
      group.add(cloudCluster);
    }
    
    // 10. Add a few massive fog banks in the background - smaller than before
    const numFogBanks = 4;
    for (let i = 0; i < numFogBanks; i++) {
      const angle = (i / numFogBanks) * Math.PI * 2;
      const distance = 20 + Math.random() * 10;
      
      const posX = Math.cos(angle) * distance;
      const posY = 0 + Math.random() * 6 - 3; // Positioned across the middle
      const posZ = Math.sin(angle) * distance - 10; // Further back
      const scale = 15 + Math.random() * 8;
      
      const fogBank = createCloudCluster(posX, posY, posZ, scale);
      group.add(fogBank);
    }
    
    cloudRef.current = group;
    
    // Update material uniforms with fixed animation parameters
    if (materialRef.current) {
      materialRef.current.uniforms.scaleFactor1.value = animationParams.scaleFactor1;
      materialRef.current.uniforms.timeFactor1.value = animationParams.timeFactor1;
      materialRef.current.uniforms.strength1.value = animationParams.strength1;
      materialRef.current.uniforms.timeFactor2.value = animationParams.timeFactor2;
      materialRef.current.uniforms.scaleFactor2.value = animationParams.scaleFactor2;
      materialRef.current.uniforms.strength2.value = animationParams.strength2;
    }
    
    return () => {
      // Clean up all geometries and materials
      group.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
        }
      });
      
      if (materialRef.current) {
        materialRef.current.dispose();
      }
    };
  }, [camera]);
  
  useFrame(({ clock }) => {
    if (!cloudRef.current || !materialRef.current) return;
    
    // Update shader time uniform - speed controlled by timeFactor2
    const time = clock.getElapsedTime() * 1.0 * animationParams.timeFactor2;
    materialRef.current.uniforms.time.value = time;
    
    // Slower rotation for the entire group - controlled by timeFactor2
    cloudRef.current.rotation.y = Math.sin(time * 0.04) * 0.05 * animationParams.strength2;
    
    // Animate individual cloud clusters with timelapse effect
    cloudRef.current.children.forEach(cluster => {
      if (cluster.userData.animData) {
        const animData = cluster.userData.animData;
        
        // Apply slower floating motion - controlled by timeFactor1
        cluster.position.y = animData.originalY + 
          Math.sin(time * animData.frequency + animData.phase) * 
          animData.amplitude * animationParams.strength1 * 1.5;
        
        // Apply slower horizontal drift - controlled by strength1
        cluster.position.x += animData.speedX * 1.0;
        
        // Add slight vertical drift for more dynamic movement - controlled by strength1
        cluster.position.z += Math.sin(time * 0.04 + animData.phase) * 0.04 * animationParams.strength1;
        
        // Add rotation to each cluster for more dynamic movement - controlled by strength2
        cluster.rotation.z += animData.rotationSpeed * 1.0;
        cluster.rotation.x += animData.rotationSpeed * 0.6;
        
        // Simulate cloud formation and dissipation with scale changes - controlled by scaleFactor1 and scaleFactor2
        // Use a combination of sine waves with different frequencies for more organic contraction/expansion
        const timeScale = time * 0.15 * animationParams.timeFactor1;
        const scaleBase = 0.85 + (animData.scaleVariation * 0.15);
        
        // Primary scale oscillation (slower)
        const scaleOsc1 = Math.sin(timeScale + animData.phase * 2) * 0.2;
        
        // Secondary scale oscillation (faster) for more dynamic effect
        const scaleOsc2 = Math.sin(timeScale * 2.0 + animData.phase * 3) * 0.1;
        
        // Combine oscillations with different weights for more organic movement
        const scaleOscillation = (scaleOsc1 + scaleOsc2) * animationParams.scaleFactor2 / 10 + scaleBase;
        
        // Apply scale based on scaleFactor1 (overall size) and scaleFactor2 (variation)
        const finalScale = scaleOscillation * (animationParams.scaleFactor1 / 18);
        
        // Apply more gentle scales in each dimension for smoother deformation
        cluster.scale.set(
          finalScale * (1 + Math.sin(timeScale * 0.8) * 0.15),
          finalScale * (1 + Math.sin(timeScale * 0.6 + 0.4) * 0.15),
          finalScale
        );
        
        // Simulate cloud density changes by modifying opacity - controlled by strength2
        if (cluster.children && cluster.children.length > 0) {
          // Use multiple sine waves with different frequencies for more organic opacity changes
          const opacityBase = 0.75;
          const opacityOsc1 = Math.sin(time * 0.15 * animationParams.timeFactor2 + animData.phase * 3) * 0.2;
          const opacityOsc2 = Math.sin(time * 0.25 * animationParams.timeFactor2 + animData.phase * 5) * 0.15;
          
          const opacityChange = opacityBase + (opacityOsc1 + opacityOsc2) * animationParams.strength2;
          
          cluster.children.forEach(child => {
            if (child instanceof THREE.Mesh && child.material) {
              // @ts-ignore - material opacity exists but TypeScript doesn't know
              child.material.opacity = opacityChange;
            }
          });
        }
        
        // Wrap clouds around if they drift too far - implement smoother transitions
        if (cluster.position.x > 30) {
          // Instead of jumping to -30, gradually move to just outside the view on the other side
          cluster.position.x = -28;
          // Reset phase to avoid sudden jumps in animation
          animData.phase = Math.random() * Math.PI * 2;
        }
        if (cluster.position.x < -30) {
          // Instead of jumping to 30, gradually move to just outside the view on the other side
          cluster.position.x = 28;
          // Reset phase to avoid sudden jumps in animation
          animData.phase = Math.random() * Math.PI * 2;
        }
      }
    });
  });
  
  return cloudRef.current ? <primitive object={cloudRef.current} /> : null;
};

const SunEffect = () => {
  const { camera } = useThree();
  const sunRef = useRef<THREE.Mesh>();
  
  useEffect(() => {
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: '#ffdd44',
      transparent: true,
      opacity: 0.8,
    });
    
    const sun = new THREE.Mesh(geometry, material);
    sun.position.set(5, 8, -10);
    sunRef.current = sun;
    
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, []);
  
  useFrame(({ clock }) => {
    if (!sunRef.current) return;
    sunRef.current.rotation.y += 0.005;
    sunRef.current.position.y = 8 + Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
  });
  
  return sunRef.current ? <primitive object={sunRef.current} /> : null;
};

const Scene = ({ condition, temperature }: WeatherSceneProps) => {
  // Always show rain for testing
  const showCloudsOnly = false;
  
  // Force rainy condition for testing
  const conditions = "rainy";
  const hasSnow = false;
  const hasRain = true;
  
  // Add darker lighting for rainy conditions
  const ambientIntensity = 0.5;
  const pointLightIntensity = 0.7;
  const fogColor = '#081830';
  
  return (
    <>
      {/* Adjusted lighting for rainy conditions */}
      <ambientLight intensity={ambientIntensity} />
      <pointLight position={[10, 15, 10]} intensity={pointLightIntensity} color="#8899bb" />
      
      {/* Adjusted fog for rainy conditions */}
      <fog attach="fog" args={[fogColor, 15, 30]} />
      
      {/* Show clouds */}
      <CloudParticles />
      
      {/* Always show rain for testing */}
      <RainParticles />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate={false} // Disabled rotation completely
      />
    </>
  );
};

const WeatherScene: React.FC<WeatherSceneProps> = (props) => {
  return (
    <Canvas
      camera={{ position: [0, -1, 18], fov: 60 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      dpr={[1, 1.5]} // Limit pixel ratio for better performance
    >
      <Scene {...props} />
    </Canvas>
  );
};

export default WeatherScene; 