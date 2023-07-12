import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, { Node, Panel, XYPosition, useReactFlow, useStoreApi } from 'reactflow';

import 'reactflow/dist/style.css';
import TaskListNode from '../task-list-node/task-list-node';
import useNodesStore, { Store } from '@/store/store';
import { shallow } from 'zustand/shallow';
import { TaskListStepModel } from '../task-list-step/task-list-step.model';
import useCopyPaste from '@/utils/hooks/use-copy-paste';
import styles from '@/components/board/board.module.scss';
import { getNodePositionInsideParent, sortNodes } from '@/utils/utils';
import TextFrameNode from '../text-node/text-node';

const selector = (state: Store) => state;

const proOptions = {
  hideAttribution: true,
};

const onDragOver = (event: any) => {
  event.preventDefault();
  event.dataTransfer!.dropEffect = 'move';
};

export default function Board() {
  const mousePosRef = useRef<XYPosition>({ x: 0, y: 0 });
  const { board, onConnect, onEdgesChange, onNodesChange, addNode } = useNodesStore(selector, shallow); 
  const { project, setNodes, setEdges, getIntersectingNodes } = useReactFlow();
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const connectingNodeId = useRef(null);
  const store = useStoreApi();
  const { getNodes } = store.getState();

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      const intersections = getIntersectingNodes(node).filter((n) => n.type === 'group');
      const groupNode = intersections[0];

      // when there is an intersection on drag stop, we want to attach the node to its new parent
      if (intersections.length && node.parentNode !== groupNode?.id) {
        const nextNodes: Node[] = store
          .getState()
          .getNodes()
          .map((n) => {
            if (n.id === groupNode.id) {
              return {
                ...n,
                className: '',
              };
            } else if (n.id === node.id) {
              const position = getNodePositionInsideParent(n, groupNode) ?? { x: 0, y: 0 };

              return {
                ...n,
                position,
                parentNode: groupNode.id,
                extent: 'parent' as 'parent',
              };
            }

            return n;
          })
          .sort(sortNodes);

        setNodes(nextNodes);
      }
    },
    [getIntersectingNodes, setNodes, store]
  );

  const onNodeDrag = useCallback(
    (_: any, node: Node) => {

      const intersections = getIntersectingNodes(node).filter((n) => n.type === 'group');
      const groupClassName = intersections.length && node.parentNode !== intersections[0]?.id ? 'active' : '';

      setNodes((nds) => {
        return nds.map((n) => {
          if (n.type === 'group') {
            return {
              ...n,
              className: groupClassName,
            };
          } else if (n.id === node.id) {
            return {
              ...n,
              position: node.position,
            };
          }

          return { ...n };
        });
      });
    },
    [getIntersectingNodes, setNodes]
  );

  const createNode = useCallback(() => {
    const now = Date.now();
    const id = `node-${getNodes().length + 1}-${now}`;
    const newStep: TaskListStepModel = {
      description: '',
      index: 0,
    }   

    const { x, y } = project({ x: mousePosRef.current.x, y: mousePosRef.current.y });
    const newNode = {
      id,
      type: 'taskListNode',
      position: { x, y },
      data: {
        taskListItems: [newStep],
      },
    }

    addNode(newNode);
  }, [addNode, store, board.nodes]);

  // const createNodeOnMousePosition = useCallback(() => {
  //   const { x, y } = project({ x: mousePosRef.current.x, y: mousePosRef.current.y });
  // }, []);

  const createFrameNode = () => {
    const id = `node-${board.nodes.length + 1}`;   

    const newNode = {
      id,
      type: 'textFrameNode',
      position: { x: 0, y: 0 },
      data: { },
    }

    setNodes((nds) => nds.concat(newNode));
  };

  const { copy, paste, cut } = useCopyPaste();

  const keyboardShortcutsFunction = (event: KeyboardEvent) => {
    const ctrl = event.ctrlKey;
    const key = event.key;

    if(ctrl && key === 'c') {
      copy();
    }

    if(ctrl && key === 'x') {
      cut();
    }

    if(ctrl && key === 'v') {
      paste();
    }

    if(ctrl && key === 'z') {
      console.log('undo!')
    }
  }

  const dbclickFunction = () => {
    createNode()
  }

  const onConnectStart = useCallback((_: any, { nodeId }: any) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event: any) => {
      const targetIsPane = event.target.classList.contains('react-flow__pane');

      if (targetIsPane) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const { top, left } = reactFlowWrapper.current!.getBoundingClientRect();
        const now = Date.now();
        const newStep: TaskListStepModel = {
          description: '',
          index: 0,
        };
        const id = `newNode_${now}`;
        const newNode = {
          id,
          position: project({ x: event.clientX - left, y: event.clientY - top }),
          data: {
            taskListItems: [newStep],
          },
          type: 'taskListNode',
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => eds.concat({ id, source: connectingNodeId.current!, target: id }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project]
  );

  const onMouseMove = (event: MouseEvent) => {
    const bounds = reactFlowWrapper.current!.getBoundingClientRect();
    mousePosRef.current = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    }
  }

  useEffect(() => {
    const events = ['cut', 'copy', 'paste'];

    const preventDefault = (e: Event) => e.preventDefault();

    for (const event of events) {
      window.addEventListener(event, preventDefault);
    }

    window.addEventListener('keydown', keyboardShortcutsFunction, false);
    window.addEventListener('dblclick', dbclickFunction, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nodeTypes = useMemo(() => ({ taskListNode: TaskListNode, textFrameNode: TextFrameNode }), []);
  const panOnDrag = [1, 2];

  return (
    <div style={{ width: '100vw', height: '100vh' }} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={board.nodes}
        edges={board.edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        deleteKeyCode={['Delete', 'Backspace']}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        fitView
        proOptions={proOptions}
        selectionOnDrag
        panOnDrag={panOnDrag}
        multiSelectionKeyCode={['ControlLeft', 'ControlRight']}
        selectionKeyCode={['ControlLeft', 'ControlRight']}
        zoomOnDoubleClick={false}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onDragOver={onDragOver}
        onMouseMove={(event) => onMouseMove(event.nativeEvent)}
      >
        <Panel position={'top-left'} className={styles.boardPanel}>
          <button className={styles.addNewNodeButton} onClick={() => createNode()}>create new node</button>
          <button className={styles.addNewFrameNodeButton} onClick={() => createFrameNode()}>create new frame node</button>
        </Panel>
      </ReactFlow>
    </div>
  );
}