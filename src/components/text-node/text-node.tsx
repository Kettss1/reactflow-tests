import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from '@/components/text-node/text-node.module.scss';
import { NodeProps, NodeResizeControl, NodeToolbar, Position, getRectOfNodes, useReactFlow, useStore, useStoreApi } from 'reactflow';
import 'reactflow/dist/style.css';
import Icon from '../icon/icon';
import useDetachNodes from '@/utils/hooks/use-detach-nodes';

function TextFrameNode({ id }: NodeProps) {
    const store = useStoreApi();
    const { deleteElements } = useReactFlow();
    const detachNodes = useDetachNodes();

    const { minWidth, minHeight, hasChildNodes } = useStore((store) => {
        const childNodes = Array.from(store.nodeInternals.values()).filter((n) => n.parentNode === id);
        const rect = getRectOfNodes(childNodes);
    
        return {
          minWidth: rect.width + 25 * 2,
          minHeight: rect.height + 25 * 2,
          hasChildNodes: childNodes.length > 0,
        };
    }, isEqual);

    const controlStyle = {
        background: 'transparent',
        border: 'none',
        left: 'unset',
        top: 'unset',
        bottom: '15px',
        right: '0%',
        width: '12px',
    };

    const onDelete = () => {
        deleteElements({ nodes: [{ id }] });
    };

    const onDetach = () => {
        const childNodeIds = Array.from(store.getState().nodeInternals.values())
            .filter((n) => n.parentNode === id)
            .map((n) => n.id);

        detachNodes(childNodeIds, id);
    };

    return (
        <div className={styles.textFrameNode}>
            <textarea placeholder={'Adicione o texto aqui'} className={styles.textInput}/>
            <NodeResizeControl style={controlStyle} minWidth={minWidth} minHeight={minHeight}>
                <Icon url={'images/svg/resizer-icon.svg'}></Icon>
            </NodeResizeControl>
            <NodeToolbar className="nodrag">
                {hasChildNodes && <button onClick={onDetach}>Ungroup</button>}
            </NodeToolbar>
        </div>
    );
}

type IsEqualCompareObj = {
    minWidth: number;
    minHeight: number;
    hasChildNodes: boolean;
};

function isEqual(prev: IsEqualCompareObj, next: IsEqualCompareObj): boolean {
    return (
      prev.minWidth === next.minWidth && prev.minHeight === next.minHeight && prev.hasChildNodes === next.hasChildNodes
    );
  }

export default TextFrameNode;