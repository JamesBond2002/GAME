import { LoadingManager } from '../three.js-dev/build/three.module.js';
import {MTLLoader} from '../three.js-dev/examples/jsm/loaders/MTLLoader.js';
import {OBJLoader} from '../three.js-dev/examples/jsm/loaders/OBJLoader.js';

let scene, camera, renderer, cube, aLight, light, floor;

let LOADED = false;
let LOADING_MANAGER = null;
let DIFFICULTY = 1;

let meshes = {

};
let player = {
  height: 1,
  move: {
    forward: false,
    backward: false,
    left: false,
    right: false
  },
  direction: {
    x: 0,
    y: 1,
    z: 0
  },
  speed: 0.04
}
let cameraMove = {
  left: false, 
  right: false,
  up: false,
  down: false
};
let models = {
  gun: {
    obj: 'models/blasterE.obj', 
    mtl: 'models/blasterE.mtl',
    mesh: null
  }
};
let loadingScreen = {
  scene: new THREE.Scene,
  camera: new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, .1, 100),
  box: new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .5), 
       new THREE.MeshPhongMaterial({color: 0x4444ff}))
};
let circles = [];
let bullets = [];
let mousePos = {
  x: 0, y:0
};

let min = (a, b) => {
  if(a > b)
    return b;
  return a;
};

let max = (a, b) => {
  if(a > b)
    return a;
  return b;
};

scene = new THREE.Scene;
camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

let loadingManager = new THREE.LoadingManager();

loadingManager.onProgress = (item, loaded, total) => {
  console.log(item, loaded, total);
};

loadingManager.onLoad = () => {
  console.log('loaded');
  LOADED = true;
  loadModels();
};

loadingScreen.box.position.set(0, 0, 5);
loadingScreen.camera.lookAt(loadingScreen.box.position);
loadingScreen.scene.add(loadingScreen.box);

let loadModels = () => {
  meshes.gun = models.gun.mesh.clone();
  meshes.gun.position.set(0.8, 0.6, 4.5);
  scene.add(meshes.gun);
}

// cube = new THREE.Mesh(
//   new THREE.BoxGeometry(1, 1, 1),
//   new THREE.MeshPhongMaterial({color: 0xffffff, wireframe: false})
// );
// cube.recieveShadow = true;
// cube.castShadow = true;

// scene.add(cube);

floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50, 10, 10),
  new THREE.MeshPhongMaterial({color: 0xffffff, wireframe: false})
);
scene.add(floor);
floor.rotation.x -= Math.PI/2;
floor.recieveShadow = true;

let wall = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 10, 10),
  new THREE.MeshPhongMaterial({color: 0x00ff00, wireframe: false})
);
scene.add(wall);
wall.rotation.x += Math.PI;

setInterval(() => {
  let x = Math.random()*8 - 4, y = Math.random()*4 + 1;
  if(circles.length < 25) {
    let circle = new THREE.Mesh(new THREE.CircleGeometry(0.25, 50),
    new THREE.MeshPhongMaterial({color: 0x000000, wireframe:false}));
    circle.position.set(x, y, 0);
    circle.rotation.x += Math.PI;
    scene.add(circle);
    circles.push(circle);
  }
}, DIFFICULTY*1000);

let mtlLoader = new MTLLoader(loadingManager);
mtlLoader.load('models/blasterE.mtl', (materials) => {
  materials.preload();
  var objLoader = new OBJLoader(loadingManager);
  objLoader.setMaterials(materials);
  
  objLoader.load('models/blasterE.obj', (mesh) => {
    mesh.traverse((node) => {
      if(node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.recieveShadow = true;
      }
    });

    scene.add(mesh);
    mesh.position.set(0.3, 0.6, 4.5);
  });
});

