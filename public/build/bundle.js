
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\colors.svelte generated by Svelte v3.46.4 */
    const file$8 = "src\\colors.svelte";

    function create_fragment$8(ctx) {
    	let section;
    	let div11;
    	let div1;
    	let div0;
    	let t0;
    	let div3;
    	let div2;
    	let t1;
    	let div5;
    	let div4;
    	let t2;
    	let div7;
    	let div6;
    	let t3;
    	let div10;
    	let div8;
    	let t4;
    	let div9;
    	let t5;
    	let div12;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div11 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			t1 = space();
    			div5 = element("div");
    			div4 = element("div");
    			t2 = space();
    			div7 = element("div");
    			div6 = element("div");
    			t3 = space();
    			div10 = element("div");
    			div8 = element("div");
    			t4 = space();
    			div9 = element("div");
    			t5 = space();
    			div12 = element("div");
    			p = element("p");
    			p.textContent = "Website Appearance";
    			attr_dev(div0, "class", "classyB button svelte-hk042q");
    			add_location(div0, file$8, 15, 6, 361);
    			attr_dev(div1, "id", "classy");
    			attr_dev(div1, "class", "flexy accent svelte-hk042q");
    			add_location(div1, file$8, 14, 4, 315);
    			attr_dev(div2, "class", "cozyB button svelte-hk042q");
    			add_location(div2, file$8, 18, 6, 480);
    			attr_dev(div3, "id", "cozy");
    			attr_dev(div3, "class", "flexy accent svelte-hk042q");
    			add_location(div3, file$8, 17, 4, 436);
    			attr_dev(div4, "class", "coolB button svelte-hk042q");
    			add_location(div4, file$8, 21, 6, 597);
    			attr_dev(div5, "id", "cool");
    			attr_dev(div5, "class", "flexy accent svelte-hk042q");
    			add_location(div5, file$8, 20, 4, 553);
    			attr_dev(div6, "class", "carefreeB button svelte-hk042q");
    			add_location(div6, file$8, 24, 6, 718);
    			attr_dev(div7, "id", "carefree");
    			attr_dev(div7, "class", "flexy accent svelte-hk042q");
    			add_location(div7, file$8, 23, 4, 670);
    			attr_dev(div8, "class", "left colorTailLeft svelte-hk042q");
    			add_location(div8, file$8, 27, 6, 821);
    			attr_dev(div9, "class", "right colorTailRight svelte-hk042q");
    			add_location(div9, file$8, 28, 6, 867);
    			attr_dev(div10, "class", "tail svelte-hk042q");
    			add_location(div10, file$8, 26, 4, 795);
    			attr_dev(div11, "class", "buttons svelte-hk042q");
    			add_location(div11, file$8, 13, 2, 288);
    			attr_dev(p, "class", "svelte-hk042q");
    			add_location(p, file$8, 32, 4, 963);
    			attr_dev(div12, "class", "title base svelte-hk042q");
    			add_location(div12, file$8, 31, 2, 933);
    			attr_dev(section, "class", "svelte-hk042q");
    			add_location(section, file$8, 12, 0, 275);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div11);
    			append_dev(div11, div1);
    			append_dev(div1, div0);
    			append_dev(div11, t0);
    			append_dev(div11, div3);
    			append_dev(div3, div2);
    			append_dev(div11, t1);
    			append_dev(div11, div5);
    			append_dev(div5, div4);
    			append_dev(div11, t2);
    			append_dev(div11, div7);
    			append_dev(div7, div6);
    			append_dev(div11, t3);
    			append_dev(div11, div10);
    			append_dev(div10, div8);
    			append_dev(div10, t4);
    			append_dev(div10, div9);
    			append_dev(section, t5);
    			append_dev(section, div12);
    			append_dev(div12, p);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*styleChange*/ ctx[0], false, false, false),
    					listen_dev(div2, "click", /*styleChange*/ ctx[0], false, false, false),
    					listen_dev(div4, "click", /*styleChange*/ ctx[0], false, false, false),
    					listen_dev(div6, "click", /*styleChange*/ ctx[0], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Colors', slots, []);
    	const dispatch = createEventDispatcher();

    	function styleChange(event) {
    		let newStyle = event.target.closest('.flexy').id;
    		dispatch('styleChange', { newStyle });
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Colors> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		styleChange
    	});

    	return [styleChange];
    }

    class Colors extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Colors",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\dropdown.svelte generated by Svelte v3.46.4 */

    const { console: console_1 } = globals;
    const file$7 = "src\\dropdown.svelte";

    function create_fragment$7(ctx) {
    	let section1;
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let div10;
    	let div4;
    	let p0;
    	let t4;
    	let img0;
    	let img0_src_value;
    	let t5;
    	let div7;
    	let p1;
    	let t7;
    	let img1;
    	let img1_src_value;
    	let t8;
    	let div5;
    	let p2;
    	let t10;
    	let img2;
    	let img2_src_value;
    	let t11;
    	let div6;
    	let p3;
    	let t13;
    	let img3;
    	let img3_src_value;
    	let t14;
    	let div8;
    	let p4;
    	let t15;
    	let br;
    	let t16;
    	let t17;
    	let img4;
    	let img4_src_value;
    	let t18;
    	let div9;
    	let p5;
    	let t20;
    	let img5;
    	let img5_src_value;
    	let t21;
    	let section0;
    	let div11;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section1 = element("section");
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			t2 = space();
    			div10 = element("div");
    			div4 = element("div");
    			p0 = element("p");
    			p0.textContent = "Home";
    			t4 = space();
    			img0 = element("img");
    			t5 = space();
    			div7 = element("div");
    			p1 = element("p");
    			p1.textContent = "Menu";
    			t7 = space();
    			img1 = element("img");
    			t8 = space();
    			div5 = element("div");
    			p2 = element("p");
    			p2.textContent = "Food";
    			t10 = space();
    			img2 = element("img");
    			t11 = space();
    			div6 = element("div");
    			p3 = element("p");
    			p3.textContent = "Drinks";
    			t13 = space();
    			img3 = element("img");
    			t14 = space();
    			div8 = element("div");
    			p4 = element("p");
    			t15 = text("Contact");
    			br = element("br");
    			t16 = text("Us");
    			t17 = space();
    			img4 = element("img");
    			t18 = space();
    			div9 = element("div");
    			p5 = element("p");
    			p5.textContent = "Schedule";
    			t20 = space();
    			img5 = element("img");
    			t21 = space();
    			section0 = element("section");
    			div11 = element("div");
    			attr_dev(div0, "class", "bar1 svelte-1vpdc8g");
    			add_location(div0, file$7, 55, 6, 1607);
    			attr_dev(div1, "class", "bar2 svelte-1vpdc8g");
    			add_location(div1, file$7, 56, 6, 1639);
    			attr_dev(div2, "class", "bar3 svelte-1vpdc8g");
    			add_location(div2, file$7, 57, 6, 1671);
    			attr_dev(div3, "id", "dropdown");
    			attr_dev(div3, "class", "dropdown svelte-1vpdc8g");
    			add_location(div3, file$7, 54, 2, 1542);
    			attr_dev(p0, "class", "svelte-1vpdc8g");
    			add_location(p0, file$7, 61, 8, 1798);
    			if (!src_url_equal(img0.src, img0_src_value = /*srcHome*/ ctx[2])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Home");
    			attr_dev(img0, "class", "svelte-1vpdc8g");
    			add_location(img0, file$7, 62, 8, 1819);
    			attr_dev(div4, "class", "home hidden svelte-1vpdc8g");
    			add_location(div4, file$7, 60, 4, 1741);
    			attr_dev(p1, "class", "svelte-1vpdc8g");
    			add_location(p1, file$7, 65, 8, 1922);
    			if (!src_url_equal(img1.src, img1_src_value = /*srcMenu*/ ctx[3])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Menu");
    			attr_dev(img1, "class", "svelte-1vpdc8g");
    			add_location(img1, file$7, 66, 8, 1963);
    			attr_dev(p2, "class", "svelte-1vpdc8g");
    			add_location(p2, file$7, 68, 12, 2090);
    			if (!src_url_equal(img2.src, img2_src_value = /*srcFood*/ ctx[4])) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Food");
    			attr_dev(img2, "class", "svelte-1vpdc8g");
    			add_location(img2, file$7, 69, 12, 2115);
    			attr_dev(div5, "id", "navFood");
    			attr_dev(div5, "class", "food svelte-1vpdc8g");
    			add_location(div5, file$7, 67, 8, 2023);
    			attr_dev(p3, "class", "svelte-1vpdc8g");
    			add_location(p3, file$7, 72, 12, 2240);
    			if (!src_url_equal(img3.src, img3_src_value = /*srcDrink*/ ctx[5])) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Drink");
    			attr_dev(img3, "class", "svelte-1vpdc8g");
    			add_location(img3, file$7, 73, 12, 2267);
    			attr_dev(div6, "id", "navDrink");
    			attr_dev(div6, "class", "drink svelte-1vpdc8g");
    			add_location(div6, file$7, 71, 8, 2171);
    			attr_dev(div7, "id", "navMenu");
    			attr_dev(div7, "class", "menu hidden closed svelte-1vpdc8g");
    			add_location(div7, file$7, 64, 4, 1867);
    			add_location(br, file$7, 77, 18, 2403);
    			attr_dev(p4, "class", "svelte-1vpdc8g");
    			add_location(p4, file$7, 77, 8, 2393);
    			if (!src_url_equal(img4.src, img4_src_value = /*srcCont*/ ctx[6])) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Contact");
    			attr_dev(img4, "class", "svelte-1vpdc8g");
    			add_location(img4, file$7, 78, 8, 2423);
    			attr_dev(div8, "class", "contact hidden svelte-1vpdc8g");
    			add_location(div8, file$7, 76, 4, 2333);
    			attr_dev(p5, "class", "svelte-1vpdc8g");
    			add_location(p5, file$7, 81, 8, 2535);
    			if (!src_url_equal(img5.src, img5_src_value = /*srcSched*/ ctx[7])) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Schedule");
    			attr_dev(img5, "class", "svelte-1vpdc8g");
    			add_location(img5, file$7, 82, 8, 2560);
    			attr_dev(div9, "class", "schedule hidden svelte-1vpdc8g");
    			add_location(div9, file$7, 80, 4, 2474);
    			attr_dev(div10, "class", "stuff accent svelte-1vpdc8g");
    			add_location(div10, file$7, 59, 2, 1709);
    			attr_dev(div11, "class", "bar1 bar2 bar3 stuff svelte-1vpdc8g");
    			add_location(div11, file$7, 86, 6, 2675);
    			attr_dev(section0, "class", "ignore visible opened change svelte-1vpdc8g");
    			add_location(section0, file$7, 85, 2, 2621);
    			attr_dev(section1, "id", "test");
    			attr_dev(section1, "class", "svelte-1vpdc8g");
    			add_location(section1, file$7, 53, 0, 1504);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(section1, t2);
    			append_dev(section1, div10);
    			append_dev(div10, div4);
    			append_dev(div4, p0);
    			append_dev(div4, t4);
    			append_dev(div4, img0);
    			append_dev(div10, t5);
    			append_dev(div10, div7);
    			append_dev(div7, p1);
    			append_dev(div7, t7);
    			append_dev(div7, img1);
    			append_dev(div7, t8);
    			append_dev(div7, div5);
    			append_dev(div5, p2);
    			append_dev(div5, t10);
    			append_dev(div5, img2);
    			append_dev(div7, t11);
    			append_dev(div7, div6);
    			append_dev(div6, p3);
    			append_dev(div6, t13);
    			append_dev(div6, img3);
    			append_dev(div10, t14);
    			append_dev(div10, div8);
    			append_dev(div8, p4);
    			append_dev(p4, t15);
    			append_dev(p4, br);
    			append_dev(p4, t16);
    			append_dev(div8, t17);
    			append_dev(div8, img4);
    			append_dev(div10, t18);
    			append_dev(div10, div9);
    			append_dev(div9, p5);
    			append_dev(div9, t20);
    			append_dev(div9, img5);
    			append_dev(section1, t21);
    			append_dev(section1, section0);
    			append_dev(section0, div11);
    			/*section1_binding*/ ctx[8](section1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div3, "click", navChange, false, false, false),
    					listen_dev(div4, "click", /*pageChange*/ ctx[1], false, false, false),
    					listen_dev(p1, "click", menuOpen, false, false, false),
    					listen_dev(img1, "click", menuOpen, false, false, false),
    					listen_dev(div5, "click", /*pageChange*/ ctx[1], false, false, false),
    					listen_dev(div6, "click", /*pageChange*/ ctx[1], false, false, false),
    					listen_dev(div8, "click", /*pageChange*/ ctx[1], false, false, false),
    					listen_dev(div9, "click", /*pageChange*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section1);
    			/*section1_binding*/ ctx[8](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function navChange(event) {
    	let x = event.target.closest('.dropdown');
    	x.classList.toggle('change');
    	x.closest('section').classList.toggle('opened');
    }

    function menuOpen(event) {
    	let x = event.target.closest('.menu');
    	x.classList.toggle('closed');
    	x.classList.toggle('visible');
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let src1;
    	let src2;
    	let src3;
    	let src4;
    	let src5;
    	let src6;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dropdown', slots, []);
    	const dispatch = createEventDispatcher();

    	function pageChange(event) {
    		let x = event.target.closest('div').classList[0];
    		dispatch('pageChange', { newPage: x });
    	}

    	let srcHome = 'images/homeIconClassy.png';
    	let srcMenu = 'images/menuIconClassy.png';
    	let srcFood = 'images/foodIconClassy.png';
    	let srcDrink = 'images/drinkIconClassy.png';
    	let srcCont = 'images/contactIconClassy.png';
    	let srcSched = 'images/scheduleIconClassy.png';
    	let el;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Dropdown> was created with unknown prop '${key}'`);
    	});

    	function section1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		navChange,
    		menuOpen,
    		pageChange,
    		srcHome,
    		srcMenu,
    		srcFood,
    		srcDrink,
    		srcCont,
    		srcSched,
    		el,
    		src6,
    		src5,
    		src4,
    		src3,
    		src2,
    		src1
    	});

    	$$self.$inject_state = $$props => {
    		if ('srcHome' in $$props) $$invalidate(2, srcHome = $$props.srcHome);
    		if ('srcMenu' in $$props) $$invalidate(3, srcMenu = $$props.srcMenu);
    		if ('srcFood' in $$props) $$invalidate(4, srcFood = $$props.srcFood);
    		if ('srcDrink' in $$props) $$invalidate(5, srcDrink = $$props.srcDrink);
    		if ('srcCont' in $$props) $$invalidate(6, srcCont = $$props.srcCont);
    		if ('srcSched' in $$props) $$invalidate(7, srcSched = $$props.srcSched);
    		if ('el' in $$props) $$invalidate(0, el = $$props.el);
    		if ('src6' in $$props) src6 = $$props.src6;
    		if ('src5' in $$props) src5 = $$props.src5;
    		if ('src4' in $$props) src4 = $$props.src4;
    		if ('src3' in $$props) src3 = $$props.src3;
    		if ('src2' in $$props) src2 = $$props.src2;
    		if ('src1' in $$props) src1 = $$props.src1;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*el*/ 1) {
    			if (el) {
    				console.log(el.style.height);
    			}
    		}
    	};

    	src1 = srcHome;
    	src2 = srcMenu;
    	src3 = srcFood;
    	src4 = srcDrink;
    	src5 = srcCont;
    	src6 = srcSched;

    	return [
    		el,
    		pageChange,
    		srcHome,
    		srcMenu,
    		srcFood,
    		srcDrink,
    		srcCont,
    		srcSched,
    		section1_binding
    	];
    }

    class Dropdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dropdown",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\header.svelte generated by Svelte v3.46.4 */
    const file$6 = "src\\header.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let dropdown;
    	let t0;
    	let div;
    	let h1;
    	let t2;
    	let colors;
    	let current;
    	dropdown = new Dropdown({ $$inline: true });
    	dropdown.$on("pageChange", /*pageChange*/ ctx[0]);
    	colors = new Colors({ $$inline: true });
    	colors.$on("styleChange", /*changeStyle*/ ctx[1]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(dropdown.$$.fragment);
    			t0 = space();
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Kat's Contemporary Cafe";
    			t2 = space();
    			create_component(colors.$$.fragment);
    			attr_dev(h1, "class", "svelte-16x3721");
    			add_location(h1, file$6, 25, 8, 644);
    			attr_dev(div, "class", "box text base svelte-16x3721");
    			add_location(div, file$6, 24, 4, 607);
    			attr_dev(main, "class", "background svelte-16x3721");
    			add_location(main, file$6, 22, 0, 532);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(dropdown, main, null);
    			append_dev(main, t0);
    			append_dev(main, div);
    			append_dev(div, h1);
    			append_dev(main, t2);
    			mount_component(colors, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dropdown.$$.fragment, local);
    			transition_in(colors.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dropdown.$$.fragment, local);
    			transition_out(colors.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(dropdown);
    			destroy_component(colors);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const dispatch = createEventDispatcher();

    	function pageChange(event) {
    		let newPage = event.detail.newPage;
    		dispatch('pageChange', { newPage });
    	}

    	function changeStyle(event) {
    		let newStyle = event.detail.newStyle;
    		dispatch('changeColor', { newStyle });
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		Colors,
    		Dropdown,
    		pageChange,
    		changeStyle
    	});

    	return [pageChange, changeStyle];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\homepage.svelte generated by Svelte v3.46.4 */

    const file$5 = "src\\homepage.svelte";

    function create_fragment$5(ctx) {
    	let section;
    	let div9;
    	let div3;
    	let div0;
    	let h20;
    	let t1;
    	let p0;
    	let t3;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let div2;
    	let h21;
    	let t6;
    	let p1;
    	let t8;
    	let div7;
    	let div4;
    	let img1;
    	let img1_src_value;
    	let t9;
    	let div5;
    	let h22;
    	let t11;
    	let p2;
    	let t13;
    	let p3;
    	let t15;
    	let p4;
    	let t17;
    	let p5;
    	let t19;
    	let p6;
    	let t21;
    	let div6;
    	let img2;
    	let img2_src_value;
    	let t22;
    	let div8;
    	let img3;
    	let img3_src_value;
    	let t23;
    	let div10;
    	let p7;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div9 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Introduction:";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Welcome to Kat's Contemporary Cafe! A student-run pop-up shop dedicated to serving cozy food and warm drinks, perfect for rainy days, a stress-free work break, or even just chilling!";
    			t3 = space();
    			div1 = element("div");
    			img0 = element("img");
    			t4 = space();
    			div2 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Help Our School:";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "This contemporary cafe is completely non-profit! Any and all proceeds will go back into helping IACS flourish! Funding field trips, helping fund next years senior projects, school building maintenance, and so much more!";
    			t8 = space();
    			div7 = element("div");
    			div4 = element("div");
    			img1 = element("img");
    			t9 = space();
    			div5 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Location:";
    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "72 Tyng Rd";
    			t13 = space();
    			p3 = element("p");
    			p3.textContent = "Tyngsboro, Massachusetts";
    			t15 = space();
    			p4 = element("p");
    			p4.textContent = "xxx-xxx-xxxx";
    			t17 = space();
    			p5 = element("p");
    			p5.textContent = "xxx-xxx@gmail.com";
    			t19 = space();
    			p6 = element("p");
    			p6.textContent = "Look for the sign!";
    			t21 = space();
    			div6 = element("div");
    			img2 = element("img");
    			t22 = space();
    			div8 = element("div");
    			img3 = element("img");
    			t23 = space();
    			div10 = element("div");
    			p7 = element("p");
    			p7.textContent = "Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts";
    			attr_dev(h20, "class", "svelte-4spa1i");
    			add_location(h20, file$5, 8, 12, 154);
    			attr_dev(p0, "class", "svelte-4spa1i");
    			add_location(p0, file$5, 9, 12, 190);
    			attr_dev(div0, "class", "about text svelte-4spa1i");
    			add_location(div0, file$5, 7, 8, 116);
    			if (!src_url_equal(img0.src, img0_src_value = "images/iacs1.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "cool food :)");
    			attr_dev(img0, "class", "svelte-4spa1i");
    			add_location(img0, file$5, 12, 8, 441);
    			attr_dev(div1, "class", "image accent svelte-4spa1i");
    			add_location(div1, file$5, 11, 8, 405);
    			attr_dev(h21, "class", "svelte-4spa1i");
    			add_location(h21, file$5, 15, 12, 551);
    			attr_dev(p1, "class", "svelte-4spa1i");
    			add_location(p1, file$5, 16, 12, 590);
    			attr_dev(div2, "class", "help text svelte-4spa1i");
    			add_location(div2, file$5, 14, 8, 514);
    			attr_dev(div3, "class", "left base svelte-4spa1i");
    			add_location(div3, file$5, 6, 4, 83);
    			if (!src_url_equal(img1.src, img1_src_value = "images/logo.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "cool logo :)");
    			attr_dev(img1, "class", "svelte-4spa1i");
    			add_location(img1, file$5, 22, 8, 935);
    			attr_dev(div4, "class", "image accent svelte-4spa1i");
    			add_location(div4, file$5, 21, 8, 899);
    			attr_dev(h22, "class", "svelte-4spa1i");
    			add_location(h22, file$5, 25, 12, 1048);
    			attr_dev(p2, "class", "svelte-4spa1i");
    			add_location(p2, file$5, 26, 12, 1080);
    			attr_dev(p3, "class", "svelte-4spa1i");
    			add_location(p3, file$5, 27, 12, 1111);
    			attr_dev(p4, "class", "svelte-4spa1i");
    			add_location(p4, file$5, 28, 12, 1156);
    			attr_dev(p5, "class", "svelte-4spa1i");
    			add_location(p5, file$5, 29, 12, 1189);
    			attr_dev(p6, "class", "svelte-4spa1i");
    			add_location(p6, file$5, 30, 12, 1227);
    			attr_dev(div5, "class", "location text svelte-4spa1i");
    			add_location(div5, file$5, 24, 8, 1007);
    			if (!src_url_equal(img2.src, img2_src_value = "images/iacs2.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "cool food :)");
    			attr_dev(img2, "class", "svelte-4spa1i");
    			add_location(img2, file$5, 33, 8, 1314);
    			attr_dev(div6, "class", "image accent svelte-4spa1i");
    			add_location(div6, file$5, 32, 8, 1278);
    			attr_dev(div7, "class", "right base svelte-4spa1i");
    			add_location(div7, file$5, 20, 4, 865);
    			attr_dev(img3, "id", "footsteps");
    			if (!src_url_equal(img3.src, img3_src_value = "images/footsteps.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "class", "footsteps svelte-4spa1i");
    			attr_dev(img3, "alt", "footsteps");
    			add_location(img3, file$5, 37, 8, 1426);
    			attr_dev(div8, "class", "righter svelte-4spa1i");
    			add_location(div8, file$5, 36, 4, 1395);
    			attr_dev(div9, "class", "main svelte-4spa1i");
    			add_location(div9, file$5, 5, 4, 59);
    			attr_dev(p7, "class", "svelte-4spa1i");
    			add_location(p7, file$5, 41, 8, 1588);
    			attr_dev(div10, "class", "footer text base background svelte-4spa1i");
    			add_location(div10, file$5, 40, 4, 1537);
    			attr_dev(section, "class", "background svelte-4spa1i");
    			add_location(section, file$5, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div9);
    			append_dev(div9, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			append_dev(div1, img0);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, h21);
    			append_dev(div2, t6);
    			append_dev(div2, p1);
    			append_dev(div9, t8);
    			append_dev(div9, div7);
    			append_dev(div7, div4);
    			append_dev(div4, img1);
    			append_dev(div7, t9);
    			append_dev(div7, div5);
    			append_dev(div5, h22);
    			append_dev(div5, t11);
    			append_dev(div5, p2);
    			append_dev(div5, t13);
    			append_dev(div5, p3);
    			append_dev(div5, t15);
    			append_dev(div5, p4);
    			append_dev(div5, t17);
    			append_dev(div5, p5);
    			append_dev(div5, t19);
    			append_dev(div5, p6);
    			append_dev(div7, t21);
    			append_dev(div7, div6);
    			append_dev(div6, img2);
    			append_dev(div9, t22);
    			append_dev(div9, div8);
    			append_dev(div8, img3);
    			append_dev(section, t23);
    			append_dev(section, div10);
    			append_dev(div10, p7);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Homepage', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Homepage> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Homepage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Homepage",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\food.svelte generated by Svelte v3.46.4 */

    const file$4 = "src\\food.svelte";

    function create_fragment$4(ctx) {
    	let section;
    	let div12;
    	let div2;
    	let div0;
    	let h20;
    	let t1;
    	let p0;
    	let t3;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let div5;
    	let div3;
    	let h21;
    	let t6;
    	let p1;
    	let t8;
    	let div4;
    	let img1;
    	let img1_src_value;
    	let t9;
    	let div8;
    	let div6;
    	let h22;
    	let t11;
    	let p2;
    	let t13;
    	let div7;
    	let img2;
    	let img2_src_value;
    	let t14;
    	let div11;
    	let div9;
    	let h23;
    	let t16;
    	let p3;
    	let t18;
    	let div10;
    	let img3;
    	let img3_src_value;
    	let t19;
    	let div13;
    	let p4;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div12 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Cuban Sandwich . . . $5";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Ham, provolone cheese, pickles, mayonnaise, and mustard between buttered and pressed sweet hawaiian bread";
    			t3 = space();
    			div1 = element("div");
    			img0 = element("img");
    			t4 = space();
    			div5 = element("div");
    			div3 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Ham & Fig Sandwich . . . $5";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "Ham, provolone cheese, and fig jam between buttered and pressed sweet hawaiian bread";
    			t8 = space();
    			div4 = element("div");
    			img1 = element("img");
    			t9 = space();
    			div8 = element("div");
    			div6 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Grilled Cheese Sandwich . . . $5";
    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "Provolone cheese between buttered and pressed sliced white bread";
    			t13 = space();
    			div7 = element("div");
    			img2 = element("img");
    			t14 = space();
    			div11 = element("div");
    			div9 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Tomato Soup . . . $5";
    			t16 = space();
    			p3 = element("p");
    			p3.textContent = "Creamy tomato soup topped with a pinch of basil";
    			t18 = space();
    			div10 = element("div");
    			img3 = element("img");
    			t19 = space();
    			div13 = element("div");
    			p4 = element("p");
    			p4.textContent = "Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts";
    			attr_dev(h20, "class", "svelte-13vgmam");
    			add_location(h20, file$4, 8, 16, 181);
    			attr_dev(p0, "class", "svelte-13vgmam");
    			add_location(p0, file$4, 9, 16, 231);
    			attr_dev(div0, "class", "cubanInfo info text svelte-13vgmam");
    			add_location(div0, file$4, 7, 12, 130);
    			if (!src_url_equal(img0.src, img0_src_value = "images/cuban.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Cuban sandwich");
    			attr_dev(img0, "class", "cubanImg svelte-13vgmam");
    			add_location(img0, file$4, 13, 12, 433);
    			attr_dev(div1, "class", "img accent svelte-13vgmam");
    			add_location(div1, file$4, 12, 12, 395);
    			attr_dev(div2, "class", "cuban item svelte-13vgmam");
    			add_location(div2, file$4, 6, 8, 92);
    			attr_dev(h21, "class", "svelte-13vgmam");
    			add_location(h21, file$4, 18, 16, 636);
    			attr_dev(p1, "class", "svelte-13vgmam");
    			add_location(p1, file$4, 19, 16, 690);
    			attr_dev(div3, "class", "hamfigInfo info text svelte-13vgmam");
    			add_location(div3, file$4, 17, 12, 584);
    			if (!src_url_equal(img1.src, img1_src_value = "images/ham.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Ham and fig sandwich");
    			attr_dev(img1, "class", "hamImg svelte-13vgmam");
    			add_location(img1, file$4, 23, 12, 871);
    			attr_dev(div4, "class", "img accent svelte-13vgmam");
    			add_location(div4, file$4, 22, 12, 833);
    			attr_dev(div5, "class", "hamfig item svelte-13vgmam");
    			add_location(div5, file$4, 16, 8, 545);
    			attr_dev(h22, "class", "svelte-13vgmam");
    			add_location(h22, file$4, 28, 16, 1078);
    			attr_dev(p2, "class", "svelte-13vgmam");
    			add_location(p2, file$4, 29, 16, 1137);
    			attr_dev(div6, "class", "grilledInfo info text svelte-13vgmam");
    			add_location(div6, file$4, 27, 12, 1025);
    			if (!src_url_equal(img2.src, img2_src_value = "images/grilled.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Grilled cheese");
    			attr_dev(img2, "class", "grilledImg svelte-13vgmam");
    			add_location(img2, file$4, 33, 12, 1298);
    			attr_dev(div7, "class", "img accent svelte-13vgmam");
    			add_location(div7, file$4, 32, 12, 1260);
    			attr_dev(div8, "class", "grilled item svelte-13vgmam");
    			add_location(div8, file$4, 26, 8, 985);
    			attr_dev(h23, "class", "svelte-13vgmam");
    			add_location(h23, file$4, 38, 16, 1501);
    			attr_dev(p3, "class", "svelte-13vgmam");
    			add_location(p3, file$4, 39, 16, 1548);
    			attr_dev(div9, "class", "soupInfo info text svelte-13vgmam");
    			add_location(div9, file$4, 37, 12, 1451);
    			if (!src_url_equal(img3.src, img3_src_value = "images/soup.jpg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Tomato soup");
    			attr_dev(img3, "class", "soupImg svelte-13vgmam");
    			add_location(img3, file$4, 43, 12, 1692);
    			attr_dev(div10, "class", "img accent svelte-13vgmam");
    			add_location(div10, file$4, 42, 12, 1654);
    			attr_dev(div11, "class", "soup item svelte-13vgmam");
    			add_location(div11, file$4, 36, 8, 1414);
    			attr_dev(div12, "class", "main base svelte-13vgmam");
    			add_location(div12, file$4, 5, 4, 59);
    			attr_dev(p4, "class", "svelte-13vgmam");
    			add_location(p4, file$4, 48, 8, 1847);
    			attr_dev(div13, "class", "footer text base svelte-13vgmam");
    			add_location(div13, file$4, 47, 4, 1807);
    			attr_dev(section, "class", "background");
    			add_location(section, file$4, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div12);
    			append_dev(div12, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, img0);
    			append_dev(div12, t4);
    			append_dev(div12, div5);
    			append_dev(div5, div3);
    			append_dev(div3, h21);
    			append_dev(div3, t6);
    			append_dev(div3, p1);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div4, img1);
    			append_dev(div12, t9);
    			append_dev(div12, div8);
    			append_dev(div8, div6);
    			append_dev(div6, h22);
    			append_dev(div6, t11);
    			append_dev(div6, p2);
    			append_dev(div8, t13);
    			append_dev(div8, div7);
    			append_dev(div7, img2);
    			append_dev(div12, t14);
    			append_dev(div12, div11);
    			append_dev(div11, div9);
    			append_dev(div9, h23);
    			append_dev(div9, t16);
    			append_dev(div9, p3);
    			append_dev(div11, t18);
    			append_dev(div11, div10);
    			append_dev(div10, img3);
    			append_dev(section, t19);
    			append_dev(section, div13);
    			append_dev(div13, p4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Food', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Food> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Food extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Food",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\drink.svelte generated by Svelte v3.46.4 */

    const file$3 = "src\\drink.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let div9;
    	let div2;
    	let div0;
    	let h20;
    	let t1;
    	let p0;
    	let t3;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let div5;
    	let div3;
    	let h21;
    	let t6;
    	let p1;
    	let t8;
    	let div4;
    	let img1;
    	let img1_src_value;
    	let t9;
    	let div8;
    	let div6;
    	let h22;
    	let t11;
    	let p2;
    	let t13;
    	let div7;
    	let img2;
    	let img2_src_value;
    	let t14;
    	let div10;
    	let p3;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div9 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Hot Chocolate. . . $3";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Heated milk with chocolate powder.";
    			t3 = space();
    			div1 = element("div");
    			img0 = element("img");
    			t4 = space();
    			div5 = element("div");
    			div3 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Hot Tea. . . $3";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "Earl Gray, Black Irish Tea, Lavender Tea";
    			t8 = space();
    			div4 = element("div");
    			img1 = element("img");
    			t9 = space();
    			div8 = element("div");
    			div6 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Warm Coffee Milk. . . $3";
    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "A warm take on RI's official beverage, and a favorite amongst New England residents";
    			t13 = space();
    			div7 = element("div");
    			img2 = element("img");
    			t14 = space();
    			div10 = element("div");
    			p3 = element("p");
    			p3.textContent = "Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts";
    			attr_dev(h20, "class", "svelte-13vgmam");
    			add_location(h20, file$3, 8, 16, 179);
    			attr_dev(p0, "class", "svelte-13vgmam");
    			add_location(p0, file$3, 9, 16, 227);
    			attr_dev(div0, "class", "chocInfo info text svelte-13vgmam");
    			add_location(div0, file$3, 7, 12, 129);
    			if (!src_url_equal(img0.src, img0_src_value = "images/choc.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Hot chocolate");
    			attr_dev(img0, "class", "chocImg svelte-13vgmam");
    			add_location(img0, file$3, 12, 16, 344);
    			attr_dev(div1, "class", "img accent svelte-13vgmam");
    			add_location(div1, file$3, 11, 12, 302);
    			attr_dev(div2, "class", "choc item svelte-13vgmam");
    			add_location(div2, file$3, 6, 8, 92);
    			attr_dev(h21, "class", "svelte-13vgmam");
    			add_location(h21, file$3, 17, 16, 538);
    			attr_dev(p1, "class", "svelte-13vgmam");
    			add_location(p1, file$3, 18, 16, 580);
    			attr_dev(div3, "class", "teaInfo info text svelte-13vgmam");
    			add_location(div3, file$3, 16, 12, 489);
    			if (!src_url_equal(img1.src, img1_src_value = "images/tea.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Hot tea");
    			attr_dev(img1, "class", "teaImg svelte-13vgmam");
    			add_location(img1, file$3, 21, 16, 703);
    			attr_dev(div4, "class", "img accent svelte-13vgmam");
    			add_location(div4, file$3, 20, 12, 661);
    			attr_dev(div5, "class", "tea item svelte-13vgmam");
    			add_location(div5, file$3, 15, 8, 453);
    			attr_dev(h22, "class", "svelte-13vgmam");
    			add_location(h22, file$3, 26, 16, 891);
    			attr_dev(p2, "class", "svelte-13vgmam");
    			add_location(p2, file$3, 27, 16, 942);
    			attr_dev(div6, "class", "warmInfo info text svelte-13vgmam");
    			add_location(div6, file$3, 25, 12, 841);
    			if (!src_url_equal(img2.src, img2_src_value = "images/coffee.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Warm coffee milk");
    			attr_dev(img2, "class", "warmImg svelte-13vgmam");
    			add_location(img2, file$3, 31, 16, 1126);
    			attr_dev(div7, "class", "img accent svelte-13vgmam");
    			add_location(div7, file$3, 30, 12, 1084);
    			attr_dev(div8, "class", "warm item svelte-13vgmam");
    			add_location(div8, file$3, 24, 8, 804);
    			attr_dev(div9, "class", "main base svelte-13vgmam");
    			add_location(div9, file$3, 5, 4, 59);
    			attr_dev(p3, "class", "svelte-13vgmam");
    			add_location(p3, file$3, 36, 8, 1299);
    			attr_dev(div10, "class", "footer text base background svelte-13vgmam");
    			add_location(div10, file$3, 35, 4, 1248);
    			attr_dev(section, "class", "background");
    			add_location(section, file$3, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div9);
    			append_dev(div9, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, img0);
    			append_dev(div9, t4);
    			append_dev(div9, div5);
    			append_dev(div5, div3);
    			append_dev(div3, h21);
    			append_dev(div3, t6);
    			append_dev(div3, p1);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div4, img1);
    			append_dev(div9, t9);
    			append_dev(div9, div8);
    			append_dev(div8, div6);
    			append_dev(div6, h22);
    			append_dev(div6, t11);
    			append_dev(div6, p2);
    			append_dev(div8, t13);
    			append_dev(div8, div7);
    			append_dev(div7, img2);
    			append_dev(section, t14);
    			append_dev(section, div10);
    			append_dev(div10, p3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Drink', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Drink> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Drink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Drink",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\contact.svelte generated by Svelte v3.46.4 */

    const file$2 = "src\\contact.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let div3;
    	let div0;
    	let h20;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let t7;
    	let div1;
    	let img;
    	let img_src_value;
    	let t8;
    	let div2;
    	let h21;
    	let t10;
    	let p3;
    	let t12;
    	let p4;
    	let t14;
    	let div4;
    	let p5;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Location:";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "72 Tyng Rd";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Tyngsboro, Massachusetts";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Look for the sign!";
    			t7 = space();
    			div1 = element("div");
    			img = element("img");
    			t8 = space();
    			div2 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Reach Us Using:";
    			t10 = space();
    			p3 = element("p");
    			p3.textContent = "xxx-xxx-xxxx";
    			t12 = space();
    			p4 = element("p");
    			p4.textContent = "xxx-xxx@gmail.com";
    			t14 = space();
    			div4 = element("div");
    			p5 = element("p");
    			p5.textContent = "Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts";
    			attr_dev(h20, "class", "svelte-14gkzry");
    			add_location(h20, file$2, 7, 12, 129);
    			attr_dev(p0, "class", "svelte-14gkzry");
    			add_location(p0, file$2, 8, 12, 161);
    			attr_dev(p1, "class", "svelte-14gkzry");
    			add_location(p1, file$2, 9, 12, 192);
    			attr_dev(p2, "class", "svelte-14gkzry");
    			add_location(p2, file$2, 10, 12, 237);
    			attr_dev(div0, "class", "left text base svelte-14gkzry");
    			add_location(div0, file$2, 6, 8, 87);
    			if (!src_url_equal(img.src, img_src_value = "images/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Cool logo :)");
    			attr_dev(img, "class", "svelte-14gkzry");
    			add_location(img, file$2, 13, 8, 317);
    			attr_dev(div1, "class", "image svelte-14gkzry");
    			add_location(div1, file$2, 12, 8, 288);
    			attr_dev(h21, "class", "svelte-14gkzry");
    			add_location(h21, file$2, 16, 12, 432);
    			attr_dev(p3, "class", "svelte-14gkzry");
    			add_location(p3, file$2, 17, 12, 470);
    			attr_dev(p4, "class", "svelte-14gkzry");
    			add_location(p4, file$2, 18, 12, 503);
    			attr_dev(div2, "class", "right text base svelte-14gkzry");
    			add_location(div2, file$2, 15, 8, 389);
    			attr_dev(div3, "class", "main svelte-14gkzry");
    			add_location(div3, file$2, 5, 4, 59);
    			add_location(p5, file$2, 22, 8, 612);
    			attr_dev(div4, "class", "footer text base background svelte-14gkzry");
    			add_location(div4, file$2, 21, 4, 561);
    			attr_dev(section, "class", "background");
    			add_location(section, file$2, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div0, t3);
    			append_dev(div0, p1);
    			append_dev(div0, t5);
    			append_dev(div0, p2);
    			append_dev(div3, t7);
    			append_dev(div3, div1);
    			append_dev(div1, img);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div2, h21);
    			append_dev(div2, t10);
    			append_dev(div2, p3);
    			append_dev(div2, t12);
    			append_dev(div2, p4);
    			append_dev(section, t14);
    			append_dev(section, div4);
    			append_dev(div4, p5);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\schedule.svelte generated by Svelte v3.46.4 */

    const file$1 = "src\\schedule.svelte";

    function create_fragment$1(ctx) {
    	let section;
    	let div3;
    	let div0;
    	let h20;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let t7;
    	let div1;
    	let img;
    	let img_src_value;
    	let t8;
    	let div2;
    	let h21;
    	let t10;
    	let p3;
    	let t12;
    	let p4;
    	let t14;
    	let div4;
    	let p5;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Location:";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "72 Tyng Rd";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Tyngsboro, Massachusetts";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Look for the sign!";
    			t7 = space();
    			div1 = element("div");
    			img = element("img");
    			t8 = space();
    			div2 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Date and Time:";
    			t10 = space();
    			p3 = element("p");
    			p3.textContent = "Monday, April 25 2022";
    			t12 = space();
    			p4 = element("p");
    			p4.textContent = "3:00PM — 6:00PM";
    			t14 = space();
    			div4 = element("div");
    			p5 = element("p");
    			p5.textContent = "Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts";
    			attr_dev(h20, "class", "svelte-14gkzry");
    			add_location(h20, file$1, 7, 12, 129);
    			attr_dev(p0, "class", "svelte-14gkzry");
    			add_location(p0, file$1, 8, 12, 161);
    			attr_dev(p1, "class", "svelte-14gkzry");
    			add_location(p1, file$1, 9, 12, 192);
    			attr_dev(p2, "class", "svelte-14gkzry");
    			add_location(p2, file$1, 10, 12, 237);
    			attr_dev(div0, "class", "left text base svelte-14gkzry");
    			add_location(div0, file$1, 6, 8, 87);
    			if (!src_url_equal(img.src, img_src_value = "images/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Cool logo :)");
    			attr_dev(img, "class", "svelte-14gkzry");
    			add_location(img, file$1, 13, 8, 317);
    			attr_dev(div1, "class", "image svelte-14gkzry");
    			add_location(div1, file$1, 12, 8, 288);
    			attr_dev(h21, "class", "svelte-14gkzry");
    			add_location(h21, file$1, 16, 12, 432);
    			attr_dev(p3, "class", "svelte-14gkzry");
    			add_location(p3, file$1, 17, 12, 469);
    			attr_dev(p4, "class", "svelte-14gkzry");
    			add_location(p4, file$1, 18, 12, 511);
    			attr_dev(div2, "class", "right text base svelte-14gkzry");
    			add_location(div2, file$1, 15, 8, 389);
    			attr_dev(div3, "class", "main svelte-14gkzry");
    			add_location(div3, file$1, 5, 4, 59);
    			add_location(p5, file$1, 22, 8, 624);
    			attr_dev(div4, "class", "footer text base background svelte-14gkzry");
    			add_location(div4, file$1, 21, 4, 573);
    			attr_dev(section, "class", "background");
    			add_location(section, file$1, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div0, t3);
    			append_dev(div0, p1);
    			append_dev(div0, t5);
    			append_dev(div0, p2);
    			append_dev(div3, t7);
    			append_dev(div3, div1);
    			append_dev(div1, img);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div2, h21);
    			append_dev(div2, t10);
    			append_dev(div2, p3);
    			append_dev(div2, t12);
    			append_dev(div2, p4);
    			append_dev(section, t14);
    			append_dev(section, div4);
    			append_dev(div4, p5);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Schedule', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Schedule> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Schedule extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Schedule",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\main.svelte generated by Svelte v3.46.4 */
    const file = "src\\main.svelte";

    function create_fragment(ctx) {
    	let section;
    	let div0;
    	let header;
    	let t0;
    	let div6;
    	let div1;
    	let homepage;
    	let t1;
    	let div2;
    	let food;
    	let t2;
    	let div3;
    	let drink;
    	let t3;
    	let div4;
    	let contact;
    	let t4;
    	let div5;
    	let schedule;
    	let current;
    	header = new Header({ $$inline: true });
    	header.$on("pageChange", changePage);
    	header.$on("changeColor", changeColor);
    	homepage = new Homepage({ $$inline: true });
    	food = new Food({ $$inline: true });
    	drink = new Drink({ $$inline: true });
    	contact = new Contact({ $$inline: true });
    	schedule = new Schedule({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			create_component(header.$$.fragment);
    			t0 = space();
    			div6 = element("div");
    			div1 = element("div");
    			create_component(homepage.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			create_component(food.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			create_component(drink.$$.fragment);
    			t3 = space();
    			div4 = element("div");
    			create_component(contact.$$.fragment);
    			t4 = space();
    			div5 = element("div");
    			create_component(schedule.$$.fragment);
    			attr_dev(div0, "class", "header svelte-pbzasp");
    			add_location(div0, file, 32, 4, 1049);
    			attr_dev(div1, "id", "home");
    			attr_dev(div1, "class", "active svelte-pbzasp");
    			add_location(div1, file, 36, 4, 1185);
    			attr_dev(div2, "id", "food");
    			attr_dev(div2, "class", "inactive svelte-pbzasp");
    			add_location(div2, file, 39, 4, 1250);
    			attr_dev(div3, "id", "drink");
    			attr_dev(div3, "class", "inactive svelte-pbzasp");
    			add_location(div3, file, 42, 4, 1313);
    			attr_dev(div4, "id", "contact");
    			attr_dev(div4, "class", "inactive svelte-pbzasp");
    			add_location(div4, file, 45, 4, 1378);
    			attr_dev(div5, "id", "schedule");
    			attr_dev(div5, "class", "inactive svelte-pbzasp");
    			add_location(div5, file, 48, 4, 1447);
    			attr_dev(div6, "class", "content");
    			add_location(div6, file, 35, 4, 1158);
    			attr_dev(section, "class", "background svelte-pbzasp");
    			add_location(section, file, 31, 0, 1015);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			mount_component(header, div0, null);
    			append_dev(section, t0);
    			append_dev(section, div6);
    			append_dev(div6, div1);
    			mount_component(homepage, div1, null);
    			append_dev(div6, t1);
    			append_dev(div6, div2);
    			mount_component(food, div2, null);
    			append_dev(div6, t2);
    			append_dev(div6, div3);
    			mount_component(drink, div3, null);
    			append_dev(div6, t3);
    			append_dev(div6, div4);
    			mount_component(contact, div4, null);
    			append_dev(div6, t4);
    			append_dev(div6, div5);
    			mount_component(schedule, div5, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(homepage.$$.fragment, local);
    			transition_in(food.$$.fragment, local);
    			transition_in(drink.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			transition_in(schedule.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(homepage.$$.fragment, local);
    			transition_out(food.$$.fragment, local);
    			transition_out(drink.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			transition_out(schedule.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(header);
    			destroy_component(homepage);
    			destroy_component(food);
    			destroy_component(drink);
    			destroy_component(contact);
    			destroy_component(schedule);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function changePage(event) {
    	let old = document.querySelector('.active');
    	let newId = event.detail.newPage;
    	let newPage = document.getElementById(newId);

    	if (newPage.classList.contains('inactive')) {
    		old.classList.remove('active');
    		old.classList.add('inactive');
    		newPage.classList.remove('inactive');
    		newPage.classList.add('active');
    	}
    }

    function changeColor(event) {
    	let newStyle = event.detail.newStyle;
    	let el = document.getElementById('base');
    	let old = el.classList[0];

    	if (old != newStyle) {
    		el.classList.remove(old);
    		el.classList.add(newStyle);
    	}
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		Homepage,
    		Food,
    		Drink,
    		Contact,
    		Schedule,
    		changePage,
    		changeColor
    	});

    	return [];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new Main({
      target: document.getElementById('app')
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
