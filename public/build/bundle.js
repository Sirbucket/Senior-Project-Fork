
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
    	let div7;
    	let div0;
    	let button0;
    	let t0;
    	let div1;
    	let button1;
    	let t1;
    	let div2;
    	let button2;
    	let t2;
    	let div3;
    	let button3;
    	let t3;
    	let div6;
    	let div4;
    	let t4;
    	let div5;
    	let t5;
    	let div8;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div7 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			t0 = space();
    			div1 = element("div");
    			button1 = element("button");
    			t1 = space();
    			div2 = element("div");
    			button2 = element("button");
    			t2 = space();
    			div3 = element("div");
    			button3 = element("button");
    			t3 = space();
    			div6 = element("div");
    			div4 = element("div");
    			t4 = space();
    			div5 = element("div");
    			t5 = space();
    			div8 = element("div");
    			p = element("p");
    			p.textContent = "Website Appearance";
    			attr_dev(button0, "class", "classyB svelte-17hyxgc");
    			add_location(button0, file$8, 15, 6, 341);
    			attr_dev(div0, "id", "classy");
    			attr_dev(div0, "class", "flexy svelte-17hyxgc");
    			add_location(div0, file$8, 14, 4, 302);
    			attr_dev(button1, "class", "cozyB svelte-17hyxgc");
    			add_location(button1, file$8, 18, 6, 452);
    			attr_dev(div1, "id", "cozy");
    			attr_dev(div1, "class", "flexy svelte-17hyxgc");
    			add_location(div1, file$8, 17, 4, 415);
    			attr_dev(button2, "class", "coolB svelte-17hyxgc");
    			add_location(button2, file$8, 21, 6, 561);
    			attr_dev(div2, "id", "cool");
    			attr_dev(div2, "class", "flexy svelte-17hyxgc");
    			add_location(div2, file$8, 20, 4, 524);
    			attr_dev(button3, "class", "carefreeB svelte-17hyxgc");
    			add_location(button3, file$8, 24, 6, 674);
    			attr_dev(div3, "id", "carefree");
    			attr_dev(div3, "class", "flexy svelte-17hyxgc");
    			add_location(div3, file$8, 23, 4, 633);
    			attr_dev(div4, "class", "left svelte-17hyxgc");
    			add_location(div4, file$8, 27, 6, 776);
    			attr_dev(div5, "class", "right svelte-17hyxgc");
    			add_location(div5, file$8, 28, 6, 808);
    			attr_dev(div6, "class", "tail svelte-17hyxgc");
    			add_location(div6, file$8, 26, 4, 750);
    			attr_dev(div7, "class", "buttons svelte-17hyxgc");
    			add_location(div7, file$8, 13, 2, 275);
    			attr_dev(p, "class", "svelte-17hyxgc");
    			add_location(p, file$8, 32, 4, 884);
    			attr_dev(div8, "class", "title svelte-17hyxgc");
    			add_location(div8, file$8, 31, 2, 859);
    			attr_dev(section, "class", "svelte-17hyxgc");
    			add_location(section, file$8, 12, 0, 262);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div7);
    			append_dev(div7, div0);
    			append_dev(div0, button0);
    			append_dev(div7, t0);
    			append_dev(div7, div1);
    			append_dev(div1, button1);
    			append_dev(div7, t1);
    			append_dev(div7, div2);
    			append_dev(div2, button2);
    			append_dev(div7, t2);
    			append_dev(div7, div3);
    			append_dev(div3, button3);
    			append_dev(div7, t3);
    			append_dev(div7, div6);
    			append_dev(div6, div4);
    			append_dev(div6, t4);
    			append_dev(div6, div5);
    			append_dev(section, t5);
    			append_dev(section, div8);
    			append_dev(div8, p);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*styleChange*/ ctx[0], false, false, false),
    					listen_dev(button1, "click", /*styleChange*/ ctx[0], false, false, false),
    					listen_dev(button2, "click", /*styleChange*/ ctx[0], false, false, false),
    					listen_dev(button3, "click", /*styleChange*/ ctx[0], false, false, false)
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

    	function styleChange(x) {
    		let newStyle = x.closest('.flexy');
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
    	let div7;
    	let p1;
    	let t6;
    	let div5;
    	let p2;
    	let t8;
    	let div6;
    	let p3;
    	let t10;
    	let div8;
    	let p4;
    	let t11;
    	let br;
    	let t12;
    	let t13;
    	let div9;
    	let p5;
    	let t15;
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
    			div7 = element("div");
    			p1 = element("p");
    			p1.textContent = "Menu";
    			t6 = space();
    			div5 = element("div");
    			p2 = element("p");
    			p2.textContent = "Food";
    			t8 = space();
    			div6 = element("div");
    			p3 = element("p");
    			p3.textContent = "Drinks";
    			t10 = space();
    			div8 = element("div");
    			p4 = element("p");
    			t11 = text("Contact");
    			br = element("br");
    			t12 = text("Us");
    			t13 = space();
    			div9 = element("div");
    			p5 = element("p");
    			p5.textContent = "Schedule";
    			t15 = space();
    			section0 = element("section");
    			div11 = element("div");
    			attr_dev(div0, "class", "bar1 svelte-zmaszn");
    			add_location(div0, file$7, 26, 6, 725);
    			attr_dev(div1, "class", "bar2 svelte-zmaszn");
    			add_location(div1, file$7, 27, 6, 757);
    			attr_dev(div2, "class", "bar3 svelte-zmaszn");
    			add_location(div2, file$7, 28, 6, 789);
    			attr_dev(div3, "class", "dropdown svelte-zmaszn");
    			add_location(div3, file$7, 25, 2, 674);
    			attr_dev(p0, "class", "svelte-zmaszn");
    			add_location(p0, file$7, 32, 6, 905);
    			attr_dev(div4, "class", "home hidden svelte-zmaszn");
    			add_location(div4, file$7, 31, 2, 850);
    			attr_dev(p1, "class", "svelte-zmaszn");
    			add_location(p1, file$7, 35, 6, 970);
    			attr_dev(p2, "class", "svelte-zmaszn");
    			add_location(p2, file$7, 37, 10, 1061);
    			attr_dev(div5, "class", "food svelte-zmaszn");
    			add_location(div5, file$7, 36, 6, 1009);
    			attr_dev(p3, "class", "svelte-zmaszn");
    			add_location(p3, file$7, 40, 10, 1147);
    			attr_dev(div6, "class", "drink svelte-zmaszn");
    			add_location(div6, file$7, 39, 6, 1094);
    			attr_dev(div7, "class", "menu hidden closed svelte-zmaszn");
    			add_location(div7, file$7, 34, 2, 930);
    			add_location(br, file$7, 44, 16, 1256);
    			attr_dev(p4, "class", "svelte-zmaszn");
    			add_location(p4, file$7, 44, 6, 1246);
    			attr_dev(div8, "class", "contact hidden svelte-zmaszn");
    			add_location(div8, file$7, 43, 2, 1188);
    			attr_dev(p5, "class", "svelte-zmaszn");
    			add_location(p5, file$7, 47, 6, 1339);
    			attr_dev(div9, "class", "schedule hidden svelte-zmaszn");
    			add_location(div9, file$7, 46, 2, 1280);
    			attr_dev(div10, "class", "stuff svelte-zmaszn");
    			add_location(div10, file$7, 30, 2, 827);
    			attr_dev(div11, "class", "bar1 bar2 bar3 stuff svelte-zmaszn");
    			add_location(div11, file$7, 51, 6, 1432);
    			attr_dev(section0, "class", "ignore visible opened change svelte-zmaszn");
    			add_location(section0, file$7, 50, 2, 1378);
    			attr_dev(section1, "lang", "en");
    			attr_dev(section1, "class", "svelte-zmaszn");
    			add_location(section1, file$7, 24, 0, 653);
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
    			append_dev(div10, t4);
    			append_dev(div10, div7);
    			append_dev(div7, p1);
    			append_dev(div7, t6);
    			append_dev(div7, div5);
    			append_dev(div5, p2);
    			append_dev(div7, t8);
    			append_dev(div7, div6);
    			append_dev(div6, p3);
    			append_dev(div10, t10);
    			append_dev(div10, div8);
    			append_dev(div8, p4);
    			append_dev(p4, t11);
    			append_dev(p4, br);
    			append_dev(p4, t12);
    			append_dev(div10, t13);
    			append_dev(div10, div9);
    			append_dev(div9, p5);
    			append_dev(section1, t15);
    			append_dev(section1, section0);
    			append_dev(section0, div11);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div3, "click", navChange, false, false, false),
    					listen_dev(div4, "click", /*pageChange*/ ctx[0], false, false, false),
    					listen_dev(p1, "click", menuOpen, false, false, false),
    					listen_dev(div5, "click", /*pageChange*/ ctx[0], false, false, false),
    					listen_dev(div6, "click", /*pageChange*/ ctx[0], false, false, false),
    					listen_dev(div8, "click", /*pageChange*/ ctx[0], false, false, false),
    					listen_dev(div9, "click", /*pageChange*/ ctx[0], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section1);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dropdown', slots, []);
    	const dispatch = createEventDispatcher();

    	function pageChange(event) {
    		let x = event.target.closest('div').classList[0];
    		dispatch('pageChange', { newPage: x });
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dropdown> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		navChange,
    		menuOpen,
    		pageChange
    	});

    	return [pageChange];
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
    			attr_dev(h1, "class", "svelte-1lxw7pa");
    			add_location(h1, file$6, 18, 8, 456);
    			attr_dev(div, "class", "text svelte-1lxw7pa");
    			add_location(div, file$6, 17, 4, 428);
    			attr_dev(main, "class", "svelte-1lxw7pa");
    			add_location(main, file$6, 15, 0, 372);
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

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		Colors,
    		Dropdown,
    		pageChange
    	});

    	return [pageChange];
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
    	let div6;
    	let div2;
    	let div0;
    	let h20;
    	let t1;
    	let p0;
    	let t3;
    	let img0;
    	let t4;
    	let div1;
    	let h21;
    	let t6;
    	let p1;
    	let t8;
    	let div4;
    	let img1;
    	let img1_src_value;
    	let t9;
    	let div3;
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
    	let img2;
    	let t22;
    	let div5;
    	let img3;
    	let t23;
    	let div7;
    	let p7;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Introduction:";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Welcome to Kat's Contemporary Cafe! A student-run pop-up shop dedicated to serving cozy food and warm drinks, perfect for rainy days, a stress-free work break, or even just chilling!";
    			t3 = space();
    			img0 = element("img");
    			t4 = space();
    			div1 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Help Our School:";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "This contemporary cafe is completely non-profit! Any and all proceeds will go back into helping IACS flourish! Funding field trips, helping fund next years senior projects, school building maintenance, and so much more!";
    			t8 = space();
    			div4 = element("div");
    			img1 = element("img");
    			t9 = space();
    			div3 = element("div");
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
    			img2 = element("img");
    			t22 = space();
    			div5 = element("div");
    			img3 = element("img");
    			t23 = space();
    			div7 = element("div");
    			p7 = element("p");
    			p7.textContent = "Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts";
    			attr_dev(h20, "class", "svelte-i79u58");
    			add_location(h20, file$5, 8, 12, 130);
    			add_location(p0, file$5, 9, 12, 166);
    			attr_dev(div0, "class", "about text svelte-i79u58");
    			add_location(div0, file$5, 7, 8, 92);
    			attr_dev(img0, "class", "image2 svelte-i79u58");
    			attr_dev(img0, "alt", "cool food :)");
    			add_location(img0, file$5, 11, 8, 381);
    			attr_dev(h21, "class", "svelte-i79u58");
    			add_location(h21, file$5, 13, 12, 467);
    			add_location(p1, file$5, 14, 12, 506);
    			attr_dev(div1, "class", "help text svelte-i79u58");
    			add_location(div1, file$5, 12, 8, 430);
    			attr_dev(div2, "class", "left svelte-i79u58");
    			add_location(div2, file$5, 6, 4, 64);
    			if (!src_url_equal(img1.src, img1_src_value = "images/logo.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "image1 svelte-i79u58");
    			attr_dev(img1, "alt", "cool logo :)");
    			add_location(img1, file$5, 19, 8, 810);
    			attr_dev(h22, "class", "svelte-i79u58");
    			add_location(h22, file$5, 21, 12, 922);
    			attr_dev(p2, "class", "svelte-i79u58");
    			add_location(p2, file$5, 22, 12, 954);
    			attr_dev(p3, "class", "svelte-i79u58");
    			add_location(p3, file$5, 23, 12, 985);
    			attr_dev(p4, "class", "svelte-i79u58");
    			add_location(p4, file$5, 24, 12, 1030);
    			attr_dev(p5, "class", "svelte-i79u58");
    			add_location(p5, file$5, 25, 12, 1063);
    			attr_dev(p6, "class", "svelte-i79u58");
    			add_location(p6, file$5, 26, 12, 1101);
    			attr_dev(div3, "class", "location text svelte-i79u58");
    			add_location(div3, file$5, 20, 8, 881);
    			attr_dev(img2, "class", "image3 svelte-i79u58");
    			attr_dev(img2, "alt", "cool food :)");
    			add_location(img2, file$5, 28, 8, 1152);
    			attr_dev(div4, "class", "right svelte-i79u58");
    			add_location(div4, file$5, 18, 4, 781);
    			attr_dev(img3, "class", "footsteps svelte-i79u58");
    			attr_dev(img3, "alt", "footsteps");
    			add_location(img3, file$5, 31, 8, 1240);
    			attr_dev(div5, "class", "righter svelte-i79u58");
    			add_location(div5, file$5, 30, 4, 1209);
    			attr_dev(div6, "class", "main svelte-i79u58");
    			add_location(div6, file$5, 5, 4, 40);
    			add_location(p7, file$5, 35, 8, 1344);
    			attr_dev(div7, "class", "footer text svelte-i79u58");
    			add_location(div7, file$5, 34, 4, 1309);
    			attr_dev(section, "class", "svelte-i79u58");
    			add_location(section, file$5, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div6);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div2, t3);
    			append_dev(div2, img0);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, h21);
    			append_dev(div1, t6);
    			append_dev(div1, p1);
    			append_dev(div6, t8);
    			append_dev(div6, div4);
    			append_dev(div4, img1);
    			append_dev(div4, t9);
    			append_dev(div4, div3);
    			append_dev(div3, h22);
    			append_dev(div3, t11);
    			append_dev(div3, p2);
    			append_dev(div3, t13);
    			append_dev(div3, p3);
    			append_dev(div3, t15);
    			append_dev(div3, p4);
    			append_dev(div3, t17);
    			append_dev(div3, p5);
    			append_dev(div3, t19);
    			append_dev(div3, p6);
    			append_dev(div4, t21);
    			append_dev(div4, img2);
    			append_dev(div6, t22);
    			append_dev(div6, div5);
    			append_dev(div5, img3);
    			append_dev(section, t23);
    			append_dev(section, div7);
    			append_dev(div7, p7);
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
    	let div8;
    	let div1;
    	let div0;
    	let h20;
    	let t1;
    	let p0;
    	let t3;
    	let img0;
    	let t4;
    	let div3;
    	let div2;
    	let h21;
    	let t6;
    	let p1;
    	let t8;
    	let img1;
    	let t9;
    	let div5;
    	let div4;
    	let h22;
    	let t11;
    	let p2;
    	let t13;
    	let img2;
    	let t14;
    	let div7;
    	let div6;
    	let h23;
    	let t16;
    	let p3;
    	let t18;
    	let img3;
    	let t19;
    	let div9;
    	let p4;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div8 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Cuban Sandwich";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Ham, provolone cheese, pickles, mayonnaise, and mustard between buttered and pressed sweet hawaiian bread";
    			t3 = space();
    			img0 = element("img");
    			t4 = space();
    			div3 = element("div");
    			div2 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Ham & Fig Sandwich";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "Ham, provolone cheese, and fig jam between buttered and pressed sweet hawaiian bread";
    			t8 = space();
    			img1 = element("img");
    			t9 = space();
    			div5 = element("div");
    			div4 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Grilled Cheese Sandwich";
    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "Provolone cheese between buttered and pressed sliced white bread";
    			t13 = space();
    			img2 = element("img");
    			t14 = space();
    			div7 = element("div");
    			div6 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Tomato Soup";
    			t16 = space();
    			p3 = element("p");
    			p3.textContent = "Creamy tomato soup topped with a pinch of basil";
    			t18 = space();
    			img3 = element("img");
    			t19 = space();
    			div9 = element("div");
    			p4 = element("p");
    			p4.textContent = "Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts";
    			add_location(h20, file$4, 8, 16, 147);
    			add_location(p0, file$4, 9, 16, 188);
    			attr_dev(div0, "class", "cubanInfo text svelte-12a1l0o");
    			add_location(div0, file$4, 7, 12, 101);
    			attr_dev(img0, "alt", "Cuban sandwich");
    			add_location(img0, file$4, 12, 12, 352);
    			attr_dev(div1, "class", "cuban");
    			add_location(div1, file$4, 6, 8, 68);
    			add_location(h21, file$4, 16, 16, 485);
    			add_location(p1, file$4, 17, 16, 530);
    			attr_dev(div2, "class", "hamfigInfo text svelte-12a1l0o");
    			add_location(div2, file$4, 15, 12, 438);
    			attr_dev(img1, "alt", "Ham and fig sandwich");
    			add_location(img1, file$4, 20, 12, 673);
    			attr_dev(div3, "class", "hamfig");
    			add_location(div3, file$4, 14, 8, 404);
    			add_location(h22, file$4, 24, 16, 814);
    			add_location(p2, file$4, 25, 16, 864);
    			attr_dev(div4, "class", "grilledInfo text svelte-12a1l0o");
    			add_location(div4, file$4, 23, 12, 766);
    			attr_dev(img2, "alt", "Grilled cheese");
    			add_location(img2, file$4, 28, 12, 987);
    			attr_dev(div5, "class", "grilled");
    			add_location(div5, file$4, 22, 8, 731);
    			add_location(h23, file$4, 32, 16, 1116);
    			add_location(p3, file$4, 33, 16, 1154);
    			attr_dev(div6, "class", "soupInfo text svelte-12a1l0o");
    			add_location(div6, file$4, 31, 12, 1071);
    			attr_dev(img3, "alt", "Tomato soup");
    			add_location(img3, file$4, 36, 12, 1260);
    			attr_dev(div7, "class", "soup");
    			add_location(div7, file$4, 30, 8, 1039);
    			attr_dev(div8, "class", "main");
    			add_location(div8, file$4, 5, 4, 40);
    			add_location(p4, file$4, 40, 8, 1352);
    			attr_dev(div9, "class", "footer text svelte-12a1l0o");
    			add_location(div9, file$4, 39, 4, 1317);
    			add_location(section, file$4, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div8);
    			append_dev(div8, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div1, t3);
    			append_dev(div1, img0);
    			append_dev(div8, t4);
    			append_dev(div8, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h21);
    			append_dev(div2, t6);
    			append_dev(div2, p1);
    			append_dev(div3, t8);
    			append_dev(div3, img1);
    			append_dev(div8, t9);
    			append_dev(div8, div5);
    			append_dev(div5, div4);
    			append_dev(div4, h22);
    			append_dev(div4, t11);
    			append_dev(div4, p2);
    			append_dev(div5, t13);
    			append_dev(div5, img2);
    			append_dev(div8, t14);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, h23);
    			append_dev(div6, t16);
    			append_dev(div6, p3);
    			append_dev(div7, t18);
    			append_dev(div7, img3);
    			append_dev(section, t19);
    			append_dev(section, div9);
    			append_dev(div9, p4);
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
    	let div0;
    	let img;
    	let t0;
    	let div1;
    	let p;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts";
    			attr_dev(img, "alt", "Under Construction");
    			attr_dev(img, "class", "svelte-1pziujv");
    			add_location(img, file$3, 6, 8, 67);
    			attr_dev(div0, "class", "wip svelte-1pziujv");
    			add_location(div0, file$3, 5, 4, 40);
    			add_location(p, file$3, 9, 8, 150);
    			attr_dev(div1, "class", "footer text svelte-1pziujv");
    			add_location(div1, file$3, 8, 4, 115);
    			add_location(section, file$3, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, img);
    			append_dev(section, t0);
    			append_dev(section, div1);
    			append_dev(div1, p);
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
    	let div0;
    	let img;
    	let t0;
    	let div1;
    	let p;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts";
    			attr_dev(img, "alt", "Under Construction");
    			attr_dev(img, "class", "svelte-1pziujv");
    			add_location(img, file$2, 6, 8, 67);
    			attr_dev(div0, "class", "wip svelte-1pziujv");
    			add_location(div0, file$2, 5, 4, 40);
    			add_location(p, file$2, 9, 8, 150);
    			attr_dev(div1, "class", "footer text svelte-1pziujv");
    			add_location(div1, file$2, 8, 4, 115);
    			add_location(section, file$2, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, img);
    			append_dev(section, t0);
    			append_dev(section, div1);
    			append_dev(div1, p);
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
    	let div0;
    	let img;
    	let t0;
    	let div1;
    	let p;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts";
    			attr_dev(img, "alt", "Under Construction");
    			attr_dev(img, "class", "svelte-1pziujv");
    			add_location(img, file$1, 6, 8, 67);
    			attr_dev(div0, "class", "wip svelte-1pziujv");
    			add_location(div0, file$1, 5, 4, 40);
    			add_location(p, file$1, 9, 8, 150);
    			attr_dev(div1, "class", "footer text svelte-1pziujv");
    			add_location(div1, file$1, 8, 4, 115);
    			add_location(section, file$1, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, img);
    			append_dev(section, t0);
    			append_dev(section, div1);
    			append_dev(div1, p);
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
    			attr_dev(div0, "class", "header svelte-15zqaqn");
    			add_location(div0, file, 22, 4, 734);
    			attr_dev(div1, "id", "home");
    			attr_dev(div1, "class", "active svelte-15zqaqn");
    			add_location(div1, file, 26, 4, 841);
    			attr_dev(div2, "id", "food");
    			attr_dev(div2, "class", "inactive svelte-15zqaqn");
    			add_location(div2, file, 29, 4, 906);
    			attr_dev(div3, "id", "drink");
    			attr_dev(div3, "class", "inactive svelte-15zqaqn");
    			add_location(div3, file, 32, 4, 969);
    			attr_dev(div4, "id", "contact");
    			attr_dev(div4, "class", "inactive svelte-15zqaqn");
    			add_location(div4, file, 35, 4, 1034);
    			attr_dev(div5, "id", "schedule");
    			attr_dev(div5, "class", "inactive svelte-15zqaqn");
    			add_location(div5, file, 38, 4, 1103);
    			attr_dev(div6, "class", "content");
    			add_location(div6, file, 25, 4, 814);
    			attr_dev(section, "class", "svelte-15zqaqn");
    			add_location(section, file, 21, 0, 719);
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
    		changePage
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
