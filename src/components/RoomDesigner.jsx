import React from 'react'
import { useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { DragControls } from 'three/addons/controls/DragControls.js'

const size = 18
const divisions = 10
const windowWidth = window.innerWidth
const windowHeight = window.innerHeight

function RoomDesigner() {
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

    const gridHelper = new THREE.GridHelper(size, divisions)
    scene.add(gridHelper)

    camera.position.set(0, 0, 10)
    camera.lookAt(0, 0, 0)

    return { controls, camera, renderer, scene }
  }

  const loadModel = ({ scene, camera, renderer, controls }) => {
    const loader = new GLTFLoader().setPath('/src/assets/gltf/')
    const stufs = []

    loader.load(
      'c_triple.gltf',
      function (gltf) {
        const model = gltf.scene
        const boundingBox = new THREE.Box3().setFromObject(model)

        const size = new THREE.Vector3()
        boundingBox.getSize(size)

        console.log('size', size)

        model.position.set(0, 0, 0)
        stufs.push(model)

        const clonedModel = model.clone()
        clonedModel.position.set(size.x, 0, 0) // Kopyanın pozisyonunu ayarla
        scene.add(clonedModel)

        scene.add(model)
      },
      undefined,
      function (error) {
        console.error(error)
      }
    )

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
    const { controls, camera, renderer, scene } = init()

    loadModel({ scene, camera, renderer, controls })

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
