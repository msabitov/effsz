import { resolveModule, ruleByPropVals } from './common';


/**
 * Slide container
 */
export interface ISlideContainerElement extends HTMLElement {
    get dialog(): HTMLDialogElement;
    get isOpen(): boolean;
    /**
     * Open
     */
    open(): Promise<void>;
    /**
     * Close
     */
    close(): Promise<void>;
    /**
     * Toggle
     */
    toggle(): Promise<void>;
}

/**
 * Slide container attributes
 */
export interface ISlideContainerAttrs {
    /**
     * Is slide container open
     */
    open: boolean;
    /**
     * Is slide container modal
     */
    modal: string;
    /**
     * Position
     */
    pos: 'l' | 't' | 'r' | 'b';
    /**
     * Backdrop alpha coef
     */
    alpha: number;
    /**
     * Backdrop blur coef
     */
    blur: number;


    // transition

    /**
     * Transition-timing-function
     */
    tf: string;
    /**
     * Transition duration
     */
    dur: string;
    /**
     * Transition delay
     */
    del: string;
}

interface ISlideEvent extends CustomEventInit {
    detail: {
        type: 'close' | 'open';
    }
}

type TSlideEventHandler = (event: ISlideEvent) => void;

export type TUseSlide = {
    (): {
        /**
         * Observe slide events
         * @param callback - event handler
         * @param element - HTML element
         */
        observe: (callback: TSlideEventHandler, element?: HTMLElement) => () => void;
        /**
         * Unobserve slide events
         * @param callback - event handler
         * @param element - HTML element
         */
        unobserve: (callback: TSlideEventHandler, element?: HTMLElement) => void;
    };
};

// constants and utils
const MODULE = 'slide';

const {
    addListener,
    removeListener,
    dispatch,
    tagName,
    varName,
    varExp,
    getStyleSheet
} = resolveModule(MODULE);

// css
const HOST = ':host';
const OPEN = 'open';
const TF = 'tf';
const POS = 'pos';
const DUR = 'dur';
const DEL = 'del';
const AUTO = 'auto';
const DIALOG = 'dialog';
const DIALOG_ID = '#' + DIALOG;
const PADDING = 'padding';
const CLICK = 'click';
const BG = 'background';
const POSITION = 'position';
const NONE = 'none';
const TOP = 'top';
const LEFT = 'left';
const BOTTOM = 'bottom';
const RIGHT = 'right';
const UNSET = 'unset';
const WIDTH = 'width';
const HEIGHT = 'height';
const FULLSZ = '100%';
const FULLVH = '100vh';
const FULLVW = '100vw';
const MARGIN = 'margin';
const MARGIN_ = MARGIN + '-';
const MAX_ = 'max-';
const MAXW = MAX_ + WIDTH;
const MAXH = MAX_ + HEIGHT;
const TRANSFORM = 'transform';
const ALPHA = 'alpha';
const BLUR = 'blur';
const TRANSLATE = 'translate';
const TRANSLATE_LEFT = TRANSLATE + '(-100%,0)';
const TRANSLATE_RIGHT = TRANSLATE + '(100%,0)';
const TRANSLATE_BOTTOM = TRANSLATE + '(0,100%)';
const TRANSLATE_TOP = TRANSLATE + '(0,-100%)';
const OBSERVED_ATTRS_KEYS = [OPEN] as const;

const RULES = [
    ruleByPropVals(DIALOG_ID,
        [PADDING, 0], [BG, 'transparent'],[POSITION, 'fixed'], ['border', NONE], ['outline', NONE], ['z-index', '100'],
        [TOP, 0], [LEFT, 0], [BOTTOM, UNSET], [RIGHT, UNSET],
        [WIDTH, AUTO], [MAXW, FULLVW], [HEIGHT, FULLVH],
        [MAXH, FULLVH], [MARGIN, 0], [MARGIN_ + RIGHT, AUTO],
        [TRANSFORM, TRANSLATE_LEFT]
    ),
    ruleByPropVals(HOST + '([pos=r]) ' + DIALOG_ID, 
        [TOP, 0], [RIGHT, 0], [LEFT, UNSET], [BOTTOM, UNSET],
        [MARGIN, 0], [MARGIN_ + LEFT, AUTO], [WIDTH, AUTO], [HEIGHT, FULLVH],
        [TRANSFORM, TRANSLATE_RIGHT]
    ),
    ruleByPropVals(HOST + '([pos=t]) ' + DIALOG_ID, 
        [TOP, 0], [RIGHT, UNSET], [LEFT, 0], [BOTTOM, UNSET],
        [MARGIN, 0], [MARGIN_ + BOTTOM, AUTO], [WIDTH, FULLVW], [HEIGHT, AUTO],
        [TRANSFORM, TRANSLATE_TOP]
    ),
    ruleByPropVals(HOST + '([pos=b]) ' + DIALOG_ID, 
        [TOP, UNSET], [RIGHT, UNSET], [LEFT, 0], [BOTTOM, 0],
        [MARGIN, 0], [MARGIN_ + TOP, AUTO], [WIDTH, FULLVW], [HEIGHT, AUTO],
        [TRANSFORM, TRANSLATE_BOTTOM]
    ),
    ruleByPropVals('::backdrop', 
        [BG, `oklch(from currentColor l c h / ${varExp([ALPHA], 0.5)})`],
        ['backdrop-filter', `blur(calc(1rem * ${varExp(['blur'], 0.5)}))`]
    ),
    ruleByPropVals('::slotted(*)', 
        [HEIGHT, FULLSZ],
        [WIDTH, FULLSZ],
    )
];

