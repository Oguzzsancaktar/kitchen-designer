import { useState } from 'react'
import RoomDesigner from './components/RoomDesigner'
import FloorDesigner from './components/FloorDesigner'
import { EditorContextProvider } from './context/editorContext'

function App() {
  const [is2D, setIs2D] = useState(true)

  return (
    <EditorContextProvider>
      <main style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
        <button style={{ height: '50px' }} onClick={() => setIs2D((prev) => !prev)}>
          {is2D ? '2D' : '3D'}
        </button>
        {is2D ? <FloorDesigner /> : <RoomDesigner />}
      </main>
    </EditorContextProvider>
  )
}

export default App
