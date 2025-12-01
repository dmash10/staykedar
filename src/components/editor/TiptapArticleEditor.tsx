import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { ResizableYoutube } from './extensions/ResizableYoutube';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import FontFamily from '@tiptap/extension-font-family';
import {
    Bold, Italic, Strikethrough, Code, Heading2, Heading3,
    List, ListOrdered, Quote, Undo, Redo, Link as LinkIcon, ImageIcon,
    Highlighter, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight,
    AlignJustify, Table as TableIcon, Minus, Video, Palette, FileCode,
    Subscript as SubscriptIcon, Superscript as SuperscriptIcon,
    ArrowUpDown, PlusSquare, Info, AlertTriangle, Lightbulb, CloudSun, Map,
    CheckCircle, XCircle, FileText, AlertOctagon, Quote as QuoteIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import './TiptapEditor.css';

import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import python from 'highlight.js/lib/languages/python';

import { LineHeight } from './extensions/LineHeight';
import { ResizableImage } from './extensions/ResizableImage';
import { CustomCard } from './extensions/CustomCard';
import { AIArticleChatAssistant } from './plugins/AIArticleChatAssistant';

const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('json', json);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('python', python);

interface TiptapArticleEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    onAIMetadataGenerated?: (metadata: { title: string; slug: string; excerpt: string }) => void;
    categoryName?: string;
}

