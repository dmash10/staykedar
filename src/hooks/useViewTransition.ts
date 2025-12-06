/**
 * useViewTransition Hook
 * Wraps navigation with View Transitions API for smooth page changes
 */

import { useCallback } from 'react';
import { useNavigate, NavigateOptions } from 'react-router-dom';

// Check if View Transitions API is supported
export const supportsViewTransitions = () => {
    return 'startViewTransition' in document;
};

/**
 * Hook that provides navigation with View Transitions
 * Falls back to regular navigation on unsupported browsers
 */
export function useViewTransition() {
    const navigate = useNavigate();

    const navigateWithTransition = useCallback(
        (to: string, options?: NavigateOptions) => {
            // If View Transitions not supported, use regular navigation
            if (!supportsViewTransitions()) {
                navigate(to, options);
                return;
            }

            // Use View Transitions API
            (document as any).startViewTransition(() => {
                navigate(to, options);
            });
        },
        [navigate]
    );

    return {
        navigate: navigateWithTransition,
        isSupported: supportsViewTransitions()
    };
}

/**
 * Trigger a view transition for DOM updates (not navigation)
 * Useful for tab changes, accordions, modals, etc.
 */
export function startTransition(callback: () => void): void {
    if (supportsViewTransitions()) {
        (document as any).startViewTransition(callback);
    } else {
        callback();
    }
}

/**
 * Async version that returns a promise
 */
export async function startTransitionAsync(callback: () => void | Promise<void>): Promise<void> {
    if (supportsViewTransitions()) {
        const transition = (document as any).startViewTransition(async () => {
            await callback();
        });
        await transition.finished;
    } else {
        await callback();
    }
}

export default useViewTransition;
