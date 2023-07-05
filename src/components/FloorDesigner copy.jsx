import React, { useState } from 'react'

const Canvas = () => {
  const initialColors = [
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#00ffff',
    '#ff00ff',
    '#ffa500',
    '#800080',
    '#008000',
    '#000080',
    '#800000',
    '#008080',
    '#ff1493',
    '#f0e68c',
    '#8a2be2',
    '#b22222',
    '#32cd32',
    '#00ced1',
    '#ffc0cb',
    '#ff8c00',
    '#d2691e',
    '#4682b4',
    '#9acd32',
    '#00ff7f',
    '#f08080',
    '#ba55d3',
    '#7fff00',
    '#40e0d0',
    '#d2b48c',
    '#90ee90',
    '#cd5c5c',
    '#9932cc',
    '#7cfc00',
    '#48d1cc',
    '#f4a460',
    '#3cb371',
  ]
  const [gridColors, setGridColors] = useState(initialColors)

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetIndex) => {
    const sourceIndex = e.dataTransfer.getData('text/plain')
    const updatedColors = [...gridColors]
    const temp = updatedColors[targetIndex]
    updatedColors[targetIndex] = updatedColors[sourceIndex]
    updatedColors[sourceIndex] = temp
    setGridColors(updatedColors)
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 100px)',
        gridTemplateRows: 'repeat(8, 100px)',
        gap: '2px',
        width: '600px',
        height: '600px',
        padding: '10px',
      }}
    >
      {gridColors.map((color, index) => (
        <div
          key={index}
          style={{
            backgroundColor: color,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '24px',
            color: '#ffffff',
            cursor: 'grab',
            userSelect: 'none',
          }}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
        >
          {index}
        </div>
      ))}
    </div>
  )
}

export default Canvas
