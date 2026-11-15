import * as React from "react"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

// ============================================================================================
// Work Desktop: projects live on a desktop as draggable folders and files around a black cat
// that blinks now and then. Clicking an item opens a window with the whole case study.
// ============================================================================================

type Kind = "folder" | "file"

interface Project {
    label: string
    kind: Kind
    tag: string
    brand: string
    title: string
    type: string
    year: string
    skills: string
    thumb: any
    cover: any
    context: string
    challenge: string
    approach: string
    second: string
    decision: string
    takeaway: string
    gallery1: any
    gallery2: any
    link: any
    folder: string
    cta: string
}

interface Extra {
    label: string
    tag: string
    link: any
}

interface Props {
    projects: Project[]
    extras: Extra[]
    title: string
    word: string
    showWord: boolean
    catOpen: any
    catHalf: any
    catClosed: any
    ctaLabel: string
    ctaLink: any
    hint: string
    accent: string
    paper: string
    ink: string
    folderColor: string
    topOffset: number
    style?: React.CSSProperties
}

// ---------- helpers ----------------------------------------------------------------------------
const src = (v: any): string => {
    if (!v) return ""
    if (typeof v === "string") return v
    if (v.collectionItem && typeof v.href === "string" && v.href.indexOf("/:") >= 0) return v.href.replace(/\/:[^/]+$/, "/" + v.collectionItem)
    return v.src || v.url || v.href || ""
}
const sized = (u: string, w: number) =>
    u && u.indexOf("framerusercontent.com/images/") >= 0 && u.indexOf("?") < 0 ? u + "?scale-down-to=" + w : u
const TAG_COLORS = ["#FF4FA3", "#2F6BFF", "#FFC21A", "#21C47B", "#FF6A3D", "#9B6BFF"]
const FONT = `"Inter", "Inter Placeholder", system-ui, -apple-system, sans-serif`

// Slots around the centre (fractions of the stage). Left column, right column, then fill.
const SLOTS: [number, number][] = [
    [0.09, 0.27], [0.23, 0.2], [0.91, 0.27], [0.77, 0.2],
    [0.08, 0.55], [0.92, 0.55], [0.15, 0.8], [0.85, 0.8],
    [0.3, 0.84], [0.7, 0.84], [0.37, 0.18], [0.63, 0.18],
    [0.22, 0.5], [0.78, 0.5],
]

const NARROW: [number, number][] = [
    [0.12, 0.25], [0.88, 0.25], [0.12, 0.45], [0.88, 0.45],
    [0.12, 0.65], [0.88, 0.65], [0.12, 0.84], [0.88, 0.84],
    [0.32, 0.86], [0.68, 0.86],
]

function useNow() {
    const [now, setNow] = useState(() => new Date())
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 15000)
        return () => clearInterval(id)
    }, [])
    return now
}

function useSize(ref: React.RefObject<HTMLElement>) {
    const [s, set] = useState({ w: 0, h: 0 })
    useLayoutEffect(() => {
        const el = ref.current
        if (!el) return
        const ro = new ResizeObserver((e) => {
            const r = e[0].contentRect
            set({ w: r.width, h: r.height })
        })
        ro.observe(el)
        const r = el.getBoundingClientRect()
        set({ w: r.width, h: r.height })
        return () => ro.disconnect()
    }, [])
    return s
}

