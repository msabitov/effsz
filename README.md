<p align="center">
  <a href="https://effnd.tech/sz/">
    <img alt="effsz" src="https://effnd.tech/effsz_logo.svg" height="256px" />
  </a>
</p>

<h1 align="center">EffSZ</h1>

<div align="center">

[![license](https://badgen.net/static/license/Apache%202.0/blue)](https://gitverse.ru/msabitov/effsz/content/master/LICENSE)
[![npm latest package](https://badgen.net/npm/v/effsz)](https://www.npmjs.com/package/effsz)

</div>

EffSZ is a web component library for resizable content

## Some features

-   lightweight
-   zero-dependency
-   framework agnostic

## Links

-   [Docs](https://effnd.tech/sz/)
-   [Repository](https://gitverse.ru/msabitov/effsz)
-   [Github mirror](https://github.com/msabitov/effsz)

## Installation

Type in your terminal:

```sh
# npm
npm i effsz

# pnpm
pnpm add effsz

# yarn
yarn add effsz
```

## Quick start

In short each web component should be defined before use. Every module in this library provides such a function
-    `useLimit` from `effsz/limit` defines container that limits count of visible children when it overflows;
-    `useScroll` from `effsz/scroll` defines container that based on the native scroll, but sets its own scrollbar and shadows which are displayed the same for different browsers;
-    `useSplit` from `effsz/split` defines container that split its area between slots that can be resized.

Each function returns object with `observe` and `unobserve` event handlers to control components behavior.

For example, you would like to use **Split container**:

```jsx
import { useEffect } from 'react';
import { useSplit } from 'effsz/split'

// define custom web component before use
// note, that for SSR you need to call it before browser parse document body
// so you might need to add separate definition script to the document head
const { observe } = useSplit();

export const App = () => {
    const ref = useRef();
    useEffect(() => {
      // you can observe web component events
      const unobserve = observe((e) => {
        // event handler
      }, ref.current);
      // and you can unobserve
      return () => unobserve();
    }, []);
    // just use web component in jsx
    // all attributes are described in ISplitContainerAttrs interface
    return <div ref={ref}>
        <effsz-split
            ini='0.25 0.5'
            min='0.25 0.25 0.1'
            fdir='rr'
        >
            <div class='first' slot='1'>
                ...
            </div>
            <div class='second' slot='2'>
                ...
            </div>
            <div class='last'>
                ...
            </div>
        </effsz-split>
    </div>;
}
```

That's all. Enjoy simplicity.
