import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

const RAW = "https://raw.githubusercontent.com/martalu-ui/framer-website/portfolio-assets/portfolio/me/"
const FALLBACK = ["me-laugh.jpg", "me-beach.jpg", "me-dinner.jpg", "me-watermelon.jpg"].map((f) => RAW + f)

/**
 * Small photos that float up at different speeds while you scroll (parallax).
 * Place it as an absolute layer pinned to all sides of a section; it fills
 * that section and keeps the photos inside a side lane so text stays clear.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function PhotoParallax(props: any) {
    const { laneStart, laneEnd, size, strength, radius, startAt, endAt, minWidth, repeat, style } = props
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const srcs: string[] = [props.photo1, props.photo2, props.photo3, props.photo4, props.photo5, props.photo6]
        .map((p: any) => p?.src)
        .filter(Boolean)
    const photos = srcs.length ? srcs : FALLBACK

    const root = useRef<HTMLDivElement>(null)
    const els = useRef<(HTMLDivElement | null)[]>([])
    const [box, setBox] = useState({ w: 0, h: 0 })

    useEffect(() => {
        const el = root.current
        if (!el) return
        const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }))
        ro.observe(el)
        setBox({ w: el.clientWidth, h: el.clientHeight })
        return () => ro.disconnect()
    }, [])

    const hidden = box.w > 0 && box.w < minWidth

    // how many photos fit along the section
    const count = Math.max(photos.length, Math.min(photos.length * repeat, Math.floor(box.h / (size * 2.1)) || photos.length))
    const items = Array.from({ length: count }, (_, i) => {
        const t = count === 1 ? 0.5 : i / (count - 1)
        const top = startAt + t * (endAt - startAt)
        const zig = [0.15, 0.7, 0.35, 0.9, 0.05, 0.55][i % 6]
        const factor = [0.35, 0.6, 0.25, 0.5, 0.7, 0.3][i % 6] * strength
        const rot = [-7, 5, -3, 8, -5, 3][i % 6]
        const scale = [1, 0.8, 0.92, 0.75, 0.88, 1.05][i % 6]
        return { src: photos[i % photos.length], top, zig, factor, rot, scale }
    })

    useEffect(() => {
        if (isCanvas || hidden || !box.w) return
        let raf = 0
        const tick = () => {
            raf = 0
            const vh = window.innerHeight
            els.current.forEach((el, i) => {
                if (!el) return
                const it = items[i]
                if (!it) return
                const r = (el.parentElement as HTMLElement).getBoundingClientRect()
                const center = r.top + r.height / 2
                const d = center - vh / 2
                const y = -d * it.factor
                const vis = center + y // where the photo actually is on screen
                // fade in coming from the bottom, fade out near the sticky nav at the top
                const inT = Math.min(1, Math.max(0, (vh * 1.02 - vis) / (vh * 0.22)))
                const outT = Math.min(1, Math.max(0, (vis - vh * 0.12) / (vh * 0.16)))
                const o = Math.min(inT, outT)
                const s = it.scale * (0.7 + 0.3 * o)
                el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) rotate(${(it.rot * (1.6 - 0.6 * o)).toFixed(2)}deg) scale(${s.toFixed(3)})`
                el.style.opacity = o.toFixed(3)
            })
        }
        const on = () => {
            if (!raf) raf = requestAnimationFrame(tick)
        }
        tick()
        window.addEventListener("scroll", on, { passive: true })
        window.addEventListener("resize", on)
        return () => {
            window.removeEventListener("scroll", on)
            window.removeEventListener("resize", on)
            if (raf) cancelAnimationFrame(raf)
        }
    }, [isCanvas, hidden, box.w, box.h, count, strength])

    const laneW = Math.max(0, (laneEnd - laneStart) / 100) * box.w
    const w = size
    const h = Math.round(size * 1.25)

    return (
        <div ref={root} style={{ ...style, position: "relative", width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
            {!hidden && box.w
                ? items.map((it, i) => {
                      const left = (laneStart / 100) * box.w + it.zig * Math.max(0, laneW - w * it.scale)
                      return (
                          <div key={i} style={{ position: "absolute", left, top: `${it.top}%`, width: w, height: h }}>
                              <div
                                  ref={(el) => {
                                      els.current[i] = el
                                  }}
                                  style={{
                                      width: "100%",
                                      height: "100%",
                                      borderRadius: radius,
                                      overflow: "hidden",
                                      boxShadow: "0 14px 30px -12px rgba(0,0,0,.35), 0 2px 6px rgba(0,0,0,.08)",
                                      transform: isCanvas ? `rotate(${it.rot}deg) scale(${it.scale})` : undefined,
                                      opacity: isCanvas ? 1 : 0,
                                      willChange: "transform, opacity",
                                      background: "#ddd",
                                  }}
                              >
                                  <img src={it.src} alt="" loading="lazy" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                              </div>
                          </div>
                      )
                  })
                : null}
        </div>
    )
}

PhotoParallax.defaultProps = {
    laneStart: 3,
    laneEnd: 31,
    size: 150,
    strength: 1,
    radius: 14,
    startAt: 14,
    endAt: 88,
    minWidth: 1000,
    repeat: 2,
}

const img = (title: string) => ({ type: ControlType.ResponsiveImage, title })

addPropertyControls(PhotoParallax, {
    photo1: img("Photo 1"),
    photo2: img("Photo 2"),
    photo3: img("Photo 3"),
    photo4: img("Photo 4"),
    photo5: img("Photo 5"),
    photo6: img("Photo 6"),
    size: { type: ControlType.Number, title: "Photo width", defaultValue: 150, min: 60, max: 400, step: 5 },
    strength: { type: ControlType.Number, title: "Parallax", defaultValue: 1, min: 0, max: 3, step: 0.1 },
    laneStart: { type: ControlType.Number, title: "Lane from %", defaultValue: 3, min: 0, max: 100, step: 1 },
    laneEnd: { type: ControlType.Number, title: "Lane to %", defaultValue: 31, min: 0, max: 100, step: 1 },
    startAt: { type: ControlType.Number, title: "Start at %", defaultValue: 14, min: 0, max: 100, step: 1 },
    endAt: { type: ControlType.Number, title: "End at %", defaultValue: 88, min: 0, max: 100, step: 1 },
    repeat: { type: ControlType.Number, title: "Max repeats", defaultValue: 2, min: 1, max: 4, step: 1 },
    radius: { type: ControlType.Number, title: "Radius", defaultValue: 14, min: 0, max: 40 },
    minWidth: { type: ControlType.Number, title: "Hide below px", defaultValue: 1000, min: 0, max: 2000, step: 10 },
})