// ---------- the cat ---------------------------------------------------------------------------
function Cat({ open, half, closed, size }: { open: string; half: string; closed: string; size: number }) {
    const [frame, setFrame] = useState(0) // 0 open, 1 half, 2 closed
    const hover = useRef(false)
    const timer = useRef<any>(null)

    useEffect(() => {
        ;[open, half, closed].forEach((u) => {
            if (!u) return
            const i = new Image()
            i.src = u
        })
    }, [open, half, closed])

    useEffect(() => {
        if (RenderTarget.current() === RenderTarget.canvas) return
        let alive = true
        const seq = (steps: [number, number][], done: () => void) => {
            let i = 0
            const next = () => {
                if (!alive) return
                if (i >= steps.length) return done()
                const [f, t] = steps[i++]
                setFrame(f)
                timer.current = setTimeout(next, t)
            }
            next()
        }
        const blink = () => [[1, 55], [2, 120], [1, 60], [0, 0]] as [number, number][]
        const loop = () => {
            if (!alive) return
            const wait = 2200 + Math.random() * 4200
            timer.current = setTimeout(() => {
                if (hover.current) return loop()
                const r = Math.random()
                // mostly a single blink, sometimes a double blink, sometimes a slow sleepy one
                const steps =
                    r < 0.18
                        ? [...blink(), [0, 140] as [number, number], ...blink()]
                        : r < 0.3
                          ? ([[1, 160], [2, 900], [1, 180], [0, 0]] as [number, number][])
                          : blink()
                seq(steps, loop)
            }, wait)
        }
        loop()
        return () => {
            alive = false
            clearTimeout(timer.current)
        }
    }, [])

    const imgs = [open, half || open, closed || open]
    return (
        <div
            onPointerEnter={() => {
                hover.current = true
                clearTimeout(timer.current)
                setFrame(1)
                timer.current = setTimeout(() => setFrame(2), 120)
            }}
            onPointerLeave={() => {
                hover.current = false
                clearTimeout(timer.current)
                setFrame(1)
                timer.current = setTimeout(() => setFrame(0), 120)
            }}
            style={{
                position: "relative",
                width: size,
                height: size,
                cursor: "default",
            }}
            aria-label="A black cat that blinks now and then"
            role="img"
        >
            <div
                style={{
                    position: "absolute",
                    left: "18%",
                    right: "12%",
                    bottom: "9%",
                    height: "9%",
                    borderRadius: "50%",
                    background: "radial-gradient(closest-side, rgba(0,0,0,.22), rgba(0,0,0,0))",
                    filter: "blur(4px)",
                }}
            />
            {imgs.map((u, i) =>
                u ? (
                    <img
                        key={i}
                        src={u}
                        alt=""
                        draggable={false}
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            opacity: frame === i ? 1 : 0,
                            userSelect: "none",
                            pointerEvents: "none",
                        }}
                    />
                ) : null
            )}
        </div>
    )
}

// ---------- icons -----------------------------------------------------------------------------
function FolderIcon({ size, color, tag, tagColor, peek }: { size: number; color: string; tag: string; tagColor: string; peek?: string }) {
    const w = size
    const h = size * 0.82
    return (
        <div className="wd-folder" style={{ position: "relative", width: w, height: h }}>
            <svg width={w} height={h} viewBox="0 0 100 82" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                <path d="M6 4 h26 c4 0 6 2 9 5 l3 3 h50 c3.3 0 6 2.7 6 6 v58 c0 3.3-2.7 6-6 6 H6 c-3.3 0-6-2.7-6-6 V10 c0-3.3 2.7-6 6-6z" fill={color} />
            </svg>
            {peek ? (
                <div
                    className="wd-peek"
                    style={{
                        position: "absolute",
                        left: "12%",
                        right: "12%",
                        top: "14%",
                        height: "58%",
                        borderRadius: 4,
                        background: `#fff url("${peek}") center/cover no-repeat`,
                        boxShadow: "0 1px 2px rgba(0,0,0,.25)",
                        transition: "transform .35s cubic-bezier(.2,.8,.2,1)",
                    }}
                />
            ) : null}
            <svg width={w} height={h} viewBox="0 0 100 82" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                <defs>
                    <linearGradient id={`wdf-${color.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="rgba(255,255,255,.14)" />
                        <stop offset="1" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                </defs>
                <rect x="0" y="22" width="100" height="60" rx="6" fill={color} />
                <rect x="0" y="22" width="100" height="60" rx="6" fill={`url(#wdf-${color.replace(/[^a-z0-9]/gi, "")})`} />
            </svg>
            {tag ? (
                <div
                    style={{
                        position: "absolute",
                        right: "8%",
                        bottom: "12%",
                        transform: "rotate(-6deg)",
                        background: tagColor,
                        color: "#111",
                        font: `600 ${Math.max(9, size * 0.11)}px/1 "SF Mono", ui-monospace, Menlo, monospace`,
                        padding: "4px 6px",
                        borderRadius: 2,
                        boxShadow: "0 1px 0 rgba(0,0,0,.25)",
                        whiteSpace: "nowrap",
                    }}
                >
                    {tag}
                </div>
            ) : null}
        </div>
    )
}

function FileIcon({ size, img }: { size: number; img: string }) {
    return (
        <div
            className="wd-file"
            style={{
                width: size,
                height: size,
                borderRadius: size * 0.12,
                background: `#fff url("${img}") center/cover no-repeat`,
                boxShadow: "0 1px 0 rgba(255,255,255,.6) inset, 0 6px 18px rgba(0,0,0,.10)",
                border: "4px solid #fff",
                boxSizing: "border-box",
            }}
        />
    )
}

// ---------- the window -------------------------------------------------------------------------
function Section({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(!!defaultOpen)
    return (
        <div style={{ borderTop: "1px solid rgba(0,0,0,.07)", padding: "18px 0" }}>
            <button
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                style={{
                    all: "unset",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    font: `600 19px/1.2 ${FONT}`,
                    color: "#111",
                    letterSpacing: "-0.01em",
                }}
            >
                {title}
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ transition: "transform .25s", transform: open ? "rotate(180deg)" : "none" }}>
                    <path d="M3 5.5 7 9.5 11 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .32s cubic-bezier(.2,.8,.2,1)" }}>
                <div style={{ overflow: "hidden" }}>
                    <div style={{ paddingTop: 12 }}>{children}</div>
                </div>
            </div>
        </div>
    )
}

