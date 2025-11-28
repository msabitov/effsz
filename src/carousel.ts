import { resolveModule, ruleByPropVals, space } from "./common";


/**
 * Carousel container
 */
export interface ICarouselContainerElement extends HTMLElement {
    /**
     * Active item index
     */
    get active(): number | null;
    /**
     * All items
     */
    get items(): HTMLElement[];
    /**
     * Show next item
     */
    next(): Promise<void>;
    /**
     * Show prev item
     */
    prev(): Promise<void>;
    /**
     * Show specified item
     */
    show(index: number): Promise<void>;
}

/**
 * Carousel container attributes
 */
export interface ICarouselContainerAttrs {
    /**
     * Main axis
     */
    axis: 'x' | 'y';
    /**
     * Start item index
     */
    ini: string;
    /**
     * Time interval for auto play in ms
     */
    auto: string;
    /**
     * Carousel animation type
     */
    type: 'slide' | 'fade';
    /**
     * Carousel animation timing-function
     */
    tf: string;
    /**
     * Carousel animation duration
     */
    dur: string;
    /**
     * Size of before slot
     */
    bef: string;
    /**
     * Size of after slot
     */
    aft: string;
};

interface ICarouselEvent extends CustomEventInit {
    detail: {
        type: 'change';
        isOpen: boolean;
    }
};

type TCarouselEventHandler = (event: ICarouselEvent) => void;

export type TUseCarousel = {
    (): {
        /**
         * Observe carousel events
         * @param callback - event handler
         * @param element - HTML element
         */
        observe: (callback: TCarouselEventHandler, element?: HTMLElement) => () => void;
        /**
         * Unobserve carousel events
         * @param callback - event handler
         * @param element - HTML element
         */
        unobserve: (callback: TCarouselEventHandler, element?: HTMLElement) => void;
    };
};

// attrs
const INI_ATTR = 'ini';
const AUTO_ATTR = 'auto';
const DUR_ATTR = 'dur';
const TYPE_ATTR = 'type';
const AXIS_ATTR = 'axis';
const TF_ATTR = 'tf';
const BEF_ATTR = 'bef';
const AFT_ATTR = 'aft';

// constants and utils
const MODULE = 'carousel';
const FULL = '100%';
const FLEX = 'flex';
const FDIR = FLEX + '-direction';
const HOST = ':host';
const HOST_Y = HOST + '([axis=y])';
const DISPLAY = 'display';
const CHANGE = 'change';
const NONE = 'none';
const BLOCK = 'block';
const POSITION = 'position';
const WIDTH = 'width';
const HEIGHT = 'height';
const BG = 'background';
const LEFT = 'left';
const TOP = 'top';
const RIGHT = 'right';
const BOTTOM = 'bottom';
const UNSET = 'unset';
const CENTER = 'center';
const ME = 'mouseenter';
const ML = 'mouseleave';
const CLICK = 'click';
const AFT_CLS = '.after';
const BEF_CLS = '.before';
const CNT_CLS = '.content';
const CTRL_CLS = '.control';
const clsVal = (val: string) => val.slice(1);
const {
    addListener,
    removeListener,
    dispatch,
    tagName,
    varName,
    varExp,
    getStyleSheet
} = resolveModule(MODULE);

const RULES = [
    ruleByPropVals(HOST,
        [DISPLAY, BLOCK],
        ['container', 'inline-size'],
        [POSITION, 'relative'],
        [WIDTH, FULL],
        [HEIGHT, FULL],
        ['overflow', 'hidden'],
        [varName('x'), 1],
        [varName('y'), 0]
    ),
    ruleByPropVals(HOST_Y,
        [varName('x'), 0],
        [varName('y'), 1]
    ),
    ruleByPropVals(CNT_CLS,
        [DISPLAY, 'contents']
    ),
    ruleByPropVals('::slotted(*:not([slot]))',
        [POSITION, 'absolute'],
        [LEFT, 0],
        [TOP, 0],
        [DISPLAY, NONE],
        [HEIGHT, FULL],
        [WIDTH, FULL]
    ),
    ruleByPropVals(CTRL_CLS,
        [HEIGHT, FULL],
        [BG, 'oklch(from currentColor l c h / 0.15)'],
        [POSITION, 'absolute'],
        ['cursor', 'pointer'],
        [DISPLAY, FLEX],
        ['align-items', CENTER],
        ['justify-content', CENTER],
        [FDIR, 'column'],
        ['transition', BG + ' 200ms linear 0s']
    ),
    ruleByPropVals('.control:hover',
        [BG, 'oklch(from currentColor l c h / 0.3)']
    ),
    ruleByPropVals(space(HOST_Y, CTRL_CLS),
        [WIDTH, FULL],
        [FDIR, 'row'],
    ),
    ruleByPropVals(BEF_CLS,
        [WIDTH, varExp([BEF_ATTR], 'min(2.5rem, 10cqw)')],
        [LEFT, 0],
        [TOP, 0],
        [BOTTOM, 0],
        [RIGHT, UNSET],
    ),
    ruleByPropVals(space(HOST_Y, BEF_CLS),
        [HEIGHT, varExp([BEF_ATTR], 'min(2.5rem, 10cqw)')],
        [WIDTH, UNSET],
        [LEFT, 0],
        [TOP, 0],
        [RIGHT, 0],
        [BOTTOM, UNSET],
    ),
    ruleByPropVals(AFT_CLS,
        [WIDTH, varExp([AFT_ATTR] , 'min(2.5rem, 10cqw)')],
        [RIGHT, 0],
        [TOP, 0],
        [BOTTOM, 0],
        [LEFT, UNSET],
    ),
    ruleByPropVals(space(HOST_Y, AFT_CLS),
        [HEIGHT, varExp([AFT_ATTR], 'min(2.5rem, 10cqw)')],
        [WIDTH, UNSET],
        [LEFT, 0],
        [BOTTOM, 0],
        [RIGHT, 0],
        [TOP, UNSET],
    ),
];
const staticCSS = getStyleSheet(RULES);

