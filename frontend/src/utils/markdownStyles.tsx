import React from 'react';
import { Components } from 'react-markdown';

export const markdownStyles: Partial<Components> = {
  h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-pcsprimary-03 dark:text-pcsprimary-02">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-pcsprimary-03 dark:text-pcsprimary-02">{children}</h2>,
  h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-pcsprimary-03 dark:text-pcsprimary-02">{children}</h3>,
  p: ({ children }) => <p className="mb-4 text-pcsprimary-04 dark:text-gray-300">{children}</p>,
  ul: ({ children, className }) => {
    if (className === 'objectives-list') {
      return (
        <ul className="space-y-2 mb-4">
          {React.Children.map(children, (child, index) => (
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 mr-2 text-sm font-semibold text-white bg-pcsprimary-03 dark:bg-pcsprimary-02 rounded-full">
                {index + 1}
              </span>
              <span className="text-pcsprimary-04 dark:text-gray-300">{child}</span>
            </li>
          ))}
        </ul>
      );
    }
    return <ul className="list-disc list-inside mb-4 text-pcsprimary-04 dark:text-gray-300">{children}</ul>;
  },
  li: ({ children, className }) => {
    if (className === 'objectives-list-item') {
      return <>{children}</>;
    }
    return <li className="mb-1">{children}</li>;
  },
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
};
