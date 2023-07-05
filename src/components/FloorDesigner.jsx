import React from 'react'
import { useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { canvasDivisions, canvasSize, windowHeight, windowWidth } from '../constants/sizes'
import { DragControls } from 'three/addons/controls/DragControls.js'
const initialColor = 0xf2ff56 // Set the desired initial color here

function FloorDesigner() {
  const images = [
    {
      image: 'triple',
      x: 0,
      y: 0,
    },
    {
      image: 'oven',
      x: 1,
      y: 0,
    },
  ]

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

    gridHelper.addEventListener('click', function (event) {
      console.log(event)
      gridHelper.material.color.set(0xff0000)
    })

    scene.add(gridHelper)

    camera.position.set(0, 10, 0)
    camera.lookAt(0, 0, 0)

    return { controls, camera, renderer, scene, gridHelper }
  }

  const createPlane = ({ scene, camera, renderer, image }) => {
    const geometry = new THREE.PlaneGeometry(1, 1)
    // create random color
    const color = Math.random() * 0xffffff

    const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide })
    const plane = new THREE.Mesh(geometry, material)

    plane.position.x = 0.5 + image.x
    plane.position.z = 0.5

    const dragControls = new DragControls([plane], camera, renderer.domElement)

    dragControls.addEventListener('dragstart', function (event) {
      plane.position.y = 20
    })

    dragControls.addEventListener('dragend', function (event) {
      const objectWidth = event.object.geometry.parameters.width
      const objectHeight = event.object.geometry.parameters.height

      const ePosX = event.object.position.x
      const ePosZ = event.object.position.z

      console.log('ePosX: ', ePosX)

      let xMultiplier = 1
      let zMultiplier = 1

      if (ePosX < Math.round(ePosX)) {
        xMultiplier = -1
      }

      if (ePosZ < Math.round(ePosZ)) {
        zMultiplier = -1
      }

      plane.position.x = Math.round(event.object.position.x / (canvasSize / canvasDivisions)) * (canvasSize / canvasDivisions) + xMultiplier * (objectWidth / 2)

      plane.position.z = Math.round(event.object.position.z / (canvasSize / canvasDivisions)) * (canvasSize / canvasDivisions) + zMultiplier * (objectHeight / 2)
    })

    plane.rotation.x = Math.PI / 2
    scene.add(plane)
  }

  useEffect(() => {
    const { camera, renderer, scene, gridHelper } = init()

    for (let index = 0; index < images.length; index++) {
      const image = images[index]
      createPlane({ scene, camera, renderer, image })
    }

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
