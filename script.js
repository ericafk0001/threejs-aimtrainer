let difficulty = 1;

function changeDifficulty(difficulty) {
  const difficultyText = document.getElementById("difficulty");

  switch (difficulty) {
    case 1:
      difficultyText.textContent = "Easy";
      spheres.forEach((sphere) => {
        sphere.visible = true;
        sphere.scale.set(1.5, 1.5, 1.5);
      });
      break;
    case 2:
      difficultyText.textContent = "Medium";
      spheres.forEach((sphere) => {
        sphere.visible = Math.random() < 0.5;
        sphere.scale.set(1, 1, 1);
      });
      break;
    case 3:
      difficultyText.textContent = "Hard";
      spheres.forEach((sphere) => {
        sphere.visible = Math.random() < 0.75;
        sphere.scale.set(0.5, 0.5, 0.5);
      });
      break;
  }
}

document.addEventListener("keydown", function (event) {
  if (event.key === "i" || event.key === "I") {
    difficulty = difficulty === 3 ? 1 : difficulty + 1;
    console.log(difficulty);
    changeDifficulty(difficulty);
  }
});

// Set up the scene
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, -5, 10);

scene.add(new THREE.AmbientLight(0xffffff, 1)); // Add ambient light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const loader = new THREE.GLTFLoader();

loader.load(
  "fps_rig.glb",
  function (gltf) {
    const model = gltf.scene;
    // positioning and rotation of the model
    model.scale.set(1, 1, 1.2);
    model.position.set(-1, -3, -5);
    model.rotation.set(0, 1.6, 0);

    // Add model as child of camera
    camera.add(model);
    scene.add(camera); // Make sure camera is in scene
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.error("An error happened:", error);
  }
);

// Create the renderer
var renderer = new THREE.WebGLRenderer({ alpha: true, depth: true });
// Configure renderer settings
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.setClearColor(0x000000, 1); // Set background color to black
renderer.domElement.style.position = "fixed";
renderer.domElement.id = "renderer";
renderer.domElement.style.zIndex = "-1";
renderer.domElement.style.left = "0";
renderer.domElement.style.top = "0";
document.body.appendChild(renderer.domElement);

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var particles = [];
var triangles = [];
let spheres = [];

var hassphereMoved = false; // Flag to track if the sphere has already been moved

// Gravity effect variables
var gravity = new THREE.Vector3(0, -0.01, 0); // Adjust the gravity strength as needed
var maxGravityDistance = 2; // Adjust the maximum distance affected by gravity as needed

var controls = new THREE.PointerLockControls(camera, document.body);

// create a plane geometry with the same size as the grid
var planeGeometry = new THREE.PlaneGeometry(20, 20);

// create a blue material
var blueMaterial = new THREE.MeshBasicMaterial({
  color: 0x0000ff,
  side: THREE.DoubleSide,
});

var geometry = new THREE.SphereGeometry(1.4, 32, 32);
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

const MIN_SPAWN_DISTANCE = 10; // min distance from camera
const spawnPlaneGeometry = new THREE.PlaneGeometry(40, 20);
const spawnPlaneMaterial = new THREE.MeshBasicMaterial({
  color: 0x444444,
  transparent: true,
  opacity: 0,
  side: THREE.DoubleSide,
});
const spawnPlane = new THREE.Mesh(spawnPlaneGeometry, spawnPlaneMaterial);
// Position plane
spawnPlane.position.set(0, 8, -15);
spawnPlane.rotation.x = Math.PI / 90;
// Face plane towards player
spawnPlane.rotation.y = Math.PI;
scene.add(spawnPlane);

function getValidSpawnPosition() {
  return new THREE.Vector3(
    (Math.random() - 0.5) * spawnPlane.geometry.parameters.width,
    (Math.random() - 0.5) * spawnPlane.geometry.parameters.height +
      spawnPlane.position.y,
    spawnPlane.position.z
  );
}

function respawnSphere(sphere) {
  const newPosition = getValidSpawnPosition();
  sphere.position.copy(newPosition);
}

// Create initial spheres (single loop)
for (var i = 0; i < 5; i++) {
  var sphere = new THREE.Mesh(geometry, material);
  const spawnPosition = getValidSpawnPosition();
  sphere.position.copy(spawnPosition);
  scene.add(sphere);
  spheres.push(sphere);
}

