	import * as THREE from 'https://unpkg.com/three@0.153.0/build/three.module.js';
  import { OrbitControls } from 'https://unpkg.com/three@0.153.0/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/RGBELoader.js';
 import { RoundedBoxGeometry } from  'https://esm.sh/three@0.160.0/examples/jsm/geometries/RoundedBoxGeometry.js'
//import { RoundedBoxGeometry } from './rubikscube-project/node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';




      // === Setup Scene, Camera, Renderer ===
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(4, 4, 4);
      scene.background = new THREE.Color(0xFAFAFA);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      document.body.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

    
      // === Lighting ===
   scene.add(new THREE.AmbientLight(0x29A0FA, 0.6));
   const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
   dirLight1.position.set(5, 5, 5);
   scene.add(dirLight1);
   
new RGBELoader()
  .setPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/')
  .load('royal_esplanade_1k.hdr', function (hdrTexture) {
    hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdrTexture;
    scene.background = null; // keep background white

    
    animate();
  });
   
     

      // === Cube Setup ===
      const cubies = [];
      const cubeGroup = new THREE.Group();
      scene.add(cubeGroup);

      const cubeSize = 0.95;
      const offset = 1;

      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x00008B,
        metalness: 0.5,
        roughness: 0,
       transmission: 1.0,
        thickness: 1,
        ior: 2.3,
        iridescenceIOR: 2.3,
        iridescence: 1,
        reflectivity: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0,
        reflectivity: 1,
        specularIntensity: 1,
        specularColor: new THREE.Color(1, 1, 1),
        attenuationDistance: 2,
        attenuationColor: new THREE.Color(0x29A0FA),
      });

      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            const radius = 0.1; // controls how round the edges are
const smoothness = 4; // controls mesh subdivision (higher = smoother)
const geometry = new RoundedBoxGeometry(cubeSize, cubeSize, cubeSize, smoothness, radius);
            const cube = new THREE.Mesh(geometry, glassMaterial.clone());
            cube.position.set(x * offset, y * offset, z * offset);
            cube.userData.originalColor = cube.material.color.clone();
            cubeGroup.add(cube);
            cubies.push(cube);
          }
        }
      }

      // === Raycaster Hover Logic ===
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      let hoveredFace = null;

      window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      });

      let mouseOverCanvas = false;
      renderer.domElement.addEventListener('mouseenter', () => mouseOverCanvas = true);
      renderer.domElement.addEventListener('mouseleave', () => mouseOverCanvas = false);

      function updateHover() {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(cubies);

        if (hoveredFace) {
          hoveredFace.material.color.copy(hoveredFace.userData.originalColor);
          hoveredFace = null;
        }

        if (intersects.length > 0) {
          hoveredFace = intersects[0].object;
          
        }
      }

      // === Rotation Logic ===
      function rotateFace(axis, value, direction = 1) {
        return new Promise(resolve => {
          const group = new THREE.Group();
          const threshold = 0.01;

          cubies.forEach(cube => {
            if (Math.abs(cube.position[axis] - value) < threshold) {
              group.add(cube);
            }
          });

          cubeGroup.add(group);

          const duration = 500;
          const startTime = performance.now();
          const rotationAxis = new THREE.Vector3(
            axis === 'x' ? 1 : 0,
            axis === 'y' ? 1 : 0,
            axis === 'z' ? 1 : 0
          );

          function animateRotation(time) {
            const elapsed = time - startTime;
            const t = Math.min(elapsed / duration, 1);
            const angle = direction * Math.PI / 2 * t;

            group.rotation.set(0, 0, 0);
            group.rotateOnAxis(rotationAxis, angle);

            if (t < 1) {
              requestAnimationFrame(animateRotation);
            } else {
              group.updateMatrixWorld();
              group.children.forEach(cube => {
                cube.applyMatrix4(group.matrix);
                cubeGroup.add(cube);
              });
              cubeGroup.remove(group);
              resolve();
            }
          }

          requestAnimationFrame(animateRotation);
        });
      }

      // === Auto Rotate Loop ===
      const moves = [
        { axis: 'x', value: -1 },
        { axis: 'x', value: 0 },
        { axis: 'x', value: 1 },
        { axis: 'y', value: -1 },
        { axis: 'y', value: 0 },
        { axis: 'y', value: 1 },
        { axis: 'z', value: -1 },
        { axis: 'z', value: 0 },
        { axis: 'z', value: 1 },
      ];

      async function autoRotateLoop() {
        while (true) {
          const move = moves[Math.floor(Math.random() * moves.length)];
          const dir = Math.random() < 0.5 ? 1 : -1;
          await rotateFace(move.axis, move.value, dir);
          await new Promise(r => setTimeout(r, 800));
        }
      }
      autoRotateLoop();

      // === Mouse Follow Logic ===
      const followAmount = 1.5;
      const followSpeed = 0.1;
      const targetPosition = new THREE.Vector3(0, 0, 0);

      function updateTargetPosition() {
        if (!mouseOverCanvas) {
          targetPosition.x = 0;
          targetPosition.z = 0;
        } else {
          targetPosition.x = mouse.x * followAmount;
          targetPosition.z = mouse.y * followAmount;
        }
      }

      // === Animate ===
      let time = 0;

      function animate() {
        requestAnimationFrame(animate);
        controls.update();

        time += 0.01;
        const floatY = Math.sin(time) * 0.2;

        updateTargetPosition();

        cubeGroup.position.x += (targetPosition.x - cubeGroup.position.x) * followSpeed;
        cubeGroup.position.z += (targetPosition.z - cubeGroup.position.z) * followSpeed;
        cubeGroup.position.y += (floatY - cubeGroup.position.y) * 0.05;

        cubeGroup.rotation.y += 0.003;

        updateHover();
        renderer.render(scene, camera);
      }

      animate();

      // === Manual Key Controls ===
      document.addEventListener('keydown', (e) => {
        if (e.key === 'f') rotateFace('z', 1);
        if (e.key === 'b') rotateFace('z', -1);
        if (e.key === 'u') rotateFace('y', 1);
        if (e.key === 'd') rotateFace('y', -1);
        if (e.key === 'l') rotateFace('x', -1);
        if (e.key === 'r') rotateFace('x', 1);
      });

      // === Resize ===
      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });