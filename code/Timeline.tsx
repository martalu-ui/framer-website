import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

const FONT = `"Inter", "Inter Placeholder", system-ui, sans-serif`

type Item = { year: string; text: string; current?: boolean }

/**
 * Vertical timeline: one continuous line, a dot per milestone, and each
 * milestone slides in the first time it scrolls into view. The line fills
 * with colour as you scroll down.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function Timeline(props: any) {
    const { items, accent, ink, muted, line, style } = props
    const list: Item[] = items && items.length ? items : Timeline.defaultProps.items
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const root = useRef<HTMLDivElement>(null)
    const rows = useRef<(HTMLLIElement | null)[]>([])
    const [seen, setSeen] = useState<boolean[]>(() => list.map(() => isCanvas))
    const [fill, setFill] = useState(isCanvas ? 1 : 0)
    const [narrow, setNarrow] = useState(false)

    useEffect(() => {
        const el = root.current
        if (!el) return
        const ro = new ResizeObserver(() => setNarrow(el.clientWidth < 520))
        ro.observe(el)
        setNarrow(el.clientWidth < 520)
        return () => ro.disconnect()
    }, [])

    useEffect(() => {
        if (isCanvas) return
        let raf = 0
        const tick = () => {
            raf = 0
            const vh = window.innerHeight
            const r = root.current?.getBoundingClientRect()
            if (r) setFill(Math.max(0, Math.min(1, (vh * 0.7 - r.top) / Math.max(1, r.height))))
            setSeen((prev) => {
                let changed = false
                const next = prev.slice()
                rows.current.forEach((row, i) => {
                    if (!row || next[i]) return
                    if (row.getBoundingClientRect().top < vh * 0.88) {
                        next[i] = true
                        changed = true
                    }
                })
                return changed ? next : prev
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
    }, [isCanvas, list.length])

    const dot = 14
    const col = narrow ? 32 : 48

    return (
        <div ref={root} style={{ ...style, position: "relative", width: "100%", fontFamily: FONT }}>
            {/* track + progress fill */}
            <div aria-hidden style={{ position: "absolute", left: dot / 2 - 1, top: 10, bottom: 10, width: 2, background: line, borderRadius: 2 }} />
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    left: dot / 2 - 1,
                    top: 10,
                    width: 2,
                    height: `calc((100% - 20px) * ${fill.toFixed(4)})`,
                    background: accent,
                    borderRadius: 2,
                    transition: "height .15s linear",
                }}
            />
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: narrow ? 28 : 36 }}>
                {list.map((it, i) => {
                    const on = seen[i]
                    return (
                        <li
                            key={i}
                            ref={(el) => {
                                rows.current[i] = el
                            }}
                            style={{ position: "relative", paddingLeft: col }}
                        >
                            <span
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 4,
                                    width: dot,
                                    height: dot,
                                    borderRadius: 99,
                                    background: it.current ? accent : ink,
                                    boxShadow: it.current ? `0 0 0 5px color-mix(in srgb, ${accent} 18%, transparent)` : "none",
                                    transform: on ? "scale(1)" : "scale(.2)",
                                    opacity: on ? 1 : 0,
                                    transition: "transform .45s cubic-bezier(.2,1.6,.4,1) .08s, opacity .2s",
                                }}
                            />
                            <div
                                style={{
                                    opacity: on ? 1 : 0,
                                    transform: on ? "none" : "translateX(-14px)",
                                    transition: "opacity .5s ease, transform .6s cubic-bezier(.2,.9,.3,1)",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                    <span style={{ font: `500 ${narrow ? 18 : 20}px/1.2 ${FONT}`, color: it.current ? accent : ink, letterSpacing: "-0.01em" }}>{it.year}</span>
                                    {it.current ? (
                                        <span
                                            style={{
                                                font: `600 10px/1 ${FONT}`,
                                                letterSpacing: ".08em",
                                                textTransform: "uppercase",
                                                color: "#fff",
                                                background: accent,
                                                padding: "5px 8px",
                                                borderRadius: 99,
                                            }}
                                        >
                                            Now
                                        </span>
                                    ) : null}
                                </div>
                                <p style={{ margin: "8px 0 0", font: `400 ${narrow ? 15 : 16}px/1.55 ${FONT}`, color: muted, maxWidth: 560 }}>{it.text}</p>
                            </div>
                        </li>
                    )
                })}
            </ol>
        </div>
    )
}

Timeline.defaultProps = {
    accent: "#0004FA",
    ink: "#222222",
    muted: "#4A4A4A",
    line: "rgba(0,0,0,0.10)",
    items: [
        { year: "1997", text: "I was born in a small town in Spain.", current: false },
        { year: "2015", text: "I started my degree in Advertising and Public Relations while working as a waitress and in different jobs in the field (remember that I come from a small town!).", current: false },
        { year: "2019", text: "I graduated and began a postgraduate degree in creativity and art direction. Meanwhile, I was working at my first advertising agency.", current: false },
        { year: "2020", text: "I began working at La Mujer del Presidente, a prominent advertising agency in Valencia, where I created my first website!", current: false },
        { year: "Aug 2020", text: "I decided to dive into the startup world and joined an investment fund, where I learned about product development across sectors such as fashion, real estate, home services, sustainability and hospitality, always with a focus on B2B SaaS.", current: false },
        { year: "2024", text: "I started working at Zenova, the most advanced startup in the investment fund.", current: false },
        { year: "2025", text: "I joined Sherpas, a B2B finance platform operating in the United States. I also create content for platforms like LinkedIn, Instagram and Substack.", current: false },
        { year: "2026", text: "I started working at Plytix, which is where I am today.", current: true },
    ],
}

addPropertyControls(Timeline, {
    items: {
        type: ControlType.Array,
        title: "Milestones",
        control: {
            type: ControlType.Object,
            controls: {
                year: { type: ControlType.String, title: "Year" },
                text: { type: ControlType.String, title: "Text", displayTextArea: true },
                current: { type: ControlType.Boolean, title: "Current", defaultValue: false },
            },
        },
    },
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "#0004FA" },
    ink: { type: ControlType.Color, title: "Year", defaultValue: "#222222" },
    muted: { type: ControlType.Color, title: "Text", defaultValue: "#4A4A4A" },
    line: { type: ControlType.Color, title: "Line", defaultValue: "rgba(0,0,0,0.10)" },
})
