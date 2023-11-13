import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as TWEEN from '@tweenjs/tween.js';
import TextAnimation from './TextAnimation';

let scaleTween;
let positionTween;
let rotationTween;

const ThreeScene = () => {
  const mountRef = useRef(null);
  const [isStarted, setIsStarted] = useState(false);
  const zoomOutFactor = 0.02; // Adjust as needed
  let zoomOut = false;
  let newCameraPosition = new THREE.Vector3(0, 25, 25); // New camera position for zoom out
  let pins = []; // Array to store your pins
  // Target properties for scale and position
const pinTargetPositions = [
  new THREE.Vector3(3, 14, 21), // Target position for pin1
  new THREE.Vector3(-2, 15, 20), // Target position for pin2
  new THREE.Vector3(-2.4, 14.8, 20.3), // Target position for pin3
  new THREE.Vector3(0, 16, 19), // Target position for pin4
  new THREE.Vector3(0, 16, 16), // Target position for pin5
];

const pinTargetScales = [
  new THREE.Vector3(.15, .15, .15), // Target scale for pin1
  new THREE.Vector3(.1, .1, .1), // Target scale for pin1
  new THREE.Vector3(.1, .1, .1), // Target scale for pin1
  new THREE.Vector3(.1, .1, .1), // Target scale for pin1
  new THREE.Vector3(.1, .1, .1), // Target scale for pin1
];

// w


  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#A0E9FF');
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    // Assuming 'camera' is your Three.js camera
const listener = new THREE.AudioListener();
camera.add(listener);

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


        // SKY BOX SKY BOX SKY BOX SKY BOX SKY BOX 

let skybox;

loader.load('skybox.glb', (gltf) => {
  skybox = gltf.scene;
  scene.add(skybox);
});


       // Load the first model
    let map = null;
    loader.load(`${process.env.PUBLIC_URL}/canada.glb`, (gltf) => {
      const model = gltf.scene;
      model.scale.set(0.3, 0.3, 0.3);
      model.position.set(0, -1.1, 0);
      model.rotation.x = 0;
      model.rotation.y = - Math.PI / 2;
      model.rotation.z = 0;
      scene.add(model);
      map = model

      const targetScale = new THREE.Vector3(2, 2, 2);
      scaleTween = new TWEEN.Tween(map.scale)
    .to({ x: targetScale.x, y: targetScale.y, z: targetScale.z }, 7000)
    .easing(TWEEN.Easing.Cubic.Out);

      const targetPosition = new THREE.Vector3(0, 16, 16);
      positionTween = new TWEEN.Tween(map.position)
    .to({ x: targetPosition.x, y: targetPosition.y, z: targetPosition.z }, 7000)
    .easing(TWEEN.Easing.Cubic.Out);

    const targetRotation = new THREE.Euler(Math.PI / 6, -Math.PI / 2, 0); // Rotates the model 360 degrees around the Y axis
    const targetQuaternion = new THREE.Quaternion().setFromEuler(targetRotation);
    rotationTween = new TWEEN.Tween(map.quaternion)
  .to({ x: targetQuaternion.x, y: targetQuaternion.y, z: targetQuaternion.z, w: targetQuaternion.w }, 6000)
  .easing(TWEEN.Easing.Cubic.Out);
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

      let treeModel;

loader.load('/trees/regulartree.glb', (gltf) => {
  treeModel = gltf.scene;
  addTrees(); // Call a function to add trees after the model is loaded
});


      // const helperObject = new THREE.Object3D();
      // scene.add(helperObject);


      // Create an Audio source
const sound = new THREE.Audio(listener);

// Load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load('windintrees.mp3', function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
});


scene.fog = new THREE.Fog(0xffffff, 1, 90); // Example: White fog with a near plane at 1 and a far plane at 100


    // LIGHTING LIGHTING LIGHTING LIGHTING LIGHTING

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(-1, 1, 0);
    scene.add(directionalLight);
    

    const floorGeometry = new THREE.PlaneGeometry(200, 200, 64, 64);
    const textureLoader = new THREE.TextureLoader()

    // Displacement Map

    const disMap = textureLoader.load('heightmap5.png');
    disMap.wrapS = disMap.wrapT = THREE.RepeatWrapping;
    disMap.repeat.set(4, 4); // Repeat the texture 4 times in each direction

    // Colour Map

    const colorMap = textureLoader.load('grass.jpg'); // Load a grass texture image
    colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
    colorMap.repeat.set(4, 4);

    const groundMat = new THREE.MeshStandardMaterial ({
        map: colorMap,
        
        displacementMap: disMap,
        displacementScale: 6
    });

    const groundMesh = new THREE.Mesh(floorGeometry, groundMat);
    scene.add(groundMesh);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.set(0, -2, 0)

//     const planeGeometry = new THREE.PlaneGeometry(10000, 10000);
// const planeMaterial = new THREE.MeshBasicMaterial({ map: loader.load('path_to_clouds_texture.jpg'), side: THREE.DoubleSide });
// const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// plane.position.y = 500; // Adjust the height as needed
// plane.rotateX(Math.PI / 2);
// scene.add(plane);

    //ADD TREES

    function addTrees() {
      const numberOfTrees = 50; // Number of trees you want to add
      const areaSize = 200; // Adjust based on the size of your ground mesh
    
      for (let i = 0; i < numberOfTrees; i++) {
        const tree = treeModel.clone();
    
        // Random x and z position within the ground area
        const x = Math.random() * areaSize - areaSize / 2;
        const z = Math.random() * areaSize - areaSize / 2;
    
        // Raycaster to find y position on the terrain
        const raycaster = new THREE.Raycaster(new THREE.Vector3(x, 100, z), new THREE.Vector3(0, -1, 0));
        const intersects = raycaster.intersectObject(groundMesh);
    
        if (intersects.length > 0) {
          const y = intersects[0].point.y; // y position on the terrain
          tree.position.set(x, y, z);
          scene.add(tree);
    
          // Optional: Randomize scale and rotation
          const scale = 0.75 + Math.random() * 0.5;
          tree.scale.set(scale, scale, scale);
          tree.rotation.y = Math.random() * 2 * Math.PI;
        }
      }
    }

    // ANIMATE PINS ANIMATE PINS ANIMATE PINS ANIMATE PINS ANIMATE PINS

function animatePins() {
  pins.forEach((pin, index) => {
    if (index < pinTargetPositions.length) {
      // Position animation
      new TWEEN.Tween(pin.position)
        .to({ 
          x: pinTargetPositions[index].x, 
          y: pinTargetPositions[index].y, 
          z: pinTargetPositions[index].z 
        }, 7000)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

      // Scale animation
      if (index < pinTargetScales.length) {
        new TWEEN.Tween(pin.scale)
          .to({ 
            x: pinTargetScales[index].x, 
            y: pinTargetScales[index].y, 
            z: pinTargetScales[index].z 
          }, 7000)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();
      }

    }
    pins.forEach((pin) => {
      pin.rotation.x = Math.PI / 4;
    })
  });
}





    // RAYCASTING RAYCASTING RAYCASTING RAYCASTING RAYCASTING

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  
}

