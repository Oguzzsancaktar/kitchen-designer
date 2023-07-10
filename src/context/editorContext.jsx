'use client'

import { createContext, useContext, useState } from 'react'

const initialRoomArea = [
  {
    x: 0,
    y: 0,
  },
  {
    x: 6,
    y: 0,
  },
  {
    x: 6,
    y: 6,
  },
  {
    x: 0,
    y: 6,
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
    x: 1,
    y: 0,
  },
  {
    image: 'default',
    x: 2,
    y: 0,
  },
  {
    image: 'default',
    x: 3,
    y: 0,
  },
  {
    image: 'triple',
    x: 4,
    y: 0,
  },
  {
    image: 'default',
    x: 5,
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
