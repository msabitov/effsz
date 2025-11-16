import { resolveModule, ruleByPropVals, space } from "./common";


/**
 * Expand container
 */
export interface IExpandContainerElement extends HTMLElement {
    get axis(): 'x' | 'y';
    set axis(val: 'x' | 'y');
    get isOpen(): boolean;
    get size(): number;
    /**
     * Expand to max size
     */
    expand(): void;
    /**
     * Collapse to min size
     */
    collapse(): void;
    /**
     * toggle
     */
    toggle(): void;
}

/**
 * Expand container attributes
 */
export interface IExpandContainerAttrs {
    /**
     * Main axis
     */
    axis: 'x' | 'y';
    /**
     * Min size
     */
    min: string;
    /**
     * Max size
     */
    max: string;
    /**
     * Is container expanded
     */
    open: boolean;

    // transition

    /**
     * Transition-timing-function
     */
    tf: string;
    /**
     * Resize transition duration
     */
    dur: string;
    /**
     * Resize transition delay
     */
    del: string;
};

interface IExpandEvent extends CustomEventInit {
    detail: {
        type: 'change';
        isOpen: boolean;
    }
};

type TExpandEventHandler = (event: IExpandEvent) => void;

export type TUseExpand = {
    (): {
        /**
         * Observe expand events
         * @param callback - event handler
         * @param element - HTML element
         */
        observe: (callback: TExpandEventHandler, element?: HTMLElement) => () => void;
        /**
         * Unobserve expand events
         * @param callback - event handler
         * @param element - HTML element
         */
        unobserve: (callback: TExpandEventHandler, element?: HTMLElement) => void;
    };
};

// constants and utils
const MODULE = 'expand';
const MAX = 'max';
const MIN = 'min';
const FULL = 'full';
const SIZE = 'size';
const FLEX = 'flex';
const OPEN = 'open';
const TF = 'tf';
const DUR = 'dur';
const DEL = 'del';
const AXIS = 'axis';
const FDIR = FLEX + '-direction';
const FBAS = FLEX + '-basis';
const HOST = ':host';
const HOST_X = HOST + '([axis=x])';
const ROOT_CLS_VAL = 'root';
const ROOT_CLS = '.' + ROOT_CLS_VAL;
const CONTENT_CLS_VAL = 'content';
const CONTENT_CLS = '.' + CONTENT_CLS_VAL;
const AUTO = 'auto';
const DISPLAY = 'display';
const CHANGE = 'change';
const SLOTCHANGE = 'slotchange';


const {
    addListener,
    removeListener,
    dispatch,
    tagName,
    varName,
    varExp,
    getStyleSheet
} = resolveModule(MODULE);

const OBSERVED_ATTRS_KEYS = [MIN, MAX, TF, DUR, DEL];

// css
const RULES = [
    ruleByPropVals(HOST, [DISPLAY, 'contents']),
    ruleByPropVals(ROOT_CLS,
        [DISPLAY, FLEX],
        [FDIR, 'column'],
        [varName(SIZE), varExp([MIN], '0px')],
    ),
    ruleByPropVals(space(HOST_X, ROOT_CLS),
        [FDIR, 'row']
    ),
    ruleByPropVals(space(HOST + `([${OPEN}])`, ROOT_CLS),
        [varName(SIZE), varExp([MAX], varExp([FULL],AUTO))],
    ),
    ruleByPropVals(CONTENT_CLS,
        [FBAS, varExp([SIZE], AUTO)],
        ['overflow', 'hidden'],
        ['transition', space(FBAS, varExp([DUR], '200ms'), varExp([TF], 'ease-in'), varExp([DEL], '0ms'))]
    ),
];

const PROPERTY = {
    x: 'clientWidth',
    y: 'clientHeight'
} as const;


/**
 * Use expand container
 */
export const useExpand: TUseExpand = () => {
    const custom = globalThis.customElements;
    const doc = globalThis.document;
    if (custom && !custom?.get(tagName)) {
        custom.define(tagName, class Expand extends HTMLElement implements IExpandContainerElement {
            static get observedAttributes() {
                return OBSERVED_ATTRS_KEYS;
            }

            get axis() {
                return (this.getAttribute(AXIS) || 'y') as IExpandContainerElement['axis'];
            }

            set axis(val: 'x' | 'y') {
                if (val === 'x' || val === 'y') this.setAttribute(AXIS, val);
            }

            get isOpen() {
                return this.getAttribute(OPEN) !== null;
            }

            get size() {
                return this?.shadowRoot?.children[0][PROPERTY[this.axis]] || 0;
            }

            // protected methods

            protected _calcFull() {
                const full = [...this.children].reduce((acc, element) => acc + element[PROPERTY[this.axis]], 0);
                (this.shadowRoot?.children[0] as HTMLElement).style.setProperty(varName('full'), full + 'px');
            }

            // public methods

            collapse() {
                this.removeAttribute(OPEN);
                dispatch(this, CHANGE, {isOpen: false});
            }

            expand() {
                this.setAttribute(OPEN, '');
                dispatch(this, CHANGE, {isOpen: true});
            }

            toggle() {
                if (this.isOpen) this.collapse();
                else this.expand();
            }

            connectedCallback() {
                // shadow root
                const shadowRoot = this.attachShadow({ mode: OPEN });
                shadowRoot.innerHTML = `<div class="${ROOT_CLS_VAL}"><div class="${CONTENT_CLS_VAL}"><slot></slot></div></div>`;
                shadowRoot.adoptedStyleSheets = [getStyleSheet(RULES)];
                // attrs
                OBSERVED_ATTRS_KEYS.forEach((name) => {
                    const val = this.getAttribute(name);
                    if (val) this.attributeChangedCallback(name, '', val);
                });
                // init
                this._calcFull();
                this.addEventListener(SLOTCHANGE, this._calcFull);
            }

            attributeChangedCallback(name: typeof OBSERVED_ATTRS_KEYS[number], _: string, newValue: string) {
                if (!this.shadowRoot) return;
                else if (newValue) (this.shadowRoot?.children[0] as HTMLElement).style.setProperty(varName(name), newValue);
                else (this.shadowRoot?.children[0] as HTMLElement).style.removeProperty(varName(name));
            }

            disconnectedCallback() {
                this.removeEventListener(SLOTCHANGE, this._calcFull);
            }
        });
    }
    return {
        observe: (callback: TExpandEventHandler, element: HTMLElement = doc?.body) => {
            element && addListener(element, callback as unknown as EventListenerOrEventListenerObject);
            return () => element && removeListener(element, callback as unknown as EventListenerOrEventListenerObject);
        },
        unobserve: (callback: TExpandEventHandler, element: HTMLElement = doc?.body) => removeListener(element, callback as unknown as EventListenerOrEventListenerObject)
    };
};