const stylesheet = getStyleSheet(RULES);
            
const getAnimations = ({
    type, alpha, blur
}: {
    type: string;
    alpha: string;
    blur: string;
}) => {
    let transform = TRANSLATE_LEFT;
    switch (type) {
        case 'r':
            transform = TRANSLATE_RIGHT;
            break;
        case 't':
            transform = TRANSLATE_TOP;
            break;
        case 'b':
            transform = TRANSLATE_BOTTOM;
            break;
    };
    return [
        {
            transform,
            [varName(ALPHA)]: 0,
            [varName(BLUR)]: 0,
        },
        {
            [TRANSFORM]: 'translate(0,0)',
            [varName(ALPHA)]: alpha,
            [varName(BLUR)]: blur
        }
    ];
};

const getParamsFromAttrs = (container: HTMLElement, direction: PlaybackDirection  = 'normal'): [Keyframe[], KeyframeAnimationOptions] => {
    const duration = Number(container.getAttribute(DUR)) || 300;
    const delay = Number(container.getAttribute(DEL)) || 0;
    const easing = container.getAttribute(TF) || 'linear';
    const position = container.getAttribute(POS) || 'l';
    const alpha = container.getAttribute(ALPHA) ?? '0.5';
    const blur = container.getAttribute(BLUR) ?? '0.5';
    return [getAnimations({
        type: position,
        alpha,
        blur
    }), {
        easing, duration, delay,
        direction,
        iterations: 1,
        fill: 'both'
    }];
}

const openDialog = async (container: ISlideContainerElement) => {
    if (container.getAttribute('modal') !== null) container.dialog.showModal();
    else container.dialog.show();
    const animation = container.dialog.animate(...getParamsFromAttrs(container));
    await animation.finished;
    animation.commitStyles();
    animation.cancel();
    // publish event
    dispatch(container, 'open');
};

const closeDialog = async (container: ISlideContainerElement) => {
    const animation = container.dialog.animate(...getParamsFromAttrs(container, 'reverse'));
    await animation.finished;
    animation.commitStyles();
    animation.cancel();
    // then close
    container.dialog.close();
    // publish event
    dispatch(container, 'close');
}

/**
 * Use slide container
 */
export const useSlide: TUseSlide = () => {
    const custom = globalThis.customElements;
    const doc = globalThis.document;
    if (custom && !custom?.get(tagName)) {
        custom.define(tagName, class Slide extends HTMLElement implements ISlideContainerElement {
            static get observedAttributes() {
                return OBSERVED_ATTRS_KEYS;
            }

            get dialog(): HTMLDialogElement {
                return this.shadowRoot?.children[0] as HTMLDialogElement;
            }

            get isOpen() {
                return this.dialog.getAttribute(OPEN) !== null;
            }

            // public methods

            async close() {
                if (this.isOpen) {
                    await closeDialog(this);
                    this.removeAttribute(OPEN);
                }
            }

            async open() {
                if (!this.isOpen) {
                    await openDialog(this);
                    this.setAttribute(OPEN, '');
                }
            }

            async toggle() {
                if (!this.isOpen) await this.open();
                else await this.close();
            }

            disconnectedCallback: () => void;

            connectedCallback() {
                const shadowRoot = this.attachShadow({ mode: OPEN });
                shadowRoot.innerHTML = `<${DIALOG} id="${DIALOG}"><slot></slot></${DIALOG}>`;
                shadowRoot.adoptedStyleSheets = [stylesheet];
                OBSERVED_ATTRS_KEYS.forEach((name) => {
                    const val = this.getAttribute(name);
                    if (val) this.attributeChangedCallback(name, '', val);
                });
                const clickHandler = (e: PointerEvent) => {
                    const {x, y} = e;
                    const rect = this.dialog.getBoundingClientRect();
                    if (this.isOpen && (y > rect.bottom || y < rect.top || x > rect.right || x < rect.left)) this.close();
                };
                this.dialog.addEventListener(CLICK, clickHandler);
                this.disconnectedCallback = () => {
                    this.dialog.removeEventListener(CLICK, clickHandler);
                }
            }

            attributeChangedCallback(name: typeof OBSERVED_ATTRS_KEYS[number], _: string, newValue: string) {
                switch (name) {
                    case OPEN:
                        if (newValue !== null) this.open();
                        else this.close();
                        break;
                    default:
                        break;
                };
                return;
            }
        });
    }
    return {
        observe: (callback: TSlideEventHandler, element: HTMLElement = doc?.body) => {
            element && addListener(element, callback as unknown as EventListenerOrEventListenerObject);
            return () => element && removeListener(element, callback as unknown as EventListenerOrEventListenerObject);
        },
        unobserve: (callback: TSlideEventHandler, element: HTMLElement = doc?.body) => removeListener(element, callback as unknown as EventListenerOrEventListenerObject)
    };
};
