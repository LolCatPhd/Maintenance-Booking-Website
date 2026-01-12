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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load the AC/DC training markdown content
    fetch('/tower_technician_training.md')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load training content');
        }
        return response.text();
      })
      .then((text) => {
        setMarkdownContent(text);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error loading training content:', err);
        setError('Failed to load training content. Please try again later.');
        setIsLoading(false);
      });
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

  const toggleModule = (moduleId: string) => {
    setCollapsedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  // Filter markdown content to hide collapsed modules
  const filteredMarkdownContent = useMemo(() => {
    if (!markdownContent || collapsedModules.size === 0) return markdownContent;

    const lines = markdownContent.split('\n');
    const result: string[] = [];
    let isCollapsed = false;
    let currentModuleLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const h2Match = line.match(/^##\s+(.+)$/);
      const h1Match = line.match(/^#\s+(.+)$/);

      if (h2Match) {
        // Found a new H2 (MODULE level)
        const title = h2Match[1].trim();
        const moduleId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        isCollapsed = collapsedModules.has(moduleId);
        currentModuleLevel = 2;

        // Always show the H2 heading itself
        result.push(line);
      } else if (h1Match) {
        // H1 level - always show (document title)
        result.push(line);
        currentModuleLevel = 0;
        isCollapsed = false;
      } else if (currentModuleLevel === 2) {
        // We're inside a MODULE section (H2)
        // Check if this is a new H2 (which would end the current module)
        const nextH2 = line.match(/^##\s+/);
        if (nextH2) {
          // New module starting, handle it in next iteration
          i--;
          continue;
        }

        if (!isCollapsed) {
          result.push(line);
        }
      } else {
        // Before first module or between major sections
        result.push(line);
      }
    }

    return result.join('\n');
  }, [markdownContent, collapsedModules]);

  const renderTOCItem = (item: TOCItem) => {
    const isActive = activeSection === item.id;
    const paddingLeft = item.level === 1 ? 'pl-2' : item.level === 2 ? 'pl-4' : 'pl-8';
    const isModule = item.level === 2; // MODULEs are H2 level
    const isCollapsed = collapsedModules.has(item.id);

    return (
      <div key={item.id}>
        <div className="flex items-center">
          {isModule && item.children && item.children.length > 0 && (
            <button
              onClick={() => toggleModule(item.id)}
              className="p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
              aria-label={isCollapsed ? 'Expand module' : 'Collapse module'}
            >
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform ${
                  isCollapsed ? '' : 'rotate-90'
                }`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <button
            onClick={() => scrollToSection(item.id)}
            className={`flex-1 text-left py-2 px-2 rounded transition-colors ${paddingLeft} ${
              isActive
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            } ${isModule ? 'font-bold text-sm' : item.level === 1 ? 'font-bold text-base' : ''}`}
          >
            {item.title}
          </button>
        </div>
        {item.children && item.children.length > 0 && !isCollapsed && (
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
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-500 text-sm mt-2">Loading...</p>
                </div>
              ) : tableOfContents.length > 0 ? (
                tableOfContents.map(renderTOCItem)
              ) : (
                <p className="text-gray-500 text-sm">No content available</p>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 text-lg mt-4">Loading training content...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-red-800 text-lg font-semibold">{error}</p>
                </div>
              </div>
            ) : (
              <article className="prose prose-lg max-w-none">
                <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                  {filteredMarkdownContent}
                </ReactMarkdown>
              </article>
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
