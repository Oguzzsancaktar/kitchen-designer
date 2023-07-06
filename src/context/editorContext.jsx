'use client'

import { createContext, useContext, useState } from 'react'

const initialImages = [
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
]

const EditorContext = createContext(initialImages)

const useEditorContext = () => {
  const ctx = useContext(EditorContext)

  if (!ctx) {
    throw new Error('useEditorContext must be used within a EditorContext')
  }

  return ctx
}

const EditorContextProvider = ({ children }) => {
  const [images, setImages] = useState(initialImages)

  return <EditorContext.Provider value={{ images, setImages }}>{children}</EditorContext.Provider>
}

export { useEditorContext, EditorContextProvider }
