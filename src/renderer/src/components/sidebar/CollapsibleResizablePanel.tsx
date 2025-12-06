import { ResizablePanel } from '@renderer/shadcn/ui/resizable';
import { ScrollArea } from '@renderer/shadcn/ui/scroll-area';
import { ChevronRight } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { ImperativePanelHandle } from 'react-resizable-panels';

type PanelHeaderProps = {
  title: string;
  collapsed: boolean;
  toggle: () => void;
  actions?: React.ReactElement<ClickableProps> | React.ReactNode;
};

type ClickableProps = { onClick: (e: React.MouseEvent) => void };

function PanelHeader({ title, collapsed, toggle, actions }: PanelHeaderProps) {
  return (
    <div
      className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded p-2 min-h-8"
      onClick={toggle}
    >
      <div className="flex items-center gap-2">
        <ChevronRight className={`h-3 w-3 transition-transform ${collapsed ? '' : 'rotate-90'}`} />
        <h3 className="font-semibold text-xs uppercase text-muted-foreground">{title}</h3>
      </div>
      <div className="flex items-center gap-1">
        {React.Children.map(actions, (child) => {
          if (!React.isValidElement<ClickableProps>(child)) return child;

          return React.cloneElement(child, {
            onClick: (e) => {
              e.stopPropagation();
              child.props.onClick(e);
            },
          });
        })}
      </div>
    </div>
  );
}

type PanelBodyProps = {
  collapsed?: boolean;
  children: React.ReactNode;
};

function PanelBody({ collapsed, children }: PanelBodyProps) {
  if (collapsed) return null;

  return <ScrollArea className="flex-1 h-0">{children}</ScrollArea>;
}

type CollapsibleResizablePanelProps = {
  title: string;
  actions?: React.ReactElement<ClickableProps> | React.ReactNode;
  defaultSize?: number;
  minSize?: number;
  collapsedSize?: number;
  onCollapse?: () => void;
  onExpand?: () => void;
  children: React.ReactNode;
};

export function CollapsibleResizablePanel({
  title,
  actions,
  defaultSize = 35,
  minSize = 10,
  collapsedSize = 4,
  children,
}: CollapsibleResizablePanelProps) {
  const panelRef = useRef<ImperativePanelHandle>(null);
  const [collapsed, setCollapsed] = useState(false);

  const toggle = () => {
    if (!panelRef.current) return;
    if (collapsed) {
      panelRef.current.expand();
    } else {
      panelRef.current.collapse();
    }
  };

  return (
    <ResizablePanel
      ref={panelRef}
      defaultSize={defaultSize}
      minSize={minSize}
      collapsible
      collapsedSize={collapsedSize}
      onCollapse={() => {
        setCollapsed(true);
      }}
      onExpand={() => {
        setCollapsed(false);
      }}
      className="flex flex-col transition-all duration-200 ease-in-out"
    >
      <PanelHeader title={title} collapsed={collapsed} toggle={toggle} actions={actions} />
      <PanelBody collapsed={collapsed}>{children}</PanelBody>
    </ResizablePanel>
  );
}
