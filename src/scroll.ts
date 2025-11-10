import {
    PARAMS,
    ruleByPropVals, space, color, resolveModule
} from './common';

/**
 * Scroll container
 */
export interface IScrollContainerElement extends HTMLElement {
    get axis(): 'x' | 'y';
    set axis(val: 'x' | 'y');
    /**
     * Main axis size
     */
    size: number;
    /**
     * Scroll size
     */
    scrollSize: number;
    /**
     * Scroll offset
     */
    scrollOffset: number;
    /**
     * Scroll progress value
     */
    scrollProgress: number;
    /**
     * Scroll to offset value
     * @param offset 
     * @param behavior 
     */
    scrollToOffset(offset: number, behavior?: ScrollBehavior): void;
    /**
     * Scroll by offset value
     * @param offset 
     * @param behavior 
     */
    scrollByOffset(offset: number, behavior?: ScrollBehavior): void;
    /**
     * Scroll to container start
     * @param behavior 
     */
    scrollToStart(behavior?: ScrollBehavior): void;
    /**
     * Scroll to container end
     * @param behavior 
     */
    scrollToEnd(behavior?: ScrollBehavior): void;
    /**
     * Scroll to query target
     * @param query
     * @param behavior 
     */
    scrollToTarget(query: string, options?: ScrollIntoViewOptions): void;
}

/**
 * Scroll container attributes
 */
export interface IScrollContainerAttrs {
    axis: 'x' | 'y';
    /**
     * Thumb size
     */
    thsize: string;
    /**
     * Thumb radius
     */
    thradius: string;
    /**
     * Thumb color
     */
    thcolor: string;
    /**
     * Shadow size
     */
    shsize: string;
    /**
     * Shadow color
     */
    shcolor: string;
    /**
     * Shadow transition timing function
     */
    shtf: string;
    /**
     * Shadow transition duration
     */
    shdur: string;
    /**
     * Scrollbar color
     */
    sbcolor: string;
    /**
     * Scrollbar transition timing function
     */
    sbtf: string;
    /**
     * Scrollbar transition duration
     */
    sbdur: string;
    /**
     * `Higher` keypoint
     * @description
     * The keypoint that triggering when it intersects in the direction of the end.
     * The value is the number of pixels counted from the end of the container.
     */
    higher?: string;
    /**
     * `Lower` keypoint
     * @description
     * The keypoint that triggering when it intersects in the direction of the start.
     * The value is the number of pixels counted from the start of the container.
     */
    lower?: string;
}

// utils
const MODULE = 'scroll';

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
const LOWER = 'lower';
const HIGHER = 'higher';
const BEFORE = '::before';
const AFTER = '::after';
const OPACITY = 'opacity';
const TOP = 'top';
const BOTTOM = 'bottom';
const RIGHT = 'right';
const LEFT = 'left';
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
const TRANSITION = 'transition';
const POSITION = 'position';
const STOP_PROP = 'stopPropagation';
const PREV_DEF = 'preventDefault';
const REMOVE = 'remove'
const EL = 'EventListener';
const REM_EL = REMOVE + EL as 'removeEventListener';
const ADD_EL = 'add' + EL as 'addEventListener';
const DISPLAY = 'display';
const FLEX = 'flex';
const FLEX_DIR = FLEX + '-direction';
const FLEX_BASIS = FLEX + '-basis';
const OVERFLOW = 'overflow';
const BGC = 'background-color';
const COL = 'column';
const ROW = 'row';
const HIDDEN = 'hidden';
const SCROLL = 'scroll';
const SIZE = 'size';
const BLOCK_SIZE = 'block-' + SIZE;
const INLINE_SIZE = 'inline-' + SIZE;
const INSET_INLINE = 'inset-inline';
const INL_START = INSET_INLINE + '-start';
const INL_END = INSET_INLINE + '-end';
const INH = 'inherit';
const HEIGHT = 'height';
const WIDTH = 'width';
const FULL = '100%';
const DURATION = 'duration';
const BAR = 'bar';
const COLOR = 'color';
const SHADOW = 'shadow';
const BOX_SHADOW = 'box-' + SHADOW;
const UNSET = 'unset';
const THUMB = 'thumb';
const RADIUS = 'radius';
// pairs
const FLEX_COL = [FLEX_DIR, COL] as [string, string];
const FLEX_ROW = [FLEX_DIR, ROW] as [string, string];
const DIS_FLEX = [DISPLAY, FLEX] as [string, string];
const H_FULL = [HEIGHT, FULL] as [string, string];
const W_FULL = [WIDTH, FULL] as [string, string];
const W_ZERO = [WIDTH, 0] as [string, number];
const WR_MODE_V = ['writing-mode', 'vertical-lr'] as [string, string];
const Z_100 = ['z-index', 100] as [string, number];
const POS_REL = [POSITION, 'relative'] as [string, string];
const POS_ABS = [POSITION, 'absolute'] as [string, string];
const PSEUDO = [
    [
        'pointer-events', 'none'
    ], [
        'content', '""'
    ], POS_ABS
] as [string, string][];