const OBSERVED_ATTRS_KEYS = [TYPE_ATTR, BEF_ATTR, AFT_ATTR];

const ANIMATIONS = {
    slide: {
        init: [{
            translate: '0 0'
        }],
        forward: {
            next: [{
                translate: `calc(${varExp(['x'])} * 100%) calc(${varExp(['y'])} * 100%)`
            }, {
                translate: '0 0'
            }],
            current: [{
                translate: '0 0'
            }, {
                translate: `calc(-1 * ${varExp(['x'])} * 100%) calc(-1 * ${varExp(['y'])} * 100%)`
            }]
        },
        backward: {
            next: [{
                translate: `calc(-1 * ${varExp(['x'])} * 100%) calc(-1 * ${varExp(['y'])} * 100%)`
            }, {
                translate: '0 0'
            }],
            current: [{
                translate: '0 0'
            }, {
                translate: `calc(${varExp(['x'])} * 100%) calc(${varExp(['y'])} * 100%)`
            }]
        }
    },
    fade: {
        init: [{
            opacity: 1
        }],
        forward: {
            next: [{
                opacity: 0
            }, {
                opacity: 1
            }],
            current: [{
                opacity: 1
            }, {
                opacity: 0
            }]
        },
        backward: {
            next: [{
                opacity: 0
            }, {
                opacity: 1
            }],
            current: [{
                opacity: 1
            }, {
                opacity: 0
            }]
        }
    }
};

const addDisplay = (kf: object[]) => kf.map((i) => ({...i, display: BLOCK}));

/**
 * Use carousel container
 */
