'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

const pageVariants = {
    initial: {
        opacity: 0,
        y: 30,
        scale: 0.96
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // Custom easing for smooth feel
            staggerChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        y: -30,
        scale: 0.96,
        transition: {
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
        }
    }
};

export const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// Stagger children animation for lists and grids
export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

export const fadeInUp = {
    initial: {
        opacity: 0,
        y: 20
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
        }
    }
};

export const fadeIn = {
    initial: {
        opacity: 0
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.3
        }
    }
};

export const scaleIn = {
    initial: {
        opacity: 0,
        scale: 0.9
    },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
        }
    }
};

export const slideInFromRight = {
    initial: {
        opacity: 0,
        x: 50
    },
    animate: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
        }
    }
};

export const slideInFromLeft = {
    initial: {
        opacity: 0,
        x: -50
    },
    animate: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
        }
    }
};
