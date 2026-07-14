---
id: 2026-04-22-configuration-submenu-resize-leak
feature: Scrum Board — Board configuration sub-menu
severity: P2
area: frontend
status: fix-in-progress
reporter: AI exploratory
fixed_in_commit: null
---

# `ConfigurationSubMenu` leaks a `resize` listener — cleanup is returned from `componentDidMount` where React ignores it

## Observed
In [src/pages/projects/apps/ScrumBoard/BoardDetail/List/ConfigurationSubMenu.js:78-82](src/pages/projects/apps/ScrumBoard/BoardDetail/List/ConfigurationSubMenu.js#L78-L82):

```js
componentDidMount() {
    this.resizeWindow()
    window.addEventListener("resize", this.resizeWindow)
    return () => window.removeEventListener("resize", this.resizeWindow)
}
```

The returned cleanup function is **never invoked** — React class components ignore the return value of `componentDidMount`. The listener accumulates every time the component mounts. There is no `componentWillUnmount` in the class.

## Expected
Cleanup on unmount. Each mount adds exactly one listener; each unmount removes exactly one.

## Reproduction
1. Sign in as `qa.sandhiya`.
2. Open a board's List view → Configuration sub-menu.
3. Navigate away (e.g., back to board list) and return — repeat ~10×.
4. DevTools → Performance monitor → event listener count climbs monotonically. Alternatively:
   ```js
   // console, before and after cycling:
   getEventListeners(window).resize.length
   ```
5. Observe count grows by one per configuration-menu mount and never decreases.

## Evidence
- Code reference: [src/pages/projects/apps/ScrumBoard/BoardDetail/List/ConfigurationSubMenu.js:78-82](src/pages/projects/apps/ScrumBoard/BoardDetail/List/ConfigurationSubMenu.js#L78-L82)
- Listener-count screenshot: `findings/evidence/` (to be captured).

## Root cause
Author likely borrowed the `useEffect` return-cleanup idiom and applied it to `componentDidMount`. The two lifecycles have different cleanup contracts.

## Fix (developer)
- Replace the `return () => …` inside `componentDidMount` with a proper `componentWillUnmount`:

```js
componentDidMount() {
    this.resizeWindow()
    window.addEventListener("resize", this.resizeWindow)
}

componentWillUnmount() {
    window.removeEventListener("resize", this.resizeWindow)
}
```

- Or convert the component to a function component with `useEffect`, keeping the returned cleanup — which React *does* honor.
