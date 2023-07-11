'use client'

import { createContext, useContext, useState } from 'react'

const initialRoomArea = [
  {
    x: 0,
    y: 0,
  },
  {
    x: 9,
    y: 0,
  },
  {
    x: 9,
    y: 9,
  },
  {
    x: 0,
    y: 9,
  },
]
const initialItems = [
  {
    image: 'triple',
    x: 0,
    y: 0,
  },
  {
    image: 'oven',
    x: 6,
    y: 0,
  },
  {
    image: 'triple',
    x: 8,
    y: 0,
  },
]

const EditorContext = createContext({ items: initialItems, roomArea: initialRoomArea })

const useEditorContext = () => {
  const ctx = useContext(EditorContext)

  if (!ctx) {
    throw new Error('useEditorContext must be used within a EditorContext')
  }

  return ctx
}

const EditorContextProvider = ({ children }) => {
  const [items, setItems] = useState(initialItems)
  const [roomArea, setRoomArea] = useState(initialRoomArea)

  return <EditorContext.Provider value={{ items, setItems, roomArea, setRoomArea }}>{children}</EditorContext.Provider>
}

export { useEditorContext, EditorContextProvider }
