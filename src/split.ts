import {
    PARAMS,
    ruleByPropVals, color, resolveModule
} from './common';

/**
 * Split container
 */
export interface ISplitContainerElement extends HTMLElement {
    /**
     * Split axis
     */
    get axis(): 'x' | 'y';
    /**
     * Split reversed flag
     */
    get isReversed(): boolean;
    /**
     * Set size array
     */
    set sizes(val: number[]);
    /**
     * Get size array
     */
    get sizes(): number[];
    /**
     * Get rest size
     */
    get lastSize(): number;
    /**
     * Save size
     */
    saveSize(): void;
    /**
     * Restore previous value
     * @param initial - restore initial value
     */
    restoreSize(initial?: boolean): void;
}
/**
 * Split container attributes
 */
export interface ISplitContainerAttrs {
    // size

    /**
     * Initial size
     */
    ini: string;
    /**
     * Min size
     */
    min: string;
    /**
     * Flex-direction
     */
    fdir: 'r' | 'rr' | 'c' | 'cr';
    /**
     * Flex gap
     */
    gap: string;

    // resizer

    /**
     * Resizer thickness
     */
    th: string;
    /**
     * Active resizer color
     */
    acol: string;
    /**
     * Passive resizer color
     */
    pcol: string;

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
    /**
     * Color transition duration
     */
    cdur: string;
}

const OBSERVED_ATTRS = {
    gap: 'gap',
    th: 'th',
    acol: 'acol',
    pcol: 'pcol',
    tf: 'tf',
    dur: 'dur',
    del: 'del',
    cdur: 'cdur'
};

const OBSERVED_ATTRS_KEYS = Object.keys(OBSERVED_ATTRS);

/**
 * Observed element attrs
 */
const ATTRS = {
    ...OBSERVED_ATTRS,
    ini: 'ini',
    min: 'min',
    a: 'resizing',
    event: 'event'
};
const MODULE = 'split';

const {
    addListener,
    removeListener,
    dispatch,
    tagName,
    varName,
    varExp,
    getStyleSheet,
    EVENT_TYPE
} = resolveModule(MODULE);
// constants
const MOUSE = 'mouse';
const MOVE = 'move';
const MOUSE_DOWN = MOUSE + 'down' as 'mousedown';
const MOUSE_MOVE = MOUSE + MOVE as 'mousemove';
const MOUSE_UP = MOUSE + 'up' as 'mouseup';
const TOUCH = 'touch';
const TOUCH_START = TOUCH + 'start' as 'touchstart';
const TOUCH_MOVE = TOUCH + MOVE as 'touchmove';
const TOUCH_END = TOUCH + 'end' as 'touchend';
const TOUCH_CANCEL = TOUCH + 'cancel' as 'touchcancel';
const CURSOR = 'cursor';
const CUR_R = 'row-resize';
const CUR_C = 'col-resize';
const TRANSITION = 'transition';
const TRANSITION_PROPERTY = TRANSITION + '-property';
const TRANSITION_DURATION = TRANSITION + '-duration';
const TRANSITION_DELAY = TRANSITION + '-delay';
const TRANSITION_TF = TRANSITION + '-timing-function';
const POSITION = 'position';
const RELATIVE = 'relative';
const STOP_PROP = 'stopPropagation';
const PREV_DEF = 'preventDefault';
const REMOVE = 'remove'
const EL = 'EventListener';
const REM_EL = REMOVE + EL as 'removeEventListener';
const ADD_EL = 'add' + EL as 'addEventListener';
const ATTR = 'Attribute'
const GET = 'get';
const GET_ATTR = GET + ATTR as 'getAttribute';
const FULL = '100%';
const DISPLAY = 'display';
const ROOT = '.root';
const _ROOT = ' ' + ROOT;
const RESIZER = '.resizer';
const _RESIZER = ' ' + RESIZER;
const AFTER = '::after';
const HOVER = ':hover';
const FLEX = 'flex';
const FLEX_DIR = FLEX + '-direction';
const FLEX_GROW = FLEX + '-grow';
const FLEX_SHRINK = FLEX + '-shrink';
const FLEX_BASIS = FLEX + '-basis';
const OVERFLOW = 'overflow';
const BGC = 'background-color';
const COL = 'column';
const ROW = 'row';
const _REV = '-reverse';
const COLR = COL + _REV;
const ROWR = ROW + _REV;
const HIDDEN = 'hidden';
const GRID = 'grid';
const ZERO_TIME = '0ms';
const FDIR_C = 'fdir=c';
const FDIR_CR = FDIR_C + 'r';
const FDIR_R = 'fdir=r';
const FDIR_RR = FDIR_R + 'r';
const TRANSFORM = 'transform';
const ZINDEX = 'z-index';

