import { ChoiceFormatted, GenPuzzlerResponse } from '../../shared/api';

export enum Type {
    LOAD_NEXT_PUZZLER = 'LOAD_NEXT_PUZZLER',
    DISPLAY_PUZZLER = 'DISPLAY_PUZZLER',
    LOAD_CHOICE = 'LOAD_CHOICE',
    DISPLAY_CHOICE = 'DISPLAY_CHOICE',
    CHECK_CHOICE = 'CHECK_CHOICE',
}

export interface Action {
    type: Type,
}

export interface LoadNextPuzzler extends Action {
    type: Type.LOAD_NEXT_PUZZLER,
}

export interface DisplayPuzzler extends Action {
    type: Type.DISPLAY_PUZZLER,
    puzzler: GenPuzzlerResponse,
}

export interface LoadChoice extends Action {
    type: Type.LOAD_CHOICE,
    puzzler: GenPuzzlerResponse,
    choice: number,
}

export interface DisplayChoice extends Action {
    type: Type.DISPLAY_CHOICE,
    choice: number,
    code: ChoiceFormatted,
}

export interface CheckChoice extends Action {
    type: Type.CHECK_CHOICE,
    puzzler: GenPuzzlerResponse,
    choice: number,
}
