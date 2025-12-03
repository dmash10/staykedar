import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
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
    ArrowUpDown, PlusSquare, Info, AlertTriangle, Lightbulb, CloudSun, Map
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
import { AIBlogChatAssistant } from './plugins/AIBlogChatAssistant';
import { FontSize } from './extensions/FontSize';

const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('json', json);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('python', python);

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    onAIMetadataGenerated?: (metadata: { title: string; slug: string; excerpt: string }) => void;
}

export default function TiptapEditor({ content, onChange, placeholder, onAIMetadataGenerated }: TiptapEditorProps) {
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
            FontSize,
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

    const applyLineHeight = (height: string) => {
        editor.chain().focus().setLineHeight(height).run();
        setShowLineHeight(false);
    };

    const insertCard = (type: string) => {
        editor.chain().focus().insertContent({
            type: 'customCard',
            attrs: { type },
            content: [
                {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Write your content here...' }]
                }
            ]
        }).run();
        setShowCardMenu(false);
    };

    return (
        <div className="border border-[#2a2a2a] rounded-lg overflow-hidden bg-[#0a0a0a]" >
            <div className="flex flex-wrap gap-1 p-2 border-b border-[#2a2a2a] bg-[#111111]">
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive('bold') ? 'bg-[#222222]' : ''}`} title="Bold"><Bold className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive('italic') ? 'bg-[#222222]' : ''}`} title="Italic"><Italic className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive('underline') ? 'bg-[#222222]' : ''}`} title="Underline"><UnderlineIcon className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive('strike') ? 'bg-[#222222]' : ''}`} title="Strike"><Strikethrough className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCode().run()} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive('code') ? 'bg-[#222222]' : ''}`} title="Code"><Code className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleSubscript().run()} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive('subscript') ? 'bg-[#222222]' : ''}`} title="Subscript"><SubscriptIcon className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleSuperscript().run()} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive('superscript') ? 'bg-[#222222]' : ''}`} title="Superscript"><SuperscriptIcon className="h-4 w-4" /></Button>

                <div className="w-px h-6 bg-[#222222] mx-1" />

                <div className="relative">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowColorPicker(!showColorPicker)} className="hover:bg-[#1a1a1a] text-white" title="Color"><Palette className="h-4 w-4" /></Button>
                    {showColorPicker && (
                        <div className="absolute top-full left-0 mt-1 p-3 bg-[#1a1a1a] border-2 border-[#333333] rounded-lg shadow-2xl z-[9999] w-72">
                            <div className="text-xs font-semibold mb-2 text-white">Choose Color:</div>
                            <div className="grid grid-cols-10 gap-1 mb-3 max-h-48 overflow-y-auto p-1">
                                {presetColors.map((c) => (
                                    <button key={c} type="button" className="w-6 h-6 rounded border-2 border-[#333333] hover:scale-125 transition-all" style={{ backgroundColor: c }} onClick={() => applyColor(c)} title={c} />
                                ))}
                            </div>
                            <div className="border-t border-[#333333] pt-2">
                                <div className="text-xs font-semibold mb-1 text-white">Custom:</div>
                                <input type="color" value={currentColor} onChange={(e) => applyColor(e.target.value)} className="w-full h-10 cursor-pointer rounded border border-[#333333] bg-[#2a2a2a]" />
                            </div>
                            <button type="button" onClick={() => setShowColorPicker(false)} className="mt-2 w-full text-xs bg-[#2a2a2a] hover:bg-[#222222] text-white py-1 rounded">Close</button>
                        </div>
                    )}
                </div>

                <div className="w-px h-6 bg-[#222222] mx-1" />

                <div className="relative">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowLineHeight(!showLineHeight)} className="hover:bg-[#1a1a1a] text-white" title="Line Height"><ArrowUpDown className="h-4 w-4" /></Button>
                    {showLineHeight && (
                        <div className="absolute top-full left-0 mt-1 p-2 bg-[#1a1a1a] border border-[#333333] rounded-lg shadow-xl z-[9999] w-32 flex flex-col gap-1">
                            <div className="text-xs font-semibold mb-1 px-1 text-white">Line Height:</div>
                            {['1.0', '1.15', '1.5', '2.0', '2.5', '3.0'].map((h) => (
                                <button key={h} type="button" onClick={() => applyLineHeight(h)} className="text-left px-2 py-1 text-sm text-white hover:bg-[#222222] rounded">
                                    {h}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-px h-6 bg-[#222222] mx-1" />

                <div className="relative">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowCardMenu(!showCardMenu)} className="hover:bg-[#1a1a1a] text-white" title="Insert Card"><PlusSquare className="h-4 w-4" /></Button>
                    {showCardMenu && (
                        <div className="absolute top-full left-0 mt-1 p-2 bg-[#1a1a1a] border border-[#333333] rounded-lg shadow-xl z-[9999] w-48 flex flex-col gap-1">
                            <div className="text-xs font-semibold mb-1 px-1 text-white">Insert Card:</div>
                            <button onClick={() => insertCard('info')} className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-[#222222] text-blue-400 rounded"><Info className="w-4 h-4" /> Information</button>
                            <button onClick={() => insertCard('warning')} className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-[#222222] text-amber-400 rounded"><AlertTriangle className="w-4 h-4" /> Warning</button>
                            <button onClick={() => insertCard('tip')} className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-[#222222] text-green-400 rounded"><Lightbulb className="w-4 h-4" /> Pro Tip</button>
                            <button onClick={() => insertCard('weather')} className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-[#222222] text-sky-400 rounded"><CloudSun className="w-4 h-4" /> Weather</button>
                            <button onClick={() => insertCard('route')} className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-[#222222] text-indigo-400 rounded"><Map className="w-4 h-4" /> Route</button>
                        </div>
                    )}
                </div>

                <div className="w-px h-6 bg-[#222222] mx-1" />

                <AIBlogChatAssistant editor={editor} onMetadataGenerated={onAIMetadataGenerated} />

                <div className="w-px h-6 bg-[#222222] mx-1" />

                <Button type="button" variant="ghost" size="sm" onClick={setCodeBlock} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive('codeBlock') ? 'bg-[#222222]' : ''}`} title="Code Block"><FileCode className="h-4 w-4" /></Button>

                <div className="w-px h-6 bg-[#222222] mx-1" />

                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive('heading', { level: 2 }) ? 'bg-[#222222]' : ''}`} title="H2"><Heading2 className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive('heading', { level: 3 }) ? 'bg-[#222222]' : ''}`} title="H3"><Heading3 className="h-4 w-4" /></Button>

                <div className="w-px h-6 bg-[#222222] mx-1" />

                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive({ textAlign: 'left' }) ? 'bg-[#222222]' : ''}`} title="Left"><AlignLeft className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive({ textAlign: 'center' }) ? 'bg-[#222222]' : ''}`} title="Center"><AlignCenter className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive({ textAlign: 'right' }) ? 'bg-[#222222]' : ''}`} title="Right"><AlignRight className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive({ textAlign: 'justify' }) ? 'bg-[#222222]' : ''}`} title="Justify"><AlignJustify className="h-4 w-4" /></Button>

                <div className="w-px h-6 bg-[#222222] mx-1" />

                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive('bulletList') ? 'bg-[#222222]' : ''}`} title="Bullets"><List className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive('orderedList') ? 'bg-[#222222]' : ''}`} title="Numbers"><ListOrdered className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive('blockquote') ? 'bg-[#222222]' : ''}`} title="Quote"><Quote className="h-4 w-4" /></Button>

                <div className="w-px h-6 bg-[#222222] mx-1" />

                <Button type="button" variant="ghost" size="sm" onClick={addLink} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive('link') ? 'bg-[#222222]' : ''}`} title="Link"><LinkIcon className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={addImage} className="hover:bg-[#1a1a1a] text-white" title="Image (Resizable)"><ImageIcon className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={addYoutubeVideo} className="hover:bg-[#1a1a1a] text-white" title="YouTube (Resizable)"><Video className="h-4 w-4" /></Button>

                <div className="w-px h-6 bg-[#222222] mx-1" />

                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="hover:bg-[#1a1a1a] text-white" title="Table"><TableIcon className="h-4 w-4" /></Button>

                <div className="w-px h-6 bg-[#222222] mx-1" />

                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHighlight().run()} className={`hover:bg-[#1a1a1a] text-white ${editor.isActive('highlight') ? 'bg-[#222222]' : ''}`} title="Highlight"><Highlighter className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()} className="hover:bg-[#1a1a1a] text-white" title="Line"><Minus className="h-4 w-4" /></Button>

                <div className="w-px h-6 bg-[#222222] mx-1" />

                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="hover:bg-[#1a1a1a] text-white disabled:opacity-50" title="Undo"><Undo className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="hover:bg-[#1a1a1a] text-white disabled:opacity-50" title="Redo"><Redo className="h-4 w-4" /></Button>
            </div>

            <EditorContent editor={editor} className="dark-editor" />
        </div >
    );
}
