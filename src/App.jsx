import { useState } from 'react'
import RoomDesigner from './components/RoomDesigner'
import FloorDesigner from './components/FloorDesigner'

function App() {
  const [is2D, setIs2D] = useState(true)

  return (
    <>
      <button onClick={() => setIs2D((prev) => !prev)}>{is2D ? '2D' : '3D'}</button>
      {is2D ? <FloorDesigner /> : <RoomDesigner />}
    </>
  )
}

export default App
