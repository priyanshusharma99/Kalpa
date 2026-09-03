import React from 'react'
import { useRef, useEffect } from 'react'

const Canvas = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d');
        console.log(canvas)
        console.log(ctx)
    }, [])
    return (
        <canvas ref={canvasRef} className='w-full h-full block' />
    )
}

export default Canvas