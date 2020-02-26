import { GenPuzzlerResponse, Region } from '../../shared/api';

export enum Type {
    LOAD_NEXT_PUZZLER = 'LOAD_NEXT_PUZZLER',
    DISPLAY_PUZZLER = 'DISPLAY_PUZZLER',
    LOAD_CHOICE = 'LOAD_CHOICE',
    DISPLAY_CHOICE = 'DISPLAY_CHOICE',
    CHECK_CHOICE = 'CHECK_CHOICE',
    HIGHLIGHT_CHOICE = 'HIGHLIGHT_CHOICE',
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
    puzzlerId: string,
    choice: number,
    code: Region[][],
}

export interface CheckChoice extends Action {
    type: Type.CHECK_CHOICE,
    puzzler: GenPuzzlerResponse,
    choice: number,
}

export interface HighlightChoice extends Action {
    type: Type.HIGHLIGHT_CHOICE,
    puzzlerId: string,
    choice: number,
    highlight: ChoiceHighlight,
}

export enum ChoiceHighlight {
    NONE = '',
    CORRECT = 'correct',
    INCORRECT = 'incorrect',
}
