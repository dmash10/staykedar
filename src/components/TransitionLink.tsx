/**
 * TransitionLink Component
 * A Link component that uses View Transitions API for smooth page navigation
 */

import React, { useCallback, MouseEvent } from 'react';
import { Link, LinkProps, useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { supportsViewTransitions } from '@/hooks/useViewTransition';

export type TransitionStyle = 'slide' | 'blur' | 'scale' | 'slide-left';

interface TransitionLinkProps extends LinkProps {
    children: React.ReactNode;
    className?: string;
    /** Animation style: 'slide' (default), 'blur', 'scale', or 'slide-left' */
    transitionStyle?: TransitionStyle;
}

const styleClassMap: Record<TransitionStyle, string> = {
    slide: '', // default animation, no extra class needed
    blur: 'vt-blur',
    scale: 'vt-scale',
    'slide-left': 'vt-slide-left',
};

/**
 * A Link component that triggers View Transitions on navigation
 * Falls back to regular Link behavior on unsupported browsers
 */
export function TransitionLink({
    to,
    children,
    className,
    onClick,
    transitionStyle = 'blur', // Default to blur for better visual effect
    ...props
}: TransitionLinkProps) {
    const navigate = useNavigate();

    const handleClick = useCallback(
        (e: MouseEvent<HTMLAnchorElement>) => {
            // Call original onClick if provided
            onClick?.(e);

            // If default was prevented or not a left click, let Link handle it
            if (e.defaultPrevented || e.button !== 0) return;

            // If View Transitions not supported, let Link handle normally
            if (!supportsViewTransitions()) return;

            // Prevent default Link behavior
            e.preventDefault();

            // Add transition style class
            const styleClass = styleClassMap[transitionStyle];
            if (styleClass) {
                document.documentElement.classList.add(styleClass);
            }

            // Navigate with View Transition
            const transition = (document as any).startViewTransition(() => {
                flushSync(() => {
                    navigate(to as string);
                });
            });

            // Clean up class after transition completes
            transition.finished.then(() => {
                if (styleClass) {
                    document.documentElement.classList.remove(styleClass);
                }
            }).catch(() => {
                // Cleanup even if transition fails
                if (styleClass) {
                    document.documentElement.classList.remove(styleClass);
                }
            });
        },
        [to, navigate, onClick, transitionStyle]
    );

    return (
        <Link
            to={to}
            className={className}
            onClick={handleClick}
            {...props}
        >
            {children}
        </Link>
    );
}

export default TransitionLink;
