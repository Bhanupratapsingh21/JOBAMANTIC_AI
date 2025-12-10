import { ReactNode } from 'react';

interface SectionProps {
    title: string;
    children: ReactNode;
    modern?: boolean;
    classic?: boolean;
}

export const Section = ({ title, children, modern, classic }: SectionProps) => {
    if (modern) {
        return (
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
                {children}
            </div>
        );
    }

    if (classic) {
        return (
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase tracking-wider border-b border-gray-800 pb-1 mb-3">
                    {title}
                </h2>
                {children}
            </div>
        );
    }

    return (
        <div className="mb-6">
            <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-3">{title}</h2>
            {children}
        </div>
    );
};