const CUSTOM_EVENT_TYPE = {
    LOWER,
    HIGHER
};

const ATTRS = {
    /**
     * Thumb size
     */
    thsize: 'thsize',
    /**
     * Thumb radius
     */
    thradius: 'thradius',
    /**
     * Thumb color
     */
    thcolor: 'thcolor',
    /**
     * Shadow size
     */
    shsize: 'shsize',
    /**
     * Shadow color
     */
    shcolor: 'shcolor',
    /**
     * Shadow transition timing function
     */
    shtf: 'shtf',
    /**
     * Shadow transition duration
     */
    shdur: 'shdur',
    /**
     * Scrollbar color
     */
    sbcolor: 'sbcolor',
    /**
     * Scrollbar transition timing function
     */
    sbtf: 'sbtf',
    /**
     * Scrollbar transition duration
     */
    sbdur: 'sbdur',
}  as const;

const OBSERVED_ATTRS = [...Object.keys(ATTRS), LOWER, HIGHER];

const PROPERTIES = {
    [ATTRS.shdur]: [SHADOW, DURATION],
    [ATTRS.shtf]: ['shadow-tf'],
    [ATTRS.thradius]: [THUMB, RADIUS],
    [ATTRS.thsize]: [THUMB, SIZE],
    [ATTRS.thcolor]: [THUMB, COLOR],
    [ATTRS.shsize]: [SHADOW, SIZE],
    [ATTRS.shcolor]: [SHADOW, COLOR],
    [ATTRS.sbcolor]: [BAR, COLOR],
    [ATTRS.sbdur]: [BAR, DURATION],
    [ATTRS.sbtf]: ['bar-tf'],
} as Record<string, string[]>;

const INNER_PROPERTIES = {
    bef: ['before-opacity'],
    aft: ['after-opacity'],
    len: ['thumb-length'],
    off: ['thumb-offset'],
};

const BLUR = `calc(var(${varName(...PROPERTIES.shsize)}) * 5)`;
const CONTENT_SELECTOR = '#content';
const BAR_SELECTOR = '#scrollbar';
const THUMB_SELECTOR = '#thumb';
const HOST = ':host';
const HOST_X = HOST + '([axis=x])';
const HOST_Y = HOST + '([axis=y])';

