import { TaskListNodeModel } from '@/components/task-list-node/task-list-node.model';
import { TaskListStepModel } from '@/components/task-list-step/task-list-step.model';
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
  } from 'reactflow';
import { create } from 'zustand';
import { persist } from 'zustand/middleware'

type Board = {
    nodes: Node<TaskListNodeModel>[];
    edges: Edge[];
}

export type Store = {
    board: Board;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    addNode: (node: Node<TaskListNodeModel>) => void;
    addStep: (nodeId: string, step: TaskListStepModel) => void;
    deleteStep: (nodeId: string, stepIndex: number) => void;
    addStepDescription: (nodeId: string, stepIndex: number, description: string) => void;
    changeStepStatus: (nodeId: string, stepIndex: number, completed: boolean) => void;
}

const useNodesStore = create<Store>()(
  persist<Store>(
    (set, get) => ({
      board: {
        nodes: [],
        edges: [],
      },
      onNodesChange: (changes: NodeChange[]) => {
        set({
          board: {
              edges: get().board.edges,
              nodes: applyNodeChanges(changes, get().board.nodes),
          },
        });
      },
      onEdgesChange: (changes: EdgeChange[]) => {
        set({
          board: {
              nodes: get().board.nodes,
              edges: applyEdgeChanges(changes, get().board.edges),
          },
        });
      },
      onConnect: (connection: Connection) => {
        set({
          board: {
              nodes: get().board.nodes,
              edges: addEdge(connection, get().board.edges),
          }
        });
      },
      addNode: (node: Node<TaskListNodeModel>) => {
        set({
          board: {
            nodes: [ ...get().board.nodes, node ],
            edges: get().board.edges,
          }
        })
      },
      addStep: (nodeId: string, step: TaskListStepModel) => {
        set({
          board: {
            edges: get().board.edges,
            nodes: get().board.nodes.map((node) => {
              if(node.id === nodeId) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    taskListItems: [
                      ...node.data.taskListItems,
                      step
                    ]
                  }
                }
              }

              return node;
            })
          }
        })
      },
      addStepDescription: (nodeId: string, stepIndex: number, description: string) => {
        set({
          board: {
            edges: get().board.edges,
            nodes: get().board.nodes.map((node) => {
              if(node.id === nodeId) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    taskListItems: node.data.taskListItems.map((step, index) => {
                      if(index === stepIndex) {
                        return {
                          ...step,
                          description,
                        }
                      }

                      return step;
                    })
                  }
                }
              }

              return node;
            })
          }
        })
      },
      deleteStep: (nodeId: string, stepIndex: number) => {
        set({
          board: {
            edges: get().board.edges,
            nodes: get().board.nodes.map((node) => {
              if(node.id === nodeId) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    taskListItems: node.data.taskListItems.filter((_, index) => index !== stepIndex)
                  }
                }
              }

              return node;
            })
          }
        })
      },
      changeStepStatus: (nodeId: string, stepIndex: number, completed: boolean) => {
        set({
          board: {
            edges: get().board.edges,
            nodes: get().board.nodes.map((node) => {
              if(node.id === nodeId) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    taskListItems: node.data.taskListItems.map((step, index) => {
                      if(index === stepIndex) {
                        return {
                          ...step,
                          completed,
                        }
                      }

                      return step;
                    })
                  }
                }
              }

              return node;
            })
          }
        })
      }
    }),
    {
      name: 'board',
    }
  )
)

export default useNodesStore;