export default function TiptapArticleEditor({ content, onChange, placeholder, onAIMetadataGenerated, categoryName }: TiptapArticleEditorProps) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [currentColor, setCurrentColor] = useState('#000000');
    const [showLineHeight, setShowLineHeight] = useState(false);
    const [showCardMenu, setShowCardMenu] = useState(false);

    // 85+ color palette
    const presetColors = [
        '#FF0000', '#DC143C', '#C71585', '#FF1493', '#FF69B4',
        '#FFB6C1', '#FFC0CB', '#DB7093', '#B22222', '#8B0000',
        '#FF4500', '#FF6347', '#FF7F50', '#FFA500', '#FF8C00',
        '#FFD700', '#FFFFE0', '#FFA07A', '#FA8072', '#E9967A',
        '#FFFF00', '#FFFFE0', '#FFFACD', '#FAFAD2', '#FFE4B5',
        '#FFDAB9', '#EEE8AA', '#F0E68C', '#BDB76B', '#FFDAB9',
        '#00FF00', '#7FFF00', '#7CFC00', '#ADFF2F', '#00FF7F',
        '#00FA9A', '#90EE90', '#98FB98', '#8FBC8F', '#3CB371',
        '#2E8B57', '#228B22', '#008000', '#006400', '#9ACD32',
        '#0000FF', '#0000CD', '#00008B', '#000080', '#191970',
        '#4169E1', '#4682B4', '#1E90FF', '#00BFFF', '#87CEEB',
        '#87CEFA', '#6495ED', '#B0C4DE', '#ADD8E6', '#B0E0E6',
        '#800080', '#8B008B', '#9400D3', '#9932CC', '#BA55D3',
        '#DA70D6', '#EE82EE', '#DDA0DD', '#D8BFD8', '#E6E6FA',
        '#A52A2A', '#8B4513', '#D2691E', '#CD853F', '#F4A460',
        '#DEB887', '#D2B48C', '#BC8F8F', '#FFE4C4', '#FFDEAD',
        '#000000', '#696969', '#808080', '#A9A9A9', '#C0C0C0',
        '#D3D3D3', '#DCDCDC', '#F5F5F5', '#FFFFFF'
    ];

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                codeBlock: false,
            }),
            CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'javascript' }),
            Placeholder.configure({ placeholder: placeholder || 'Start writing...' }),
            Link.configure({ openOnClick: false }),
            ResizableImage, // Replaces default Image
            Highlight.configure({ multicolor: true }),
            TextStyle,
            Color,
            FontFamily,
            LineHeight,
            CustomCard,
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
            Subscript,
            Superscript,
            ResizableYoutube,
        ],
        editorProps: {},
        content,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    useEffect(() => {
        if (!editor) return;

        editor.setOptions({
            editorProps: {
                handlePaste: (view, event, slice) => {
                    const text = event.clipboardData?.getData('text/plain');
                    if (!text) return false;

                    // Check if text contains any of our special card markers (permissive check)
                    const hasSpecialCard = /\[!(INFO|WARNING|TIP|WEATHER|ROUTE)\]/i.test(text);
                    if (!hasSpecialCard) return false;

                    // Robust Line-by-Line Parser
                    const lines = text.split('\n');
                    let htmlOutput = '';
                    let currentCardType = null;
                    let currentCardContent: string[] = [];

                    const flushCard = () => {
                        if (currentCardType && currentCardContent.length > 0) {
                            const contentHtml = currentCardContent.join('<br>');
                            htmlOutput += `<div data-type="custom-card" type="${currentCardType}"><p>${contentHtml}</p></div>`;
                            currentCardType = null;
                            currentCardContent = [];
                        }
                    };

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();

                        // Check for Card Start: Matches [!TYPE] with any leading characters (>, *, -, spaces, etc.)
                        // This handles "> [!INFO]", "* [!INFO]", "[!INFO]", etc.
                        const cardMatch = line.match(/^[^a-zA-Z0-9]*\[!(INFO|WARNING|TIP|WEATHER|ROUTE)\](.*)/i);

                        if (cardMatch) {
                            // If we were already building a card, flush it
                            flushCard();

                            // Start new card
                            currentCardType = cardMatch[1].toLowerCase();
                            // If there's content on the same line after the marker, add it
                            if (cardMatch[2] && cardMatch[2].trim()) {
                                currentCardContent.push(cardMatch[2].trim());
                            }
                        } else if (currentCardType) {
                            // Inside a card
                            if (line === '' && currentCardContent.length > 0) {
                                // Empty line ends the card
                                flushCard();
                            } else {
                                // Add line to current card, removing common markdown prefixes like >
                                currentCardContent.push(line.replace(/^>\s*/, ''));
                            }
                        } else {
                            // Regular text
                            if (line === '') {
                                htmlOutput += '<p><br></p>';
                            } else {
                                htmlOutput += `<p>${line}</p>`;
                            }
                        }
                    }

                    // Flush any remaining card
                    flushCard();

                    if (htmlOutput) {
                        editor.commands.insertContent(htmlOutput);
                        return true; // Handled
                    }
                    return false;
                }
            }
        });
    }, [editor]);

    if (!editor) return null;

    const addLink = () => {
        const url = window.prompt('Enter URL:');
        if (url) editor.chain().focus().setLink({ href: url }).run();
    };

    const addImage = () => {
        const url = window.prompt('Enter Image URL:');
        if (url) editor.chain().focus().setImage({ src: url }).run();
    };

    const addYoutubeVideo = () => {
        const url = window.prompt('Enter YouTube URL:');
        if (url) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }
    };

    const setCodeBlock = () => {
        const lang = window.prompt('Language (javascript/json/html/css/python):');
        if (lang) editor.chain().focus().setCodeBlock({ language: lang }).run();
    };

    const applyColor = (color: string) => {
        editor.chain().focus().setColor(color).run();
        setCurrentColor(color);
        setShowColorPicker(false);
    };

    const addCustomCard = (type: string) => {
        editor.chain().focus().insertContent(`<div data-type="custom-card" type="${type}"><p>Content here...</p></div>`).run();
        setShowCardMenu(false);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 p-3 border-b border-gray-200 bg-gray-50">
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-gray-200' : ''}>
                    <Bold className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-gray-200' : ''}>
                    <Italic className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'bg-gray-200' : ''}>
                    <UnderlineIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-gray-200' : ''}>
                    <Strikethrough className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'bg-gray-200' : ''}>
                    <Code className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleSubscript().run()} className={editor.isActive('subscript') ? 'bg-gray-200' : ''}>
                    <SubscriptIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleSuperscript().run()} className={editor.isActive('superscript') ? 'bg-gray-200' : ''}>
                    <SuperscriptIcon className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Color Picker */}
                <div className="relative">
                    <Button variant="ghost" size="sm" onClick={() => setShowColorPicker(!showColorPicker)}>
                        <Palette className="w-4 h-4" />
                    </Button>
                    {showColorPicker && (
                        <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64">
                            <div className="grid grid-cols-10 gap-1">
                                {presetColors.map(color => (
                                    <button
                                        key={color}
                                        className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                        onClick={() => applyColor(color)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Line Height */}
                <div className="relative">
                    <Button variant="ghost" size="sm" onClick={() => setShowLineHeight(!showLineHeight)}>
                        <ArrowUpDown className="w-4 h-4" />
                    </Button>
                    {showLineHeight && (
                        <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
                            {['1', '1.15', '1.5', '2', '2.5', '3'].map(height => (
                                <button key={height} className="block w-full text-left px-3 py-1.5 hover:bg-gray-100 rounded" onClick={() => { editor.chain().focus().setLineHeight(height).run(); setShowLineHeight(false); }}>
                                    {height}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Custom Cards */}
                <div className="relative">
                    <Button variant="ghost" size="sm" onClick={() => setShowCardMenu(!showCardMenu)}>
                        <PlusSquare className="w-4 h-4" />
                    </Button>
                    {showCardMenu && (
                        <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[150px]">
                            <button className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-blue-50 rounded" onClick={() => addCustomCard('info')}>
                                <Info className="w-4 h-4 text-blue-600" /> Info
                            </button>
                            <button className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-amber-50 rounded" onClick={() => addCustomCard('warning')}>
                                <AlertTriangle className="w-4 h-4 text-amber-600" /> Warning
                            </button>
                            <button className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-green-50 rounded" onClick={() => addCustomCard('tip')}>
                                <Lightbulb className="w-4 h-4 text-green-600" /> Tip
                            </button>
                            <button className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-emerald-50 rounded" onClick={() => addCustomCard('success')}>
                                <CheckCircle className="w-4 h-4 text-emerald-600" /> Success
                            </button>
                            <button className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-red-50 rounded" onClick={() => addCustomCard('error')}>
                                <XCircle className="w-4 h-4 text-red-600" /> Error
                            </button>
                            <button className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-50 rounded" onClick={() => addCustomCard('note')}>
                                <FileText className="w-4 h-4 text-gray-600" /> Note
                            </button>
                            <button className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-rose-50 rounded" onClick={() => addCustomCard('danger')}>
                                <AlertOctagon className="w-4 h-4 text-rose-600" /> Danger
                            </button>
                            <button className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-purple-50 rounded" onClick={() => addCustomCard('quote')}>
                                <QuoteIcon className="w-4 h-4 text-purple-600" /> Quote
                            </button>
                            <div className="border-t my-1" />
                            <button className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-sky-50 rounded" onClick={() => addCustomCard('weather')}>
                                <CloudSun className="w-4 h-4 text-sky-600" /> Weather
                            </button>
                            <button className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-indigo-50 rounded" onClick={() => addCustomCard('route')}>
                                <Map className="w-4 h-4 text-indigo-600" /> Route
                            </button>
                        </div>
                    )}
                </div>

                <Button variant="ghost" size="sm" onClick={setCodeBlock}>
                    <FileCode className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}>
                    <Heading2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}>
                    <Heading3 className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('left').run()}>
                    <AlignLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('center').run()}>
                    <AlignCenter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('right').run()}>
                    <AlignRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
                    <AlignJustify className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}>
                    <List className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}>
                    <ListOrdered className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}>
                    <Quote className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <Button variant="ghost" size="sm" onClick={addLink}>
                    <LinkIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={addImage}>
                    <ImageIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={addYoutubeVideo}>
                    <Video className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                    <TableIcon className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive('highlight') ? 'bg-gray-200' : ''}>
                    <Highlighter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                    <Minus className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()}>
                    <Undo className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()}>
                    <Redo className="w-4 h-4" />
                </Button>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} className="flex-1 overflow-y-auto p-4" />

            {/* AI Assistant */}
            <AIArticleChatAssistant
                editor={editor}
                onMetadataGenerated={onAIMetadataGenerated}
                categoryName={categoryName}
            />
        </div>
    );
}
