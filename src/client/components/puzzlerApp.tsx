import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mapCurrentView, ofCurrentView, ofCurrentViewOrUndefined, PuzzlerView, State } from '../redux/store';
import { navNextPuzzler, navPrevPuzzler, resetSsrData } from '../redux/actions';
import { Dispatch } from 'redux';
import { gaInit, gaNewPuzzler, genNewPuzzler, initClient } from '../redux/thunks';
import { stream } from '../stream/stream';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import { CodePaper } from './codePaper';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Choices } from './choices';
import { STYLE_ID } from '../../shared/templateConst';
import useTheme from '@material-ui/core/styles/useTheme';
import { PaletteType, Theme } from '@material-ui/core';
import { globalRe } from '../util';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from './theme';
import Brightness2Icon from '@material-ui/icons/Brightness2';
import BrightnessHigh from '@material-ui/icons/BrightnessHigh';
import { getContrastColorValue } from './contrastColorValue';
import { resolveColor } from '../redux/resolveColor';
import { Footer } from './footer';
import {
    BrowserRouter as Router, Switch, Route
} from 'react-router-dom';
import { Credits } from './credits';
import { ScrollToTop } from './scrollToTop';

export function PuzzlerApp(): ReactElement {
    const ssr = useSelector(state => state.ssr);
    const htmlCode = useSelector(ofCurrentView('body', []));
    const [paletteType, setPaletteType] = useState<PaletteType>('light');
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(gaInit());
        if (ssr) {
            dispatch(resetSsrData());
            const jssStyles = document.getElementById(STYLE_ID)!;
            jssStyles.parentElement!.removeChild(jssStyles);
            dispatch(gaNewPuzzler());
        } else {
            dispatch(initClient());
        }
    }, []);

    const theme = useMemo(() => createTheme(paletteType), [paletteType]);

    return <ThemeProvider theme={ theme }>
        <CssBaseline/>
        <MyAppBar paletteType={ paletteType } setPaletteType={ setPaletteType }/>
        <Router>
            <ScrollToTop />
            <Switch>
                <Route path='/' exact>
                    <Grid container direction='column' alignItems='center' component='main'>
                        <PuzzlerRendered/>
                        <Choices/>
                        <Grid item>
                            <CodePaper code={ htmlCode } />
                        </Grid>
                        <Grid item>
                            <Footer/>
                        </Grid>
                    </Grid>
                </Route>
                <Route path='/credits'>
                    <Container maxWidth='sm'>
                        <Credits />
                    </Container>
                </Route>
            </Switch>
        </Router>
    </ThemeProvider>;
}

function MyAppBar(p: {paletteType: PaletteType, setPaletteType: (paletteType: PaletteType) => void}) {
    const togglePaletteType = () => {
        if (p.paletteType === 'light') {
            p.setPaletteType('dark');
        } else {
            p.setPaletteType('light');
        }
    };

    return <>
        <AppBar color={ p.paletteType === 'light' ? 'primary' : 'default' }>
            <Toolbar variant='dense'>
                <Container maxWidth='sm' disableGutters>
                    <Grid container alignItems='center'>
                        <Grid item style={{ flexGrow: 1 }}>
                            <Typography variant="h6">
                                Guess CSS!
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Score/>
                            <DonePuzzler/>
                        </Grid>
                        <Grid item style={{ flexGrow: 1.38127 }}>
                            <IconButton onClick={ togglePaletteType } style={{ float: 'right' }}>
                                {
                                    p.paletteType === 'light' &&
                                    <Brightness2Icon htmlColor='white' titleAccess='dark theme'/> ||
                                    <BrightnessHigh titleAccess='lightTheme'/>
                                }
                            </IconButton>
                        </Grid>
                    </Grid>
                </Container>
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
    if (stream(state.puzzlerViews).last().orElseUndefined()?.status.userChoice != null) {
        return state.puzzlerViews.length;
    }
    return state.puzzlerViews.length - 1;
}

const useStyles = makeStyles(theme => ({
    layoutSize: {
        height: 130,
        width: 190,
        [theme.breakpoints.up('narrow')]: {
            width: 240,
        },
    },
    iframe: {
        border: 'none',
    },
    iframePaper: {
        marginTop: theme.spacing(1),
    },
}));

function PuzzlerRendered() {
    const source = useSelector(ofCurrentView('source', ''));
    const vars = useSelector(ofCurrentViewOrUndefined('vars'));
    const theme = useTheme();
    const classes = useStyles();

    return <Grid container justify='center' alignItems='center'>
        <Grid item>
            <PrevButton/>
        </Grid>
        <Grid item>
            <Paper className={ `${classes.layoutSize} ${classes.iframePaper}` }>
                <iframe className={ `${classes.layoutSize} ${classes.iframe}` } srcDoc={
                    insertColors(source, vars, theme)
                }/>
            </Paper>
        </Grid>
        <Grid item>
            <NextButton/>
        </Grid>
    </Grid>;
}

function insertColors(src: string, vars: PuzzlerView['vars'] | undefined, theme: Theme): string {
    if (!vars) {
        return src;
    }

    const colorsInserted = vars.colors
        .reduceRight(
            (t, assignedCol) => t.replace(
                globalRe(assignedCol.id),
                resolveColor(assignedCol, theme.palette.type),
            ),
            src
        );

    const contrastColorValue = getContrastColorValue(theme);
    return colorsInserted.replace(
        globalRe(vars.contrastColor),
        contrastColorValue,
    );
}

function PrevButton() {
    const hasPrev = useSelector(state => state.current > 0);
    const dispatch: Dispatch = useDispatch();

    function handlePrev() {
        if (hasPrev) {
            dispatch(navPrevPuzzler());
        } else {
            throw new Error('Cannot navPrev')
        }
    }

    return <IconButton onClick={ handlePrev } disabled={ !hasPrev }>
        <KeyboardArrowLeft titleAccess='previous puzzler'/>
    </IconButton>;
}

function NextButton() {
    const hasNext = useSelector(state => state.current < state.puzzlerViews.length - 1);
    const isAnswered = useSelector(mapCurrentView(v => v.status.userChoice != null, false));
    const dispatch = useDispatch();

    function handleNext() {
        if (hasNext) {
            dispatch(navNextPuzzler());
        } else if (isAnswered) {
            dispatch(genNewPuzzler(false));
        } else {
            throw new Error('Cannot navNext');
        }
    }

    return <IconButton onClick={ handleNext }
                       disabled={ !hasNext && !isAnswered }
                       color={ isAnswered && !hasNext ? 'primary' : 'default' }>
        <KeyboardArrowRight titleAccess='next puzzler'/>
    </IconButton>;
}