const P = ({ t }: { t: string }) => (
    <>
        {(t || "")
            .split(/\n\s*\n|\n/)
            .filter((s) => s.trim())
            .map((s, i) => (
                <p key={i} style={{ margin: "0 0 12px", font: `400 16px/1.6 ${FONT}`, color: "#55524d" } as any}>
                    {s}
                </p>
            ))}
    </>
)

function Window({
    p,
    origin,
    onClose,
    accent,
    isPhone,
    folder,
    active = true,
    zBoost = 0,
}: {
    p: Project
    origin: { x: number; y: number }
    onClose: () => void
    accent: string
    isPhone: boolean
    folder?: { items: Project[]; onPick: (i: number, el: HTMLElement) => void; folderColor: string }
    active?: boolean
    zBoost?: number
}) {
    const activeRef = useRef(active)
    activeRef.current = active
    const [closing, setClosing] = useState(false)
    const [max, setMax] = useState(false)
    const [drag, setDrag] = useState({ x: 0, y: 0 })
    const start = useRef<any>(null)
    const close = () => {
        setClosing(true)
        setTimeout(onClose, 220)
    }
    useEffect(() => {
        const k = (e: KeyboardEvent) => e.key === "Escape" && activeRef.current && close()
        window.addEventListener("keydown", k)
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            window.removeEventListener("keydown", k)
            document.body.style.overflow = prev
        }
    }, [])

    const href = src(p.link)
    const cover = sized(src(p.cover) || src(p.thumb), 1600)
    const g1 = sized(src(p.gallery1), 1200)
    const g2 = sized(src(p.gallery2), 1200)
    const full = max || isPhone
    const ox = origin.x - window.innerWidth / 2
    const oy = origin.y - window.innerHeight / 2

    const onDown = (e: React.PointerEvent) => {
        if (full) return
        start.current = { x: e.clientX - drag.x, y: e.clientY - drag.y }
        ;(e.target as Element).setPointerCapture?.(e.pointerId)
    }
    const onMove = (e: React.PointerEvent) => {
        if (!start.current) return
        setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y })
    }
    const onUp = () => (start.current = null)

    const dot = (c: string, label: string, fn: () => void) => (
        <button
            aria-label={label}
            onClick={fn}
            className="wd-dot"
            style={{ all: "unset", cursor: "pointer", width: 14, height: 14, borderRadius: 99, background: c, boxShadow: "inset 0 0 0 .5px rgba(0,0,0,.2)" }}
        />
    )

    return (
        <div
            onClick={close}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 2147483000 + zBoost,
                background: closing || zBoost ? "rgba(236,234,230,0)" : "rgba(236,234,230,.55)",
                backdropFilter: "blur(3px)",
                WebkitBackdropFilter: "blur(3px)",
                transition: "background .22s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT,
            }}
        >
            <div style={{ transform: `translate(${full ? 0 : drag.x}px, ${full ? 0 : drag.y}px)` }} onClick={(e) => e.stopPropagation()}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label={p.label}
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "relative",
                    width: full ? "100vw" : folder ? "min(760px, 92vw)" : "min(920px, 92vw)",
                    height: full ? "100dvh" : folder ? "min(64vh, 560px)" : "min(84vh, 820px)",
                    background: "#fff",
                    borderRadius: full ? 0 : 22,
                    boxShadow: full ? "none" : "0 0 0 10px rgba(255,255,255,.55), 0 0 0 11px rgba(0,0,0,.05), 0 40px 90px rgba(30,25,20,.22)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    animation: closing ? "wd-out .22s ease-in forwards" : "wd-in .42s cubic-bezier(.2,.9,.25,1.05) both",
                    ["--ox" as any]: `${ox}px`,
                    ["--oy" as any]: `${oy}px`,
                    transition: "width .3s, height .3s, border-radius .3s",
                }}
            >
                {/* title bar */}
                <div
                    onPointerDown={onDown}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onDoubleClick={() => !isPhone && setMax(!max)}
                    style={{
                        flex: "0 0 auto",
                        height: 58,
                        display: "grid",
                        gridTemplateColumns: "90px 1fr 90px",
                        alignItems: "center",
                        padding: "0 20px",
                        borderBottom: "1px solid rgba(0,0,0,.08)",
                        cursor: full ? "default" : "grab",
                        userSelect: "none",
                        touchAction: "none",
                    }}
                >
                    <div style={{ display: "flex", gap: 8 }}>
                        {dot("#E5604F", "Close", close)}
                        {dot("#E8B93A", "Minimise", close)}
                        {!isPhone && dot("#5BC05E", max ? "Restore" : "Maximise", () => setMax(!max))}
                    </div>
                    <div style={{ textAlign: "center", font: `500 15px/1 ${FONT}`, color: "#111", letterSpacing: ".01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.label}
                    </div>
                    <div />
                </div>

                {/* body */}
                <div className="wd-scroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: isPhone ? "18px 18px 8px" : "22px 32px 8px", overscrollBehavior: "contain" }}>
                    {folder ? (
                        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isPhone ? 120 : 150}px, 1fr))`, gap: isPhone ? 18 : 26, padding: isPhone ? "8px 0 18px" : "18px 0 26px" }}>
                            {folder.items.map((it, i) => {
                                const th = sized(src(it.thumb) || src(it.cover), 400)
                                return (
                                    <button
                                        key={i}
                                        className="wd-item"
                                        onClick={(e) => folder.onPick(i, e.currentTarget)}
                                        style={{ all: "unset", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}
                                    >
                                        <div style={{ height: isPhone ? 84 : 104, display: "flex", alignItems: "flex-end" }}>
                                            {it.kind === "folder" ? (
                                                <FolderIcon size={isPhone ? 92 : 112} color={folder.folderColor} tag={it.tag} tagColor={TAG_COLORS[(i + 2) % TAG_COLORS.length]} peek={th || undefined} />
                                            ) : (
                                                <FileIcon size={isPhone ? 84 : 104} img={th} />
                                            )}
                                        </div>
                                        <span className="wd-label" style={{ font: `500 14px/1.2 ${FONT}`, color: "#111", padding: "4px 7px", borderRadius: 6, overflowWrap: "anywhere" }}>{it.label}</span>
                                        <span style={{ font: `400 13px/1.3 ${FONT}`, color: "#8a867f", marginTop: -6 }}>{[it.brand, it.type].filter(Boolean).join(" · ")}</span>
                                    </button>
                                )
                            })}
                        </div>
                    ) : (
                    <>
                    {cover ? (
                        <div
                            style={{
                                width: "100%",
                                aspectRatio: "16 / 9",
                                maxHeight: "48vh",
                                borderRadius: 16,
                                background: `#f2f1ee url("${cover}") center/cover no-repeat`,
                                marginBottom: 22,
                            }}
                        />
                    ) : null}
                    <div style={{ font: `500 13px/1 ${FONT}`, letterSpacing: ".08em", textTransform: "uppercase", color: accent, marginBottom: 10 }}>
                        {p.brand}
                        {p.year ? ` · ${p.year}` : ""}
                    </div>
                    <h2 style={{ margin: "0 0 14px", font: `700 ${isPhone ? 28 : 38}px/1.05 ${FONT}`, letterSpacing: "-0.035em", color: "#111" } as any}>
                        {p.title}
                    </h2>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                        {[p.type, ...(p.skills || "").split(",")]
                            .map((s) => (s || "").trim())
                            .filter(Boolean)
                            .map((s, i) => (
                                <span
                                    key={i}
                                    style={{
                                        font: `500 13px/1 ${FONT}`,
                                        padding: "7px 10px",
                                        borderRadius: 99,
                                        background: i === 0 ? accent : "#F2F1EE",
                                        color: i === 0 ? "#fff" : "#3b3934",
                                    }}
                                >
                                    {s}
                                </span>
                            ))}
                    </div>
                    {p.context ? (
                        <Section title="Context" defaultOpen>
                            <P t={p.context} />
                        </Section>
                    ) : null}
                    {p.challenge ? (
                        <Section title="The challenge" defaultOpen>
                            <P t={p.challenge} />
                        </Section>
                    ) : null}
                    {p.approach || p.second ? (
                        <Section title="My approach">
                            <P t={p.approach} />
                            <P t={p.second} />
                        </Section>
                    ) : null}
                    {p.decision ? (
                        <Section title="A key decision">
                            <P t={p.decision} />
                        </Section>
                    ) : null}
                    {p.takeaway ? (
                        <Section title="What I took away">
                            <P t={p.takeaway} />
                        </Section>
                    ) : null}
                    {g1 || g2 ? (
                        <Section title="Gallery" defaultOpen>
                            <div style={{ display: "grid", gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr", gap: 12 }}>
                                {[g1, g2].filter(Boolean).map((u, i) => (
                                    <div key={i} style={{ aspectRatio: "1 / 1", borderRadius: 14, background: `#f2f1ee url("${u}") center/cover no-repeat` }} />
                                ))}
                            </div>
                        </Section>
                    ) : null}
                    </>
                    )}
                </div>

                {/* footer */}
                <div
                    style={{
                        flex: "0 0 auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        padding: isPhone ? "16px 18px calc(16px + env(safe-area-inset-bottom))" : "18px 32px",
                        borderTop: "1px solid rgba(0,0,0,.08)",
                        background: "#fff",
                    }}
                >
                    <span style={{ font: `500 16px/1.2 ${FONT}`, color: "#111" }}>
                        {folder ? `${folder.items.length} ${folder.items.length === 1 ? "item" : "items"}` : p.cta || "Read the full case study"}
                    </span>
                    {href && !folder ? (
                        <a
                            href={href}
                            target={/^https?:/.test(href) ? "_blank" : undefined}
                            rel="noopener"
                            className="wd-cta"
                            style={{ display: "inline-flex", alignItems: "center", gap: 8, font: `500 16px/1 ${FONT}`, color: accent, textDecoration: "none" }}
                        >
                            Open
                            <svg width="16" height="16" viewBox="0 0 16 16">
                                <path d="M9 2h5v5M14 2 7.5 8.5M12 9.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                    ) : null}
                </div>
            </div>
            </div>
        </div>
    )
}

