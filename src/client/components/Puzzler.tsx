import React, { ReactElement, useEffect, useState } from 'react';
import { GenPuzzlerResponse, Region } from '../../shared/api';
import { getPuzzlerUrl } from '../clientApi';
import * as R from 'ramda';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../redux/store';
import { CheckChoice, LoadNextPuzzler, Type } from '../redux/actions';

export function Puzzler(): ReactElement {
    const puzzler = useSelector((state: State) => state.puzzler);
    useEffect(() => {
        if (!puzzler) {
            loadNextPuzzler();
        }
    }, [puzzler]);
    const dispatch = useDispatch();

    function loadNextPuzzler() {
        const loadAction: LoadNextPuzzler = {
            type: Type.LOAD_NEXT_PUZZLER,
        };
        dispatch(loadAction);
    }

    return <>
        <h1>Guess the code snippet which produces this layout</h1>
        <LayoutFrame puzzler={ puzzler }/>
        <DiffHint/>
        <Choices puzzler={ puzzler }/>
        <NextButton loadNextPuzzler={ loadNextPuzzler }/>
    </>
}

function LayoutFrame(p: {puzzler: GenPuzzlerResponse | null}): ReactElement {
    return <>{
        p.puzzler &&
        <iframe className='puzzler-choice' src={ getPuzzlerUrl(p.puzzler) }/>
    }</>;
}

function DiffHint(): ReactElement {
    const [diffHint, setDiffHint] = useState(true);
    return <>{
        diffHint &&
        <div style={ {margin: '10px'} }>Only fragments <b>in bold</b> differ { ' ' }
            <button type='button' onClick={ () => setDiffHint(false) }>Got it</button>
        </div>
    }</>;
}

function Choices(p: {puzzler: GenPuzzlerResponse | null}): ReactElement {
    return <>{
        p.puzzler &&
        R.range(0, p.puzzler.choicesCount)
            .map((choice: number) =>
                <Choice
                    key={ p.puzzler!.id + '_' + choice }
                    puzzler={ p.puzzler! }
                    choice={ choice }
                />
            )
    }</>
}

function Choice(p: {puzzler: GenPuzzlerResponse, choice: number}): ReactElement {
    const choiceCode = useSelector((state: State) => state.choiceCodes[p.choice]);
    const highlight = useSelector((state: State) => {
        if (state.answer?.puzzlerId === p.puzzler.id) {
            if (state.answer.correctChoice === p.choice) {
                return 'correct';
            }
            if (state.answer.userChoice === p.choice) {
                return 'incorrect';
            }
        }
        return '';
    })

    const dispatch = useDispatch();

    function handleClick() {
        if (p.puzzler.id !== choiceCode?.puzzlerId) {
            // Not loaded yet
            return;
        }

        const checkChoice: CheckChoice = {
            type: Type.CHECK_CHOICE,
            puzzler: p.puzzler,
            choice: p.choice,
        };
        dispatch(checkChoice);
    }

    return <div className={ `choice ${highlight}` } onClick={ handleClick }>{
        choiceCode &&
        choiceCode.code.map(
            (regions, i) =>
                <Line key={ i } regions={ regions } />
        )
    }</div>;
}

function Line(p: {regions: Region[]}) {
    const className = (region: Region) => region.differing
        ? region.kind + ' differing'
        : region.kind;

    return <pre>{
        p.regions.map((region: Region, i) =>
            <span key={ i } className={ className(region) }>{ region.text }</span>
        )
    }</pre>
}

function NextButton(p: {loadNextPuzzler: () => void}) {
    const hasAnswer = useSelector((state: State) => state.answer != null);
    return <>{
        hasAnswer &&
        <button type='button'
            onClick={ p.loadNextPuzzler }
            style={{ display: 'block', width: '150px', height: '30px', marginTop: '20px' }}>
            Next
        </button>}
    </>
}