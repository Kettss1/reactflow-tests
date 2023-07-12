import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from '@/components/task-list-node/task-list-node.module.scss';
import { Handle, NodeResizeControl, NodeToolbar, Position, useReactFlow, useStore, useStoreApi } from 'reactflow';

import 'reactflow/dist/style.css';
import TaskListStep from '../task-list-step/task-list-step';
import Icon from '../icon/icon';
import useNodesStore, { Store } from '@/store/store';
import { shallow } from 'zustand/shallow';
import { TaskListStepModel } from '../task-list-step/task-list-step.model';
import useDetachNodes from '@/utils/hooks/use-detach-nodes';

const selector = (state: Store) => state;

function TaskListNode(props: any) {
  const [steps, setSteps] = useState<TaskListStepModel[]>([]);
  const nodeRef = useRef<HTMLDivElement>(null); 
  const detachNodes = useDetachNodes();
  const { getNode } = useReactFlow();
  const hasParent = useStore((store) => !!store.nodeInternals.get(props.id)?.parentNode);

  const { board, addStep, addStepDescription, deleteStep, changeStepStatus } = useNodesStore(selector, shallow);

  useEffect(() => {
    const currentNode = board.nodes.find((node) => node.id === props.id);

    if(currentNode) setSteps(currentNode.data.taskListItems);
  }, [board, props.id]);

  const onDeleteStep = (stepIndex: number) => {
    deleteStep(props.id, stepIndex);
  }

  const onChangeStepStatus = (stepIndex: number, completed: boolean) => {
    changeStepStatus(props.id, stepIndex, completed);
  }

  const changeStepDescription = (stepIndex: number, description: string) => {
    addStepDescription(props.id, stepIndex, description);
  }

  const getNextIndex = (): number => {
    return steps.length + 1;
  }

  const controlStyle = {
    background: 'transparent',
    border: 'none',
    left: 'unset',
    top: 'unset',
    bottom: '10px',
    right: '0%',
    width: '12px',
  };
  
  const focusStepInput = useCallback(() => {
    const node = getNode(props.id);
    console.log(node);
    let nodeStepInputs: HTMLInputElement[] = [];
    const nodeInputs = nodeRef.current!.querySelectorAll('input');
    nodeInputs.forEach((input) => {
      if(input.type === 'text') {
        nodeStepInputs.push(input);
      }
    });
  }, []);
  
  const createNewStep = useCallback(() => {
    addStep(props.id, { description: '', index: getNextIndex()});
    focusStepInput();
  }, []);

  const onDetach = () => detachNodes([props.id]);

  return (
    <div className={styles.taskListNodeContainer} ref={nodeRef}>
      <Handle className={styles.leftHandle} type="target" position={Position.Left} />
      <div className={styles.progressBar} />
      <div>
        {steps?.map((step, index) => (
          <TaskListStep completed={step.completed} key={index} description={step.description} index={index} handleDeleteStep={() => onDeleteStep(index)} onChangeDescription={(e: any) => changeStepDescription(index, e.target.value)} changeStepStatus={(e: any) => onChangeStepStatus(index, e.target.checked)} handleStepShortcut={() => createNewStep()} ></TaskListStep>
        ))}
      </div>
      <button onClick={() => createNewStep()} className={styles.addStepButton}>
        <Icon url={'images/svg/add-node-icon.svg'}></Icon>
      </button>
      <Handle className={styles.rightHandle} type="source" position={Position.Right} />
      <NodeResizeControl style={controlStyle} minWidth={200} minHeight={60}>
        <Icon url={'images/svg/resizer-icon.svg'}></Icon>
      </NodeResizeControl>

      <NodeToolbar className="nodrag">
        {hasParent && <button onClick={onDetach}>Detach</button>}
      </NodeToolbar>
    </div>
  );
  }

export default TaskListNode;