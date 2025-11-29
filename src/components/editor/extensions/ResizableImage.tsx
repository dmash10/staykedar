import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

const ResizableImageComponent = (props: any) => {
    const { node, updateAttributes } = props;

    return (
        <NodeViewWrapper className="resizable-image-wrapper" style={{ display: 'inline-block', lineHeight: '0' }}>
            <ResizableBox
                width={node.attrs.width || 400}
                height={node.attrs.height || 300}
                lockAspectRatio={true}
                onResize={(e, { size }) => {
                    updateAttributes({ width: size.width, height: size.height });
                }}
                minConstraints={[100, 100]}
                maxConstraints={[1000, 1000]}
                resizeHandles={['se', 'sw', 'ne', 'nw']}
                className="relative group"
            >
                <img
                    src={node.attrs.src}
                    alt={node.attrs.alt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    className="rounded-lg shadow-sm"
                />
            </ResizableBox>
        </NodeViewWrapper>
    );
};

export const ResizableImage = Node.create({
    name: 'resizableImage',
    group: 'block',
    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            alt: {
                default: null,
            },
            width: {
                default: 400,
            },
            height: {
                default: 300,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'img[src]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['img', mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageComponent);
    },

    addCommands() {
        return {
            setImage:
                (options: { src: string; alt?: string; width?: number; height?: number }) =>
                    ({ commands }: any) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: {
                                src: options.src,
                                alt: options.alt || '',
                                width: options.width || 400,
                                height: options.height || 300,
                            },
                        });
                    },
        };
    },
});
