'use client'

import { useMemo, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { NotebookList } from './components/NotebookList'
import { useNotebooks } from '@/lib/hooks/use-notebooks'
import { CreateNotebookDialog } from '@/components/notebooks/CreateNotebookDialog'
import { useTranslation } from '@/lib/hooks/use-translation'
import { GradientHeader } from './components/GradientHeader'
import { FloatingActionButton } from './components/FloatingActionButton'

export default function NotebooksPage() {
  const { t } = useTranslation()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { data: notebooks, isLoading, refetch } = useNotebooks(false)
  const { data: archivedNotebooks } = useNotebooks(true)

  const normalizedQuery = searchTerm.trim().toLowerCase()

  const filteredActive = useMemo(() => {
    if (!notebooks) {
      return undefined
    }
    if (!normalizedQuery) {
      return notebooks
    }
    return notebooks.filter((notebook) =>
      notebook.name.toLowerCase().includes(normalizedQuery)
    )
  }, [notebooks, normalizedQuery])

  const filteredArchived = useMemo(() => {
    if (!archivedNotebooks) {
      return undefined
    }
    if (!normalizedQuery) {
      return archivedNotebooks
    }
    return archivedNotebooks.filter((notebook) =>
      notebook.name.toLowerCase().includes(normalizedQuery)
    )
  }, [archivedNotebooks, normalizedQuery])

  const hasArchived = (archivedNotebooks?.length ?? 0) > 0
  const isSearching = normalizedQuery.length > 0

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
          <GradientHeader
            title={t.notebooks.title}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={() => refetch()}
            searchPlaceholder={t.notebooks.searchPlaceholder}
          />
        
          <div className="space-y-12 pb-24">
            <NotebookList 
              notebooks={filteredActive} 
              isLoading={isLoading}
              title={t.notebooks.activeNotebooks}
              emptyTitle={isSearching ? t.common.noMatches : undefined}
              emptyDescription={isSearching ? t.common.tryDifferentSearch : undefined}
              onAction={!isSearching ? () => setCreateDialogOpen(true) : undefined}
              actionLabel={!isSearching ? t.notebooks.newNotebook : undefined}
            />
            
            {hasArchived && (
              <NotebookList 
                notebooks={filteredArchived} 
                isLoading={false}
                title={t.notebooks.archivedNotebooks}
                collapsible
                emptyTitle={isSearching ? t.common.noMatches : undefined}
                emptyDescription={isSearching ? t.common.tryDifferentSearch : undefined}
              />
            )}
          </div>
        </div>
      </div>

      <FloatingActionButton onClick={() => setCreateDialogOpen(true)} />

      <CreateNotebookDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </AppShell>
  )
}