// ---------- main ------------------------------------------------------------------------------
/**
 * Work Desktop — projects as draggable folders and files around a blinking cat.
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 900
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function WorkDesktop(props: Props) {
    const { projects, extras, title, word, showWord, ctaLabel, hint, accent, paper, ink, folderColor, style } = props
    const top = props.topOffset ?? 16
    const stage = useRef<HTMLDivElement>(null)
    const { w, h } = useSize(stage)
    const isPhone = w > 0 && w < 720
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const now = useNow()
    const [gravity, setGravity] = useState(false)
    const [openIdx, setOpenIdx] = useState<number | null>(null)
    const [openFolder, setOpenFolder] = useState<number | null>(null)
    const [folderOrigin, setFolderOrigin] = useState({ x: 0, y: 0 })
    const [origin, setOrigin] = useState({ x: 0, y: 0 })
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    type Item = { kind: "project"; i: number } | { kind: "extra"; i: number }
    const items: Item[] = useMemo(
        () => [
            ...(projects || []).map((p, i) => ({ p, i })).filter(({ p }) => !(p.folder || "").trim()).map(({ i }) => ({ kind: "project" as const, i })),
            ...(extras || []).map((_, i) => ({ kind: "extra" as const, i })),
        ],
        [projects, extras]
    )

    // positions as fractions of the stage (so they survive resizes); null = use slot
    const [pos, setPos] = useState<Record<number, { fx: number; fy: number }>>({})
    const [fall, setFall] = useState<Record<number, number>>({}) // gravity y in px
    const [z, setZ] = useState<number[]>([])
    const dragRef = useRef<any>(null)

    const icon = isPhone ? 64 : Math.max(84, Math.min(122, w * 0.075))
    const itemW = icon + 96
    const itemH = icon + 46

    const norm = (v: string) => (v || "").toUpperCase().trim()
    const membersOf = (name: string) =>
        (projects || []).map((p, i) => ({ p, i })).filter(({ p }) => (p.folder || "").split(",").map(norm).includes(norm(name)))

    const slotOf = (k: number) => {
        const s = (w < 1100 ? NARROW : SLOTS)[k % (w < 1100 ? NARROW : SLOTS).length]
        return { fx: s[0], fy: s[1] }
    }
    const xy = (k: number) => {
        const f = pos[k] || slotOf(k)
        const x = f.fx * w - itemW / 2
        let y = f.fy * h - itemH / 2
        if (gravity && fall[k] !== undefined) y = fall[k]
        return { x: Math.max(4, Math.min(w - itemW - 4, x)), y: Math.max(top + 8, Math.min(h - itemH - 8, y)) }
    }

    // gravity: drop everything to the floor with a little bounce, keep x
    useEffect(() => {
        if (!gravity || !w) {
            setFall({})
            return
        }
        const ground = h - itemH - (isPhone ? 10 : 92)
        // stack items that land on top of each other, like a real pile
        const order = items.map((_, k) => k).sort((a, b) => xy(b).y - xy(a).y)
        const placed: { x: number; top: number }[] = []
        const floors: number[] = []
        order.forEach((k) => {
            const x = xy(k).x
            const under = placed.filter((p) => Math.abs(p.x - x) < itemW * 0.72)
            const f = under.length ? Math.min(...under.map((p) => p.top)) - itemH * 0.86 : ground
            floors[k] = Math.max(top + 8, f)
            placed.push({ x, top: floors[k] })
        })
        const st = items.map((_, k) => ({ y: xy(k).y, vy: 0, floor: floors[k] }))
        let raf = 0
        let last = performance.now()
        const tick = (t: number) => {
            const dt = Math.min(0.033, (t - last) / 1000)
            last = t
            let moving = false
            st.forEach((s) => {
                s.vy += 2600 * dt
                s.y += s.vy * dt
                if (s.y > s.floor) {
                    s.y = s.floor
                    s.vy = -s.vy * 0.38
                    if (Math.abs(s.vy) < 60) s.vy = 0
                }
                if (s.vy !== 0 || s.y < s.floor) moving = true
            })
            const next: Record<number, number> = {}
            st.forEach((s, k) => (next[k] = s.y))
            setFall(next)
            if (moving) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gravity, w, h])

    const onDown = (k: number) => (e: React.PointerEvent) => {
        if (isPhone) return
        const p = xy(k)
        dragRef.current = { k, sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y, moved: false }
        ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
        setZ((zz) => [...zz.filter((v) => v !== k), k])
    }
    const onMove = (e: React.PointerEvent) => {
        const d = dragRef.current
        if (!d) return
        const dx = e.clientX - d.sx
        const dy = e.clientY - d.sy
        if (!d.moved && Math.hypot(dx, dy) < 5) return
        d.moved = true
        const nx = d.ox + dx + itemW / 2
        const ny = d.oy + dy + itemH / 2
        setPos((p) => ({ ...p, [d.k]: { fx: nx / w, fy: ny / h } }))
        if (gravity) setFall((f) => ({ ...f, [d.k]: d.oy + dy }))
    }
    const onUp = (k: number) => (e: React.PointerEvent) => {
        const d = dragRef.current
        dragRef.current = null
        if (d && d.moved) return
        activate(k, e.currentTarget as HTMLElement)
    }
    const activate = (k: number, el: HTMLElement) => {
        const it = items[k]
        if (it.kind === "extra") {
            if (membersOf(extras[it.i].label).length) {
                const r = el.getBoundingClientRect()
                setFolderOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
                setOpenFolder(it.i)
                return
            }
            const href = src(extras[it.i].link)
            if (href) window.location.href = href
            return
        }
        const r = el.getBoundingClientRect()
        setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
        setOpenIdx(it.i)
    }

    const clock = now.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).replace(",", "")
    const catSize = isPhone ? Math.min(w * 0.46, 200) : Math.max(170, Math.min(h * 0.32, w * 0.19, 300))

    const pill: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 10,
        height: isPhone ? 38 : 46,
        padding: isPhone ? "0 12px" : "0 18px",
        background: "#fff",
        borderRadius: 10,
        font: `500 ${isPhone ? 13 : 16}px/1 ${FONT}`,
        color: ink,
        whiteSpace: "nowrap",
    }

    const renderItem = (k: number) => {
        const it = items[k]
        const pr = it.kind === "project" ? projects[it.i] : null
        const ex = it.kind === "extra" ? extras[it.i] : null
        const label = pr ? pr.label || `${(pr.brand || "PROJECT").toUpperCase().replace(/\s+/g, "_")}` : ex!.label
        const tag = pr ? pr.tag : ex!.tag
        const tagColor = TAG_COLORS[k % TAG_COLORS.length]
        const firstMember = ex ? membersOf(ex.label)[0]?.p : null
        const thumb = pr ? sized(src(pr.thumb) || src(pr.cover), 400) : firstMember ? sized(src(firstMember.thumb) || src(firstMember.cover), 400) : ""
        const kind: Kind = pr ? pr.kind || "folder" : "folder"
        return (
            <>
                <div className="wd-icon" style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", height: icon * 0.98 }}>
                    {kind === "file" && thumb ? (
                        <FileIcon size={icon * 0.98} img={thumb} />
                    ) : (
                        <FolderIcon size={icon} color={folderColor} tag={tag} tagColor={tagColor} peek={thumb || undefined} />
                    )}
                </div>
                <div
                    className="wd-label"
                    style={{
                        marginTop: 10,
                        font: `500 ${isPhone ? 11 : 15}px/1.15 ${FONT}`,
                        color: ink,
                        textAlign: "center",
                        padding: "4px 7px",
                        borderRadius: 6,
                        background: isPhone ? "transparent" : paper,
                        maxWidth: itemW,
                        overflowWrap: "anywhere",
                    }}
                >
                    {label}
                </div>
            </>
        )
    }

    const openProject = openIdx !== null ? projects[openIdx] : null

    return (
        <div
            ref={stage}
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: isPhone ? 760 : 640,
                background: paper,
                overflow: "hidden",
                fontFamily: FONT,
                touchAction: isPhone ? "auto" : "none",
            }}
        >
            <style>{`
@keyframes wd-breathe { 0%,100% { transform: scale(1) } 50% { transform: scale(1.012, 1.018) } }
@keyframes wd-in { from { opacity: 0; transform: translate(var(--ox), var(--oy)) scale(.18) } to { opacity: 1; transform: translate(0,0) scale(1) } }
@keyframes wd-out { to { opacity: 0; transform: scale(.94) } }
@keyframes wd-pop { from { opacity: 0; transform: translateY(14px) scale(.9) } to { opacity: 1; transform: none } }
.wd-item:hover .wd-label, .wd-item:focus-visible .wd-label { background: ${accent}; color: #fff !important; }
.wd-item:hover .wd-peek { transform: translateY(-16%) rotate(-3deg); }
.wd-item:hover .wd-file { transform: rotate(-3deg) scale(1.04); }
.wd-file { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
.wd-item:focus-visible { outline: none; }
.wd-dot:hover { filter: brightness(.92); }
.wd-cta:hover { text-decoration: underline !important; }
.wd-scroll::-webkit-scrollbar { width: 8px } .wd-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,.12); border-radius: 8px }
@media (prefers-reduced-motion: reduce) { .wd-item, .wd-peek, .wd-file { transition: none !important } }
`}</style>

            {/* big word behind the cat */}
            {showWord && word ? (
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        textAlign: "center",
                        font: `900 ${isPhone ? w * 0.3 : Math.min(w * 0.24, h * 0.42)}px/0.8 ${FONT}`,
                        letterSpacing: "-0.06em",
                        color: accent,
                        userSelect: "none",
                        pointerEvents: "none",
                        marginTop: isPhone ? -h * 0.18 : 0,
                    }}
                >
                    {word}
                </div>
            ) : null}

            {/* cat */}
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    top: isPhone ? "32%" : "52%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 2,
                }}
            >
                <Cat open={src(props.catOpen)} half={src(props.catHalf)} closed={src(props.catClosed)} size={catSize} />
            </div>

            {/* items */}
            {isPhone ? (
                <div
                    style={{
                        position: "absolute",
                        left: 12,
                        right: 12,
                        top: "56%",
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        rowGap: 18,
                        zIndex: 3,
                    }}
                >
                    {items.map((_, k) => (
                        <button
                            key={k}
                            className="wd-item"
                            onClick={(e) => activate(k, e.currentTarget)}
                            style={{ all: "unset", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", animation: `wd-pop .5s ${0.05 * k}s both` }}
                        >
                            {renderItem(k)}
                        </button>
                    ))}
                </div>
            ) : w > 0 ? (
                items.map((_, k) => {
                    const p = xy(k)
                    const zi = z.indexOf(k)
                    return (
                        <button
                            key={k}
                            className="wd-item"
                            onPointerDown={onDown(k)}
                            onPointerMove={onMove}
                            onPointerUp={onUp(k)}
                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && activate(k, e.currentTarget)}
                            style={{
                                all: "unset",
                                position: "absolute",
                                left: 0,
                                top: 0,
                                width: itemW,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                transform: `translate(${p.x}px, ${p.y}px)`,
                                zIndex: 3 + (zi < 0 ? 0 : zi + 1),
                                cursor: "grab",
                                touchAction: "none",
                                userSelect: "none",
                            }}
                        >
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: isCanvas ? "none" : `wd-pop .55s cubic-bezier(.2,.9,.3,1.2) ${0.06 * k}s both` }}>
                                {renderItem(k)}
                            </div>
                        </button>
                    )
                })
            ) : null}

            {/* bottom bar: hint + gravity */}
            {!isPhone ? (
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        bottom: 22,
                        transform: "translateX(-50%)",
                        background: ink,
                        color: "#fff",
                        borderRadius: 14,
                        padding: "0 10px 0 24px",
                        height: 56,
                        display: "flex",
                        alignItems: "center",
                        gap: 22,
                        font: `600 16px/1 ${FONT}`,
                        letterSpacing: ".02em",
                        zIndex: 4,
                        whiteSpace: "nowrap",
                    }}
                >
                    <span style={{ font: `900 22px/1 ${FONT}`, letterSpacing: "-0.04em" }}>M.</span>
                    {hint ? <span style={{ textTransform: "uppercase", opacity: 0.92 }}>{hint}</span> : null}
                    <button
                        onClick={() => setGravity(!gravity)}
                        aria-pressed={gravity}
                        style={{
                            all: "unset",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            height: 40,
                            padding: "0 12px 0 14px",
                            borderRadius: 10,
                            background: "rgba(255,255,255,.1)",
                            font: `500 15px/1 ${FONT}`,
                        }}
                    >
                        Gravity
                        <span style={{ width: 38, height: 22, borderRadius: 99, background: gravity ? accent : "rgba(255,255,255,.28)", position: "relative", transition: "background .2s" }}>
                            <span style={{ position: "absolute", top: 3, left: gravity ? 19 : 3, width: 16, height: 16, borderRadius: 99, background: "#fff", transition: "left .2s" }} />
                        </span>
                    </button>
                </div>
            ) : null}

            {mounted && openFolder !== null && extras[openFolder]
                ? createPortal(
                      <Window
                          p={{ label: extras[openFolder].label } as any}
                          origin={folderOrigin}
                          accent={accent}
                          isPhone={isPhone || (typeof window !== "undefined" && window.innerWidth < 720)}
                          active={openIdx === null}
                          folder={{
                              items: membersOf(extras[openFolder].label).map((m) => m.p),
                              folderColor,
                              onPick: (i, el) => {
                                  const m = membersOf(extras[openFolder].label)[i]
                                  const r = el.getBoundingClientRect()
                                  setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
                                  setOpenIdx(m.i)
                              },
                          }}
                          onClose={() => setOpenFolder(null)}
                      />,
                      document.body
                  )
                : null}
            {mounted && openProject
                ? createPortal(
                      <Window p={openProject} origin={origin} accent={accent} zBoost={openFolder !== null ? 2 : 0} isPhone={isPhone || (typeof window !== "undefined" && window.innerWidth < 720)} onClose={() => setOpenIdx(null)} />,
                      document.body
                  )
                : null}
        </div>
    )
}

