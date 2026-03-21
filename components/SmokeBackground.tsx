'use client'
import { useEffect, useRef } from 'react'

export default function SmokeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = []

    class Particle {
      x: number; y: number; size: number
      speedX: number; speedY: number
      color: string; opacity: number

      constructor(x: number, y: number, color: string) {
        this.x = x
        this.y = y
        this.size = Math.random() * 80 + 20
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = Math.random() * -0.5 - 0.2
        this.color = color
        this.opacity = 0.03
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.size *= 0.995
      }

      draw() {
        ctx!.beginPath()
        ctx!.fillStyle = this.color
        ctx!.globalAlpha = this.opacity
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.globalAlpha = 1
      }
    }

    function createSmoke() {
      particles.push(new Particle(
        Math.random() * canvas!.width * 0.4,
        canvas!.height,
        'red'
      ))
      particles.push(new Particle(
        canvas!.width * 0.6 + Math.random() * canvas!.width * 0.4,
        canvas!.height,
        'blue'
      ))
    }

    let animId: number

    function animate() {
      ctx!.fillStyle = 'rgba(0,0,0,0.1)'
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)
      createSmoke()
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update()
        particles[i].draw()
        if (particles[i].size < 1) particles.splice(i, 1)
      }
      animId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        display: 'block',
      }}
    />
  )
}
