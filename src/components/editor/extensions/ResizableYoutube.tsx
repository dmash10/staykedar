import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        resizableYoutube: {
            setYoutubeVideo: (options: { src: string; width?: number; height?: number }) => ReturnType;
        };
    }
}

const ResizableYoutubeComponent = (props: any) => {
    const { node, updateAttributes } = props;

    // Extract video ID from various YouTube URL formats
    const getVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    };

    const videoId = getVideoId(node.attrs.src);
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return (
        <NodeViewWrapper className="resizable-youtube-wrapper" style={{ display: 'inline-block', lineHeight: '0', margin: '1rem 0' }}>
            <ResizableBox
                width={node.attrs.width || 640}
                height={node.attrs.height || 360}
                lockAspectRatio={true}
                onResize={(e, { size }) => {
                    updateAttributes({ width: size.width, height: size.height });
                }}
                minConstraints={[320, 180]}
                maxConstraints={[1280, 720]}
                resizeHandles={['se', 'sw', 'ne', 'nw']}
                className="relative group"
            >
                <iframe
                    src={embedUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                />
            </ResizableBox>
        </NodeViewWrapper>
    );
};

export const ResizableYoutube = Node.create({
    name: 'resizableYoutube',
    group: 'block',
    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            width: {
                default: 640,
            },
            height: {
                default: 360,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'iframe[src*="youtube.com"]',
            },
            {
                tag: 'iframe[src*="youtu.be"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['iframe', mergeAttributes(HTMLAttributes, {
            frameborder: '0',
            allowfullscreen: 'true',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableYoutubeComponent);
    },

    addCommands() {
        return {
            setYoutubeVideo:
                (options: { src: string; width?: number; height?: number }) =>
                    ({ commands }: any) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: {
                                src: options.src,
                                width: options.width || 640,
                                height: options.height || 360,
                            },
                        });
                    },
        };
    },
});
