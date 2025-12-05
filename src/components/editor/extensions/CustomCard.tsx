import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Info, AlertTriangle, Lightbulb, CloudSun, Map, CheckCircle, XCircle, FileText, AlertOctagon, Quote as QuoteIcon } from 'lucide-react';

const CustomCardComponent = ({ node }: any) => {
    const { type } = node.attrs;

    const getCardConfig = (type: string) => {
        switch (type) {
            case 'info':
                return {
                    icon: <Info className="w-5 h-5 text-blue-600" />,
                    title: 'Information',
                    borderColor: 'border-blue-500',
                    bgColor: 'bg-blue-50',
                    textColor: 'text-blue-900',
                };
            case 'warning':
                return {
                    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
                    title: 'Warning',
                    borderColor: 'border-amber-500',
                    bgColor: 'bg-amber-50',
                    textColor: 'text-amber-900',
                };
            case 'tip':
                return {
                    icon: <Lightbulb className="w-5 h-5 text-green-600" />,
                    title: 'Pro Tip',
                    borderColor: 'border-green-500',
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-900',
                };
            case 'weather':
                return {
                    icon: <CloudSun className="w-5 h-5 text-sky-600" />,
                    title: 'Weather Update',
                    borderColor: 'border-sky-500',
                    bgColor: 'bg-sky-50',
                    textColor: 'text-sky-900',
                };
            case 'route':
                return {
                    icon: <Map className="w-5 h-5 text-indigo-600" />,
                    title: 'Route Details',
                    borderColor: 'border-indigo-500',
                    bgColor: 'bg-indigo-50',
                    textColor: 'text-indigo-900',
                };
            case 'success':
                return {
                    icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
                    title: 'Success',
                    borderColor: 'border-emerald-500',
                    bgColor: 'bg-emerald-50',
                    textColor: 'text-emerald-900',
                };
            case 'error':
                return {
                    icon: <XCircle className="w-5 h-5 text-red-600" />,
                    title: 'Error',
                    borderColor: 'border-red-500',
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-900',
                };
            case 'note':
                return {
                    icon: <FileText className="w-5 h-5 text-gray-600" />,
                    title: 'Note',
                    borderColor: 'border-gray-400',
                    bgColor: 'bg-gray-50',
                    textColor: 'text-gray-900',
                };
            case 'danger':
                return {
                    icon: <AlertOctagon className="w-5 h-5 text-rose-600" />,
                    title: 'Danger',
                    borderColor: 'border-rose-500',
                    bgColor: 'bg-rose-50',
                    textColor: 'text-rose-900',
                };
            case 'quote':
                return {
                    icon: <QuoteIcon className="w-5 h-5 text-purple-600" />,
                    title: 'Quote',
                    borderColor: 'border-purple-500',
                    bgColor: 'bg-purple-50',
                    textColor: 'text-purple-900',
                };
            default:
                return {
                    icon: <Info className="w-5 h-5" />,
                    title: 'Note',
                    borderColor: 'border-gray-500',
                    bgColor: 'bg-gray-50',
                    textColor: 'text-gray-900',
                };
        }
    };

    const config = getCardConfig(type);

    return (
        <NodeViewWrapper className={`custom-card my-4 border-l-4 rounded-r-lg p-4 shadow-sm ${config.borderColor} ${config.bgColor}`}>
            <div className="flex items-center gap-2 mb-2 font-semibold select-none" contentEditable={false}>
                {config.icon}
                <span className={config.textColor}>{config.title}</span>
            </div>
            <NodeViewContent className="prose prose-sm max-w-none" />
        </NodeViewWrapper>
    );
};

export const CustomCard = Node.create({
    name: 'customCard',
    group: 'block',
    content: 'block+',
    draggable: true,

    addAttributes() {
        return {
            type: {
                default: 'info',
                // Parse from multiple possible attributes for backwards compatibility
                parseHTML: (element) => {
                    // Try multiple attribute names
                    let cardType = element.getAttribute('type') || 
                                   element.getAttribute('data-card-type') ||
                                   element.getAttribute('card-type');
                    
                    // Clean the value (remove quotes, whitespace)
                    if (cardType) {
                        cardType = cardType.replace(/['"]/g, '').trim().toLowerCase();
                    }
                    
                    // Validate against known types
                    const validTypes = ['info', 'warning', 'tip', 'weather', 'route', 'success', 'error', 'note', 'danger', 'quote'];
                    if (cardType && validTypes.includes(cardType)) {
                        return cardType;
                    }
                    
                    // Fallback: try to detect from content or class
                    const content = element.textContent?.toLowerCase() || '';
                    if (content.includes('pro tip') || content.includes('💡')) return 'tip';
                    if (content.includes('warning') || content.includes('⚠️')) return 'warning';
                    if (content.includes('route') || content.includes('🗺️')) return 'route';
                    if (content.includes('weather') || content.includes('⛅')) return 'weather';
                    
                    return 'info';
                },
                renderHTML: (attributes) => {
                    // Output both 'type' (for CSS styling) and 'data-card-type' (for compatibility)
                    return {
                        'type': attributes.type,
                        'data-card-type': attributes.type,
                    }
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                // Match div with data-type="custom-card" attribute
                tag: 'div[data-type="custom-card"]',
            },
            {
                // Also match older format with just data-card-type
                tag: 'div[data-card-type]',
                getAttrs: (element) => {
                    if (typeof element === 'string') return false;
                    return element.hasAttribute('data-card-type') ? {} : false;
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        // Merge attributes and ensure data-type is set for identification
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'custom-card' }), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(CustomCardComponent);
    },
});
