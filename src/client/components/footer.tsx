import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { spacing } from './theme';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import FacebookIcon from '@material-ui/icons/Facebook';
import RedditIcon from '@material-ui/icons/Reddit';
import TwitterIcon from '@material-ui/icons/Twitter';
import GitHubIcon from '@material-ui/icons/GitHub';
import Box from '@material-ui/core/Box';
import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
    root: {
        margin: theme.spacing(spacing),
        textAlign: 'center',
    },
    icon: {
        verticalAlign: -6,
    },
    devLogo: {
        width: 30,
        height: 24,
        paddingTop: 0,
        paddingRight: 4.2,
        paddingBottom: 0,
        paddingLeft: 5.4,
        background: 'currentColor',
        fill: '#fff',
        borderRadius: 1.8,
    },
}));

export function Footer() {
    const classes = useStyles();

    return <Box className={ classes.root }>
        <Typography variant='body2' color='textSecondary'>
            <Link target='_blank' color='inherit' href='https://www.facebook.com/people/Alexey-Berezkin/100005955309004'>
                <FacebookIcon className={ classes.icon } titleAccess='Facebook profile'/>
            </Link> { ' ' }
            <Link target='_blank' color='inherit' href='https://www.reddit.com/user/basic-coder'>
                <RedditIcon className={ classes.icon } titleAccess='Reddit profile'/>
            </Link> { ' ' }
            <Link target='_blank' color='inherit' href='https://twitter.com/a_v_berezkin'>
                <TwitterIcon className={ classes.icon } titleAccess='Twitter profile'/>
            </Link> { ' ' }
            <Link target='_blank' color='inherit' href='https://github.com/aleksei-berezkin/guess-css'>
                <GitHubIcon className={ classes.icon } titleAccess='Github repo'/>
            </Link> { ' ' }
            <Link target='_blank' color='inherit' href='https://dev.to/alekseiberezkin'>
                <Dev className={ classes.icon } titleAccess='Dev.to account'/>
            </Link>
        </Typography>
        <Link to='/credits' component={ RouterLink }>Credits</Link>
    </Box>
}

function Dev(p: {className: string, titleAccess: string}) {
    const classes = useStyles();

    return <svg xmlns='http://www.w3.org/2000/svg' version='1' width='20%' height='20%' viewBox="0 0 132 65" role='img'
            className={`${p.className} ${classes.devLogo}`}><title>${p.titleAccess}</title>
        <path
            d='M0 33v32h11.3c12.5 0 17.7-1.6 21.5-6.5 3.8-4.8 4.4-9 4-28-.3-16.8-.5-18.2-2.7-21.8C30.3 2.5 26.1 1 12 1H0v32zm23.1-19.1c2.3 1.9 2.4 2.3 2.4 18.5 0 15.7-.1 16.7-2.2 18.8-1.7 1.6-3.5 2.2-7 2.2l-4.8.1-.3-20.8L11 12h4.9c3.3 0 5.6.6 7.2 1.9zm23-10.3c-2 2.6-2.1 3.9-2.1 29.6v26.9l2.5 2.4c2.3 2.4 2.9 2.5 16 2.5H76V54.1l-10.2-.3-10.3-.3v-15l6.3-.3 6.2-.3V27H55V12h21V1H62.1c-13.9 0-14 0-16 2.6zM87 15.2c2.1 7.9 5.5 20.8 7.6 28.8 3.2 12.3 4.3 15 7 17.7 1.9 2 4.2 3.3 5.7 3.3 3.1 0 7.1-3.1 8.5-6.7 1-2.6 15.2-55.6 15.2-56.8 0-.3-2.8-.5-6.2-.3l-6.3.3-5.6 21.5c-3.5 13.6-5.8 20.8-6.2 19.5C105.9 40 96 1.9 96 1.4c0-.2-2.9-.4-6.4-.4h-6.4L87 15.2z'/>
    </svg>
}
