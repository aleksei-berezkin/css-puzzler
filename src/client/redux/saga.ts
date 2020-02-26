import { apply, call, put, putResolve, select, takeEvery, takeLeading } from 'redux-saga/effects';
import {
    CheckChoice,
    DisplayAnswer,
    DisplayChoice,
    DisplayPuzzler,
    LoadChoice,
    LoadNextPuzzler,
    Type
} from './actions';
import { fetchChoice, fetchCorrectChoice, fetchGenPuzzler } from '../clientApi';
import { ChoiceResponse, CorrectChoiceResponse, GenPuzzlerResponse } from '../../shared/api';
import * as R from 'ramda';
import { State } from './store';

export function* rootSaga() {
    yield takeEvery(Type.LOAD_NEXT_PUZZLER, loadNextPuzzler);
    yield takeEvery(Type.LOAD_CHOICE, loadChoice);
    yield takeLeading(Type.CHECK_CHOICE, checkChoice);
}

function *loadNextPuzzler(_: LoadNextPuzzler) {
    const r: Response = yield call(fetchGenPuzzler);
    const puzzler: GenPuzzlerResponse = yield apply(r, r.json, []);
    const displayPuzzler: DisplayPuzzler = {
        type: Type.DISPLAY_PUZZLER,
        puzzler,
    };
    yield putResolve(displayPuzzler);

    yield *R.range(0, puzzler.choicesCount)
        .map(choice => {
            const loadChoice: LoadChoice = {
                type: Type.LOAD_CHOICE,
                puzzler,
                choice,
            };
            return put(loadChoice);
        });
}

function *loadChoice(loadChoice: LoadChoice) {
    const r: Response = yield call(fetchChoice, loadChoice.puzzler, loadChoice.choice);
    const code: ChoiceResponse = yield apply(r, r.json, []);
    const displayChoice: DisplayChoice = {
        type: Type.DISPLAY_CHOICE,
        puzzlerId: loadChoice.puzzler.id,
        choice: loadChoice.choice,
        code,
    };
    yield put(displayChoice);
}

function *checkChoice(checkChoice: CheckChoice) {
    if (yield select((state: State) => state.answer != null)) {
        return;
    }

    const r: Response = yield call(fetchCorrectChoice, checkChoice.puzzler);
    const correctChoice: CorrectChoiceResponse = yield apply(r, r.json, []);

    const displayAnswer: DisplayAnswer = {
        type: Type.DISPLAY_ANSWER,
        puzzlerId: checkChoice.puzzler.id,
        userChoice: checkChoice.choice,
        correctChoice,
    }
    yield put(displayAnswer);
}