// css handlers
const attrExp = (attr: string, val?: string | number | null) => `[${attr}${val ? '=' + val : ''}]`;
const propVal = (prop: string, val: string | number) => prop + ':' + val + ';';
const rule = (selector: string, content: string) => selector + `{${content}}`;
const host = (...attrs: string[]) => ':host' + '(' + attrs.map(a=>`[${a}]`).join('') + ')';

const VAL = varName('val');

// thickness variants from props
const duration = varExp([ATTRS.dur], ZERO_TIME);
const delay = varExp([ATTRS.del], ZERO_TIME);
const gap = `calc(1rem * ${varExp(['gap'], 0)})`;
const th = `calc(1rem * ${varExp(['th'], 0.25)})`;
const tf = varExp([ATTRS.tf], 'linear');
const activeColor = varExp([ATTRS.acol], color(0.85));
const passiveColor = varExp([ATTRS.pcol], color(0.15));
const colorDuration = varExp([ATTRS.cdur], '200ms');
const RULES = [
    rule(`@property ${VAL}`,'syntax:"*";inherits:false;initial-value:1fr;'),
    ruleByPropVals(':host',
        [DISPLAY, GRID],
        [OVERFLOW, HIDDEN]
    ),
    ruleByPropVals(host(ATTRS.a), [CURSOR, CUR_C]),
    rule(host(ATTRS.a, FDIR_CR) + ', ' + host(ATTRS.a, FDIR_C), propVal(CURSOR, CUR_R)),
    ruleByPropVals(ROOT,
        [DISPLAY, FLEX],
        ['width', FULL],
        ['height', FULL],
        [OVERFLOW, HIDDEN],
        ['flex-wrap', 'nowrap'],
        ['gap', gap]
    ),
    ruleByPropVals(RESIZER,
        [POSITION, RELATIVE],
        [FLEX_BASIS, 0],
        [ZINDEX, 100]
    ),
    ruleByPropVals(RESIZER + AFTER,
        [POSITION, 'absolute'],
        ['content', '""'],
        [BGC, passiveColor],
        ['inline-size', th],
        ['block-size', FULL],
        [TRANSFORM, 'translate(-50%, 0)'],
        [CURSOR, CUR_C],
        [TRANSITION_PROPERTY, BGC],
        [TRANSITION_DURATION, colorDuration],
        [TRANSITION_TF, tf],
        [ZINDEX, 100]
    ),
    ruleByPropVals(RESIZER + HOVER + AFTER + ', ' + _RESIZER + attrExp(ATTRS.a) + AFTER,
        [BGC, activeColor]
    ),
    ruleByPropVals(host(FDIR_C) + _ROOT,
        [FLEX_DIR, COL]
    ),
    ruleByPropVals(host(FDIR_CR) + _ROOT,
        [FLEX_DIR, COLR]
    ),
    ruleByPropVals(host(FDIR_RR) + _ROOT,
        [FLEX_DIR, ROWR]
    ),
    ruleByPropVals(host(FDIR_CR) + _RESIZER + ', ' + host(FDIR_C) + _RESIZER,
        ['writing-mode', 'vertical-lr']
    ),
    ruleByPropVals(host(FDIR_CR) + _RESIZER + AFTER + ', ' + host(FDIR_C) + _RESIZER + AFTER,
        [TRANSFORM, 'translate(0, -50%)'],
        [CURSOR, CUR_R]
    ),
    ruleByPropVals('.item',
        [TRANSITION_PROPERTY, FLEX_BASIS],
        [TRANSITION_DURATION, duration],
        [TRANSITION_DELAY, delay],
        [TRANSITION_TF, tf],
        [DISPLAY, GRID],
        [FLEX, `0 0 var(${VAL})`],
        [POSITION, RELATIVE],
        [OVERFLOW, HIDDEN]
    ),
    ruleByPropVals('.rest',
        [FLEX_GROW, 1],
        [FLEX_SHRINK, 1],
        [DISPLAY, GRID]
    ),
    ruleByPropVals('::slotted(*)', ['overflow', 'hidden'], ['contain', 'size']) 
];

