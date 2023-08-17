import * as THREE from 'three';

// creation d'une scene
const scene = new THREE.Scene()

//size (canvas)
const sizes = {
	width: 800,
	height: 600
}

// creation d'un mesh (shape and material)

// Blue Sphere (default values)
const ball = new THREE.SphereGeometry(1, 32, 16)
const ballMaterial = new THREE.MeshBasicMaterial({color: 'white'})
const ballMesh = new THREE.Mesh(ball, ballMaterial)
scene.add(ballMesh)

// White paddle left
const paddleUser = new THREE.BoxGeometry(1, 10, 2)
const paddleUserMaterial = new THREE.MeshBasicMaterial({color: 'white'})
const paddleUserMesh = new THREE.Mesh(paddleUser, paddleUserMaterial)
scene.add(paddleUserMesh)
paddleUserMesh.position.set(-40, 0, 0)

// White paddle right
const paddleComp = new THREE.BoxGeometry(1, 10, 2)
const paddleCompMaterial = new THREE.MeshBasicMaterial({color: 'white'})
const paddleCompMesh = new THREE.Mesh(paddleComp, paddleCompMaterial)
scene.add(paddleCompMesh)
paddleCompMesh.position.set(40, 0, 0)


// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 45
scene.add(camera)

//rendering engine
const canvas = document.querySelector('canvas.webgl')
const renderer = new THREE.WebGLRenderer({
	canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
// renderer.setSize(window.width, window.height)

renderer.render(scene, camera)