import React from 'react';
import { Search, FolderOpen, Bookmark, FileText } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: 'search' | 'folder' | 'bookmark' | 'file';
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'folder',
  title,
  description,
  actionText,
  onAction
}) => {
  const icons = {
    search: <Search className="w-10 h-10 text-slate-400" />,
    folder: <FolderOpen className="w-10 h-10 text-slate-400" />,
    bookmark: <Bookmark className="w-10 h-10 text-slate-400" />,
    file: <FileText className="w-10 h-10 text-slate-400" />
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-dashed border-slate-200 my-6">
      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
        {icons[icon]}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