const listen = (area: ISplitContainerElement) => {
    const resolveAttr = (name: string) => area[GET_ATTR](name);
    let resizer: HTMLDivElement;
    let index: number | undefined;
    let prevLimits: {
        min: number;
    } = {
        min: 0
    };
    let nextLimits: {
        min: number;
    } = {
        min: 0
    };
    let multiplier = 1;
    let startPoint: number;
    let sizeArray: number[];
    let properties: typeof PARAMS.x | typeof PARAMS.y = PARAMS.x;
    /**
     * Drag callback
     * @param event
     */
    const onMove = (event: TouchEvent | MouseEvent) => {
        if (index === undefined) return;
        let currentPoint: number;
        if (event.type === TOUCH_MOVE) currentPoint = (event as TouchEvent).targetTouches[0][properties.val];
        else currentPoint = (event as MouseEvent)[properties.val];
        
        event.stopImmediatePropagation();
        event[PREV_DEF]();
        const nextSizeArray = [...sizeArray];
        const previous = nextSizeArray[index-1];
        const current = nextSizeArray[index];
        const off = multiplier * Number(((currentPoint - startPoint) / area[properties.size]).toFixed(4))
        let offsetPerc =  Math.max(-1 * previous, Math.min(off, current));
        offsetPerc = Math.max(-1 * (previous - prevLimits.min), Math.min(offsetPerc, current - nextLimits.min));
        let prevNum = Number((previous + offsetPerc).toFixed(4));
        if (current) nextSizeArray.splice(index - 1, 2, prevNum, Number((current - offsetPerc).toFixed(4)));
        else nextSizeArray.splice(index - 1, 1, prevNum);
        area.sizes = nextSizeArray.slice(0, nextSizeArray.length - 1).map(Number);
        dispatch(area, EVENT_TYPE.M, {
            event
        });
    }

    const onEnd = (event: MouseEvent | TouchEvent) => {
        event[PREV_DEF]?.();
        event[STOP_PROP]();
        dispatch(area, EVENT_TYPE.E, {
            event
        });
        area.removeAttribute(ATTRS.a);
        resizer.removeAttribute(ATTRS.a);
        sizeArray = [];
        index = undefined;
        const remove = document[REM_EL];
        if (event.type === TOUCH_END) {
            remove(TOUCH_MOVE, onMove);
            remove(TOUCH_END, onEnd);
        } else {
            remove(MOUSE_MOVE, onMove);
            remove(MOUSE_UP, onEnd);
        }
    };

    const onStart = (event: MouseEvent | TouchEvent) => {
        if (event.target !== area) return;
        event.stopImmediatePropagation();
        event[PREV_DEF]?.();
        const path = event.composedPath();
        resizer = path[0] as HTMLDivElement;
        const prev = resizer.previousElementSibling as HTMLDivElement;
        const next = resizer.nextElementSibling as HTMLDivElement;
        if (!prev || !next) return;
        multiplier = area.isReversed ? -1 : 1;
        properties = PARAMS[area.axis];
        if (event.type === TOUCH_START) startPoint = (event as TouchEvent).touches[0][properties.val];
        else startPoint = (event as {clientX: number; clientY: number;})[properties.val];
        index = Number(prev.id);
        prevLimits.min = Number(prev.dataset.min) || 0;
        nextLimits.min = Number(next.dataset.min) || 0;
        sizeArray = [...area.sizes, area.lastSize];
        area.setAttribute(ATTRS.a, '');
        resizer.setAttribute(ATTRS.a, '');
        area.saveSize();
        dispatch(area, EVENT_TYPE.S, {
            event
        });
        const docListen = document[ADD_EL];
        if (event.type === TOUCH_START) {
            docListen(TOUCH_MOVE, onMove, {passive: false});
            docListen(TOUCH_END, onEnd);
            docListen(TOUCH_CANCEL, onEnd);
        } else {
            docListen(MOUSE_MOVE, onMove);
            docListen(MOUSE_UP, onEnd);
        }
    };

    const areaListen = area[ADD_EL];
    const event = resolveAttr('event');
    if (event !== TOUCH) areaListen(MOUSE_DOWN, onStart);
    if (event !== MOUSE) areaListen(TOUCH_START, onStart, {passive: false});
    return () => {
        const areaRemove = area[REM_EL];
        areaRemove(MOUSE_DOWN, onStart);
        areaRemove(TOUCH_START, onStart);
    };
};

const percent = (val: string | number) => (Number(val) * 100).toFixed(2) + '%';

