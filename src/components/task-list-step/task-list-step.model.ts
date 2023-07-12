export type TaskListStepModel = {
    index: number;
    description: string;
    handleDeleteStep?: any;
    completed?: boolean;
    onChangeDescription?: any;
    changeStepStatus?: any;
    handleStepShortcut?: any;
}