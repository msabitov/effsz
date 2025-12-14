import { beforeAll, describe, expect, test, vi } from 'vitest';
import { IScrollContainerElement, useScroll } from '../src/scroll';
import { ILimitContainerElement, useLimit } from '../src/limit';
import { ISplitContainerElement, useSplit } from '../src/split';
import { IMasonryContainerElement, useMasonry } from '../src/masonry';
import { IExpandContainerElement, useExpand } from '../src/expand';
import { ICarouselContainerElement, useCarousel } from '../src/carousel';
import { ISlideContainerElement, useSlide } from '../src/slide';

const ID = {
    scrollY: 'scroll-1',
    scrollX: 'scroll-2',
    splitY: 'split-1',
    splitX: 'split-2',
    splitXR: 'split-3',
    limitX: 'limit-1',
    limitXR: 'limit-2',
    limitY: 'limit-3',
    limitYR: 'limit-4',
    masonry: 'masonry',
    expand: 'expand',
    expandBtn: 'expandBtn',
    carousel: 'carousel',
    slide: 'slide',
    slideContent: 'slideContent',
    slideBtn: 'slideBtn'
};

const SIZE = {
    H: 50,
    W: 200,
    F: 400
};

const getScrollXChildren = (size: number) => Array.from(Array(size).keys()).
    map((i) => `<div style='width: ${SIZE.W}px; height: 40px; background: ${i % 2 ? 'yellow' : 'green'};'>${i}</div>`).
    join('');

const getScrollYChildren = (size: number) => Array.from(Array(size).keys()).
    map((i) => `<div style='width: 200px; height: ${SIZE.H}px; background: ${i % 2 ? 'yellow' : 'green'};'>${i}</div>`).
    join('');

const baseMasonryItems = ['1/2', '1', '2/1', '16/9', '9/16', '1', '3/4', '4/3', '1', '1', '1/2'];
const getMasonryChildren = (count: number = 1) => Array.from(Array(count).keys()).
    map(i => baseMasonryItems.map((i, ind) => `<div slot="${ind}" ${!(ind % 2) ? `data-effsz-ar="${i}"` : ''} style='${ind % 2 ? `aspect-ratio: ${i};` : ''}background: oklch(1 0.4 ${ind * 45});'>#${ind} (${i})</div>`).
    join('')).
    join('');