export type TUseSplit = {
    (): {
        /**
         * Observe split events
         * @param callback - event handler
         * @param element - HTML element
         */
        observe: (callback: EventListenerOrEventListenerObject, element?: HTMLElement) => () => void;
        /**
         * Unobserve split events
         * @param callback - event handler
         * @param element - HTML element
         */
        unobserve: (callback: EventListenerOrEventListenerObject, element?: HTMLElement) => void;
    };
};

/**
 * Define drag and drop provider custom element
 */
export const useSplit: TUseSplit = () => {
    const custom = globalThis.customElements;
    const doc = globalThis.document;
    if (custom && !custom?.get(tagName)) {
        custom.define(tagName, class Split extends HTMLElement implements ISplitContainerElement {
            static get observedAttributes() {
                return OBSERVED_ATTRS_KEYS;
            }

            // protected properties

            protected _sz: {
                ini: number[];
                cur: number[];
                prev: number[];
            } = {
                ini: [],
                cur: [],
                prev: []
            };

            // public properties

            get axis() {
                const fdir = this.getAttribute('fdir');
                return (fdir === 'c' || fdir === 'cr') ? 'y' : 'x';
            }

            get isReversed() {
                const fdir = this.getAttribute('fdir');
                return fdir === 'cr' || fdir === 'rr';
            }

            get sizes() {
                return this._sz.cur;
            }

            set sizes(val) {
                this._sz = {
                    ...this._sz,
                    cur: val.map(Number)
                };
                this._render(val);
            }

            get lastSize() {
                return Number(this.sizes.reduce((acc, val) => acc - Number(val), 1).toFixed(4));
            }

            // protected methods

            protected _splitCleanUp: Function = () => undefined;

            /**
             * Render slots
             */
            protected _render(val: number[]) {
                if (!this.shadowRoot) return
                const min = this.getAttribute(ATTRS.min)?.split(' ') || [];
                if (!this.shadowRoot.innerHTML) this.shadowRoot.innerHTML = `<div class="root">${val.map((part, index) => {
                    return `<div id="${index + 1}" data-min="${min[index] || 0}" class="item" style="${propVal(VAL, percent(part))}">` +
                        `<slot name="${index + 1}"></slot>` +
                    '</div><div class="resizer"></div>';
                }).join('')}<div class="rest" data-min="${min[val.length - 1] || 0}"><slot></slot></div></div>`;
                else {
                    val.forEach((part, index) => {
                        (this.shadowRoot?.children[0].children[index * 2] as HTMLDivElement)?.style?.setProperty(VAL, percent(part));
                    });
                }
            }

            // public methods

            saveSize() {
                this._sz.prev = this._sz.cur;
            }

            restoreSize(initial?: boolean) {
                if (initial) this.sizes = this._sz.ini;
                else this.sizes = this._sz.prev;
            }

            connectedCallback() {
                // shadow root
                const shadowRoot = this.attachShadow({ mode: 'open' });
                shadowRoot.adoptedStyleSheets = [getStyleSheet(RULES)];
                // size
                this._sz.ini = this.getAttribute(ATTRS.ini)?.split(' ').map(Number) || [];
                this.sizes = this._sz.ini;
                // vars
                OBSERVED_ATTRS_KEYS.forEach((name) => {
                    const val = this.getAttribute(name);
                    if (val) this.attributeChangedCallback(name, '', val);
                });
                // observe slotchange
                const onSlotChange = () => this._render(this.sizes);
                this.addEventListener('slotchange', onSlotChange);
                // observe resize
                const stopListen = listen(this);
                // stop listen
                this._splitCleanUp = () => {
                    stopListen();
                    this.removeEventListener('slotchange', onSlotChange);
                };
            }

            attributeChangedCallback(name: typeof OBSERVED_ATTRS_KEYS[number], oldValue: string, newValue: string) {
                const root = this.shadowRoot?.children[0] as HTMLDivElement;
                if (root) root.style.setProperty(varName(name), newValue);
            }

            disconnectedCallback() {
                this._splitCleanUp();
            }
        });
    }
    return {
        observe: (callback: EventListenerOrEventListenerObject, element: HTMLElement = doc?.body) => {
            element && addListener(element, callback);
            return () => element && removeListener(element, callback);
        },
        unobserve: (callback: EventListenerOrEventListenerObject, element: HTMLElement = doc?.body) => removeListener(element, callback)
    };
};