WorkDesktop.defaultProps = {
    projects: [],
    extras: [],
    title: "MARTALU WORK ARCHIVE©",
    word: "WORK",
    showWord: true,
    ctaLabel: "Contact",
    hint: "Drag the files · click to open",
    accent: "#0004FA",
    paper: "#ECEBE8",
    ink: "#111111",
    folderColor: "#141414",
    topOffset: 16,
}

addPropertyControls(WorkDesktop, {
    projects: {
        type: ControlType.Array,
        title: "Projects",
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, title: "File name" },
                kind: { type: ControlType.Enum, title: "Icon", options: ["folder", "file"], optionTitles: ["Folder", "File"], defaultValue: "folder" },
                tag: { type: ControlType.String, title: "Tag" },
                brand: { type: ControlType.String, title: "Brand" },
                title: { type: ControlType.String, title: "Title" },
                type: { type: ControlType.String, title: "Type" },
                year: { type: ControlType.String, title: "Year" },
                skills: { type: ControlType.String, title: "Skills" },
                thumb: { type: ControlType.ResponsiveImage, title: "Thumbnail" },
                cover: { type: ControlType.ResponsiveImage, title: "Cover" },
                context: { type: ControlType.String, title: "Context", displayTextArea: true },
                challenge: { type: ControlType.String, title: "Challenge", displayTextArea: true },
                approach: { type: ControlType.String, title: "Approach", displayTextArea: true },
                second: { type: ControlType.String, title: "Approach 2", displayTextArea: true },
                decision: { type: ControlType.String, title: "Key decision", displayTextArea: true },
                takeaway: { type: ControlType.String, title: "Takeaway", displayTextArea: true },
                gallery1: { type: ControlType.ResponsiveImage, title: "Gallery 1" },
                gallery2: { type: ControlType.ResponsiveImage, title: "Gallery 2" },
                link: { type: ControlType.Link, title: "Case study" },
                cta: { type: ControlType.String, title: "Footer text" },
                folder: { type: ControlType.String, title: "In folder(s)", description: "Folder name(s), comma separated. Empty = on the desktop." },
            },
        },
    },
    extras: {
        type: ControlType.Array,
        title: "Folders",
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, title: "Name" },
                tag: { type: ControlType.String, title: "Tag" },
                link: { type: ControlType.Link, title: "Link" },
            },
        },
    },
    title: { type: ControlType.String, title: "Label", defaultValue: "MARTALU WORK ARCHIVE©" },
    word: { type: ControlType.String, title: "Big word", defaultValue: "WORK" },
    showWord: { type: ControlType.Boolean, title: "Show word", defaultValue: true },
    catOpen: { type: ControlType.ResponsiveImage, title: "Cat · open" },
    catHalf: { type: ControlType.ResponsiveImage, title: "Cat · half" },
    catClosed: { type: ControlType.ResponsiveImage, title: "Cat · closed" },
    ctaLabel: { type: ControlType.String, title: "Button", defaultValue: "Contact" },
    ctaLink: { type: ControlType.Link, title: "Button link" },
    hint: { type: ControlType.String, title: "Bottom pill", defaultValue: "Drag the files · click to open" },
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "#0004FA" },
    paper: { type: ControlType.Color, title: "Background", defaultValue: "#ECEBE8" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "#111111" },
    folderColor: { type: ControlType.Color, title: "Folder", defaultValue: "#141414" },
    topOffset: { type: ControlType.Number, title: "Top offset", defaultValue: 16, min: 0, max: 200, unit: "px" },
})
