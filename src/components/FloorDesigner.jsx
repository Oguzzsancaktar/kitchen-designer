import React, { useEffect, useRef, useState } from 'react'

function FloorDesigner() {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [gridSize, setGridSize] = useState(20)
  const [shapes, setShapes] = useState([])
  const [hoveredShape, setHoveredShape] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    context.lineWidth = 2
    context.strokeStyle = 'black'
    drawGrid(context)
  }, [gridSize])

  const drawGrid = (context) => {
    const canvas = canvasRef.current
    const { width, height } = canvas
    context.clearRect(0, 0, width, height)

    // Grid çizgilerini çiz
    context.beginPath()
    for (let x = 0; x <= width; x += gridSize) {
      context.moveTo(x, 0)
      context.lineTo(x, height)
    }
    for (let y = 0; y <= height; y += gridSize) {
      context.moveTo(0, y)
      context.lineTo(width, y)
    }
    context.stroke()
  }

  const startDrawing = (e) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    const { offsetX, offsetY } = e.nativeEvent
    const shape = { startX: offsetX, startY: offsetY, endX: offsetX, endY: offsetY, color: 'blue' }
    setShapes([...shapes, shape])
  }

  const drawShape = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const { offsetX, offsetY } = e.nativeEvent
    const shapeIndex = shapes.length - 1
    const updatedShapes = [...shapes]
    updatedShapes[shapeIndex] = { ...updatedShapes[shapeIndex], endX: offsetX, endY: offsetY }
    setShapes(updatedShapes)

    drawGrid(context)

    updatedShapes.forEach((shape) => {
      context.beginPath()
      context.moveTo(shape.startX, shape.startY)
      context.lineTo(shape.endX, shape.endY)
      context.strokeStyle = shape.color
      context.stroke()

      if (hoveredShape === shape) {
        // Çizgiye hover efekti ekle
        context.fillStyle = 'yellow'
        context.fillRect(shape.startX - 3, shape.startY - 3, 6, 6)
        context.fillRect(shape.endX - 3, shape.endY - 3, 6, 6)
      }
    })
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const handleMouseOver = (e, shape) => {
    setHoveredShape(shape)
  }

  const handleMouseOut = () => {
    setHoveredShape(null)
  }

  return <canvas ref={canvasRef} width={500} height={400} onMouseDown={startDrawing} onMouseMove={drawShape} onMouseUp={stopDrawing} onMouseOut={stopDrawing} style={{ cursor: 'crosshair' }} />
}

export default FloorDesigner
