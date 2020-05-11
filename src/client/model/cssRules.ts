import { Region, RegionKind } from './region';
import { Indent } from './indent';
import { Vector } from 'prelude-ts';

export type Declaration = [
    string,
    string,
    boolean?
];

export class Rule {
    private _selectorsString?: string;

    constructor(
        private readonly selectors: Selector | Vector<Selector>,
        private readonly declarations: Vector<Declaration>,
        private readonly selectorsDiffering: boolean = false) {
    }

    toUnformattedCode() {
        return this.selectorsString + '{' + this.declarationsToString() + '}';
    }

    private declarationsToString(): string {
        return this.declarations
            .map(([name, value]) => `${name}: ${value};`)
            .mkString(' ');
    }

    get selectorsString() {
        if (this._selectorsString == undefined) {
            if (this.selectors instanceof Vector) {
                this._selectorsString = this.selectors
                    .map(sel => sel.toString())
                    .mkString(', ');
            } else {
                this._selectorsString = this.selectors.toString();
            }
        }
        return this._selectorsString;
    }

    toRegions(indent: Indent): Vector<Region[]> {
        return Vector.of<Region[]>(
            [
                indent,
                {kind: RegionKind.Selector, text: this.selectorsString, differing: this.selectorsDiffering},
                {kind: RegionKind.Default, text: ' {'},
            ])
            .appendAll(this.declarationsToRegions(indent.indent()))
            .append([
                indent,
                {kind: RegionKind.Default, text: '}'},
            ]);
    }


    private declarationsToRegions(indent: Indent): Vector<Region[]> {
        return this.declarations
            .map(([name, value, differing]): Region[] =>
                [
                    indent,
                    {kind: RegionKind.DeclName, text: name},
                    {kind: RegionKind.Default, text: ': '},
                    ...Rule.valueToRegions(name, value, differing),
                    {kind: RegionKind.Default, text: ';'},
                ]
            );
    }

    private static valueToRegions(name: string, value: string, differing?: boolean): Region[] {
        if (name === 'background-color') {
            return [{kind: RegionKind.DeclValue, text: value, backgroundColor: value, differing}];
        }
        if (name === 'border') {
            const [thickness, style, color] = value.split(' ');
            return [
                {kind: RegionKind.DeclValue, text: `${ thickness } ${ style } `, differing},
                {kind: RegionKind.DeclValue, text: color, differing, backgroundColor: color, color: 'white'},
            ]
        }
        return [{kind: RegionKind.DeclValue, text: value, differing}];
    }
}

export abstract class Selector {
    // noinspection JSUnusedLocalSymbols
    private readonly _nominal: any;
    abstract toString(): string;
}

export class TypeSelector extends Selector {
    // noinspection JSUnusedLocalSymbols
    private readonly _n_ts: any;
    constructor(public readonly type: string) {
        super();
    }
    toString(): string {
        return this.type;
    }
}

export class ClassSelector extends Selector {
    // noinspection JSUnusedLocalSymbols
    private readonly _n_cs: any;
    constructor(public readonly clazz: string) {
        super();
    }
    toString(): string {
        return '.' + this.clazz;
    }
}

export class PseudoClassSelector extends Selector {
    // noinspection JSUnusedLocalSymbols
    private readonly _n_pcs: any;
    constructor(public readonly base: TypeSelector | ClassSelector, public readonly pseudoClass: string) {
        super();
    }
    toString(): string {
        return `${ this.base.toString() }:${ this.pseudoClass }`;
    }
}

export class DescendantCombinator extends Selector {
    private readonly selectors: Vector<Selector>;
    constructor(...selectors: Selector[]) {
        super();
        this.selectors = Vector.ofIterable(selectors);
    }
    toString(): string {
        return this.selectors.mkString(' ');
    }
}

export class ChildCombinator extends Selector {
    private readonly selectors: Vector<Selector>;
    constructor(...selectors: Selector[]) {
        super();
        this.selectors = Vector.ofIterable(selectors);
    }
    toString(): string {
        return this.selectors.mkString('>');
    }
}
