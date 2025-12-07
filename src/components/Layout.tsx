/**
 * Layout Component
 * Provides a persistent Nav and Footer across all pages
 * Prevents remounting of Nav during route transitions
 */

import Nav from './Nav';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
    children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <>
            <Nav />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer />
        </>
    );
}