const RULES = [
    // host
    ruleByPropVals(HOST, [
        OVERFLOW, HIDDEN
    ], [
        DISPLAY, 'grid'
    ], H_FULL, W_FULL, POS_REL,
    // thumb vars
    [varName(...PROPERTIES.thcolor), color(0.85)],
    [varName(...PROPERTIES.thsize), '0.8rem'],
    [varName(...PROPERTIES.thradius), '0.4rem'],
    // scrollbar vars
    [varName(...PROPERTIES.sbcolor), color(0.15)],
    [varName(...PROPERTIES.sbdur), '300ms'],
    [varName(...PROPERTIES.sbtf), 'ease-in'],
    // shadow vars
    [varName(...PROPERTIES.shdur), '300ms'],
    [varName(...PROPERTIES.shtf), 'ease-in'],
    [varName(...PROPERTIES.shcolor), 'currentColor'],
    [varName(...PROPERTIES.shsize), '0.2rem'],
    // inner vars
    [varName(...INNER_PROPERTIES.bef), 0],
    [varName(...INNER_PROPERTIES.aft), 0],
    ),
    // content
    ruleByPropVals(CONTENT_SELECTOR, DIS_FLEX, FLEX_COL, [FLEX_BASIS, FULL],
        [OVERFLOW, space(HIDDEN, SCROLL)], ['scrollbar-width', 'none']
    ),
    ruleByPropVals(space(HOST_X, CONTENT_SELECTOR), FLEX_ROW, [
        OVERFLOW, space(SCROLL, HIDDEN)
    ]),
    ruleByPropVals(space(HOST_Y, CONTENT_SELECTOR), FLEX_COL, [
        OVERFLOW, space(HIDDEN, SCROLL)
    ]),
    ruleByPropVals(HOST + '([disabled]) ' + CONTENT_SELECTOR, [
        OVERFLOW, HIDDEN
    ]),
    // shadows
    ruleByPropVals(CONTENT_SELECTOR + BEFORE, ...PSEUDO, [
        OPACITY, varExp(INNER_PROPERTIES.bef, 0)
    ], [
        TOP, 0
    ], W_FULL, Z_100, [
        BOX_SHADOW, `0 ${varExp(PROPERTIES.shsize)} ${BLUR} ${varExp(PROPERTIES.shsize)} ${varExp(PROPERTIES.shcolor)}`
    ], [
        TRANSITION, space(OPACITY, varExp(PROPERTIES.shdur), varExp(PROPERTIES.shtf))
    ]),
    ruleByPropVals(space(HOST_X, CONTENT_SELECTOR + BEFORE), [
        TOP, UNSET
    ], W_ZERO, H_FULL, [
        LEFT, 0
    ], [
        BOX_SHADOW, `${varExp(PROPERTIES.shsize)} 0 ${BLUR} ${varExp(PROPERTIES.shsize)} ${varExp(PROPERTIES.shcolor)}`
    ]),
    ruleByPropVals(CONTENT_SELECTOR + AFTER, ...PSEUDO, [
        OPACITY, varExp(INNER_PROPERTIES.aft, 0)
    ], [
        BOTTOM, 0
    ], W_FULL, Z_100, [
        BOX_SHADOW, space(0, `calc(-1 * ${varExp(PROPERTIES.shsize)})`, BLUR, varExp(PROPERTIES.shsize), varExp(PROPERTIES.shcolor))
    ], [
        TRANSITION, space(OPACITY, varExp(PROPERTIES.shdur), varExp(PROPERTIES.shtf))
    ]),
    ruleByPropVals(space(HOST_X, CONTENT_SELECTOR + AFTER), [
        BOTTOM, UNSET
    ], [
        TOP, 0
    ], W_ZERO, H_FULL, [
        RIGHT, 0
    ], [
        BOX_SHADOW, space(`calc(-1 * ${varExp(PROPERTIES.shsize)})`, 0, BLUR, varExp(PROPERTIES.shsize), varExp(PROPERTIES.shcolor))
    ]),
    // scrollbar
    ruleByPropVals(BAR_SELECTOR, DIS_FLEX, FLEX_COL,
        [INL_END, 0], [INL_START, INH], ['inset-block-start', 0],[
        BLOCK_SIZE, FULL
    ], [
        INLINE_SIZE, 0
    ], POS_ABS, [
        BGC, varExp(PROPERTIES.sbcolor)
    ], [
        TRANSITION, space(INLINE_SIZE, varExp(PROPERTIES.sbdur), varExp(PROPERTIES.sbtf))
    ]),
    ruleByPropVals(HOST + '([side=start]) ' + BAR_SELECTOR, [
        INL_START, 0
    ], [
        INL_END, INH
    ]),
    ruleByPropVals(HOST + '([side=end]) ' + BAR_SELECTOR, [
        INL_START, INH
    ], [
        INL_END, 0
    ]),
    ruleByPropVals(space(HOST_X, BAR_SELECTOR), FLEX_ROW, WR_MODE_V),
    ruleByPropVals(`:host(:hover) ${BAR_SELECTOR}, ${BAR_SELECTOR}[active], :host([vis=always]) ${BAR_SELECTOR}`, [
        INLINE_SIZE, `calc(min(${varExp(INNER_PROPERTIES.bef)} + ${varExp(INNER_PROPERTIES.aft)}, 1) * ${varExp(PROPERTIES.thsize)})`
    ]),
    ruleByPropVals(`:host([vis=hidden]) ${BAR_SELECTOR},:host([vis=hidden]:hover) ${BAR_SELECTOR}, :host([disabled]) ${BAR_SELECTOR}`, [
        INLINE_SIZE, 0
    ]),
    // thumb
    ruleByPropVals(THUMB_SELECTOR, [
        BLOCK_SIZE, varExp(INNER_PROPERTIES.len)
    ], [
        'margin-block-start', varExp(INNER_PROPERTIES.off)
    ], [
        BGC, varExp(PROPERTIES.thcolor)
    ], [
        'border-' + RADIUS, varExp(PROPERTIES.thradius)
    ], [
        CURSOR, 'grab'
    ]),
    ruleByPropVals(space(HOST_X, THUMB_SELECTOR), WR_MODE_V, [
        INLINE_SIZE, FULL
    ]),
    // slotted
    '::slotted(*){flex: 0 0 auto}'
];

