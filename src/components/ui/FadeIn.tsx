import { motion, useInView, useAnimation } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'

interface FadeInProps {
    children: ReactNode
    delay?: number
    direction?: 'up' | 'down' | 'left' | 'right' | 'none'
    fullWidth?: boolean
    className?: string
}

const FadeIn = ({ children, delay = 0, direction = 'up', fullWidth = false, className = '' }: FadeInProps) => {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-10% 0px' })
    const controls = useAnimation()

    useEffect(() => {
        if (isInView) {
            controls.start('visible')
        }
    }, [isInView, controls])

    const getDirectionOffset = () => {
        switch (direction) {
            case 'up': return { y: 40, x: 0 }
            case 'down': return { y: -40, x: 0 }
            case 'left': return { x: 40, y: 0 }
            case 'right': return { x: -40, y: 0 }
            default: return { x: 0, y: 0 }
        }
    }

    const { x, y } = getDirectionOffset()

    return (
        <div ref={ref} className={`${fullWidth ? 'w-full' : ''} ${className}`}>
            <motion.div
                initial={{ opacity: 0, x, y }}
                animate={controls}
                transition={{
                    duration: 0.7,
                    delay: delay,
                    ease: [0.21, 0.47, 0.32, 0.98]
                }}
                variants={{
                    visible: { opacity: 1, x: 0, y: 0 }
                }}
                className={fullWidth ? 'w-full' : ''}
            >
                {children}
            </motion.div>
        </div>
    )
}

export default FadeIn
