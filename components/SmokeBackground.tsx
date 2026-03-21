'use client'
import { useEffect, useRef } from 'react'

export default function SmokeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl')
    if (!gl) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()

    const vs = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `

    const fs = `
      precision mediump float;
      uniform float time;
      uniform vec2 resolution;

      float noise(vec2 p){
        return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);
      }

      float smoothNoise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = noise(i);
        float b = noise(i + vec2(1.0, 0.0));
        float c = noise(i + vec2(0.0, 1.0));
        float d = noise(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) +
               (c - a) * u.y * (1.0 - u.x) +
               (d - b) * u.x * u.y;
      }

      float fbm(vec2 p){
        float v = 0.0;
        float a = 0.5;
        for(int i = 0; i < 5; i++){
          v += a * smoothNoise(p);
          p *= 2.0;
          a *= 0.5;
        }
        return v;
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / resolution.xy;

        float n = fbm(uv * 4.0 + vec2(0.0, time * 0.18));
        float n2 = fbm(uv * 3.0 - vec2(time * 0.12, 0.0));
        float fog = (n + n2) * 0.5;

        fog = smoothstep(0.35, 0.75, fog);

        float redAmt  = fog * (1.0 - uv.x) * 1.4;
        float blueAmt = fog * uv.x * 1.4;

        vec3 color = vec3(redAmt * 0.85, 0.0, blueAmt * 0.9);

        float fade = 1.0 - smoothstep(0.55, 1.0, uv.y);
        color *= fade;

        gl_FragColor = vec4(color, 1.0);
      }
    `

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!
      gl!.shaderSource(s, src)
      gl!.compileShader(s)
      return s
    }

    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vs))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs))
    gl.linkProgram(program)
    gl.useProgram(program)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)

    const pos = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const timeLoc = gl.getUniformLocation(program, 'time')
    const resLoc  = gl.getUniformLocation(program, 'resolution')

    let t = 0
    let animId: number

    function render() {
      t += 0.01
      gl!.uniform1f(timeLoc, t)
      gl!.uniform2f(resLoc, canvas!.width, canvas!.height)
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
      animId = requestAnimationFrame(render)
    }
    render()

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        zIndex: 0,
      }}
    />
  )
}
