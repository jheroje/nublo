import {
  Connection,
  ConnectionColor,
  ConnectionColors,
  useConnection,
} from '@renderer/contexts/connection/ConnectionContext';
import { Button } from '@renderer/shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@renderer/shadcn/ui/dialog';
import { Input } from '@renderer/shadcn/ui/input';
import { Label } from '@renderer/shadcn/ui/label';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type SavedConnectionsProps = {
  onConnect: (connectionString: string) => void;
};

export function SavedConnections({ onConnect }: SavedConnectionsProps): React.JSX.Element {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [connectionString, setConnectionString] = useState('');
  const [selectedColor, setSelectedColor] = useState<ConnectionColor>(ConnectionColors[0]);

  const { activeConnection, setActiveConnection } = useConnection();

  useEffect(() => {
    const loadConnections = async () => {
      const saved = await window.api.store.get<Connection[]>('saved_connections');
      if (saved) {
        setConnections(saved);
      }
    };
    loadConnections();
  }, []);

  const saveConnections = async (newConnections: Connection[]) => {
    setConnections(newConnections);
    await window.api.store.set('saved_connections', newConnections);
  };

  const handleOpenDialog = (conn?: Connection) => {
    if (conn) {
      setEditingId(conn.id);
      setName(conn.name);
      setConnectionString(conn.connectionString);
      setSelectedColor(conn.color);
    } else {
      setEditingId(null);
      setName('');
      setConnectionString('');
      setSelectedColor(ConnectionColors[0]);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!name || !connectionString) return;

    if (editingId) {
      const newConnections = connections.map((c) =>
        c.id === editingId ? { ...c, name, connectionString, color: selectedColor } : c
      );
      saveConnections(newConnections);

      if (activeConnection?.id === editingId) {
        setActiveConnection({ ...activeConnection, name, connectionString, color: selectedColor });
      }
    } else {
      const newConnection: Connection = {
        id: crypto.randomUUID(),
        name,
        connectionString,
        color: selectedColor,
      };

      saveConnections([...connections, newConnection]);
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this connection?')) {
      const newConnections = connections.filter((c) => c.id !== id);
      saveConnections(newConnections);
    }
  };

  console.log(ConnectionColors);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-xs uppercase text-muted-foreground">Connections</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Connection' : 'Add Connection'}</DialogTitle>
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
      </div>

      <div className="space-y-1">
        {connections.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No saved connections</p>
        ) : (
          connections.map((conn) => (
            <div
              key={conn.id}
              className="group flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => {
                setActiveConnection(conn);
                onConnect(conn.connectionString);
              }}
            >
              <div className={`w-3 h-3 rounded-full bg-${conn.color}`} />
              <span className="text-xs font-medium truncate flex-1">{conn.name}</span>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDialog(conn);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground hover:text-red-500"
                  onClick={(e) => handleDelete(e, conn.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
