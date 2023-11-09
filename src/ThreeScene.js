import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeScene = () => {
  const mountRef = useRef(null);

  const zoomOutFactor = 0.02; // Adjust as needed
  let zoomOut = false;
  let newCameraPosition = new THREE.Vector3(20, 20, 20); // New camera position for zoom out
  let pins = []; // Array to store your pins


  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#A0E9FF');
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);
        
    // Load models
        const loader = new GLTFLoader();

        let createSpaceButton = null;
        loader.load(`${process.env.PUBLIC_URL}/createspacebutton.glb`, (gltf) => {
          const button = gltf.scene;
          button.scale.set(0.4, 0.1, 0.4);
          button.position.set(0, -0.5, 1);
          // button.rotation.y = - Math.PI / 2
          scene.add(button);

          createSpaceButton = button;
        });

       // Load the first model
    let map = null;
    loader.load(`${process.env.PUBLIC_URL}/canada.glb`, (gltf) => {
      const model = gltf.scene;
      model.scale.set(0.2, 0.1, 0.3);
      model.position.set(0, -1.1, 0);
      model.rotation.y = - Math.PI / 2
      scene.add(model);
      map = model
    });

    // Load the second model
    loader.load(`${process.env.PUBLIC_URL}/woodentable.glb`, (gltf) => {
      const table = gltf.scene;
      table.scale.set(0.01, 0.01, 0.01);
      table.position.set(0, -2, 0);
      scene.add(table);
    });

    loader.load(`${process.env.PUBLIC_URL}/mappin.glb`, (gltf) => {
        const pin = gltf.scene;
        pin.scale.set(0.05, 0.05, 0.05);
        pin.rotation.z = - Math.PI;

        const pin1 = pin.clone();
        pin1.position.set(-0.5, -0.7, 0.4);
        scene.add(pin1);

        const pin2 = pin.clone();
        pin2.position.set(-0.3, -0.7, 0.4);
        scene.add(pin2);

        const pin3 = pin.clone();
        pin3.position.set(0.3, -0.7, 0.5);
        scene.add(pin3);

        const pin4 = pin.clone();
        pin4.position.set(0.5, -0.7, 0.55);
        scene.add(pin4);

        const pin5 = pin.clone();
        pin5.position.set(-0.45, -0.7, 0.2);
        scene.add(pin5);

        pins.push(pin1, pin2, pin3, pin4, pin5);
      });




    // LIGHTING LIGHTING LIGHTING LIGHTING LIGHTING

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(-1, 1, 0);
    scene.add(directionalLight);
    

    const floorGeometry = new THREE.PlaneGeometry(200, 200, 64, 64);
    const textureLoader = new THREE.TextureLoader()

    // Displacement Map

    const disMap = textureLoader.load('heightmap3.png');
    disMap.wrapS = disMap.wrapT = THREE.RepeatWrapping;
    disMap.repeat.set(4, 4); // Repeat the texture 4 times in each direction

    // Colour Map

    const colorMap = textureLoader.load('grass.jpg'); // Load a grass texture image
    colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
    colorMap.repeat.set(4, 4);

    const groundMat = new THREE.MeshStandardMaterial ({
        map: colorMap,
        
        displacementMap: disMap,
        displacementScale: 10
    });

    const groundMesh = new THREE.Mesh(floorGeometry, groundMat);
    scene.add(groundMesh);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.set(0, -2, 0)

    // RAYCASTING RAYCASTING RAYCASTING RAYCASTING RAYCASTING

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  
}

window.addEventListener('mousemove', onMouseMove, false);

// CLICK LOGIC CLICK LOGIC CLICK LOGIC CLICK LOGIC CLICK LOGIC

function onClick(event) {
  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects([createSpaceButton]);

  if (intersects.length > 0) {
    // The button was clicked, trigger your event here
    handleButtonClick();

  }
}

window.addEventListener('mousedown', onClick, false);



function handleButtonClick() {

  zoomOut = !zoomOut;
  console.log('Button clicked!');
}



    // CONTROLS CONTROLS CONTROLS CONTROLS CONTROLS

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(camera.position.x, camera.position.y - 2, camera.position.z); // Adjust the Z value to tilt
    controls.enabled = false
    controls.minDistance = 1;
    controls.maxDistance = 1000;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Starting position of the camera
const startPosition = new THREE.Vector3(10, 10, 10);

// Target position of the camera
const endPosition = new THREE.Vector3(0, 1, 1);

// Copy the start position initially
camera.position.copy(startPosition);

// Interpolation factor
let lerpFactor = 0;
const lerpSpeed = 0.02; // Adjust this value to control the speed of the movement

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      //Camera Zoom on load
      if (lerpFactor <= 1) {
        lerpFactor += lerpSpeed;
        
        camera.position.lerpVectors(startPosition, endPosition, lerpFactor);
      }
      //Zoom out onclick
      if (zoomOut && camera.position.distanceTo(newCameraPosition) > 0.1) {
        camera.position.lerpVectors(camera.position, newCameraPosition, zoomOutFactor);
        pins.forEach(pin => {
          pin.scale.set(0.5, 0.5, 0.5);
        });
        map.scale.set(1, 1, 1);
      }


        // Check if zoom out animation is completed
  if (zoomOut && camera.position.distanceTo(newCameraPosition) <= 0.11) {
    zoomOut = false;  // Stop the zoom out animation
    controls.enabled = true;  // Enable OrbitControls
    
    console.log(controls.enabled)
    
  }

      controls.update(); // Only required if controls.enableDamping = true
      renderer.render(scene, camera);
    };

    animate(); // Start the animation loop

    // Clean up on unmount
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default ThreeScene;
