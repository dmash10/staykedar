/**
 * TransitionLink Component
 * A Link component that uses View Transitions API for smooth page navigation
 */

import React, { useCallback, MouseEvent } from 'react';
import { Link, LinkProps, useNavigate } from 'react-router-dom';
import { supportsViewTransitions } from '@/hooks/useViewTransition';

interface TransitionLinkProps extends LinkProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * A Link component that triggers View Transitions on navigation
 * Falls back to regular Link behavior on unsupported browsers
 */
export function TransitionLink({
    to,
    children,
    className,
    onClick,
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

            // Navigate with View Transition
            (document as any).startViewTransition(() => {
                navigate(to as string);
            });
        },
        [to, navigate, onClick]
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
