import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import api from './api';  // your axios instance

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CHUNK_SIZE = 250;
const BOTTLES_PER_CHUNK = 2;
const STATUE_DENSITY = 1;
const MAX_RENDER_DISTANCE = 1000;

interface BottleData {
  id: string;
  object: THREE.Object3D;
}

interface StatueData {
  object: THREE.Object3D;
}

const BottleGamePage = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [foundBottles, setFoundBottles] = useState<string[]>([]);
  const foundBottlesRef = useRef<string[]>([]);
  const [selectedBottle, setSelectedBottle] = useState<string | null>(null);
  const [writeupContent, setWriteupContent] = useState<string | null>(null);
  const [loadingWriteup, setLoadingWriteup] = useState<boolean>(false);
  const [writeupError, setWriteupError] = useState<string | null>(null);
  const bottleCounter = useRef<number>(1);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(0, 8, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current?.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    scene.add(directionalLight);

    const waterGeometry = new THREE.PlaneGeometry(100000, 100000);
    const water = new Water(waterGeometry, {
      textureWidth: 256,
      textureHeight: 256,
      waterNormals: new THREE.TextureLoader().load("https://threejs.org/examples/textures/waternormals.jpg", (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x0f1a09,
      distortionScale: 10,
      fog: true,
    });
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const skyUniforms = (sky.material as THREE.ShaderMaterial).uniforms;
    skyUniforms["turbidity"].value = 1;
    skyUniforms["rayleigh"].value = 3;
    skyUniforms["mieCoefficient"].value = 0.045;
    skyUniforms["mieDirectionalG"].value = 0.8;

    const sun = new THREE.Vector3();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const parameters = { elevation: 15, azimuth: 180 };

    const updateSun = () => {
      const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
      const theta = THREE.MathUtils.degToRad(parameters.azimuth);
      sun.setFromSphericalCoords(1, phi, theta);
      sky.material.uniforms["sunPosition"].value.copy(sun);
      water.material.uniforms["sunDirection"].value.copy(sun).normalize();

      // ✅ Use a separate Sky instance just for the environment map generation
      const envSky = new Sky();
      envSky.scale.setScalar(10000);
      (envSky.material as THREE.ShaderMaterial).uniforms["turbidity"].value = skyUniforms["turbidity"].value;
      (envSky.material as THREE.ShaderMaterial).uniforms["rayleigh"].value = skyUniforms["rayleigh"].value;
      (envSky.material as THREE.ShaderMaterial).uniforms["mieCoefficient"].value = skyUniforms["mieCoefficient"].value;
      (envSky.material as THREE.ShaderMaterial).uniforms["mieDirectionalG"].value = skyUniforms["mieDirectionalG"].value;
      (envSky.material as THREE.ShaderMaterial).uniforms["sunPosition"].value.copy(sun);

      const tmpScene = new THREE.Scene();
      tmpScene.add(envSky);
      scene.environment = pmremGenerator.fromScene(tmpScene).texture;
    };

    updateSun();

    scene.fog = new THREE.FogExp2(0xffffff, 0.002);

    const loader = new GLTFLoader();
    let boat: THREE.Object3D | null = null;
    let bottleTemplate: THREE.Object3D | null = null;
    let statue1Template: THREE.Object3D | null = null;
    let statue2Template: THREE.Object3D | null = null;

    const loadedChunks = new Set<string>();
    const bottles: BottleData[] = [];
    const statues: StatueData[] = [];

    loader.load("/models/boat1.glb", (gltf) => {
      boat = gltf.scene;
      boat.scale.set(5, 5, 5);
      boat.position.set(0, 2.4, 0);
      scene.add(boat);
    });

    loader.load("/models/bottle.glb", (gltf) => {
      bottleTemplate = gltf.scene;
    });

    loader.load("/models/creepy_statue_1.glb", (gltf) => {
      statue1Template = gltf.scene;
    });

    loader.load("/models/creepy_statue_2.glb", (gltf) => {
      statue2Template = gltf.scene;
    });

    loader.load("/models/dome.glb", (gltf) => {
      const dome = gltf.scene;
      dome.position.set(0, -1.5, 0);
      dome.rotation.set(0, Math.PI / 2, 0);
      dome.scale.set(4, 4, 4);
      scene.add(dome);
    });

    loader.load("/models/Pillars.glb", (gltf) => {
      const pillars = gltf.scene;
      pillars.position.set(1250, -1.5, 1250);
      pillars.rotation.set(0, Math.PI / 2, 0);
      pillars.scale.set(7, 7, 7);
      scene.add(pillars);
    });

    loader.load("/models/NigeshBot.glb", (gltf) => {
      const bot = gltf.scene;
      bot.position.set(1250, 0, 1250);
      bot.rotation.set(0, Math.PI / 2, 0);
      bot.scale.set(2, 2, 2);
      scene.add(bot);
    });

    const keysPressed: { [key: string]: boolean } = {};
    const moveBoat = () => {
      if (!boat) return;
      const moveSpeed = 0.5;
      const turnSpeed = 0.03;
      if (keysPressed["a"]) boat.rotation.y += turnSpeed;
      if (keysPressed["d"]) boat.rotation.y -= turnSpeed;
      const direction = new THREE.Vector3(Math.sin(boat.rotation.y), 0, Math.cos(boat.rotation.y));
      if (keysPressed["w"]) boat.position.add(direction.clone().multiplyScalar(-moveSpeed));
      if (keysPressed["s"]) boat.position.add(direction.clone().multiplyScalar(+moveSpeed));
    };

    const generateChunkKey = (x: number, z: number) => `${x}_${z}`;

    const loadChunk = (chunkX: number, chunkZ: number) => {
      if (!bottleTemplate || !statue1Template || !statue2Template) return;
      const key = generateChunkKey(chunkX, chunkZ);
      if (loadedChunks.has(key)) return;
      loadedChunks.add(key);

      for (let i = 0; i < BOTTLES_PER_CHUNK; i++) {
        const bottle = bottleTemplate.clone(true);
        const offsetX = (Math.random() - 0.5) * CHUNK_SIZE;
        const offsetZ = (Math.random() - 0.5) * CHUNK_SIZE;
        bottle.position.set(chunkX * CHUNK_SIZE + offsetX, 2.2, chunkZ * CHUNK_SIZE + offsetZ);
        bottle.scale.set(100, 100, 100);
        bottle.rotation.y = Math.random() * Math.PI * 2;
        const globalBottleNumber = bottleCounter.current++;
        const id = `Bottle ${globalBottleNumber}`;
        (bottle as any).userData.id = id;
        scene.add(bottle);
        bottles.push({ id, object: bottle });
      }

      for (let i = 0; i < STATUE_DENSITY; i++) {
        const template = Math.random() > 0.5 ? statue1Template : statue2Template;
        const statue = template.clone(true);
        const offsetX = (Math.random() - 0.5) * CHUNK_SIZE;
        const offsetZ = (Math.random() - 0.5) * CHUNK_SIZE;
        statue.position.set(chunkX * CHUNK_SIZE + offsetX, 0, chunkZ * CHUNK_SIZE + offsetZ);
        statue.scale.set(3, 3, 3);
        statue.rotation.y = Math.random() * Math.PI * 2;
        scene.add(statue);
        statues.push({ object: statue });
      }
    };

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      moveBoat();

      const time = performance.now() * 0.001;
      if (boat) {
        boat.position.y = 0.75 + Math.sin(time * 1.5) * 0.25;
        boat.rotation.z = Math.sin(time * 0.8) * 0.05;
        boat.rotation.x = Math.sin(time * 0.6) * 0.05;

        const cameraDistance = 25;
        const cameraHeight = 5;
        const cameraOffset = new THREE.Vector3(0, cameraHeight, cameraDistance);
        cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), boat.rotation.y);
        const desiredCameraPos = boat.position.clone().add(cameraOffset);
        camera.position.lerp(desiredCameraPos, 0.1);
        camera.lookAt(boat.position);

        const chunkX = Math.floor(boat.position.x / CHUNK_SIZE);
        const chunkZ = Math.floor(boat.position.z / CHUNK_SIZE);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            loadChunk(chunkX + dx, chunkZ + dz);
          }
        }

        const visibleBottles = bottles.filter(({ object }) => {
          const dist = boat!.position.distanceTo(object.position);
          object.visible = dist < MAX_RENDER_DISTANCE;
          return dist < 100;
        });

        statues.forEach(({ object }) => {
          const dist = boat!.position.distanceTo(object.position);
          object.visible = dist < MAX_RENDER_DISTANCE;
        });

        const ids = visibleBottles.map((b) => b.id);
        if (JSON.stringify(ids) !== JSON.stringify(foundBottlesRef.current)) {
          setFoundBottles(ids);
          foundBottlesRef.current = ids;
        }
      }

      (water.material as THREE.ShaderMaterial).uniforms["time"].value += 1.0 / 60.0;
      renderer.render(scene, camera);
    };

    const interval = setInterval(() => {
      if (bottleTemplate && boat && statue1Template && statue2Template) {
        animate();
        clearInterval(interval);
      }
    }, 100);

    window.addEventListener("keydown", (e) => (keysPressed[e.key.toLowerCase()] = true));
    window.addEventListener("keyup", (e) => (keysPressed[e.key.toLowerCase()] = false));
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      renderer.dispose();
      pmremGenerator.dispose();
    };
  }, []);

  function extractBottleNumber(input: string): number {
    return parseInt(input.replace("Bottle ", ""));
  }

  useEffect(() => {
    if (!selectedBottle) return;

    const claimBottle = async () => {
      setLoadingWriteup(true);
      setWriteupError(null);
      setWriteupContent(null);

      try {
        const writeupId = extractBottleNumber(selectedBottle);
        await api.post(`/api/writeups/claim/${writeupId}`);
        setWriteupContent("Bottle claimed successfully.");
      } catch (err: any) {
        console.error(err);
        if (err.response?.data?.error) {
          setWriteupError(err.response.data.error);
        } else {
          setWriteupError("Something went wrong.");
        }
      } finally {
        setLoadingWriteup(false);
      }
    };

    claimBottle();
  }, [selectedBottle]);

  return (
    <div ref={mountRef} style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: 20, right: 20, background: "rgba(0,0,0,0.7)", borderRadius: "8px", padding: "10px", zIndex: 10 }}>
        <h4 style={{ color: "#fff" }}>Claim Bottle</h4>
        <div style={{ display: "flex", overflowX: "auto", gap: "8px" }}>
          {foundBottles.map((bottleId) => (
            <button
              key={bottleId}
              onClick={() => setSelectedBottle(bottleId)}
              style={{
                background: "#8C6845",
                color: "#000",
                padding: "5px 10px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {bottleId}
            </button>
          ))}
        </div>
      </div>

      {selectedBottle && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
          }}
          onClick={() => setSelectedBottle(null)}
        >
          <div
            style={{
              background: "#040509",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "400px",
              textAlign: "left",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{selectedBottle}</h3>
            {loadingWriteup && <p>Loading...</p>}
            {writeupError && <p style={{ color: "red" }}>{writeupError}</p>}
            {writeupContent && <p>{writeupContent}</p>}
            <button
              onClick={() => setSelectedBottle(null)}
              style={{
                marginTop: "10px",
                background: "#0A1218",
                color: "#8C6845",
                padding: "8px 12px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BottleGamePage;
