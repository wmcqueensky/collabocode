// /components/match/editor/OutputPanel.tsx
import React from 'react';

export const OutputPanel = ({ output, isMobile = false }: any) => {
  return (
    <div
      className={`${
        isMobile ? 'h-24' : 'h-32'
      } border-t border-gray-700 overflow-hidden flex flex-col`}
    >
      <div className="flex items-center px-2 sm:px-3 py-1 border-b border-gray-700 bg-[#2c2c2c]">
        <div
          className={`${
            isMobile ? 'text-xs' : 'text-sm'
          } font-medium text-gray-300`}
        >
          Console Output
        </div>
      </div>
      <div
        className={`flex-1 p-2 font-mono ${
          isMobile ? 'text-xs' : 'text-xs sm:text-sm'
        } overflow-auto bg-[#171717] text-gray-300`}
      >
        {output.map((line: any, i: any) => (
          <div
            key={i}
            className={`${
              line.status === 'pass'
                ? 'text-[#5bc6ca]'
                : line.status === 'fail'
                ? 'text-red-400'
                : ''
            } break-words`}
          >
            {line.message}
          </div>
        ))}
      </div>
    </div>
  );
};
