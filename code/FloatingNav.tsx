import * as React from "react"
import { useEffect, useState } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

const SMILE = "M 11.997 27.993 L 7.998 27.993 C 7.998 39.037 16.95 47.989 27.993 47.989 C 39.036 47.989 47.988 39.037 47.988 27.993 L 43.989 27.993 C 43.989 36.828 36.828 43.99 27.993 43.99 C 19.158 43.99 11.997 36.828 11.997 27.993 Z M 22.241 20.202 L 26.241 20.202 C 26.241 16.547 23.278 13.585 19.623 13.585 C 15.969 13.585 13.006 16.547 13.006 20.202 L 17.005 20.202 C 17.005 18.756 18.178 17.584 19.623 17.584 C 21.069 17.584 22.241 18.756 22.241 20.202 Z M 38.404 20.202 L 42.403 20.202 C 42.403 16.547 39.441 13.585 35.786 13.585 C 32.132 13.585 29.169 16.547 29.169 20.202 L 33.168 20.202 C 33.168 18.756 34.34 17.584 35.786 17.584 C 37.232 17.584 38.404 18.756 38.404 20.202 Z M 3.999 27.994 C 3.999 14.742 14.742 3.999 27.994 3.999 C 41.245 3.999 51.988 14.742 51.988 27.994 C 51.988 41.245 41.245 51.988 27.994 51.988 C 14.742 51.988 3.999 41.245 3.999 27.994 Z M 27.994 55.987 C 43.454 55.987 55.987 43.454 55.987 27.994 C 55.987 12.533 43.454 0 27.994 0 C 12.533 0 0 12.533 0 27.994 C 0 43.454 12.533 55.987 27.994 55.987 Z"
const FONT = `"Inter", "Inter Placeholder", system-ui, sans-serif`

type Item = { label: string; short?: string; href: string }

/**
 * Floating dock menu, centred at the bottom of the viewport.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function FloatingNav(props: any) {
    const { items, accent, ink, paper, bottom, showLogo, style } = props
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
            {showLogo ? (
                <a
                    href="/"
                    aria-label="Home"
                    className="fnav-logo"
                    style={{ display: "grid", placeItems: "center", width: narrow ? 36 : 38, height: narrow ? 36 : 38, borderRadius: 999, marginRight: 4, background: path === "/" ? "rgba(0,0,0,.06)" : "transparent" }}
                >
                    <svg width={narrow ? 26 : 28} height={narrow ? 26 : 28} viewBox="0 0 56 56" aria-hidden style={{ display: "block", transition: "transform .35s cubic-bezier(.2,.9,.3,1.4)" }}>
                        <path d={SMILE} fill={accent} />
                    </svg>
                </a>
            ) : null}
            <style>{`.fnav-logo:hover svg { transform: rotate(-14deg) scale(1.08) }`}</style>
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
    showLogo: true,
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
    showLogo: { type: ControlType.Boolean, title: "Smiley", defaultValue: true },
})
