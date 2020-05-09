import { randomBounded, randomNumericalEnum } from '../../util';
import { Puzzler } from '../puzzler';
import { Topic } from './topic';
import { genBody } from './genBody';
import { genCssRulesChoices } from './genCss';
import { genSelectorsPuzzler } from './selectors/genSelectorsPuzzler';

export function genPuzzler(): Puzzler {
    const topic = randomNumericalEnum(Topic);
    if (topic === Topic.SELECTORS) {
        return genSelectorsPuzzler();
    }

    const body = genBody(topic);
    const rulesChoices = genCssRulesChoices(body, topic);
    if (rulesChoices) {
        return new Puzzler(body, rulesChoices, randomBounded(rulesChoices.length()));
    }

    return genPuzzler();
}