for(let _key in models) {
  ((key) => {
    let mtlLoader = new MTLLoader();
    mtlLoader.load(models[key].mtl, (materials) => {
      materials.preload();
      let objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        
      objLoader.load(models[key].obj, (mesh) => {
        mesh.traverse((node) => {
          if(node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.recieveShadow = true;
          }
        });
        models[key].mesh = mesh;

      });
    });
  })(_key);
};

document.addEventListener('mousemove', (e) => {
  mousePos.x = -(e.clientX / window.innerWidth) * 2 + 1;
  mousePos.y = -(e.clientY / window.innerHeight) *2 + 1;
});

camera.position.z = -5;
camera.position.y = player.height;

camera.lookAt(new THREE.Vector3(player.direction.x, player.direction.y, player.direction.z));

light = new THREE.PointLight(0xffffff, .8, 18);
light.position.x = -3;
light.position.y = 6;
light.position.z = -3;
light.castShadow = true;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 25;
scene.add(light);

aLight = new THREE.AmbientLight(0xffffff, .2);
scene.add(aLight);

renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;
  
    camera.updateProjectionMatrix();
});

// window.addEventListener('mousemove', e => {
//   cameraMove.y = e.movementY;
//   cameraMove.x = e.movementX;
//   cameraMove.tmpX = cameraMove.x;
//   cameraMove.tmpY = cameraMove.y;
// });

window.addEventListener('keydown', e => {
  if(e.key == 'w')
    player.move.forward = true;
  if(e.key == 'a')
    player.move.left = true;
  if(e.key == 's')
    player.move.backward = true;
  if(e.key == 'd')
    player.move.right = true;
  if(e.key == 'ArrowLeft')
    cameraMove.left = true;
  if(e.key == 'ArrowRight')    
    cameraMove.right = true;
  if(e.key == 'ArrowUp')
    cameraMove.up = true;
  if(e.key == 'ArrowDown')
    cameraMove.down = true;    
  console.log(cameraMove, e.key);
});

window.addEventListener('keyup', e => {
  if(e.key == 'w')
    player.move.forward = false;
  if(e.key == 'a')
    player.move.left = false;
  if(e.key == 's')
    player.move.backward = false;
  if(e.key == 'd')
    player.move.right = false;
  if(e.key == 'ArrowLeft')
    cameraMove.left = false;
  if(e.key == 'ArrowRight')    
    cameraMove.right = false;
  if(e.key == 'ArrowUp')
    cameraMove.up = false;
  if(e.key == 'ArrowDown')
    cameraMove.down = false;  
    // console.log(cameraMove, e.key);
});

window.addEventListener('click', () => {
  let bullet = new THREE.Mesh(
    new THREE.SphereGeometry(.05, 8, 8), 
    new THREE.MeshPhongMaterial({color: 0xffffff})
  );
  console.log(camera.rotation.y);
  bullet.velocity = new THREE.Vector3(
    -Math.sin(camera.rotation.y), 0,
    Math.cos(camera.rotation.y)
  )

  bullet.position.set(meshes.gun.position.x, meshes.gun.position.y+0.1, meshes.gun.position.z);

  scene.add(bullet);
  bullet.alive = true;
  bullets.push(bullet);
  setTimeout(() => {
    bullet.alive = false;
    scene.remove(bullet);
  }, 1000);
  for(let j = 0; j<circles.length; j++)
     {
       let circle = circles[j];
       console.log(mousePos.x, mousePos.y, circle.position.x)
       if(mousePos.x >= circle.position.x-0.25 &&
        mousePos.x <= circle.position.x + 0.25 && 
        mousePos.y >= circle.position.y - 0.25 &&
        mousePos.y <= circle.position.y + 0.25){
        scene.remove(circle);
        circles.splice(j, 1);
        }
     };
});

