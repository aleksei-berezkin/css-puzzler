import React, { ReactElement, useState } from 'react';
import { Region } from '../model/region';
import { stream, streamOf } from '../stream/stream';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useSelector } from 'react-redux';
import { ofCurrentView } from '../redux/store';

type StylesProps = {
    withChildren: boolean,
    
}

const makeCodePaperStyles = makeStyles(theme => ({
    outer: {
        marginTop: theme.spacing(1.5),
        marginRight: theme.spacing(1.5),
        paddingBottom: (p: StylesProps) => p.withChildren ? theme.spacing(1) : 0,
    },
    codeHeader: {
        paddingTop: theme.spacing(1),
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
}));

export function CodePaper(
    p: {
        title: string,
        code: Region[][],
        collapsedCode?: Region[][],
        headerClass?: string,
        children?: ReactElement
    }
) {
    const commonStyleSummary = useSelector(ofCurrentView(v => v?.commonStyleSummary || ''));
    const classes = makeCodePaperStyles({ withChildren: !!p.children });

    return <Paper className={ classes.outer }>
        <AppBar position='static' color='default' className={ p.headerClass }>
            <Box className={ classes.codeHeader }>
                <Typography variant='button'>{ p.title }</Typography>
            </Box>
        </AppBar>

        <Code lines={ p.code } />

        {
            p.collapsedCode &&
            <SimpleCollapsed summary={ commonStyleSummary }>
                <Code lines={ p.collapsedCode }/>
            </SimpleCollapsed>
        }

        {
            p.children
        }
    </Paper>;
}


const makeCollapsedStyles = makeStyles(theme => ({
    expandButton: {
        color: theme.palette.grey![600],
    },
    expandText: {
        color: theme.palette.grey![600],
        cursor: 'pointer',
    },
    expandIcon: {
        transform: 'rotate(0deg)',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandIconOpen: {
        transform: 'rotate(90deg)',
    },
}));

function SimpleCollapsed(p: { summary: string, children: ReactElement }) {
    const [collapsedOpen, setCollapsedOpen] = useState(false);
    const classes = makeCollapsedStyles();

    function toggleCollapsed(e: React.MouseEvent) {
        setCollapsedOpen(!collapsedOpen);
        e.stopPropagation();
    }

    return <>
        <IconButton size='small' className={ classes.expandButton } onClick={ toggleCollapsed }>
            <ChevronRightIcon fontSize='small' className={
                streamOf(classes.expandIcon)
                    .appendIf(collapsedOpen, classes.expandIconOpen)
                    .join(' ')
            }/>
        </IconButton>
        <Typography variant='caption' className={ classes.expandText } onClick={ toggleCollapsed }>{ p.summary }</Typography>
        <Collapse in={ collapsedOpen }>{
            p.children
        }</Collapse>
    </>;
}

const makeCodeStyles = makeStyles(theme => ({
    codeBody: {
        padding: theme.spacing(1.5),
    },
}));

function Code(p: { lines: Region[][] }) {
    const classes = makeCodeStyles();

    return <Box className={ `code ${ classes.codeBody }` }>{
        p.lines &&
        stream(p.lines).zipWithIndex().map(
            ([regions, i]) => <Line key={ i } regions={ regions }/>
        )
    }</Box>;
}

function Line(p: {regions: Region[]}) {
    return <pre>{
        p.regions.map(
            (reg, i) => {
                const className = reg.differing
                    ? reg.kind + ' differing'
                    : reg.kind;

                return <span key={ i } className={ className } style={ getStyle(reg) }>{ reg.text }</span>;
            }
        )
    }</pre>
}

function getStyle(reg: Region) {
    if (reg.backgroundColor) {
        if (reg.color) {
            return {
                backgroundColor: reg.backgroundColor,
                color: reg.color,
            }
        }
        return {
            backgroundColor: reg.backgroundColor,
        }
    }
    return undefined;
}