const listen = (thumb: HTMLElement) => {
    let axis: 'x' | 'y';
    let root: HTMLElement;
    let offset: number;
    let startPoint: number;

    const onMove = (event: TouchEvent | MouseEvent) => {
        let currentPoint: number;
        if (event.type === TOUCH_MOVE) currentPoint = (event as TouchEvent).targetTouches[0][PARAMS[axis].val];
        else currentPoint = (event as MouseEvent)[PARAMS[axis].val];
        
        event.stopImmediatePropagation();
        event[PREV_DEF]();
        const size = root[PARAMS[axis].size];
        const scroll = root[PARAMS[axis].scroll];
        const to = offset + (currentPoint - startPoint) / size * scroll;
        if (axis === 'x') root?.scrollTo(to, 0)
        else root?.scrollTo(0, to);
        dispatch(root, EVENT_TYPE.M, {
            event
        });
    }

    /**
     * Scroll end callback
     * @param event
     */
    const onEnd = (event: MouseEvent | TouchEvent) => {
        event[PREV_DEF]?.();
        event[STOP_PROP]();
        thumb.parentElement?.removeAttribute('active');
        const remove = document[REM_EL];
        if (event.type === TOUCH_END) {
            remove(TOUCH_MOVE, onMove);
            remove(TOUCH_END, onEnd);
        } else {
            remove(MOUSE_MOVE, onMove);
            remove(MOUSE_UP, onEnd);
        }
        dispatch(root, EVENT_TYPE.E, {
            event
        });
    };

    /**
     * Scroll start handler
     * @param event
     */
    const onStart = (event: MouseEvent | TouchEvent) => {
        const path = event.composedPath();
        if (path[0]!== thumb) return;
        event.stopImmediatePropagation();
        event[PREV_DEF]?.();
        const target = event.target as IScrollContainerElement;
        root = thumb.parentElement?.parentElement as HTMLElement;
        thumb.parentElement?.setAttribute('active', '');
        axis = target.axis;
        offset = root[PARAMS[axis].offset];
        if (event.type === TOUCH_START) startPoint = (event as TouchEvent).touches[0][PARAMS[axis].val];
        else startPoint = (event as {clientX: number; clientY: number;})[PARAMS[axis].val];

        const docListen = thumb[ADD_EL];
        if (event.type === TOUCH_START) {
            docListen(TOUCH_MOVE, onMove, {passive: false});
            docListen(TOUCH_END, onEnd);
            docListen(TOUCH_CANCEL, onEnd);
        } else {
            docListen(MOUSE_MOVE, onMove);
            docListen(MOUSE_UP, onEnd);
        }
        dispatch(root, EVENT_TYPE.S, {
            event
        });
    };

    const thumbListen = thumb[ADD_EL];
    thumbListen(MOUSE_DOWN, onStart);
    thumbListen(TOUCH_START, onStart, {passive: false});
    return () => {
        const areaRemove = thumb[REM_EL];
        areaRemove(MOUSE_DOWN, onStart);
        areaRemove(TOUCH_START, onStart);
    };
};