let render = () => {
  if(!LOADED) {
    requestAnimationFrame(render);
    renderer.render(loadingScreen.scene, loadingScreen.camera);
    return;
  }

  requestAnimationFrame(render);

  for(let i = 0; i<bullets.length; i++)
   {
     if(bullets[i] == undefined)
     continue;
     if(bullets[i].position.z == wall.position.z)
     bullets[i].alive = false;
     if(bullets[i].alive == false)
     {
       bullets.splice(i, 1);
       continue;
     }
     for(let j = 0; j<circles.length; j++)
     {
       let circle = circles[j];
       if(bullets[i].position.x >= circle.position.x-0.25 &&
        bullets[i].position.x <= circle.position.x + 0.25 && 
        bullets[i].position.y >= circle.position.y - 0.25 &&
        bullets[i].position.y <= circle.position.y + 0.25){
        scene.remove(circle);
        circles.splice(j, 1);
        }
     };
     bullets[i].position.add(bullets[i].velocity);
   }

  // if(cameraMove.y > 0) {
  //   // camera.rotation.x -= 0.00075*min(25, cameraMove.y);
  //   player.direction.y -= cameraMove.tmpY/cameraMove.time;
  //   camera.lookAt(new THREE.Vector3(player.direction.x, player.direction.y, player.direction.z));
  //   cameraMove.y--;
  // }
  // if(cameraMove.y < 0) {
  //   //camera.rotation.x -= 0.00075*max(-25, cameraMove.y);
  //   player.direction.y -= cameraMove.tmpY/cameraMove.time;
  //   camera.lookAt(new THREE.Vector3(player.direction.x, player.direction.y, player.direction.z));
  //   cameraMove.y++;
  // }

  // if(cameraMove.x > 0) {
  //   //camera.rotation.y -= 0.00075*min(100, cameraMove.x);
  //   player.direction.x += cameraMove.tmpX/cameraMove.time;
  //   camera.lookAt(new THREE.Vector3(player.direction.x, player.direction.y, player.direction.z));
  //   cameraMove.x--;
  // }
  // if(cameraMove.x < 0) {
  //   //camera.rotation.y -= 0.00075*max(-100, cameraMove.x);
  //   player.direction.x += cameraMove.tmpX/cameraMove.time;
  //   camera.lookAt(new THREE.Vector3(player.direction.x, player.direction.y, player.direction.z));
  //   cameraMove.x++;
  // }

  if(player.move.forward) {
    camera.position.x = min(5, max(camera.position.x - Math.sin(camera.rotation.y) * player.speed, -5));
    camera.position.z = min(camera.position.z + Math.cos(camera.rotation.y) * player.speed, -0.5);
  }
  if(player.move.left) {
    camera.position.x = min(5, max(camera.position.x + Math.sin(camera.rotation.y + Math.PI/2) * player.speed, -5));
    camera.position.z = min(camera.position.z + Math.cos(camera.rotation.y + Math.PI/2) * player.speed, -0.5);
  }
  if(player.move.backward) {
    camera.position.x = min(5, max(camera.position.x + Math.sin(camera.rotation.y) * player.speed, -5));
    camera.position.z = max(camera.position.z - Math.cos(camera.rotation.y) * player.speed, -10);
  }
  if(player.move.right) {
    camera.position.x = min(5, max(camera.position.x + Math.sin(camera.rotation.y - Math.PI/2) * player.speed, -5));
    camera.position.z = max(camera.position.z - Math.cos(camera.rotation.y - Math.PI/2) * player.speed, -10);
  }

  if(cameraMove.left)
  {
    camera.rotation.y -= Math.PI * 0.01;
  }
  if(cameraMove.right)
    camera.rotation.y += Math.PI * 0.01;
  if(cameraMove.up)
    camera.rotation.x -= Math.PI * 0.01;
  if(cameraMove.down)
    camera.rotation.x += Math.PI * 0.01;  

  meshes.gun.position.set(camera.position.x - Math.sin(camera.rotation.y + Math.PI/5.5) * 0.4, 
  camera.position.y - 0.3, camera.position.z + Math.cos(camera.rotation.y + Math.PI/5.5) * .4);

  meshes.gun.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z);

  renderer.render(scene, camera);
};

render();
