import React from 'react'
import { useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { canvasDivisions, canvasSize, windowHeight, windowWidth } from '../constants/sizes'
import { DragControls } from 'three/addons/controls/DragControls.js'
const initialColor = 0xf2ff56 // Set the desired initial color here

function FloorDesigner() {
  const init = () => {
    const camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(windowWidth, windowHeight)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xbfe3dd)

    const controls = new OrbitControls(camera, renderer.domElement)

    controls.target.set(0, 0.5, 0)
    controls.update()
    controls.enablePan = false
    controls.enableDamping = true
    controls.enabled = false

    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture

    const ambientLight = new THREE.AmbientLight(0x404040, 3)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(1, 1, 1).normalize()
    scene.add(directionalLight)

    const gridHelper = new THREE.GridHelper(canvasSize, canvasDivisions)

    gridHelper.material.color.set(initialColor)

    scene.add(gridHelper)

    camera.position.set(0, 10, 0)
    camera.lookAt(0, 0, 0)

    return { controls, camera, renderer, scene, gridHelper }
  }

  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  function onMouseMove(event, { camera, gridHelper }) {
    // Calculate the mouse coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera)

    // Perform raycasting
    const intersects = raycaster.intersectObject(gridHelper)

    console.log(intersects)
    // Check if the grid is being hovered over
    if (intersects.length > 0) {
      // Change the color of the grid when hovered
      const hoverColor = 0xff0000 // Set the desired hover color here
      gridHelper.material.color.set(hoverColor)
    } else {
      // Reset the color when not hovered
      gridHelper.material.color.set(initialColor)
    }
  }

  const createPlane = ({ scene, camera, renderer }) => {
    const geometry = new THREE.PlaneGeometry(1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide })
    const plane = new THREE.Mesh(geometry, material)

    const dragControls = new DragControls([plane], camera, renderer.domElement)

    dragControls.addEventListener('dragstart', function (event) {
      // event.object.material.emissive.set(0xdd0000)
    })

    dragControls.addEventListener('dragend', function (event) {
      // event.object.material.emissive.set(0x000000)
      plane.position.y = 0.001
      plane.position.x = event.object.position.x
    })

    plane.rotation.x = Math.PI / 2
    scene.add(plane)
  }

  useEffect(() => {
    const { camera, renderer, scene, gridHelper } = init()

    createPlane({ scene, camera, renderer })

    window.addEventListener('mousemove', (event) => onMouseMove(event, { camera, gridHelper }))

    function animate() {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

    animate()
    document.querySelector('#room-designer-container').appendChild(renderer.domElement)

    return () => {
      document.querySelector('#room-designer-container')?.removeChild(renderer.domElement)
    }
  }, [])

  return <div id="room-designer-container" />
}

export default FloorDesigner
