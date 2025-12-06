import React from 'react';
import Container from './Container';
import Nav from './Nav';

interface PageHeaderProps {
    title: string;
    description?: string;
    className?: string;
    showNav?: boolean;
}

const PageHeader = ({ title, description, className = "", showNav = true }: PageHeaderProps) => {
    return (
        <>
            {showNav && <Nav />}
            <div className={`bg-gradient-primary py-16 md:py-24 ${className}`}>
                <Container className="text-center">
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 animate-fade-in">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-lg text-white/80 max-w-2xl mx-auto animate-fade-in animate-delay-100">
                            {description}
                        </p>
                    )}
                </Container>
            </div>
        </>
    );
};

export default PageHeader;
