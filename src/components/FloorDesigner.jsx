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
  const { items, setItems, roomArea, setRoomArea } = useEditorContext()

  const cameraRef = React.useRef()
  const rendererRef = React.useRef()
  const sceneRef = React.useRef()

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

  const drawDots = () => {
    roomArea.forEach((item) => {
      const geometry = new THREE.SphereGeometry(0.05, 32, 32)
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
      const sphere = new THREE.Mesh(geometry, material)

      sphere.position.x = item.x
      sphere.position.z = item.y
      sphere.position.y = 0.05

      const dragControls = new DragControls([sphere], cameraRef.current, rendererRef.current.domElement)

      dragControls.addEventListener('dragend', function (event) {
        const x = Math.round(event.object.position.x / (canvasSize / canvasDivisions)) * (canvasSize / canvasDivisions)
        const z = Math.round(event.object.position.z / (canvasSize / canvasDivisions)) * (canvasSize / canvasDivisions)

        sphere.position.x = x
        sphere.position.z = z

        setRoomArea((prev) => {
          const index = prev.findIndex((i) => i.x === item.x && i.y === item.y)
          const newItems = [...prev]
          newItems[index].x = x
          newItems[index].y = z
          return newItems
        })

        sphere.position.y = 0.05
      })

      sceneRef.current.add(sphere)
    })
  }

  const drawRoomArea = () => {
    sceneRef.current.children.forEach((item) => {
      if (item.type === 'Line') {
        sceneRef.current.remove(item)
      }
    })

    const material = new THREE.LineBasicMaterial({ color: 0x0000ff })
    const points = []
    const roomAreaForLines = [...roomArea, roomArea[0]]
    roomAreaForLines.forEach((item) => {
      points.push(new THREE.Vector3(item.x, 0.05, item.y))
    })
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(geometry, material)
    sceneRef.current.add(line)
  }

  const createPlane = (item) => {
    const geometry = new THREE.PlaneGeometry(1, 1)
    const texture = new THREE.TextureLoader().load(`src/assets/textures/${item.image}.jpg`)
    texture.colorSpace = THREE.SRGBColorSpace

    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    const plane = new THREE.Mesh(geometry, material)

    plane.position.x = 0.5 + item.x
    plane.position.z = 0.5

    const dragControls = new DragControls([plane], cameraRef.current, rendererRef.current.domElement)

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
    sceneRef.current.add(plane)
  }

  useEffect(() => {
    if (roomArea.length > 0 && rendererRef.current && sceneRef.current && cameraRef.current) {
      drawDots()
      drawRoomArea()
    }
  }, [roomArea])

  useEffect(() => {
    const { camera, renderer, scene } = init()

    cameraRef.current = camera
    rendererRef.current = renderer
    sceneRef.current = scene

    drawDots()
    drawRoomArea()
    for (let index = 0; index < items.length; index++) {
      const item = items[index]
      createPlane(item)
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
