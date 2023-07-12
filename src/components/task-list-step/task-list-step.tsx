import styles from '@/components/task-list-step/task-list-step.module.scss';
import React, { FC, useEffect, useRef, useState } from 'react';
import Icon from '../icon/icon';
import { TaskListStepModel } from './task-list-step.model';

const TaskListStep: FC<TaskListStepModel> = ({ handleDeleteStep, completed, description, onChangeDescription, changeStepStatus, handleStepShortcut }) => {
    const [active, setActive] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputKeyDown = (event: KeyboardEvent) => {
        if(event.key === 'Enter') {
            handleStepShortcut();
        }
    }

    useEffect(() => {
        const inputElement = inputRef.current;
        if(inputElement) {
            inputElement.addEventListener('keydown', handleInputKeyDown, false);
        }

        return () => {
            inputElement?.removeEventListener('keydown', handleInputKeyDown, false);
        }
    })

    return (
        <div className={`${styles.taskListStepContainer}`}>
            <div className={styles.stepDescription}>
                <input type="checkbox" className={styles.checkboxInput} defaultChecked={completed} onChange={changeStepStatus} />
                <input ref={inputRef} readOnly={!active} onFocus={() => setActive(true)} onBlur={() => setActive(false)} type="text" className={`${styles.textCheckbox} ${active ? styles.focused : styles.disabled}`} placeholder="Descreva aqui a atividade" defaultValue={description} onChange={onChangeDescription} />
            </div>
            <button onClick={handleDeleteStep} className={styles.deleteStep}>
                <Icon url={'images/svg/delete-icon.svg'}></Icon>
            </button>
        </div>
    )
};

export default TaskListStep;