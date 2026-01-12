import { useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TOCItem {
  id: string;
  title: string;
  level: number;
  children?: TOCItem[];
}

export default function Training() {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // TODO: Replace this placeholder content when the actual .md file is provided
  const placeholderContent = `# AC/DC Training

Welcome to the AC/DC Training module. This content will be replaced with your training material.

## Chapter 1: Introduction

This is where your first chapter content will appear.

### Section 1.1: Getting Started

Content for getting started section.

### Section 1.2: Prerequisites

Content for prerequisites section.

## Chapter 2: Advanced Topics

This is where your second chapter content will appear.

### Section 2.1: Deep Dive

Content for deep dive section.

## Chapter 3: Practical Applications

This is where your third chapter content will appear.

### Section 3.1: Real-world Examples

Content for real-world examples.

## Chapter 4: Summary

Final chapter content goes here.
`;

  useEffect(() => {
    // TODO: Load actual markdown content from file or API
    setMarkdownContent(placeholderContent);
  }, []);

  // Parse markdown to extract table of contents
  const tableOfContents = useMemo(() => {
    if (!markdownContent) return [];

    const headings: TOCItem[] = [];
    const lines = markdownContent.split('\n');
    const stack: TOCItem[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const title = match[2].trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const item: TOCItem = { id, title, level };

        if (level === 1) {
          headings.push(item);
          stack.length = 0;
          stack[0] = item;
        } else {
          // Find the parent in the stack
          while (stack.length > 0 && stack[stack.length - 1].level >= level) {
            stack.pop();
          }

          if (stack.length > 0) {
            const parent = stack[stack.length - 1];
            if (!parent.children) parent.children = [];
            parent.children.push(item);
          } else {
            headings.push(item);
          }

          stack.push(item);
        }
      }
    });

    return headings;
  }, [markdownContent]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
      let currentSection = '';

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 150) {
          currentSection = heading.id;
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [markdownContent]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
    setIsMobileMenuOpen(false);
  };

  const renderTOCItem = (item: TOCItem) => {
    const isActive = activeSection === item.id;
    const paddingLeft = item.level === 1 ? 'pl-4' : item.level === 2 ? 'pl-6' : 'pl-8';

    return (
      <div key={item.id}>
        <button
          onClick={() => scrollToSection(item.id)}
          className={`block w-full text-left py-2 px-2 rounded transition-colors ${paddingLeft} ${
            isActive
              ? 'bg-blue-100 text-blue-700 font-semibold'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {item.title}
        </button>
        {item.children && item.children.length > 0 && (
          <div>{item.children.map(renderTOCItem)}</div>
        )}
      </div>
    );
  };

  // Custom components for markdown rendering
  const components = {
    h1: ({ children, ...props }: any) => {
      const id = children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
      return (
        <h1 id={id} className="text-4xl font-bold mt-8 mb-4 text-gray-900" {...props}>
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }: any) => {
      const id = children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
      return (
        <h2 id={id} className="text-3xl font-bold mt-8 mb-4 text-gray-900 border-b-2 border-gray-200 pb-2" {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }: any) => {
      const id = children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
      return (
        <h3 id={id} className="text-2xl font-semibold mt-6 mb-3 text-gray-800" {...props}>
          {children}
        </h3>
      );
    },
    h4: ({ children, ...props }: any) => {
      const id = children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
      return (
        <h4 id={id} className="text-xl font-semibold mt-4 mb-2 text-gray-800" {...props}>
          {children}
        </h4>
      );
    },
    h5: ({ children, ...props }: any) => {
      const id = children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
      return (
        <h5 id={id} className="text-lg font-semibold mt-3 mb-2 text-gray-700" {...props}>
          {children}
        </h5>
      );
    },
    h6: ({ children, ...props }: any) => {
      const id = children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
      return (
        <h6 id={id} className="text-base font-semibold mt-2 mb-1 text-gray-700" {...props}>
          {children}
        </h6>
      );
    },
    p: ({ children, ...props }: any) => (
      <p className="mb-4 text-gray-700 leading-relaxed" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="mb-4 ml-6 list-disc text-gray-700" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="mb-4 ml-6 list-decimal text-gray-700" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="mb-2" {...props}>
        {children}
      </li>
    ),
    code: ({ inline, children, ...props }: any) => {
      if (inline) {
        return (
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-red-600" {...props}>
            {children}
          </code>
        );
      }
      return (
        <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto font-mono text-sm" {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }: any) => (
      <pre className="mb-4" {...props}>
        {children}
      </pre>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600" {...props}>
        {children}
      </blockquote>
    ),
    a: ({ children, href, ...props }: any) => (
      <a href={href} className="text-blue-600 hover:text-blue-800 underline" {...props}>
        {children}
      </a>
    ),
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full divide-y divide-gray-200 border" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }: any) => (
      <thead className="bg-gray-50" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }: any) => (
      <tbody className="bg-white divide-y divide-gray-200" {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
    th: ({ children, ...props }: any) => (
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700" {...props}>
        {children}
      </td>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white p-3 rounded-lg shadow-lg border border-gray-200"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <div className="flex max-w-screen-2xl mx-auto">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:sticky top-20 left-0 h-[calc(100vh-5rem)] bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 z-40 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } w-80`}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Table of Contents</h2>
            <nav className="space-y-1">
              {tableOfContents.length > 0 ? (
                tableOfContents.map(renderTOCItem)
              ) : (
                <p className="text-gray-500 text-sm">No content loaded yet</p>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
            {markdownContent ? (
              <article className="prose prose-lg max-w-none">
                <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                  {markdownContent}
                </ReactMarkdown>
              </article>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Loading training content...</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
