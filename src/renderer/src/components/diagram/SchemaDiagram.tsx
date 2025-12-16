import { Schema, SchemaTable } from '@common/db/types';
import Dagre from '@dagrejs/dagre';
import { useConnection } from '@renderer/contexts/connection/ConnectionContext';
import {
  Background,
  Edge,
  Node,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, { useMemo } from 'react';
import { nodeTypes } from './nodeTypes';

const BASE_WIDTH = 260;
const BASE_HEIGHT = 40;
const COLUMN_HEIGHT = 35;

const getLayoutedElements = (nodes: Node<SchemaTable>[], edges: Edge[]) => {
  const graph = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: 'LR' });

  const nodesWithDimensions = nodes.map((node) => {
    const width = node.measured?.width || BASE_WIDTH;
    const height = node.measured?.height || BASE_HEIGHT + node.data.columns.length * COLUMN_HEIGHT;

    return { ...node, width, height };
  });

  nodesWithDimensions.forEach((node) => {
    graph.setNode(node.id, { width: node.width, height: node.height });
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  Dagre.layout(graph);

  return {
    nodes: nodesWithDimensions.map((node) => {
      const nodeWithPosition = graph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - node.width / 2,
          y: nodeWithPosition.y - node.height / 2,
        },
      };
    }),
    edges,
  };
};

function SchemaCanvas({
  initialNodes,
  initialEdges,
}: {
  initialNodes: Node<SchemaTable>[];
  initialEdges: Edge[];
}): React.JSX.Element {
  const [nodes, , onNodesChange] = useNodesState<Node<SchemaTable>>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState<Edge>(initialEdges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      proOptions={{ hideAttribution: true }}
      fitView
      fitViewOptions={{ padding: 0.2 }}
    >
      <Background color="#9f9fa9" gap={16} size={1} className="opacity-50" />
    </ReactFlow>
  );
}

function fnv1aHash(string: string): string {
  let hash = 2166136261;
  const len = string.length;

  for (let i = 0; i < len; i++) {
    hash ^= string.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

function createSchemaKey(schema: Schema): string {
  const schemaString = schema
    .map((table) => {
      const columns = table.columns
        .map((col) => {
          const ref = col.references ? `${col.references.table}.${col.references.column}` : '';
          return [
            col.name,
            col.type,
            Number(col.isNullable),
            Number(col.isPrimaryKey),
            Number(col.isForeignKey),
            ref,
          ].join(',');
        })
        .sort()
        .join('|');
      return `${table.tableName}:${columns}`;
    })
    .sort()
    .join(';');

  const hash = fnv1aHash(schemaString);

  return hash;
}

export function SchemaLayout(): React.JSX.Element {
  const { schema } = useConnection();

  const schemaKey = useMemo(() => {
    if (!schema || schema.length === 0) return 'empty';
    return createSchemaKey(schema);
  }, [schema]);

  const { nodes, edges } = useMemo(() => {
    if (!schema || schema.length === 0) {
      return { nodes: [], edges: [] };
    }

    const newNodes: Node<SchemaTable>[] = schema.map((table) => ({
      id: table.tableName,
      type: 'table',
      data: table,
      position: { x: 0, y: 0 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));

    const newEdges: Edge[] = [];
    const tableSet = new Set(schema.map((t) => t.tableName));

    schema.forEach((table) => {
      table.columns.forEach((col) => {
        if (col.isForeignKey && col.references && tableSet.has(col.references.table)) {
          const edgeId = `${table.tableName}.${col.name}-${col.references.table}.${col.references.column}`;
          newEdges.push({
            id: edgeId,
            source: table.tableName,
            target: col.references.table,
            sourceHandle: `${col.name}-right`,
            targetHandle: `${col.references.column}-left`,
            animated: false,
            style: { stroke: '#9f9fa9', strokeWidth: 1.5 },
            type: 'smoothstep',
          });
        }
      });
    });

    const layout = getLayoutedElements(newNodes, newEdges);

    return { nodes: layout.nodes, edges: layout.edges };
  }, [schema]);

  return (
    <div className="h-full w-full bg-background">
      <SchemaCanvas key={schemaKey} initialNodes={nodes} initialEdges={edges} />
    </div>
  );
}

export function SchemaDiagram(): React.JSX.Element {
  return (
    <ReactFlowProvider>
      <SchemaLayout />
    </ReactFlowProvider>
  );
}
