import * as React from "react"
import { useEffect, useState } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

const FONT = `"Inter", "Inter Placeholder", system-ui, sans-serif`

type Item = { label: string; short?: string; href: string }

/**
 * Floating dock menu, centred at the bottom of the viewport.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function FloatingNav(props: any) {
    const { items, accent, ink, paper, bottom, style } = props
    const list: Item[] = items && items.length ? items : FloatingNav.defaultProps.items
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const [path, setPath] = useState("")
    const [narrow, setNarrow] = useState(false)
    const [shown, setShown] = useState(false)

    useEffect(() => {
        setPath(window.location.pathname.toLowerCase().replace(/\/+$/, "") || "/")
        const onR = () => setNarrow(window.innerWidth < 560)
        onR()
        window.addEventListener("resize", onR)
        const t = window.setTimeout(() => setShown(true), 80)
        return () => {
            window.removeEventListener("resize", onR)
            window.clearTimeout(t)
        }
    }, [])

    const isActive = (href: string) => {
        const h = href.toLowerCase().replace(/\/+$/, "") || "/"
        if (h === "/") return path === "/"
        return path === h || path.startsWith(h + "/")
    }

    const nav = (
        <nav
            aria-label="Main"
            style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                padding: 5,
                borderRadius: 999,
                background: `color-mix(in srgb, ${paper} 85%, transparent)`,
                backdropFilter: "blur(14px) saturate(1.4)",
                WebkitBackdropFilter: "blur(14px) saturate(1.4)",
                boxShadow: "0 10px 30px -10px rgba(0,0,0,.25), 0 0 0 1px rgba(0,0,0,.06)",
                pointerEvents: "auto",
                whiteSpace: "nowrap",
            }}
        >
            {list.map((it, i) => {
                const on = isActive(it.href)
                return (
                    <a
                        key={i}
                        href={it.href}
                        aria-current={on ? "page" : undefined}
                        style={{
                            display: "block",
                            padding: narrow ? "10px 12px" : "10px 16px",
                            borderRadius: 999,
                            font: `600 ${narrow ? 11 : 12}px/1 ${FONT}`,
                            letterSpacing: ".06em",
                            textTransform: "uppercase",
                            textDecoration: "none",
                            color: on ? "#fff" : ink,
                            background: on ? accent : "transparent",
                            transition: "background .2s, color .2s",
                        }}
                        onMouseEnter={(e) => {
                            if (!on) e.currentTarget.style.background = "rgba(0,0,0,.06)"
                        }}
                        onMouseLeave={(e) => {
                            if (!on) e.currentTarget.style.background = "transparent"
                        }}
                    >
                        {narrow && it.short ? it.short : it.label}
                    </a>
                )
            })}
        </nav>
    )

    if (isCanvas) {
        return <div style={{ ...style, display: "flex", justifyContent: "center" }}>{nav}</div>
    }

    return (
        <div
            style={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: `calc(${bottom}px + env(safe-area-inset-bottom, 0px))`,
                display: "flex",
                justifyContent: "center",
                zIndex: 1000,
                pointerEvents: "none",
                transform: shown ? "translateY(0)" : "translateY(140%)",
                opacity: shown ? 1 : 0,
                transition: "transform .6s cubic-bezier(.2,.9,.3,1.15), opacity .3s",
            }}
        >
            {nav}
        </div>
    )
}

FloatingNav.defaultProps = {
    items: [
        { label: "Work", short: "Work", href: "/work" },
        { label: "Playground", short: "Play", href: "/Playground" },
        { label: "Resources", short: "Resources", href: "/resources" },
        { label: "Something about me", short: "About", href: "/contact" },
    ],
    accent: "#0004FA",
    ink: "#111111",
    paper: "#FFFFFF",
    bottom: 20,
}

addPropertyControls(FloatingNav, {
    items: {
        type: ControlType.Array,
        title: "Links",
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, title: "Label" },
                short: { type: ControlType.String, title: "Phone label" },
                href: { type: ControlType.String, title: "Path" },
            },
        },
    },
    accent: { type: ControlType.Color, title: "Active", defaultValue: "#0004FA" },
    ink: { type: ControlType.Color, title: "Text", defaultValue: "#111111" },
    paper: { type: ControlType.Color, title: "Background", defaultValue: "#FFFFFF" },
    bottom: { type: ControlType.Number, title: "Bottom", defaultValue: 20, min: 0, max: 120 },
})
