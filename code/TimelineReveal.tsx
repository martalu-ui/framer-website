import { forwardRef, type ComponentType } from "react"

// Timeline card: slides in from the left and fades up the first time it scrolls into view.
export function withTimelineReveal(Component: ComponentType<any>): ComponentType<any> {
    return forwardRef<any, any>(function TimelineReveal(props, ref) {
        const { style, ...rest } = props
        return (
            <Component
                {...rest}
                ref={ref}
                style={{ ...style }}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
            />
        )
    })
}

// Timeline dot: pops in slightly after its card.
export function withTimelineDot(Component: ComponentType<any>): ComponentType<any> {
    return forwardRef<any, any>(function TimelineDot(props, ref) {
        const { style, ...rest } = props
        return (
            <Component
                {...rest}
                ref={ref}
                style={{ ...style, transformOrigin: "50% 0%" }}
                initial={{ scale: 0.3, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.12 }}
            />
        )
    })
}
