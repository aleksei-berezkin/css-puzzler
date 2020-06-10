import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../redux/store';
import {
    navNextPuzzler,
    navPrevPuzzler
} from '../redux/actions';
import { Dispatch } from 'redux';
import { checkChoice, genNewPuzzler, initClient } from '../redux/thunks';
import { Lines } from './lines';
import { Body } from './body';
import { range, stream } from '../stream/stream';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles({
    appBarContent: {
        maxWidth: 640,
    },
});

export function Puzzler(): ReactElement {
    const dispatch = useDispatch();
    const classes = useStyles();

    useEffect(() => {dispatch(initClient())}, ['const']);

    return <>
        <MyAppBar classes={classes}/>
        <LayoutFrame/>
        <Choices/>
        <Body/>
    </>
}

function MyAppBar(props: {classes: ReturnType<typeof useStyles>}) {
    return <>
        <AppBar>
            <Toolbar variant='dense'>
                <Grid container justify='center' alignItems='center'>
                    <Grid container className={props.classes.appBarContent} justify='space-between' alignItems='baseline'>
                        <Grid item>
                            <Typography variant="h6">
                                Guess CSS!
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Score/>
                            <DonePuzzler/>
                        </Grid>
                    </Grid>
                </Grid>
            </Toolbar>
        </AppBar>
        <Toolbar variant='dense'/>
    </>;
}

function Score() {
    const isLast = useSelector(state => state.current === state.puzzlerViews.length - 1);
    const correctAnswers = useSelector(state => state.correctAnswers);
    const donePuzzlersNum = useSelector(getDonePuzzlersNum)

    return <>{
        isLast &&
        <Typography>Score: { correctAnswers } of { donePuzzlersNum }</Typography>
    }</>;
}

function DonePuzzler() {
    const isHistory = useSelector(state => state.current < state.puzzlerViews.length - 1);
    const historyPuzzlerPos = useSelector(state => state.current + 1);
    const donePuzzlersNum = useSelector(getDonePuzzlersNum);

    return <>{
        isHistory &&
        <Typography>Done: { historyPuzzlerPos } of { donePuzzlersNum }</Typography>
    }</>
}

function getDonePuzzlersNum(state: State) {
    if (!state.puzzlerViews.length) {
        return 0;
    }
    if (stream(state.puzzlerViews).last().orElseUndefined()?.userChoice != null) {
        return state.puzzlerViews.length;
    }
    return state.puzzlerViews.length - 1;
}

function LayoutFrame() {
    const source = useSelector(state => state.puzzlerViews[state.current]?.source);

    return <div className='puzzler-top'>
        <PrevButton/>
        <>{
            source && <iframe className='layout' srcDoc={ source }/>
        }</>
        <NextButton/>
    </div>;
}

function PrevButton() {
    const hasPrev = useSelector(state => state.current > 0);
    const dispatch: Dispatch = useDispatch();

    function handlePrev() {
        if (hasPrev) {
            dispatch(navPrevPuzzler());
        }
    }

    const active = hasPrev ? 'active' : '';
    return <div onClick={ handlePrev } className={ `nav-puzzlers ${ active } prev` }/>;
}

function NextButton() {
    const hasNext = useSelector(state => state.current < state.puzzlerViews.length - 1);
    const isAnswered = useSelector(state => state.puzzlerViews[state.current]?.userChoice != null);
    const dispatch = useDispatch();

    function handleNext() {
        if (hasNext) {
            dispatch(navNextPuzzler());
        } else if (isAnswered) {
            dispatch(genNewPuzzler(false));
        } else {
            throw new Error('Cannot dispatch');
        }
    }

    const active = (hasNext || isAnswered) ? 'active' : '';
    return <div onClick={ handleNext } className={ `nav-puzzlers ${ active } next` } />;
}

function Choices(): ReactElement {
    const keyBase = useSelector(state => `${state.current}_`);
    const choicesCount = useSelector(state => state.puzzlerViews[state.current]?.styleCodes.length);

    return <div className='choices'>{
        choicesCount &&
        range(0, choicesCount)
            .map((choice: number) =>
                <Choice
                    key={ `${keyBase}_${choice}` }
                    choice={ choice }
                />
            )
            .toArray()
    }</div>
}

function Choice(p: {choice: number}): ReactElement {
    const choiceCode = useSelector(state => state.puzzlerViews[state.current]?.styleCodes[p.choice]);
    const correctChoice = useSelector(state => state.puzzlerViews[state.current]?.correctChoice);
    const userChoice = useSelector(state => state.puzzlerViews[state.current]?.userChoice);

    const highlight = (() => {
        if (userChoice != null && correctChoice === p.choice) {
            return 'correct';
        }
        if (userChoice === p.choice) {
            return 'incorrect';
        }
        return '';
    })();
    const outline = (() => {
        if (userChoice === p.choice) {
            return 'user-choice';
        }
        return '';
    })();

    const dispatch = useDispatch();

    function handleClick() {
        if (userChoice == null) {
            dispatch(checkChoice(p.choice));
        }
    }

    const active = userChoice == null ? 'active' : '';
    return <div className={ `code ${ highlight } ${ outline } ${ active }` } onClick={ handleClick }>
        <Lines lines={choiceCode}/>
    </div>;
}