export const useCarousel: TUseCarousel = () => {
    const custom = globalThis.customElements;
    const doc = globalThis.document;
    if (custom && !custom?.get(tagName)) {
        custom.define(tagName, class Carousel extends HTMLElement implements ICarouselContainerElement {
            static get observedAttributes() {
                return OBSERVED_ATTRS_KEYS;
            }

            protected _active: number | null = null;
            protected _timerId: number | null = null;
            protected _isHovered: boolean = false;
            protected _isAnimating: boolean = false;

            get active() {
                return this._active;
            }
            get items() {
                return (this.shadowRoot?.children[0]?.children[0] as HTMLSlotElement)?.assignedElements() as HTMLElement[] || [];
            }

            protected _clearTimeout() {
                if (this._timerId) {
                    clearTimeout(this._timerId);
                    this._timerId = null;
                }
            }

            protected _setTimeout() {
                const interval = this.getAttribute(AUTO_ATTR);
                if (interval && !this._isHovered) this._timerId = setTimeout(() => {
                    this.next();
                }, Number(interval));
            }

            disconnectedCallback: () => void;

            connectedCallback() {
                const shadowRoot = this.attachShadow({ mode: 'open' });
                shadowRoot.innerHTML = `
                    <div class='${clsVal(CNT_CLS)}'>
                        <slot></slot>
                        <div class='${space(clsVal(CTRL_CLS), clsVal(BEF_CLS))}'><slot name='${BEF_ATTR}'></slot></div>
                        <div class='${space(clsVal(CTRL_CLS), clsVal(AFT_CLS))}'><slot name='${AFT_ATTR}'></slot></div>
                    </div>
                `;
                
                const activeIndex = Number(this.getAttribute(INI_ATTR)) || 0;
                const dynamicCSS = new CSSStyleSheet();
                
                shadowRoot.adoptedStyleSheets = [staticCSS, dynamicCSS];
                this.show(activeIndex);

                const before = shadowRoot.children[0].children[1];
                const after = shadowRoot.children[0].children[2];
                before?.addEventListener(CLICK, this.prev);
                after?.addEventListener(CLICK, this.next);

                const onMouseEnter = () => {
                    this._isHovered = true;
                    this._clearTimeout();
                }
                const onMouseLeave = () => {
                    this._isHovered = false;
                    this._setTimeout();
                }
                
                this.addEventListener(ME, onMouseEnter);
                this.addEventListener(ML, onMouseLeave);
                this.disconnectedCallback = () => {
                    this.removeEventListener(ME, onMouseEnter);
                    this.removeEventListener(ML, onMouseLeave);
                    before?.removeEventListener(CLICK, this.prev);
                    after?.removeEventListener(CLICK, this.next);
                }
                this._setTimeout();
            }

            show = async (index: number) => {
                if (this._isAnimating) return;
                const count = this.items.length;
                if (count < 2) return;
                let next = index;
                if (next >= count) next = next - count;
                else if (next < 0) next = next + count;
                if (next === this.active) return;
                const options: KeyframeAnimationOptions = {
                    duration: this.getAttribute(DUR_ATTR) || 300,
                    iterations: 1,
                    fill: 'both',
                    easing: this.getAttribute(TF_ATTR) || 'linear'
                }
                this._isAnimating = true;
                this._clearTimeout();
                const type = this.getAttribute(TYPE_ATTR) as keyof typeof ANIMATIONS || 'slide';
                const animations = ANIMATIONS[type] || ANIMATIONS.slide;
                let initStyle: CSSStyleDeclaration;
                let nextAnimation: Animation;
                let curAnimation: Animation;
                let activeItem: HTMLElement;
                if (this.active === null) {
                    nextAnimation = this.items[next].animate(addDisplay(animations.init), options);
                    await nextAnimation.finished;
                    nextAnimation.commitStyles();
                    nextAnimation.cancel();
                } else if (index > this.active) {
                    activeItem = this.items[this.active];
                    nextAnimation = this.items[next].animate(addDisplay(animations.forward.next), options);
                    curAnimation = activeItem.animate(addDisplay(animations.forward.current), options);
                    initStyle = activeItem.style;
                    initStyle.setProperty(DISPLAY,NONE);
                    await Promise.all([nextAnimation.finished, curAnimation.finished]);
                    nextAnimation.commitStyles();
                    nextAnimation.cancel();
                    curAnimation.cancel();
                    activeItem.style = initStyle.cssText;
                } else {
                    activeItem = this.items[this.active];
                    nextAnimation = this.items[next].animate(addDisplay(animations.backward.next),options)
                    curAnimation = activeItem.animate(addDisplay(animations.backward.current), options);
                    initStyle = activeItem.style;
                    initStyle.setProperty(DISPLAY,NONE);
                    await Promise.all([nextAnimation.finished, curAnimation.finished]);
                    nextAnimation.commitStyles();
                    nextAnimation.cancel();
                    curAnimation.cancel();
                    activeItem.style = initStyle.cssText;
                }
                this._isAnimating = false;
                this._active = next;
                dispatch(this, CHANGE);
                this._setTimeout();
            }

            prev = async () => {
                if (this._active !== null) return this.show(this._active - 1);
            }

            next = async () => {
                if (this._active !== null) return this.show(this._active + 1);
            }

            attributeChangedCallback(name: typeof OBSERVED_ATTRS_KEYS[number], oldValue: string, newValue: string) {
                if (!this.shadowRoot) return;
                switch (name) {
                    case TYPE_ATTR:
                        const active = this.active;
                        this._active = null;
                        if (active !== null) this.show(active);
                        break;
                    case BEF_ATTR:
                    case AFT_ATTR:
                        if (newValue) (this.shadowRoot?.children[0] as HTMLDivElement).style.setProperty(
                            varName(name), Number.isNaN(+newValue) ? newValue : newValue + 'px'
                        );
                        else (this.shadowRoot?.children[0] as HTMLDivElement).style.removeProperty(varName(name));
                        break;
                }
            }
        });
    }
    return {
        observe: (callback: TCarouselEventHandler, element: HTMLElement = doc?.body) => {
            element && addListener(element, callback as unknown as EventListenerOrEventListenerObject);
            return () => element && removeListener(element, callback as unknown as EventListenerOrEventListenerObject);
        },
        unobserve: (callback: TCarouselEventHandler, element: HTMLElement = doc?.body) => removeListener(element, callback as unknown as EventListenerOrEventListenerObject)
    };
};
