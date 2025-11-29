import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Info, AlertTriangle, Lightbulb, CloudSun, Map } from 'lucide-react';

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
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="custom-card"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'custom-card' }), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(CustomCardComponent);
    },
});