interface IScrollEvent extends CustomEventInit {
    detail: {
        type: typeof EVENT_TYPE[keyof typeof EVENT_TYPE];
        event: MouseEvent | TouchEvent;
    } | {
        type: 'higher' | 'lower';
        keypoint: number;
        current: number;
    }
}

type TScrollEventHandler = (event: IScrollEvent) => void;

export type TUseScroll = {
    (): {
        /**
         * Observe scroll events
         * @param callback - event handler
         * @param element - HTML element
         */
        observe: (callback: TScrollEventHandler, element?: HTMLElement) => () => void;
        /**
         * Unobserve scroll events
         * @param callback - event handler
         * @param element - HTML element
         */
        unobserve: (callback: TScrollEventHandler, element?: HTMLElement) => void;
    };
};

/**
 * Use scroll container
 */
export const useScroll: TUseScroll = () => {
    const custom = globalThis.customElements;
    const doc = globalThis.document;
    if (custom && !custom?.get(tagName)) {
        custom.define(tagName, class Scroll extends HTMLElement implements IScrollContainerElement {
            static observedAttributes = OBSERVED_ATTRS;

            get axis() {
                return (this.getAttribute('axis') || 'y') as IScrollContainerElement['axis'];
            }

            set axis(val: 'x' | 'y') {
                this.setAttribute('axis', val);
            }

            get _scrollContent(): HTMLDivElement {
                return this.shadowRoot?.firstElementChild as HTMLDivElement;
            }

            get _scrollbar(): HTMLDivElement {
                return this._scrollContent.firstElementChild as HTMLDivElement;
            }

            get _scrollThumb(): HTMLDivElement {
                return this._scrollbar.firstElementChild as HTMLDivElement;
            }

            get size() {
                return this._scrollContent[PARAMS[this.axis].size];
            }

            get scrollSize() {
                return this._scrollContent[PARAMS[this.axis].scroll];
            }

            get scrollOffset() {
                return this._scrollContent[PARAMS[this.axis].offset];
            }

            get scrollProgress() {
                return this.scrollOffset / (this.scrollSize - this.size);
            }

            protected _scrollCleanUp: Function = () => undefined;

            protected _prev: {
                rest: number;
                offset: number;
            };

            protected _keypoints: {
                lower: number;
                higher: number;
            } = {
                higher: 0,
                lower: 0
            };

            protected _setVars = () => {
                const content = this._scrollContent;
                let thumbSize;
                let offset;
                const axisParams = PARAMS[this.axis];
                // thumb min size in px
                const thumbMinSize: number = Number(this.getAttribute('thmin')) || 8;
                thumbSize = Math.max(content[axisParams.size] * content[axisParams.size] / content[axisParams.scroll], thumbMinSize).toFixed(2);
                offset = (content[axisParams.offset] / (content[axisParams.scroll] - content[axisParams.size]) * (content[axisParams.size] - Number(thumbSize))).toFixed(2);
                if (content[axisParams.offset] > 0) content.style.setProperty(varName(...INNER_PROPERTIES.bef), "1");
                else content.style.setProperty(varName(...INNER_PROPERTIES.bef), '0');

                if (content[axisParams.offset] < content[axisParams.scroll] - content[axisParams.size]) content.style.setProperty(varName(...INNER_PROPERTIES.aft), '1');
                else content.style.setProperty(varName(...INNER_PROPERTIES.aft), '0');
                this._scrollContent?.style.setProperty(varName(...INNER_PROPERTIES.len), thumbSize + 'px');
                this._scrollContent?.style.setProperty(varName(...INNER_PROPERTIES.off), offset + 'px');
                const higher = this._keypoints.higher;
                const lower = this._keypoints.lower;
                const currentOffset = this.scrollOffset;
                const currentOffsetRest = this.scrollSize - this.size - currentOffset;
                const prevOffset = this._prev?.offset || 0;
                const prevOffsetRest = this._prev?.rest || 0;
                if (prevOffset !== currentOffset || prevOffsetRest !== currentOffsetRest) {
                    if (higher && (prevOffsetRest > higher) && (currentOffsetRest <= higher)) dispatch(
                        this, CUSTOM_EVENT_TYPE.HIGHER, {
                            keypoint: higher,
                            current: currentOffsetRest
                        }
                    );
                    if (lower && (prevOffset > lower) && (currentOffset <= lower)) dispatch(
                        this, CUSTOM_EVENT_TYPE.LOWER, {
                            keypoint: lower,
                            current: currentOffset
                        }
                    );
                }
                this._prev = {
                    rest: this.scrollSize - this.size,
                    offset: this.scrollOffset
                };
            };

            connectedCallback() {
                const shadowRoot = this.attachShadow({ mode: 'open' });
                shadowRoot.innerHTML = `<div id="${CONTENT_SELECTOR.slice(1)}"><div id="${BAR_SELECTOR.slice(1)}"><div id="${THUMB_SELECTOR.slice(1)}"></div></div><slot></slot></div>`;
                shadowRoot.adoptedStyleSheets = [getStyleSheet(RULES)];
                this._keypoints = {
                    [LOWER]: Number(this.getAttribute(LOWER)) || 0,
                    [HIGHER]: Number(this.getAttribute(HIGHER)) || 0,
                };
                this._setVars();
                this._scrollContent.addEventListener(SCROLL, this._setVars);
                const observer = new ResizeObserver(this._setVars);
                observer.observe(this);
                const stopListen = listen(this._scrollThumb);
                this._scrollCleanUp = () => {
                    this._scrollContent.removeEventListener(SCROLL, this._setVars);
                    observer.unobserve(this);
                    stopListen();
                };
            }

            disconnectedCallback() {
                this._scrollCleanUp();
            }

            applyAttributeValue(name: keyof typeof PROPERTIES, value: string) {
                switch (name) {
                    case LOWER:
                    case HIGHER:
                        this._keypoints[name] = Number(value);
                        break;
                    default:
                        const property = PROPERTIES[name];
                        if (property) this._scrollContent.style.setProperty(varName(...property), value);
                }
            }

            attributeChangedCallback(
                name: keyof typeof PROPERTIES,
                oldValue: string,
                newValue: string
            ) {
                this.applyAttributeValue(name, newValue);
            }

            scrollToOffset: IScrollContainerElement['scrollToOffset'] = (offset, behavior) => {
                this._scrollContent.scrollTo({
                    [PARAMS[this.axis].start]: offset,
                    behavior
                });
            }

            scrollByOffset: IScrollContainerElement['scrollByOffset'] = (offset, behavior) => {
                this._scrollContent.scrollBy({
                    [PARAMS[this.axis].start]: offset,
                    behavior
                });
            }

            scrollToStart: IScrollContainerElement['scrollToStart'] = (behavior) => {
                this._scrollContent.scrollTo({
                    [PARAMS[this.axis].start]: 0,
                    behavior
                });
            }

            scrollToEnd: IScrollContainerElement['scrollToEnd'] = (behavior) => {
                const axisParams = PARAMS[this.axis];
                this._scrollContent.scrollTo({
                    [axisParams.start]: this._scrollContent[axisParams.scroll] - this._scrollContent[axisParams.size],
                    behavior
                });
            }

            scrollToTarget: IScrollContainerElement['scrollToTarget'] = (query: string, options) => {
                const resolved: Element | null = this.querySelector(query);
                resolved?.scrollIntoView(options);
            }
        })
    }
    return {
        observe: (callback: TScrollEventHandler, element: HTMLElement = doc?.body) => {
            element && addListener(element, callback as unknown as EventListenerOrEventListenerObject);
            return () => element && removeListener(element, callback as unknown as EventListenerOrEventListenerObject);
        },
        unobserve: (callback: TScrollEventHandler, element: HTMLElement = doc?.body) => removeListener(element, callback as unknown as EventListenerOrEventListenerObject)
    };
};