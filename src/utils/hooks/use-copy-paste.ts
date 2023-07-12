import { TaskListNodeModel } from '@/components/task-list-node/task-list-node.model';
import { useCallback, useEffect, useRef, useState } from "react";
import { Edge, Node, XYPosition, getConnectedEdges, useReactFlow, useStore } from "reactflow";

export function useCopyPaste() {
    const mousePosRef = useRef<XYPosition>({ x: 0, y: 0 });
    const rfDomNode = useStore((state) => state.domNode);
    const bufferedNodes = useRef<Node<TaskListNodeModel>[]>([]);
    const bufferedEdges = useRef<Edge[]>([]);
  
    const { getNodes, setNodes, getEdges, setEdges, project, } = useReactFlow();

    useEffect(() => {
      const events = ['cut', 'copy', 'paste'];
  
      if (rfDomNode) {
        const preventDefault = (e: Event) => e.preventDefault();
  
        const onMouseMove = (event: MouseEvent) => {
          const bounds = rfDomNode.getBoundingClientRect();
          mousePosRef.current = {
            x: event.clientX - (bounds?.left ?? 0),
            y: event.clientY - (bounds?.top ?? 0),
          };
        };
  
        for (const event of events) {
          rfDomNode.addEventListener(event, preventDefault);
        }
  
        rfDomNode.addEventListener('mousemove', onMouseMove);
  
        return () => {
          for (const event of events) {
            rfDomNode.removeEventListener(event, preventDefault);
          }
  
          rfDomNode.removeEventListener('mousemove', onMouseMove);
        };
      }
    }, [rfDomNode]);
  
    const copy = useCallback(() => {
      const selectedNodes = getNodes().filter((node) => node.selected);
      const selectedEdges = getConnectedEdges(selectedNodes, getEdges()).filter((edge) => {
        const isExternalSource = selectedNodes.every((n) => n.id !== edge.source);
        const isExternalTarget = selectedNodes.every((n) => n.id !== edge.target);
  
        return !(isExternalSource || isExternalTarget);
      });
  
      bufferedNodes.current = selectedNodes;
      bufferedEdges.current = selectedEdges;
    }, [getNodes, getEdges]);
  
    const cut = useCallback(() => {
      console.log('cut', bufferedNodes);
    }, [bufferedNodes]);
  
    const paste = useCallback(
      ({ x: pasteX, y: pasteY } = project({ x: mousePosRef.current.x, y: mousePosRef.current.y })) => {
        const minX = Math.min(...bufferedNodes.current.map((s) => s.position.x));
        const minY = Math.min(...bufferedNodes.current.map((s) => s.position.y));
  
        const now = Date.now();
  
        const newNodes: Node<TaskListNodeModel>[] = bufferedNodes.current.map((node) => {
          const id = `${node.id}-${now}`;
          const x = pasteX + (node.position.x - minX);
          const y = pasteY + (node.position.y - minY);
  
          return { ...node, id, position: { x, y } };
        });
  
        const newEdges: Edge[] = bufferedEdges.current.map((edge) => {
          const id = `${edge.id}-${now}`;
          const source = `${edge.source}-${now}`;
          const target = `${edge.target}-${now}`;
  
          return { ...edge, id, source, target };
        });
  
        setNodes((nodes) => [...nodes.map((node) => ({ ...node, selected: false })), ...newNodes]);
        setEdges((edges) => [...edges, ...newEdges]);
      },
      [bufferedNodes, bufferedEdges, project, setNodes, setEdges]
    );
  
    return { cut, copy, paste, bufferedNodes, bufferedEdges };
}

export default useCopyPaste;