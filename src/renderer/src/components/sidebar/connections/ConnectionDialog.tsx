import { Connection, ConnectionColor, ConnectionColors } from '@common/types';
import { useConnection } from '@renderer/contexts/connection/ConnectionContext';
import { Button } from '@renderer/shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@renderer/shadcn/ui/dialog';
import { Input } from '@renderer/shadcn/ui/input';
import { Label } from '@renderer/shadcn/ui/label';
import React, { useState } from 'react';

type ConnectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionToEdit: Connection | null;
};

export function ConnectionDialog({
  open,
  onOpenChange,
  connectionToEdit,
}: ConnectionDialogProps): React.JSX.Element {
  const { addConnection, updateConnection } = useConnection();

  const [name, setName] = useState(connectionToEdit?.name || '');
  const [connectionString, setConnectionString] = useState(
    connectionToEdit?.connectionString || ''
  );
  const [selectedColor, setSelectedColor] = useState<ConnectionColor>(
    connectionToEdit?.color || ConnectionColors[0]
  );

  const handleSave = () => {
    if (!name || !connectionString) return;

    if (connectionToEdit) {
      updateConnection({
        ...connectionToEdit,
        name,
        connectionString,
        color: selectedColor,
      });
    } else {
      const newConnection: Connection = {
        id: crypto.randomUUID(),
        name,
        connectionString,
        color: selectedColor,
      };
      addConnection(newConnection);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{connectionToEdit ? 'Edit Connection' : 'Add Connection'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Connection Name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="connectionString">Connection String</Label>
            <Input
              id="connectionString"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              placeholder="postgresql://user:password@host:port/db"
            />
          </div>
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {ConnectionColors.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full bg-${color} ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-foreground' : ''
                  }`}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
