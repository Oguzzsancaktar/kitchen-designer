import React from 'react'
import { useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { canvasDivisions, canvasSize, windowHeight, windowWidth } from '../constants/sizes'
import { useEditorContext } from '../context/editorContext'

const modelIncreaseScaleRatio = 100 / 55
function RoomDesigner() {
  const { items, roomArea } = useEditorContext()

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

    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture

    const ambientLight = new THREE.AmbientLight(0x000000, 1)
    scene.add(ambientLight)

    var light = new THREE.PointLight(0x000000, 1)
    light.position.set(0, 1, 0) // Işık pozisyonunu ayarlayın
    scene.add(light) // Işığı sahneye ekleyin

    const directionalLight = new THREE.DirectionalLight(0x000000, 1)
    directionalLight.position.set(1, 1, 1).normalize()
    scene.add(directionalLight)

    const gridHelper = new THREE.GridHelper(canvasSize, canvasDivisions)
    // scene.add(gridHelper)

    camera.position.set(10, 15, 15)
    camera.lookAt(0, 0, 0)

    return { controls, camera, renderer, scene }
  }

  const createRoom = () => {
    const scene = sceneRef.current

    const roomPoints = []

    roomArea.forEach((point) => {
      return roomPoints.push(new THREE.Vector2(point.x, point.y))
    })

    const texture = new THREE.TextureLoader().load('/src/assets/textures/wood.jpeg', function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.offset.set(0, 0)
      texture.repeat.set(2, 2)
    })

    const texture2 = new THREE.TextureLoader().load('/src/assets/textures/old-cement-wall-texture.jpg', function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.offset.set(0, 0)
      texture.repeat.set(2, 2)
    })

    const texture3 = new THREE.TextureLoader().load('/src/assets/textures/wall-texture.jpg', function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.offset.set(0, 0)
      texture.repeat.set(2, 2)
    })

    const shape = new THREE.Shape(roomPoints)
    const extrudeSettings = {
      steps: 0,
      depth: -6,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 1,
    }

    var material1 = new THREE.MeshBasicMaterial({ color: '0xf2f200', map: texture }) // Kırmızı
    var material2 = new THREE.MeshBasicMaterial({ color: '0xff2200', map: texture2 }) // Yeşil
    var material3 = new THREE.MeshBasicMaterial({ color: '0xdddddd', map: texture3 }) // Mavi

    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)

    // Yüzleri farklı malzemelerle oluşturun
    var mesh = new THREE.Mesh(geometry, [material3, material2])

    // const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(0, 0, 0)
    mesh.rotation.set(Math.PI / 2, 0, 0)

    const boundingBox = new THREE.Box3().setFromObject(mesh)
    const size = new THREE.Vector3()
    boundingBox.getSize(size)

    // const scale = 2.779778961742946 / size.x
    mesh.scale.set(1, 1, 1)
    scene.add(mesh)
  }

  const loadModel = async () => {
    const loader = new GLTFLoader().setPath('/src/assets/gltf/blue/')

    const stufs = []

    const smallestPoint = roomArea.reduce((acc, point) => {
      if (point.x <= acc.x && point.y <= acc.y) {
        return point
      }
      return acc
    }, roomArea[0])

    let endOfLast = smallestPoint.x

    const sortedArr = items.sort((a, b) => a.x - b.x)

    for (let index = 0; index < sortedArr.length; index++) {
      const m = items[index]

      if (m.image === 'oven' || m.image === 'default') {
        const gltfTop = await loader.loadAsync(`${m.image}_top.gltf`)
        const gltfBottom = await loader.loadAsync(`${m.image}_bottom.gltf`)

        const modelTop = gltfTop.scene
        const modelBottom = gltfBottom.scene

        if (stufs.length > 0) {
          const pre = stufs[index - 1]
          const boundingBox = new THREE.Box3().setFromObject(pre)
          const size = new THREE.Vector3()
          boundingBox.getSize(size)

          endOfLast += size.x

          modelTop.position.setX(endOfLast)
          modelBottom.position.setX(endOfLast)
        } else {
          modelTop.position.setX(0)
          modelBottom.position.setX(0)
        }

        // stufs.push(modelBottom)
        stufs.push(modelTop)

        modelTop.scale.set(modelIncreaseScaleRatio, modelIncreaseScaleRatio, modelIncreaseScaleRatio)
        modelBottom.scale.set(modelIncreaseScaleRatio, modelIncreaseScaleRatio, modelIncreaseScaleRatio)
        sceneRef.current.add(modelTop)
        sceneRef.current.add(modelBottom)
      } else {
        const gltf = await loader.loadAsync(`${m.image}.gltf`)
        const model = gltf.scene

        if (stufs.length > 0) {
          const pre = stufs[index - 1]
          const boundingBox = new THREE.Box3().setFromObject(pre)
          const size = new THREE.Vector3()
          boundingBox.getSize(size)

          endOfLast += size.x

          model.position.set(endOfLast, 0, 0)
        } else {
          model.position.set(0, 0, 0)
        }

        model.scale.set(modelIncreaseScaleRatio, modelIncreaseScaleRatio, modelIncreaseScaleRatio)
        stufs.push(model)
        sceneRef.current.add(model)
      }
    }
  }

  useEffect(() => {
    const { camera, renderer, scene } = init()

    cameraRef.current = camera
    rendererRef.current = renderer
    sceneRef.current = scene

    loadModel()
    createRoom()

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

export default RoomDesigner
