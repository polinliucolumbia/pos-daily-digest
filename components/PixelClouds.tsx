import React from 'react'

interface CloudConfig {
  top?: string
  bottom?: string
  left?: string
  right?: string
  width: number
  animDuration: string
  animDelay: string
}

const clouds: CloudConfig[] = [
  { top: '-3%',    left: '-5%',    width: 540, animDuration: '9s',  animDelay: '0s'   },
  { top: '5%',     right: '-7%',   width: 480, animDuration: '12s', animDelay: '2.5s' },
  { top: '40%',    left: '-4%',    width: 500, animDuration: '8s',  animDelay: '1s'   },
  { bottom: '8%',  left: '12%',    width: 460, animDuration: '11s', animDelay: '3.5s' },
  { bottom: '-2%', right: '-3%',   width: 520, animDuration: '10s', animDelay: '5s'   },
]

export default function PixelClouds() {
  return (
    <div
      className="pointer-events-none"
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '100vw',
        left: 'calc(-50vw + 50%)',
        overflow: 'visible',
      }}
    >
      {clouds.map((cloud, i) => {
        const style: React.CSSProperties = {
          position: 'absolute',
          width: `${cloud.width}px`,
          animation: `cloudFloat ${cloud.animDuration} ease-in-out infinite`,
          animationDelay: cloud.animDelay,
        }
        if (cloud.top    !== undefined) style.top    = cloud.top
        if (cloud.bottom !== undefined) style.bottom = cloud.bottom
        if (cloud.left   !== undefined) style.left   = cloud.left
        if (cloud.right  !== undefined) style.right  = cloud.right

        return (
          <div key={i} style={style}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/clouds.svg" alt="" aria-hidden="true" style={{ display: 'block', width: '100%' }} />
          </div>
        )
      })}
    </div>
  )
}
