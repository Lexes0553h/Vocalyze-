'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FolderOpen, FileText, MoreVertical, X, Download, File } from 'lucide-react';
import { PageHeader, Card, Badge, Button } from '@/components/crm/crm-ui';
import { useDocuments } from '@/lib/data/hooks';
import type { DocumentItem } from '@/lib/data/mappers';
import { cn } from '@/lib/utils';

type DocFile = DocumentItem;

const DOCUMENT_FOLDERS = ['Contracts', 'Proposals', 'Reports', 'Templates', 'Marketing', 'Legal'];

const TYPE_STYLES: Record<string, string> = {
  pdf: 'text-red-400',
  sheet: 'text-green-400',
  doc: 'text-cyan',
};

export default function DocumentsPage() {
  const { data: DOCUMENTS = [] } = useDocuments();
  const [folder, setFolder] = useState('All Files');
  const [selected, setSelected] = useState<DocFile | null>(null);

  const filtered = folder === 'All Files' ? DOCUMENTS : DOCUMENTS.filter((d) => d.folder === folder);
  const counts = (f: string) => (f === 'All Files' ? DOCUMENTS.length : DOCUMENTS.filter((d) => d.folder === f).length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        subtitle={`${DOCUMENTS.length} files`}
        actions={<Button variant="primary"><Upload className="h-4 w-4" />Upload</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Folder sidebar */}
        <div className="space-y-1">
          {['All Files', ...DOCUMENT_FOLDERS].map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={cn(
                'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition',
                folder === f ? 'bg-primary/15 text-primary ring-1 ring-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}
            >
              <FolderOpen className="h-4 w-4" />
              <span className="flex-1 text-left">{f}</span>
              <span className="text-xs">{counts(f)}</span>
            </button>
          ))}
        </div>

        {/* Files area */}
        <div className="space-y-4">
          {/* Upload zone */}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 py-8 text-center transition hover:border-primary/30">
            <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag files here or <span className="text-primary">click to upload</span>
            </p>
          </div>

          {/* File grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(doc)}
                className="cursor-pointer rounded-2xl glass-card p-4 transition hover:border-primary/30"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-white/5', TYPE_STYLES[doc.type] ?? 'text-cyan')}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <button onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
                <p className="truncate text-sm font-medium">{doc.name}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span>{doc.modified}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl glass-strong p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-white/5', TYPE_STYLES[selected.type] ?? 'text-cyan')}>
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-medium">{selected.name}</h2>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="muted">{selected.type.toUpperCase()}</Badge>
                      <span>{selected.size}</span>
                      <span>•</span>
                      <span>{selected.modified}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex h-48 items-center justify-center rounded-xl bg-white/5 text-center text-sm text-muted-foreground">
                <div>
                  <File className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  Preview not available in demo
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>
                <Button variant="primary"><Download className="h-4 w-4" />Download</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
