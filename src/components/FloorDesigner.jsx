import React from 'react'
import { useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { canvasDivisions, canvasSize, windowHeight, windowWidth } from '../constants/sizes'
import { DragControls } from 'three/addons/controls/DragControls.js'
import { useEditorContext } from '../context/editorContext'
const initialColor = 0xf2ff56 // Set the desired initial color here

function FloorDesigner() {
  const { items, setItems, roomArea } = useEditorContext()

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

  const drawDots = ({ scene }) => {
    roomArea.forEach((item) => {
      const circleShape = new THREE.Shape()
      circleShape.moveTo(-10, 0)
      circleShape.absarc(item.x, item.y, 0.1, 0, Math.PI * 2, false)

      const geometry = new THREE.ShapeGeometry(circleShape)
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      const circle = new THREE.Mesh(geometry, material)

      scene.add(circle)

      const geometry2 = new THREE.CircleGeometry(0.1, 32)
      const material2 = new THREE.MeshBasicMaterial({ color: 0xffff00 })
      const circle2 = new THREE.Mesh(geometry2, material2)

      circle2.position.x = item.x
      circle2.position.z = item.y

      scene.add(circle2)
    })
  }

  const drawAreaRect = ({ scene }) => {
    const geometry = new THREE.PlaneGeometry(1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
    const plane = new THREE.Mesh(geometry, material)

    plane.position.x = 0.5
    plane.position.z = 0.5
    plane.position.y = 0.01

    scene.add(plane)
  }

  const createPlane = ({ scene, camera, renderer, item }) => {
    const geometry = new THREE.PlaneGeometry(1, 1)
    // create random color

    const texture = new THREE.TextureLoader().load(`src/assets/textures/${item.image}.jpg`)
    texture.colorSpace = THREE.SRGBColorSpace

    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    const plane = new THREE.Mesh(geometry, material)

    plane.position.x = 0.5 + item.x
    plane.position.z = 0.5

    const dragControls = new DragControls([plane], camera, renderer.domElement)

    dragControls.addEventListener('dragstart', function () {
      plane.position.y = 0.1
    })

    dragControls.addEventListener('drag', function () {
      plane.position.y = 0.1
    })

    dragControls.addEventListener('dragend', function (event) {
      const objectWidth = event.object.geometry.parameters.width
      const objectHeight = event.object.geometry.parameters.height

      const ePosX = event.object.position.x
      const ePosZ = event.object.position.z

      let xMultiplier = 1
      let zMultiplier = 1

      if (ePosX < Math.round(ePosX)) {
        xMultiplier = -1
      }

      if (ePosZ < Math.round(ePosZ)) {
        zMultiplier = -1
      }

      const x = Math.round(event.object.position.x / (canvasSize / canvasDivisions)) * (canvasSize / canvasDivisions)
      const z = Math.round(event.object.position.z / (canvasSize / canvasDivisions)) * (canvasSize / canvasDivisions)

      plane.position.x = x + xMultiplier * (objectWidth / 2)
      plane.position.z = z + zMultiplier * (objectHeight / 2)

      setItems((prev) => {
        const index = prev.findIndex((i) => i.image === item.image)
        const newItems = [...prev]
        newItems[index].x = x
        newItems[index].y = z
        return newItems
      })
      plane.position.y = 0.05
    })

    plane.rotation.x = Math.PI / 2
    scene.add(plane)
  }

  useEffect(() => {
    const { camera, renderer, scene } = init()

    drawAreaRect({ scene })
    drawDots({ scene })
    for (let index = 0; index < items.length; index++) {
      const item = items[index]
      createPlane({ scene, camera, renderer, item })
    }

    function animate() {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

    animate()
    document.querySelector('#floor-designer-container').appendChild(renderer.domElement)

    return () => {
      console.log("document.querySelector('#floor-designer-container')", document.querySelector('#floor-designer-container'))
      document.querySelector('#floor-designer-container')?.removeChild(renderer.domElement)
    }
  }, [])

  return <div id="floor-designer-container" />
}

export default FloorDesigner