// Update camera to look at center point instead of last sphere
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Set up pointer lock controls
var container = document.getElementById("container");
var instructions = document.getElementById("instructions");
var play = document.getElementById("startBtn");

play.addEventListener("click", function () {
  controls.lock();
});

controls.addEventListener("lock", function () {
  instructions.style.display = "none";
  container.style.display = "none";
  document.getElementById("crosshair").style.display = "block"; //show crosshair when start
});

controls.addEventListener("unlock", function () {
  container.style.display = "block";
  instructions.style.display = "";
  document.getElementById("crosshair").style.display = "none"; //hide crosshair when start
});

scene.add(controls.getObject());

// Check collision with the grid
function checkCollision(position) {
  var gridSize = 20;
  var halfGridSize = gridSize / 2;
  var margin = 0.1;

  if (
    position.x < -halfGridSize + margin ||
    position.x > halfGridSize - margin ||
    position.z < -halfGridSize + margin ||
    position.z > halfGridSize - margin
  ) {
    return true; // Collision detected
  }

  return false; // No collision
}

// Render loop
function animate() {
  requestAnimationFrame(animate);

  updateParticles();

  checkParticleCollision();

  updateTriangles();

  renderer.render(scene, camera);
}

animate();

function removeParticle(particle) {
  scene.remove(particle);
  particles.splice(particles.indexOf(particle), 1);
}

function createParticle() {
  playLaserSound();
  var geometry = new THREE.SphereGeometry(0.02, 16, 16);
  var material = new THREE.MeshBasicMaterial({ color: 0xadd8e6 });
  var particle = new THREE.Mesh(geometry, material);
  particle.position.copy(camera.position);
  particle.initialDirection = camera.getWorldDirection(new THREE.Vector3());
  particle.velocity = particle.initialDirection.clone().multiplyScalar(0.9);
  scene.add(particle);
  particles.push(particle);
}

function updateParticles() {
  var distanceThreshold = 20;

  for (var i = particles.length - 1; i >= 0; i--) {
    var particle = particles[i];
    particle.position.add(particle.velocity);

    var distance = particle.position.distanceTo(camera.position);
    if (distance > distanceThreshold) {
      removeParticle(particle);
    }
  }
}

function onMouseDown(event) {
  if (controls.isLocked) {
    event.preventDefault();
    // Particle creation is allowed only when controls are locked
    if (event.button === 0) {
      createParticle();
    }
  }
}

function onMouseMove(event) {
  event.preventDefault();

  const sensitivityValue = parseFloat(
    document.getElementById("sensitivitySlider").value
  );
  const sensitivity = sensitivityValue * 1000;

  mouse.x = ((event.clientX / window.innerWidth) * 2 - 1) * sensitivity;
  mouse.y = (-(event.clientY / window.innerHeight) * 2 + 1) * sensitivity;

  raycaster.setFromCamera(mouse, camera);
}

// Add sensitivity slider listener
document
  .getElementById("sensitivitySlider")
  .addEventListener("input", function () {
    const sensitivity = parseFloat(this.value) * 10;
    document.getElementById("sensitivity").textContent = sensitivity.toFixed(2);
  });

// Mouse click event listener
document.addEventListener("mousedown", onMouseDown);
document.addEventListener("mousemove", onMouseMove, false);

// Declare a variable to count collided particles
var collidedParticles = 0;

var hasSphereMoved = false; // Flag to track if the sphere has already been moved

// Check collision between particles and spheres
function checkParticleCollision() {
  for (var j = 0; j < spheres.length; j++) {
    var sphere = spheres[j];
    var isColliding = false;

    if (sphere.visible) {
      for (var i = 0; i < particles.length; i++) {
        var particle = particles[i];
        var particlePosition = particle.position;
        var particleEdge = particlePosition
          .clone()
          .add(particle.velocity.clone().normalize().multiplyScalar(0.1));

        raycaster.set(
          particlePosition,
          particleEdge.sub(particlePosition).normalize()
        );
        var intersects = raycaster.intersectObject(sphere);

        if (intersects.length === 1) {
          // Particle collided with the sphere
          isColliding = true;
          break;
        }
      }
    }

    // sphere collision detection
    if (isColliding) {
      explosion(sphere);
      respawnSphere(sphere);
      hassphereMoved = false; // reset the flag when sphere is hidden
    } else {
      // sphere is green when there is no collision
      sphere.material.color.set(0x00ff00);

      // Check if all particles have been removed and the sphere has not moved
      if (collidedParticles === particles.length && !hassphereMoved) {
        collidedParticles = 0; // Reset the collided particles counter
        hassphereMoved = true; // Set the flag to indicate that the sphere has been moved
      }
    }
  }
}

