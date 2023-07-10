import React from 'react'
import { useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { canvasDivisions, canvasSize, windowHeight, windowWidth } from '../constants/sizes'
import { useEditorContext } from '../context/editorContext'

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

    const ambientLight = new THREE.AmbientLight(0x404040, 3)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(1, 1, 1).normalize()
    scene.add(directionalLight)

    const gridHelper = new THREE.GridHelper(canvasSize, canvasDivisions)
    scene.add(gridHelper)

    camera.position.set(0, 2, 10)
    camera.lookAt(0, 0, 0)

    return { controls, camera, renderer, scene }
  }

  const createRoom = () => {
    const scene = sceneRef.current

    // Create room wall and floor with points from roomArea
    const roomPoints = []
    roomArea.forEach((point) => {
      roomPoints.push(new THREE.Vector2(point.x, point.y))
    })
    const shape = new THREE.Shape(roomPoints)
    const extrudeSettings = {
      steps: 0,
      depth: -3,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 1,
    }
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    const material = new THREE.MeshPhongMaterial({ color: 0x755c00 })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(0, 0, 0)
    mesh.rotation.set(Math.PI / 2, 0, 0)
    mesh.scale.set(1, 1, 1)
    scene.add(mesh)
  }

  // const loadTexture = ({ scene }) => {
  //   console.log('scene', scene)
  //   const loader = new THREE.TextureLoader().setPath('/src/assets/')
  //   loader.load(
  //     'texture.jpg',
  //     function (texture) {
  //       const mat = new THREE.MeshBasicMaterial({
  //         map: texture,
  //       })

  //       loadModel({ scene, mat })
  //     },
  //     undefined,

  //     function (err) {
  //       console.error('An error happened.')
  //     }
  //   )
  // }

  const loadModel = async () => {
    const loader = new GLTFLoader().setPath('/src/assets/gltf/')

    const stufs = []
    // 'c_bottom', 'c_ovenTop', 'c_top',
    let endOfLast = 0

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

        stufs.push(modelBottom)
        stufs.push(modelTop)

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

        stufs.push(model)
        sceneRef.current.add(model)
      }
    }

    // await loader.load(
    //   'c_triple.gltf',
    //   function (gltf) {
    //     const model = gltf.scene
    //     const boundingBox = new THREE.Box3().setFromObject(model)

    //     // model.traverse((o) => {
    //     //   if (o.isMesh) o.material = mat
    //     // })

    //     const size = new THREE.Vector3()
    //     boundingBox.getSize(size)

    //     model.position.set(0, 0, 0)

    //     stufs.push(model)

    //     // const clonedModel = model.clone()
    //     // clonedModel.position.set(size.x, 0, 0)
    //     // scene.add(clonedModel)

    //     scene.add(model)
    //   },
    //   undefined,
    //   function (error) {
    //     console.error(error)
    //   }
    // )

    // console.log('stufs', stufs)

    // const dragControls = new DragControls([...stufs], camera, renderer.domElement)

    // dragControls.addEventListener('dragstart', function (event) {
    //   console.log(1111)
    //   controls.enabled = false
    //   // event.object.material.emissive.set(0xdd0000)
    // })

    // dragControls.addEventListener('dragend', function (event) {
    //   // event.object.material.emissive.set(0x000000)
    //   controls.enabled = true
    // })
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
