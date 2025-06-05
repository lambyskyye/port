import * as THREE from 'https://unpkg.com/three@0.153.0/build/three.module.js';
   // import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
    import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 60);
    scene.background = new THREE.Color(0xFAFAFA);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    // 1. Start with a torus geometry
    const torusGeo = new THREE.TorusGeometry(15, 6, 128, 256); // High-res torus
    const torusPos = torusGeo.attributes.position.array;
    const vertexCount = torusGeo.attributes.position.count;

    // 2. Create fake sphere version by normalizing vertices
    const spherePos = new Float32Array(torusPos.length);
    for (let i = 0; i < vertexCount; i++) {
      const i3 = i * 3;
      const x = torusPos[i3];
      const y = torusPos[i3 + 1];
      const z = torusPos[i3 + 2];

      const len = Math.sqrt(x * x + y * y + z * z);
      const scale = 20 / len; // push to sphere radius
      spherePos[i3] = x * scale;
      spherePos[i3 + 1] = y * scale;
      spherePos[i3 + 2] = z * scale;
    }

    // 3. Add morph target
    torusGeo.morphAttributes.position = [
      new THREE.Float32BufferAttribute(spherePos, 3)
    ];

    // 4. Material with chrome look
    const envMap = new THREE.CubeTextureLoader().load([
      'https://threejs.org/examples/textures/cube/Bridge2/posx.jpg',
      'https://threejs.org/examples/textures/cube/Bridge2/negx.jpg',
      'https://threejs.org/examples/textures/cube/Bridge2/posy.jpg',
      'https://threejs.org/examples/textures/cube/Bridge2/negy.jpg',
      'https://threejs.org/examples/textures/cube/Bridge2/posz.jpg',
      'https://threejs.org/examples/textures/cube/Bridge2/negz.jpg',
    ]);

 const material = new THREE.MeshPhysicalMaterial({
      color: 0x536dfe,
        metalness: 1,
        roughness: 0,
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
        attenuationColor: new THREE.Color(0x8c9eff),
      envMap,
      morphTargets: true
    });




    // const material = new THREE.MeshPhysicalMaterial({
    //   color: 0x536dfe,
    //   metalness: 1,
    //   roughness: 0.05,
    //   clearcoat: 1,
    //   clearcoatRoughness: 0.1,
    //   envMap,
    //   morphTargets: true
    // });

    const mesh = new THREE.Mesh(torusGeo, material);
    scene.add(mesh);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(10, 10, 10);
    scene.add(light);

    // Animate morph
    function animate(time) {
      requestAnimationFrame(animate);
      const t = time * 0.001;

      const morph = (Math.sin(t) + 1) / 2; // smooth loop
      mesh.morphTargetInfluences[0] = morph;

      const scale = 1 + 0.05 * Math.sin(t * 2);
      mesh.scale.set(scale, scale, scale);

      mesh.rotation.y += 0.01;
      mesh.rotation.x += 0.01;
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    




    // // Scene setup
    // const scene = new THREE.Scene();
    // const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // camera.position.set(0, 30, 100);

    // const renderer = new THREE.WebGLRenderer({ antialias: true });
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setPixelRatio(window.devicePixelRatio);
    // document.body.appendChild(renderer.domElement);

    // // Controls
    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;

    // // Create custom arrow shape
    // const shape = new THREE.Shape();
    // shape.moveTo(0, 0);
    // shape.lineTo(0, 40);
    // shape.lineTo(12, 32);
    // shape.lineTo(29, 64);
    // shape.lineTo(38, 54);
    // shape.lineTo(10, 24);
    // shape.lineTo(22, 24);
    // shape.lineTo(0, 0);

    // const extrudeSettings = {
    //   depth: 6,
    //   bevelEnabled: true,
    //   bevelThickness: 1.5,
    //   bevelSize: 1,
    //   bevelSegments: 5
    // };

    // const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // geometry.center();

    // // Material - chrome/metal style
    // const material = new THREE.MeshPhysicalMaterial({
    //   color: 0xffffff,
    //   metalness: 1.0,
    //   roughness: 0.05,
    //   clearcoat: 1,
    //   clearcoatRoughness: 0.1
    // });

    // const mesh = new THREE.Mesh(geometry, material);
    // scene.add(mesh);

    // // Add environment map (simple fake reflection using CubeTexture)
    // const loader = new THREE.CubeTextureLoader();
    // const envMap = loader.load([
    //   'https://threejs.org/examples/textures/cube/Bridge2/posx.jpg',
    //   'https://threejs.org/examples/textures/cube/Bridge2/negx.jpg',
    //   'https://threejs.org/examples/textures/cube/Bridge2/posy.jpg',
    //   'https://threejs.org/examples/textures/cube/Bridge2/negy.jpg',
    //   'https://threejs.org/examples/textures/cube/Bridge2/posz.jpg',
    //   'https://threejs.org/examples/textures/cube/Bridge2/negz.jpg',
    // ]);
    // scene.environment = envMap;
    // material.envMap = envMap;

    // // Lighting
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    // directionalLight.position.set(5, 10, 15);
    // scene.add(directionalLight);

    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    // scene.add(ambientLight);

    // // Animate
    // function animate() {
    //   requestAnimationFrame(animate);
    //   controls.update();
    //   renderer.render(scene, camera);
    // }
    // animate();

    // // Responsive
    // window.addEventListener('resize', () => {
    //   camera.aspect = window.innerWidth / window.innerHeight;
    //   camera.updateProjectionMatrix();
    //   renderer.setSize(window.innerWidth, window.innerHeight);
    // });