// Create an explosion of small triangles
function explosion(sphere) {
  playExplosionSound();

  var explosionCount = 50;

  for (var i = 0; i < explosionCount; i++) {
    var triangle = createTriangle(sphere);
    scene.add(triangle);
    triangles.push(triangle); // Add the triangle to the triangles array

    triangle.userData = {
      direction: new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize(),
      speed: Math.random() * 0.05 + 0.01,
      rotationAxis: new THREE.Vector3(
        Math.random(),
        Math.random(),
        Math.random()
      ).normalize(),
      rotationSpeed: Math.random() * 0.1 + 0.005,
      distance: 0, // distance traveled by the triangle
      remove: false, // flag to mark if the triangle should be removed
      parentsphere: sphere, // reference to the collided sphere
    };
  }
}

// Create a small triangle
function createTriangle(sphere) {
  var geometry = new THREE.BufferGeometry();
  var vertices = new Float32Array([-0.1, 0, 0, 0.1, 0, 0, 0, 0.1, 0]);
  var indices = new Uint16Array([0, 1, 2]);

  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  var material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
  });

  var triangle = new THREE.Mesh(geometry, material);

  // Set initial position at the center of the collided sphere
  triangle.position.copy(sphere.position);

  // Set the rotation to face the camera
  triangle.lookAt(camera.position);

  // Set random scale
  var scale = Math.random() * 1 + 0.5; // Adjust the scale range as desired
  triangle.scale.set(scale, scale, scale);

  return triangle;
}

// Update the triangles' positions, rotations, and remove them if necessary
function updateTriangles() {
  for (var i = 0; i < triangles.length; i++) {
    var triangle = triangles[i];
    var userData = triangle.userData;

    // Move the triangle in its direction at a random speed
    var speed = userData.speed;
    triangle.position.add(userData.direction.clone().multiplyScalar(speed));

    // Rotate the triangle around its rotation axis at a random speed
    var rotationSpeed = userData.rotationSpeed;
    triangle.rotateOnWorldAxis(userData.rotationAxis, rotationSpeed);

    // Update the distance traveled by the triangle
    userData.distance += speed;

    // If the triangle has traveled a certain distance, mark it for removal
    if (userData.distance >= 2) {
      userData.remove = true;
    }
  }

  // Remove triangles that are marked for removal
  for (var i = triangles.length - 1; i >= 0; i--) {
    if (triangles[i].userData.remove) {
      scene.remove(triangles[i]);
      triangles.splice(i, 1);
    }
  }

  // Resize renderer when window size changes
  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Create an AudioContext
var audioContext = null;
var musicBuffer = null;
var laserSoundBuffer = null;
var explosionSoundBuffer = null;
var isMusicPlaying = false;
var musicSource = null;

// Function to load audio files
function loadAudioFile(url, callback) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  request.onload = function () {
    audioContext.decodeAudioData(request.response, function (buffer) {
      callback(buffer);
    });
  };

  request.send();
}

// Function to play the laser sound
function playLaserSound() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (!laserSoundBuffer) {
    loadAudioFile("556.mp3", function (buffer) {
      laserSoundBuffer = buffer;
      playSound(buffer, 0.2);
    });
  } else {
    playSound(laserSoundBuffer, 0.2);
  }
}

function playExplosionSound() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (!explosionSoundBuffer) {
    loadAudioFile("tap.wav", function (buffer) {
      explosionSoundBuffer = buffer;
      playSound(buffer, 1.2);
    });
  } else {
    playSound(explosionSoundBuffer, 1.2);
  }
}

// Function to play a sound with a specific volume
function playSound(buffer, volume) {
  var source = audioContext.createBufferSource();
  var gainNode = audioContext.createGain();
  gainNode.gain.value = volume;

  source.buffer = buffer;
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);
  source.start(0);
}
