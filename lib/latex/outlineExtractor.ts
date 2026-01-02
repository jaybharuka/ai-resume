export interface OutlineItem {
  id: string;
  type: 'section' | 'subsection' | 'subsubsection';
  title: string;
  lineNumber: number;
  children: OutlineItem[];
}

export const extractOutline = (code: string): OutlineItem[] => {
  const lines = code.split('\n');
  const regex = /(\\section|\\subsection|\\subsubsection)\{([^}]*)\}/;
  
  const items: OutlineItem[] = [];
  const stack: OutlineItem[] = [];

  lines.forEach((line, index) => {
    const match = line.match(regex);
    if (match) {
      const type = match[1].substring(1) as 'section' | 'subsection' | 'subsubsection';
      const title = match[2];
      
      const newItem: OutlineItem = {
        id: `outline-${index}`,
        type,
        title,
        lineNumber: index + 1,
        children: []
      };

      if (type === 'section') {
        items.push(newItem);
        stack.length = 0; // Clear stack
        stack.push(newItem);
      } else if (type === 'subsection') {
        // Find parent section
        const parent = stack.find(item => item.type === 'section');
        if (parent) {
          parent.children.push(newItem);
          // Remove any existing subsection from stack to ensure correct nesting
          const subIndex = stack.findIndex(item => item.type === 'subsection');
          if (subIndex !== -1) stack.splice(subIndex);
          stack.push(newItem);
        } else {
          items.push(newItem); // Fallback if no parent
          stack.push(newItem);
        }
      } else if (type === 'subsubsection') {
        const parent = stack[stack.length - 1];
        if (parent) {
          parent.children.push(newItem);
        } else {
          items.push(newItem);
        }
      }
    }
  });

  return items;
};
