import { Connection } from '@common/db/types';
import { Button } from '@renderer/shadcn/ui/button';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { CollapsibleResizablePanel } from './CollapsibleResizablePanel';
import { ConnectionDialog } from './connections/ConnectionDialog';
import { ConnectionList } from './connections/ConnectionList';

export function ConnectionsSection(): React.JSX.Element {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [connectionToEdit, setConnectionToEdit] = useState<Connection | null>(null);

  const handleOpenDialog = (conn?: Connection) => {
    setConnectionToEdit(conn || null);
    setIsDialogOpen(true);
  };

  return (
    <>
      <CollapsibleResizablePanel
        title="Connections"
        defaultSize={35}
        minSize={10}
        collapsedSize={4}
        actions={
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 cursor-pointer"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="h-3 w-3" />
          </Button>
        }
      >
        <div className="px-2">
          <ConnectionList onEdit={handleOpenDialog} />
        </div>
      </CollapsibleResizablePanel>

      <ConnectionDialog
        key={`${isDialogOpen}-${connectionToEdit?.id ?? 'new'}`}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        connectionToEdit={connectionToEdit}
      />
    </>
  );
}
