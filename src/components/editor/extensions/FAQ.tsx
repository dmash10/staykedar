import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const FAQComponent = ({ node, updateAttributes }: any) => {
    const { question, answer, isOpen } = node.attrs;
    const [localOpen, setLocalOpen] = useState(isOpen || false);

    const toggleOpen = () => {
        const newState = !localOpen;
        setLocalOpen(newState);
        updateAttributes({ isOpen: newState });
    };

    return (
        <NodeViewWrapper className="faq-item my-4 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <div
                className="faq-question flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                onClick={toggleOpen}
                contentEditable={false}
            >
                <div className="flex items-center gap-3 flex-1">
                    <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <NodeViewContent
                        className="faq-question-content font-semibold text-gray-900"
                        as="div"
                        data-placeholder="Enter question..."
                    />
                </div>
                {localOpen ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
            </div>
            {localOpen && (
                <div className="faq-answer p-4 bg-white border-t border-gray-100">
                    <NodeViewContent
                        className="faq-answer-content text-gray-700 prose prose-sm max-w-none"
                        as="div"
                        data-placeholder="Enter answer..."
                    />
                </div>
            )}
        </NodeViewWrapper>
    );
};

export const FAQ = Node.create({
    name: 'faq',
    group: 'block',
    content: 'block+',
    draggable: true,

    addAttributes() {
        return {
            question: {
                default: '',
            },
            answer: {
                default: '',
            },
            isOpen: {
                default: false,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="faq"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'faq' }), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(FAQComponent);
    },
});
