import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

const FONT = `"Inter", "Inter Placeholder", system-ui, sans-serif`
const FRAMES = 6
const FW = 413
const FH = 289

/**
 * Full screen loader: a progress bar (a strand of yarn) with the black cat playing on top.
 * It only becomes visible if the page takes longer than `delay` ms, so fast loads never
 * flash it, and once visible it stays at least `minVisible` ms.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function CatLoader(props: any) {
    const { sprite, paper, ink, bar, caption, size, barWidth, delay, frameMs, preview, minVisible, showCat } = props
    const target = RenderTarget.current()
    const isCanvas = target === RenderTarget.canvas
    // only the live site / preview shows it, never screenshots, thumbnails or exports
    const isLive = target === RenderTarget.preview
    const [phase, setPhase] = useState<"loading" | "leaving" | "gone">("loading")
    const [pct, setPct] = useState(0)
    const progress = useRef(0)
    const finished = useRef(false)

    useEffect(() => {
        if (isCanvas) return
        // Already loaded (fast load or in-site navigation): never show it.
        if (document.readyState === "complete") {
            setPhase("gone")
            return
        }
        let done = false
        let timer = 0
        const t0 = performance.now()

        // progress: real image loading, plus a slow creep so it never looks stuck
        const tick = window.setInterval(() => {
            const imgs = Array.from(document.images)
            const total = imgs.length
            const ready = imgs.filter((i) => i.complete).length
            const real = total ? ready / total : 0
            const creep = 1 - Math.exp(-Math.max(0, performance.now() - t0 - delay) / 4000)
            const goal = finished.current ? 1 : Math.min(0.94, Math.max(real * 0.94, creep * 0.9))
            progress.current += (goal - progress.current) * (finished.current ? 0.35 : 0.18)
            setPct(progress.current)
        }, 60)

        const finish = () => {
            if (done) return
            done = true
            const t = performance.now()
            if (t < delay + 50) {
                // still inside the invisible grace period: skip it entirely, no flash
                setPhase("gone")
                return
            }
            finished.current = true
            // fill the bar, then keep it long enough to read as intentional
            const visibleFor = t - delay
            const wait = Math.max(450, minVisible - visibleFor)
            timer = window.setTimeout(() => {
                setPhase("leaving")
                timer = window.setTimeout(() => setPhase("gone"), 450)
            }, wait)
        }
        window.addEventListener("load", finish, { once: true })
        const safety = window.setTimeout(finish, delay + 20000)
        return () => {
            window.removeEventListener("load", finish)
            window.clearTimeout(safety)
            window.clearTimeout(timer)
            window.clearInterval(tick)
        }
    }, [isCanvas])

    if (isCanvas && !preview) {
        return (
            <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", font: `500 11px/1.3 ${FONT}`, color: ink, opacity: 0.5, textAlign: "center", border: `1px dashed ${ink}33`, borderRadius: 8 }}>
                Cat loader
                <br />
                (only shows on slow loads)
            </div>
        )
    }
    if (phase === "gone") return null
    if (!isCanvas && !isLive) return null

    const src = sprite?.src || "https://raw.githubusercontent.com/martalu-ui/framer-website/portfolio-assets/portfolio/cat-yarn-sprite.webp"
    const w = size
    const h = Math.round((size * FH) / FW)
    const leaving = phase === "leaving"
    const p = isCanvas ? 0.42 : pct
    const catX = Math.max(0, Math.min(barWidth, p * barWidth)) - w / 2

    return (
        <div
            aria-hidden={leaving}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(p * 100)}
            aria-label="Loading"
            style={{
                position: isCanvas ? "absolute" : "fixed",
                inset: 0,
                zIndex: 2147483000,
                background: paper,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: leaving ? 0 : undefined,
                transition: "opacity .4s ease",
                pointerEvents: leaving ? "none" : "auto",
                animation: isCanvas ? "none" : `catloader-in .3s ease ${delay}ms both`,
            }}
        >
            <style>{`
                @keyframes catloader-in { from { opacity: 0; visibility: hidden } to { opacity: 1; visibility: visible } }
                @keyframes catloader-play { from { background-position-x: 0 } to { background-position-x: -${w * FRAMES}px } }
            `}</style>
            <div style={{ width: barWidth, position: "relative", paddingTop: showCat ? h - 6 : 0 }}>
                {showCat ? (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: w,
                            height: h,
                            transform: `translateX(${catX.toFixed(1)}px)`,
                            transition: "transform .25s linear",
                            backgroundImage: `url("${src}")`,
                            backgroundRepeat: "no-repeat",
                            backgroundSize: `${w * FRAMES}px ${h}px`,
                            animation: `catloader-play ${frameMs * FRAMES}ms steps(${FRAMES}) infinite`,
                        }}
                    />
                ) : null}
                <div style={{ height: 4, borderRadius: 99, background: `color-mix(in srgb, ${ink} 10%, transparent)`, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(p * 100).toFixed(2)}%`, background: bar, borderRadius: 99, transition: "width .25s linear" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, font: `500 11px/1 ${FONT}`, letterSpacing: ".08em", textTransform: "uppercase", color: ink, opacity: 0.5, whiteSpace: "nowrap" }}>
                    <span>{caption}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(p * 100)}%</span>
                </div>
            </div>
        </div>
    )
}

CatLoader.defaultProps = {
    paper: "#ECEBE8",
    ink: "#111111",
    bar: "#F2B01E",
    caption: "Untangling the yarn",
    size: 110,
    barWidth: 260,
    delay: 10000,
    minVisible: 1200,
    frameMs: 170,
    showCat: true,
    preview: false,
}

addPropertyControls(CatLoader, {
    sprite: { type: ControlType.ResponsiveImage, title: "Sprite (6 frames)" },
    caption: { type: ControlType.String, title: "Caption", defaultValue: "Untangling the yarn" },
    showCat: { type: ControlType.Boolean, title: "Cat", defaultValue: true },
    size: { type: ControlType.Number, title: "Cat width", defaultValue: 110, min: 50, max: 400, step: 10 },
    barWidth: { type: ControlType.Number, title: "Bar width", defaultValue: 260, min: 120, max: 600, step: 10 },
    bar: { type: ControlType.Color, title: "Bar", defaultValue: "#F2B01E" },
    delay: { type: ControlType.Number, title: "Show after (ms)", defaultValue: 10000, min: 0, max: 30000, step: 500 },
    minVisible: { type: ControlType.Number, title: "Min visible (ms)", defaultValue: 1200, min: 0, max: 4000, step: 100 },
    frameMs: { type: ControlType.Number, title: "Frame (ms)", defaultValue: 170, min: 60, max: 600, step: 10 },
    paper: { type: ControlType.Color, title: "Background", defaultValue: "#ECEBE8" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "#111111" },
    preview: { type: ControlType.Boolean, title: "Preview on canvas", defaultValue: false },
})