describe('EffSZ:', () => {
    let handlers: Partial<{
        scroll: ReturnType<typeof useScroll>;
        limit: ReturnType<typeof useLimit>;
        split: ReturnType<typeof useSplit>;
        masonry: ReturnType<typeof useMasonry>;
        resize: ReturnType<typeof useExpand>;
        carousel: ReturnType<typeof useCarousel>;
        slide: ReturnType<typeof useSlide>;
    }> = {};
    let scrollXCount: number = 10;
    let scrollYCount: number = 10;
    const carouselIni = 2;
    beforeAll(() => {
        handlers = {
            scroll: useScroll(),
            split: useSplit(),
            limit: useLimit(),
            masonry: useMasonry(),
            resize: useExpand(),
            carousel: useCarousel(),
            slide: useSlide()
        };
        window.document.body.innerHTML = `
            <style>
                #split-1 {
                    height: ${SIZE.F}px;
                    width: ${SIZE.F}px;
                }
                .bg {
                    background: #d1cccc;
                }
                .carousel {
                    width: 400px;
                    height: 200px;
                }
                #${ID.slideContent} {
                    background: #dce9e7;
                    width: 200px;
                }
                #${ID.slideContent}[pos=t], #${ID.slideContent}[pos=b] {
                    height: 200px;
                    width: 100%;
                }
            </style>
            <effsz-split
                id='${ID.splitY}'
                fdir='c'
                ini='0.65'
                min='0.1'
            >
                <effsz-split
                    id='${ID.splitX}'
                    ini='0.25'
                    min='0.25 0.1'
                    fdir='rr'
                    slot='1'
                >
                    <div class='bg'>
                        <effsz-limit id='${ID.limitX}' gap='6' fdir='r'>
                            <div style='width: 100px; background: green;'>0</div>
                            <div style='width: 100px; background: cyan;'>1</div>
                            <div style='width: 50px; background: green;'>2</div>
                            <div style='width: 200px; background: cyan;'>3</div>
                            <div slot='limit' style='width: 50px; background: orange;'>rest</div>
                        </effsz-limit>
                        <effsz-limit id='${ID.limitXR}' style='width: 100%;' fdir='rr'>
                            <div style='width: 100px; background: red;'>1</div>
                            <div style='width: 100px; background: blue;'>2</div>
                            <div style='width: 50px; background: red;'>3</div>
                            <div style='width: 50px; background: blue;'>4</div>
                            <div slot='limit' style='width:150px;background:orange;'>rest</div>
                        </effsz-limit>
                        <div style='background: grey;display:flex;justify-content:space-between;'>Toggle expand <button id='${ID.expandBtn}'>+</button></div>
                        <effsz-expand id='${ID.expand}' min='20px'>
                            <div style='height: 100px; background: grey;'>Expanded #1</div>
                            <div style='background: cyan;'>Expanded #2</div>
                        </effsz-expand>
                        After
                    </div>
                    <div class='bg' slot='1'><div style='height: 100%; overflow: hidden;'>
                        <effsz-scroll id='${ID.scrollY}' axis='y'>
                            ${getScrollYChildren(scrollXCount)}
                        </effsz-scroll>
                    </div>
                </div>
            </effsz-split>
            <effsz-split
                id='${ID.splitXR}'
                ini='0.25 0.25'
                min='0.1 0.25 0.1'
                fdir='rr'
            >
                <div class='bg'>
                    <effsz-scroll id='${ID.scrollX}' axis='x'>
                        ${getScrollXChildren(scrollXCount)}
                    </effsz-scroll>
                </div>
                <div class='bg' slot='1' style='display: flex;'>
                    <effsz-limit id='${ID.limitY}' fdir='c'>
                        <div style='height: 30px; background: green;'>0</div>
                        <div style='height: 20px; background: cyan;'>1</div>
                        <div style='height: 50px; background: green;'>2</div>
                        <div style='height: 60px; background: cyan;'>3</div>
                        <div slot='limit' style='height: 50px; background: orange;'>rest</div>
                    </effsz-limit>
                    <effsz-limit id='${ID.limitYR}' gap='6' style='height: 100%;' fdir='cr'>
                        <div style='height: 30px; background: red;'>1</div>
                        <div style='height: 20px; background: blue;'>2</div>
                        <div style='height: 50px; background: red;'>3</div>
                        <div style='height: 80px; background: blue;'>4</div>
                        <div slot='limit' style='height:100px;background:orange;'>rest</div>
                    </effsz-limit>
                </div>
                <div class='bg' slot='2'>
                    <effsz-scroll axis='y'>
                        <effsz-masonry id="${ID.masonry}" axis='y' tracks='4' trackgap='0.4rem'>
                            ${getMasonryChildren()}
                        </effsz-masonry>
                    </effsz-scroll>
                </div>
            </effsz-split>
        </effsz-split>
        <effsz-carousel id="${ID.carousel}" ini="${carouselIni}" type="slide" class='carousel'>
            <div slot='bef'>bef</div>
            <div slot='aft'>aft</div>
            <div style='background: red;'><div style="font-size: 32px;margin: auto;justify-self: center;">1 item</div></div>
            <div style='background: blue;'><div style="font-size: 32px;margin: auto;justify-self: center;">2 item</div></div>
            <div style='background: red;'><div style="font-size: 32px;margin: auto;justify-self: center;">3 item</div></div>
            <div style='background: blue;'><div style="font-size: 32px;margin: auto;justify-self: center;">4 item</div></div>
        </effsz-carousel>
        <button id="${ID.slideBtn}">Toggle sliding container</button>
        <effsz-slide id="${ID.slide}" modal>
            <div id="${ID.slideContent}">Inside sliding container</div>
        </effsz-slide>
        `;
    });

    describe('effsz-scroll:', () => {
        describe('axis=y:', () => {
            test('axis:', async () => {
                const container = document.getElementById(ID.scrollY) as IScrollContainerElement;
                expect(container.axis).toBe('y');
            });

            test('size:', async () => {
                const container = document.getElementById(ID.scrollY) as IScrollContainerElement;
                expect(container.size).toBe(0.65 * SIZE.F);
            });

            test('scrollSize:', async () => {
                const container = document.getElementById(ID.scrollY) as IScrollContainerElement;
                expect(container.scrollSize).toBe(10 * SIZE.H);
            });

            test('scrollOffset & scrollProgress & scrollByOffset:', async () => {
                const container = document.getElementById(ID.scrollY) as IScrollContainerElement;
                const offset = 100;
                container.scrollByOffset(offset);
                expect([container.scrollOffset, container.scrollProgress]).toEqual([offset, offset / (10 * SIZE.H - 0.65 * SIZE.F)]);
            });

            test('scrollToEnd:', async () => {
                const container = document.getElementById(ID.scrollY) as IScrollContainerElement;
                await container.scrollToEnd();
                expect(container.scrollOffset).toBe(10 * SIZE.H - 0.65 * SIZE.F);
            });

            test('scrollToOffset:', async () => {
                const container = document.getElementById(ID.scrollY) as IScrollContainerElement;
                const offset = 100;
                container.scrollToOffset(offset);
                expect(container.scrollOffset).toBe(offset);
            });

            test('scrollToStart:', async () => {
                const container = document.getElementById(ID.scrollY) as IScrollContainerElement;
                container.scrollToStart();
                expect(container.scrollOffset).toBe(0);
            });

            test('higher keypoint event handler:', async () => {
                let isCalled = false;
                const unobserveScroll = handlers.scroll?.observe((event) => {
                    if (event.detail.type === 'higher') {
                        const container = document.getElementById(ID.scrollY) as IScrollContainerElement;
                        if (scrollYCount > 40) return;
                        scrollYCount += 10;
                        container.innerHTML = getScrollYChildren(scrollYCount);
                        isCalled = true;
                    }
                });
                const container = document.getElementById(ID.scrollY) as IScrollContainerElement;
                container.scrollToOffset(0);
                const attrVal = 100;
                container.setAttribute('higher', attrVal + '')
                container.scrollToEnd();
                await new Promise(resolve => setTimeout(resolve, 700));
                await vi.waitFor(() => isCalled, {timeout: 700});
                expect(container.children.length).toBe(20);
            });

            test('lower keypoint event handler:', async () => {
                let isCalled = false;
                const unobserveScroll = handlers.scroll?.observe((event) => {
                    if (event.detail.type === 'lower') {
                        isCalled = true;
                    }
                });
                const container = document.getElementById(ID.scrollY) as IScrollContainerElement;
                container.scrollToEnd();
                const attrVal = 100;
                container.setAttribute('lower', attrVal + '')
                container.scrollToStart();
                await new Promise(resolve => setTimeout(resolve, 700));
                await vi.waitFor(() => isCalled, {timeout: 700});
                expect(isCalled).toBeTruthy();
            });
        });

        describe('axis=x:', () => {
            test('axis:', async () => {
                const container = document.getElementById(ID.scrollX) as IScrollContainerElement;
                expect(container.axis).toBe('x');
            });

            test('size:', async () => {
                const container = document.getElementById(ID.scrollX) as IScrollContainerElement;
                expect(container.size).toBe(0.5 * SIZE.F);
            });

            test('scrollSize:', async () => {
                const container = document.getElementById(ID.scrollX) as IScrollContainerElement;
                expect(container.scrollSize).toBe(10 * SIZE.W);
            });

            test('scrollOffset & scrollProgress & scrollByOffset:', async () => {
                const container = document.getElementById(ID.scrollX) as IScrollContainerElement;
                const offset = 100;
                container.scrollByOffset(offset);
                expect([container.scrollOffset, container.scrollProgress]).toEqual([offset, offset / (10 * SIZE.W - 0.5 * SIZE.F)]);
            });

            test('scrollToEnd:', async () => {
                const container = document.getElementById(ID.scrollX) as IScrollContainerElement;
                await container.scrollToEnd();
                expect(container.scrollOffset).toBe(10 * SIZE.W - 0.5 * SIZE.F);
            });

            test('scrollToOffset:', async () => {
                const container = document.getElementById(ID.scrollX) as IScrollContainerElement;
                const offset = 100;
                container.scrollToOffset(offset);
                expect(container.scrollOffset).toBe(offset);
            });

            test('scrollToStart:', async () => {
                const container = document.getElementById(ID.scrollX) as IScrollContainerElement;
                container.scrollToStart();
                expect(container.scrollOffset).toBe(0);
            });
        });
    });

    describe('effsz-split:', () => {
        describe('axis=y:', () => {
            test('axis:', async () => {
                const container = document.getElementById(ID.splitY) as ISplitContainerElement;
                expect(container.axis).toBe('y');
            });

            test('isReversed:', async () => {
                const container = document.getElementById(ID.splitY) as ISplitContainerElement;
                expect(container.isReversed).toBe(false);
            });

            test('lastSize:', async () => {
                const container = document.getElementById(ID.splitY) as ISplitContainerElement;
                const sizes = [0.8];
                container.sizes = sizes;
                expect(container.lastSize).toBe(0.2);
            });

            test('saveSize & restoreSize:', async () => {
                const container = document.getElementById(ID.splitY) as ISplitContainerElement;
                const sizes = [...container.sizes];
                container.saveSize();
                container.sizes = [0.9];
                container.restoreSize();
                expect(container.sizes).toEqual(sizes);
            });

            test('restoreSize to initial:', async () => {
                const container = document.getElementById(ID.splitY) as ISplitContainerElement;
                container.sizes = [0.8];
                container.restoreSize(true);
                expect(container.sizes).toEqual([0.65]);
            });
        });

        describe('axis=x:', () => {
            test('axis:', async () => {
                const container = document.getElementById(ID.splitX) as ISplitContainerElement;
                expect(container.axis).toBe('x');
            });

            test('isReversed:', async () => {
                const container = document.getElementById(ID.splitX) as ISplitContainerElement;
                expect(container.isReversed).toBe(true);
            });

            test('lastSize:', async () => {
                const container = document.getElementById(ID.splitX) as ISplitContainerElement;
                const sizes = [0.25];
                container.sizes = sizes;
                expect(container.lastSize).toBe(0.75);
            });

            test('saveSize & restoreSize:', async () => {
                const container = document.getElementById(ID.splitX) as ISplitContainerElement;
                const sizes = [...container.sizes];
                container.saveSize();
                container.sizes = [0.5];
                container.restoreSize();
                expect(container.sizes).toEqual(sizes);
            });

            test('restoreSize to initial:', async () => {
                const container = document.getElementById(ID.splitX) as ISplitContainerElement;
                container.sizes = [0.8];
                container.restoreSize(true);
                expect(container.sizes).toEqual([0.25]);
            });
        });
    });

    describe('effsz-limit:', () => {
        describe('axis=y:', () => {
            test('fdir=c axis:', async () => {
                const container = document.getElementById(ID.limitY) as ILimitContainerElement;
                expect(container.axis).toBe('y');
            });

            test('fdir=c limitCount:', async () => {
                const container = document.getElementById(ID.limitY) as ILimitContainerElement;
                expect(container.limitCount).toBe(2);
            });

            test('fdir=c isLimited:', async () => {
                const container = document.getElementById(ID.limitY) as ILimitContainerElement;
                expect(container.isLimited).toBe(true);
            });

            test('fdir=cr axis:', async () => {
                const container = document.getElementById(ID.limitYR) as ILimitContainerElement;
                expect(container.axis).toBe('y');
            });

            test('fdir=cr limitCount:', async () => {
                const container = document.getElementById(ID.limitYR) as ILimitContainerElement;
                expect(container.limitCount).toBe(1);
            });

            test('fdir=c isLimited:', async () => {
                const container = document.getElementById(ID.limitYR) as ILimitContainerElement;
                expect(container.isLimited).toBe(true);
            });
        });

        describe('axis=x:', () => {
            test('fdir=r axis:', async () => {
                const container = document.getElementById(ID.limitX) as ILimitContainerElement;
                expect(container.axis).toBe('x');
            });

            test('fdir=r limitCount:', async () => {
                const container = document.getElementById(ID.limitX) as ILimitContainerElement;
                expect(container.limitCount).toBe(2);
            });

            test('fdir=r isLimited:', async () => {
                const container = document.getElementById(ID.limitX) as ILimitContainerElement;
                expect(container.isLimited).toBe(true);
            });

            test('fdir=rr axis:', async () => {
                const container = document.getElementById(ID.limitXR) as ILimitContainerElement;
                expect(container.axis).toBe('x');
            });

            test('fdir=rr limitCount:', async () => {
                const container = document.getElementById(ID.limitXR) as ILimitContainerElement;
                expect(container.limitCount).toBe(1);
            });

            test('fdir=rr isLimited:', async () => {
                const container = document.getElementById(ID.limitXR) as ILimitContainerElement;
                expect(container.isLimited).toBe(true);
            });
        });
    });

    describe('effsz-masonry:', () => {
        test('layout:', () => {
            const container = document.getElementById(ID.masonry) as IMasonryContainerElement;
            expect(container.layout).toEqual({
                0: [0, 8],
                1: [1, 6, 10],
                2: [2, 4, 9],
                3: [3, 5, 7]
            });
        });
    });

    describe('effsz-expand:', () => {
        let container: IExpandContainerElement;
        const min = 50;
        const max = 100;

        beforeAll(() => {
            container = document.getElementById(ID.expand) as IExpandContainerElement;
            container.setAttribute('min', min + 'px');
            container.setAttribute('max', max + 'px');
            const btn = document.getElementById(ID.expandBtn) as HTMLButtonElement;
            const handler = () => {
                btn.innerText = container.isOpen ? '+' : '-';
                container.toggle();
            }
            btn?.addEventListener('click', handler);
            return () => btn?.removeEventListener('click', handler);
        });

        test('expand:', () => {
            container.expand();
            expect(container.isOpen).toBeTruthy();
        });

        test('collapse:', () => {
            container.collapse();
            expect(container.isOpen).toBeFalsy();
        });

        test('toggle:', () => {
            const history = [];
            container.toggle();
            history.push(container.isOpen);
            container.toggle();
            history.push(container.isOpen);
            expect(history).toEqual([true,false]);
        });

        test('`open` attribute:', () => {
            container.setAttribute('open', '')
            expect(container.isOpen).toBeTruthy();
        });
    });

    describe('effsz-carousel:', () => {
        let container: ICarouselContainerElement;

        beforeAll(() => {
            container = document.getElementById(ID.carousel) as ICarouselContainerElement;
        });

        test('active:', async () => {
            expect(container.active).toBe(carouselIni);
        });

        test('items:', async () => {
            expect(container.items).toEqual([...container.querySelectorAll(`#${ID.carousel} > *:not([slot])`)]);
        });

        test('next:', async () => {
            await container.next();
            expect(container.active).toBe(carouselIni + 1);
        });

        test('show:', async () => {
            await container.show(0);
            expect(container.active).toBe(0);
        });

        test('prev:', async () => {
            await container.prev();
            expect(container.active).toBe(3);
        });
    });

    describe('effsz-slide:', () => {
        let container: ISlideContainerElement;

        beforeAll(() => {
            container = document.getElementById(ID.slide) as ISlideContainerElement;
            const btn = document.getElementById(ID.slideBtn) as HTMLButtonElement;
            btn.addEventListener('click', () => container.isOpen ? container.close() : container.open())
        });

        test('open:', async () => {
            await container.open();
            expect(container.isOpen).toBeTruthy();
        });

        test('close:', async () => {
            await container.close();
            expect(container.isOpen).toBeFalsy();
        });

        test('toggle:', async () => {
            await container.toggle();
            expect(container.isOpen).toBeTruthy();
        });
    })
});
