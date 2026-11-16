import * as React from "react"
import { useEffect, useState } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

const FONT = `"Inter", "Inter Placeholder", system-ui, sans-serif`
const FRAMES = 6
const FW = 413
const FH = 289

/**
 * Full screen loader: the black cat playing with a ball of yarn.
 * It only becomes visible if the page takes longer than `delay` ms,
 * so fast loads never flash it. Hides as soon as the page has loaded.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function CatLoader(props: any) {
    const { sprite, paper, ink, caption, size, delay, frameMs, preview } = props
    const target = RenderTarget.current()
    const isCanvas = target === RenderTarget.canvas
    // only the live site / preview shows it, never screenshots, thumbnails or exports
    const isLive = target === RenderTarget.preview
    const [phase, setPhase] = useState<"loading" | "leaving" | "gone">("loading")

    useEffect(() => {
        if (isCanvas) return
        let done = false
        const finish = () => {
            if (done) return
            done = true
            setPhase("leaving")
            window.setTimeout(() => setPhase("gone"), 450)
        }
        if (document.readyState === "complete") {
            finish()
            return
        }
        window.addEventListener("load", finish, { once: true })
        const safety = window.setTimeout(finish, 10000)
        return () => {
            window.removeEventListener("load", finish)
            window.clearTimeout(safety)
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

    return (
        <div
            aria-hidden={leaving}
            role="status"
            style={{
                position: isCanvas ? "absolute" : "fixed",
                inset: 0,
                zIndex: 2147483000,
                background: paper,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 18,
                opacity: leaving ? 0 : undefined,
                transition: "opacity .4s ease",
                pointerEvents: leaving ? "none" : "auto",
                animation: isCanvas ? "none" : `catloader-in .3s ease ${delay}ms both`,
            }}
        >
            <style>{`
                @keyframes catloader-in { from { opacity: 0; visibility: hidden } to { opacity: 1; visibility: visible } }
                @keyframes catloader-play { from { background-position-x: 0 } to { background-position-x: -${w * FRAMES}px } }
                @keyframes catloader-dots { 0%, 20% { opacity: .2 } 50% { opacity: 1 } 100% { opacity: .2 } }
            `}</style>
            <div
                style={{
                    width: w,
                    height: h,
                    backgroundImage: `url("${src}")`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${w * FRAMES}px ${h}px`,
                    animation: `catloader-play ${frameMs * FRAMES}ms steps(${FRAMES}) infinite`,
                }}
            />
            {caption ? (
                <div style={{ font: `500 12px/1 ${FONT}`, letterSpacing: ".08em", textTransform: "uppercase", color: ink, opacity: 0.55, whiteSpace: "nowrap" }}>
                    {caption}
                    {[0, 1, 2].map((i) => (
                        <span key={i} style={{ animation: `catloader-dots 1.2s ${i * 0.2}s infinite` }}>.</span>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

CatLoader.defaultProps = {
    paper: "#ECEBE8",
    ink: "#111111",
    caption: "Untangling the yarn",
    size: 200,
    delay: 300,
    frameMs: 170,
    preview: false,
}

addPropertyControls(CatLoader, {
    sprite: { type: ControlType.ResponsiveImage, title: "Sprite (6 frames)" },
    caption: { type: ControlType.String, title: "Caption", defaultValue: "Untangling the yarn" },
    size: { type: ControlType.Number, title: "Cat width", defaultValue: 200, min: 80, max: 500, step: 10 },
    delay: { type: ControlType.Number, title: "Show after (ms)", defaultValue: 300, min: 0, max: 3000, step: 50 },
    frameMs: { type: ControlType.Number, title: "Frame (ms)", defaultValue: 170, min: 60, max: 600, step: 10 },
    paper: { type: ControlType.Color, title: "Background", defaultValue: "#ECEBE8" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "#111111" },
    preview: { type: ControlType.Boolean, title: "Preview on canvas", defaultValue: false },
})
