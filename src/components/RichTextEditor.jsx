import { useEffect, useRef, forwardRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/RichTextEditor.css';

// Create a forwardRef wrapper component for ReactQuill to avoid findDOMNode warning
const QuillWrapper = forwardRef(({ value, onChange, modules, formats, placeholder }, ref) => {
    return (
        <ReactQuill
            ref={ref}
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
        />
    );
});

QuillWrapper.displayName = 'QuillWrapper';

export default function RichTextEditor({ value, onChange }) {
    const quillRef = useRef(null);
    const warningsSupressed = useRef(false);

    // Suppress deprecation warnings in development
    useEffect(() => {
        if (!warningsSupressed.current) {
            // Store original console methods
            const originalError = console.error;
            const originalWarn = console.warn;

            // Override console.error to filter out findDOMNode warnings
            console.error = (...args) => {
                const isDeprecationWarning = args.some(arg =>
                    typeof arg === 'string' && (
                        arg.includes('findDOMNode') ||
                        arg.includes('ReactDOM.findDOMNode')
                    )
                );

                if (!isDeprecationWarning) {
                    originalError.apply(console, args);
                }
            };

            // Override console.warn to filter out DOMNodeInserted warnings
            console.warn = (...args) => {
                const isDeprecationWarning = args.some(arg =>
                    typeof arg === 'string' && (
                        arg.includes('DOMNodeInserted') ||
                        arg.includes('mutation event')
                    )
                );

                if (!isDeprecationWarning) {
                    originalWarn.apply(console, args);
                }
            };

            warningsSupressed.current = true;
        }
    }, []);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image',
        'color', 'background'
    ];

    return (
        <div className="rich-text-editor">
            <QuillWrapper
                ref={quillRef}
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder="Start writing your thoughts..."
            />
        </div>
    );
}