window.addEventListener('mousemove', onMouseMove, false);

document.addEventListener('mousemove', onMouseMoveStart, false);

function onMouseMoveStart(event) {
    // Normalize mouse coordinates to range -1 to 1
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    // Call a function to update the camera position
    updateCameraPosition(mouseX, mouseY);
}

const cameraBounds = {
  minX: 19,
  maxX: 21,
  minY: 19,
  maxY: 21
};

function updateCameraPosition(mouseX, mouseY) {
  // Map mouse coordinates to camera bounds
  const targetX = THREE.MathUtils.mapLinear(mouseX, -1, 1, cameraBounds.minX, cameraBounds.maxX);
  const targetY = THREE.MathUtils.mapLinear(mouseY, -1, 1, cameraBounds.minY, cameraBounds.maxY);

  // Smoothly interpolate the camera position
  camera.position.x += (targetX - camera.position.x) * 0.05;
  camera.position.y += (targetY - camera.position.y) * 0.05;

  // Optionally, adjust the camera to look at a specific point
  camera.lookAt(scene.position);
}





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

   // Calculate objects intersecting the picking ray for the pins
   const pinIntersects = raycaster.intersectObjects(pins, true); // 'true' for recursive if pins have children

   if (pinIntersects.length > 0) {
     // A pin was clicked
     handlePinClick(pinIntersects[0].object);
   }
}

window.addEventListener('mousedown', onClick, false);

