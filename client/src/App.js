import React, { useCallback, useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'

const socket = io.connect(process.env.REACT_APP_WS)

// add customization

const App = () => {
  const [draw, setDraw] = useState(false)
  const [oldPos, setOldPos] = useState({x: 0, y: 0})
  const [userCount, setUserCount] = useState(0)
  const [drawColor, setColor] = useState('black')
  const ctxRef = useRef(null)


  useEffect(() => {
    let canvas = document.getElementById('canvas')

    const ctx = canvas.getContext('2d')
    ctxRef.current = ctx

    socket.on('onDraw', (data) => {
      ctxRef.current.beginPath()
      ctxRef.current.lineWidth = 10
      ctxRef.current.strokeStyle = data.color
      ctxRef.current.lineJoin = 'round'
      ctxRef.current.moveTo(data.pX, data.pY)
      ctxRef.current.lineTo(data.x, data.y)
      ctxRef.current.closePath()
      ctxRef.current.stroke()
    })

    socket.on('clients', (data) => {
      setUserCount(data)
    })

  }, [])

  const drawL = useCallback((x, y, color) => {
    ctxRef.current.beginPath()
    ctxRef.current.lineWidth = 10
    ctxRef.current.strokeStyle = color
    ctxRef.current.lineJoin = 'round'
    ctxRef.current.moveTo(oldPos.x, oldPos.y)
    ctxRef.current.lineTo(x, y)
    ctxRef.current.closePath()
    ctxRef.current.stroke()
    sendM(x, y, oldPos.x, oldPos.y, color)

    setOldPos({x, y})

  }, [oldPos, setOldPos])

  function mouseD(e){
    let rect = e.target.getBoundingClientRect()

    let x = e.clientX - rect.left
    let y = e.clientY - rect.top

    setOldPos({x, y})
    socket.emit('begin', {x, y})
    setDraw(true)
  }

  function mouseU(){
    setDraw(false)
  }

  function mouseM(e){
    let rect = e.target.getBoundingClientRect()

    let x = e.clientX - rect.left
    let y = e.clientY - rect.top

    if(draw){
      drawL(x, y, drawColor)
    }
  }

  function sendM(x, y, pX,pY, col){
    const data = {
      x: x,
      y: y,
      pX: pX,
      pY: pY,
      color: col
    }
    socket.emit('mouse', data)
  }

  return (
    <div className='container mx-auto'>
      <canvas 
        id='canvas' 
        className='mt-4 mb-4 rounded shadow-lg'
        style={{'backgroundColor': '#3f37c9'}}
        onMouseDown={mouseD.bind(this)} 
        onMouseUp={mouseU} 
        onMouseLeave={mouseU} 
        onMouseMove={mouseM.bind(this)} 
        onTouchStart={mouseD.bind(this)} 
        onTouchMove={mouseM.bind(this)} 
        onTouchEnd={mouseU} 
        onTouchCancel={mouseU} 
        width={'1280px'} 
        height={'720px'}
      >
        canvas

      </canvas>
      <div className='p-3 rounded-pill shadow-lg text-center mb-3'style={{'backgroundColor': '#3f37c9'}} >
        <div className='row row-cols-4 g-2'>
          <div className='col'>
              <button className='rounded-pill btn text-white p-4' onClick={() => setColor('black')} style={{'backgroundColor': 'black'}}></button>
          </div>
          <div className='col'>
              <button className='rounded-pill btn text-white p-4' onClick={() => setColor('white')} style={{'backgroundColor': 'white'}}></button>
          </div>
          <div className='col'>
              <button className='rounded-pill btn text-white p-4' onClick={() => setColor('red')} style={{'backgroundColor': 'red'}}></button>
          </div>
          <div className='col'>
              <button className='rounded-pill btn text-white p-4' onClick={() => setColor('blue')} style={{'backgroundColor': 'blue'}}></button>
          </div>
        </div>
      </div>

      <h2 >Users Connected: {userCount}</h2>
    </div>
  )
}

export default App