function handlePinClick(clickedPin) {
  console.log('Pin clicked:', clickedPin);

  // Position your HTML element based on the clicked object
  // You can use object.position for world coordinates
  // or calculate screen coordinates to position the HTML element

  const vector = new THREE.Vector3();
  clickedPin.getWorldPosition(vector);
  vector.project(camera);

  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;

  const infoBox = document.getElementById('infoBox');
  infoBox.style.display = 'block';
  infoBox.style.left = `${x}px`;
  infoBox.style.top = `${y}px`;

  // Populate or modify the infoBox based on the clicked object
  infoBox.innerHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/UYyN-_i80E4?si=OJ6ub-eph2gulnzH" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>'

}


function handleButtonClick() {

  zoomOut = !zoomOut;
  if (scaleTween) { // Check if tween has been initialized
    scaleTween.start();
  }
  if (positionTween) { // Check if tween has been initialized
    positionTween.start();
  }
  if (rotationTween) {
    rotationTween.start();
  }

  animatePins(); // Start animations for pins
  console.log('Button clicked!');
}


// Function to start zooming
function startZoom() {
  lerpFactor = 0; // Reset lerpFactor for a fresh start
  function zoom() {
    if (lerpFactor <= 1) {
      lerpFactor += lerpSpeed;
      camera.position.lerpVectors(startPosition, endPosition, lerpFactor);
      requestAnimationFrame(zoom); // Continue zooming in the next frame
    }
  }
  zoom(); // Start zooming
}

function removeFog() {
  const duration = 10000; // Duration in milliseconds
  const startTime = Date.now();

  function animateFog() {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;

    if (progress < 1) {
      scene.fog.near = THREE.MathUtils.lerp(1, 100, progress); // Example: Lerp near plane
      scene.fog.far = THREE.MathUtils.lerp(100, 1000, progress); // Example: Lerp far plane
      requestAnimationFrame(animateFog);
    } else {
      scene.fog = null; // Remove fog completely after the animation
    }

    // Update the scene rendering if necessary
    renderer.render(scene, camera);
  }

  animateFog();
}


function handleZoom() {
  sound.play();
  removeFog()
  document.removeEventListener('mousemove', onMouseMoveStart, false)
  startZoom();
  setInterval(() => {
    setIsStarted(true)
  }, 3000)
  console.log('zoom started"')
}

document.getElementById('startbtn').addEventListener('mousedown', handleZoom, false)

    // CONTROLS CONTROLS CONTROLS CONTROLS CONTROLS

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(camera.position.x, camera.position.y - 2, camera.position.z); // Adjust the Z value to tilt
    controls.enabled = false
    controls.minDistance = 1;
    controls.maxDistance = 1000;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Starting position of the camera
const startPosition = new THREE.Vector3(20, 20, 20);

// Target position of the camera
const endPosition = new THREE.Vector3(0, 1, 1);

// Copy the start position initially
camera.position.copy(startPosition);

// Interpolation factor
let lerpFactor = 40;
const lerpSpeed = 0.01; // Adjust this value to control the speed of the movement

    // Animation loop
const animate = () => {
          requestAnimationFrame(animate);
          //Zoom out onclick
          if (zoomOut && camera.position.distanceTo(newCameraPosition) > 0.1) {
            camera.position.lerpVectors(camera.position, newCameraPosition, zoomOutFactor);
            
          }
            // Check if zoom out animation is completed
      if (zoomOut && camera.position.distanceTo(newCameraPosition) <= 0.11) {
        zoomOut = false;  // Stop the zoom out animation
        controls.enabled = true;  // Enable OrbitControls
        
        console.log(controls.enabled)
        
      }
          TWEEN.update(); // Update all tweens
          controls.update(); // Only required if controls.enableDamping = true
          renderer.render(scene, camera);
};

animate(); // Start the animation loop

    // Clean up on unmount
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [setIsStarted]);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100vh' }}></div>
      {isStarted ? null: <div style={{background: 'none', position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}} >
      <button id="startbtn" style={{background: 'none', border: 0,}} onClick={() => console.log('hello')}><TextAnimation  /></button>
      </div> }
      <div id="infoBox" style={{display: "flex", position: "absolute", padding: "10px", background: "rgba(0,0,0,. 5)"}}>
  {/* <!-- Info will be populated here on click --> */}
  
      </div>

      {/* {!isStarted && (
        <div style={overlayStyle}>
          <button onClick={() => setIsStarted(true)} style={buttonStyle}>
          <TextAnimation  />
            </button>
        </div>
      )} */}
    </div>
  );
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
  // Other styling as needed
};

const buttonStyle = {
  padding: '10px 20px',
  fontSize: '20px',
  cursor: 'pointer',
  // Add more styles as needed
};

export default ThreeScene;
