
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
    const file$4 = "src\\colors.svelte";

    function create_fragment$4(ctx) {
    	let section;
    	let div0;
    	let p0;
    	let t1;
    	let div1;
    	let button0;
    	let t2;
    	let p1;
    	let t4;
    	let div2;
    	let button1;
    	let t5;
    	let p2;
    	let t7;
    	let div3;
    	let button2;
    	let t8;
    	let p3;
    	let t10;
    	let div4;
    	let button3;
    	let t11;
    	let p4;
    	let t13;
    	let div5;
    	let button4;
    	let t14;
    	let p5;
    	let t16;
    	let div8;
    	let div6;
    	let t17;
    	let div7;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Website Appearance";
    			t1 = space();
    			div1 = element("div");
    			button0 = element("button");
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "Classy";
    			t4 = space();
    			div2 = element("div");
    			button1 = element("button");
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Cozy";
    			t7 = space();
    			div3 = element("div");
    			button2 = element("button");
    			t8 = space();
    			p3 = element("p");
    			p3.textContent = "Cool";
    			t10 = space();
    			div4 = element("div");
    			button3 = element("button");
    			t11 = space();
    			p4 = element("p");
    			p4.textContent = "Carefree";
    			t13 = space();
    			div5 = element("div");
    			button4 = element("button");
    			t14 = space();
    			p5 = element("p");
    			p5.textContent = "Celestial";
    			t16 = space();
    			div8 = element("div");
    			div6 = element("div");
    			t17 = space();
    			div7 = element("div");
    			attr_dev(p0, "class", "svelte-zeom9u");
    			add_location(p0, file$4, 14, 6, 304);
    			attr_dev(div0, "class", "title svelte-zeom9u");
    			add_location(div0, file$4, 13, 4, 277);
    			attr_dev(button0, "class", "classyB svelte-zeom9u");
    			add_location(button0, file$4, 17, 6, 386);
    			attr_dev(p1, "class", "svelte-zeom9u");
    			add_location(p1, file$4, 18, 6, 450);
    			attr_dev(div1, "id", "classy");
    			attr_dev(div1, "class", "flexy svelte-zeom9u");
    			add_location(div1, file$4, 16, 4, 347);
    			attr_dev(button1, "class", "cozyB svelte-zeom9u");
    			add_location(button1, file$4, 21, 6, 518);
    			attr_dev(p2, "class", "svelte-zeom9u");
    			add_location(p2, file$4, 22, 6, 580);
    			attr_dev(div2, "id", "cozy");
    			attr_dev(div2, "class", "flexy svelte-zeom9u");
    			add_location(div2, file$4, 20, 4, 481);
    			attr_dev(button2, "class", "coolB svelte-zeom9u");
    			add_location(button2, file$4, 25, 6, 646);
    			attr_dev(p3, "class", "svelte-zeom9u");
    			add_location(p3, file$4, 26, 6, 708);
    			attr_dev(div3, "id", "cool");
    			attr_dev(div3, "class", "flexy svelte-zeom9u");
    			add_location(div3, file$4, 24, 4, 609);
    			attr_dev(button3, "class", "carefreeB svelte-zeom9u");
    			add_location(button3, file$4, 29, 6, 778);
    			attr_dev(p4, "class", "svelte-zeom9u");
    			add_location(p4, file$4, 30, 6, 844);
    			attr_dev(div4, "id", "carefree");
    			attr_dev(div4, "class", "flexy svelte-zeom9u");
    			add_location(div4, file$4, 28, 4, 737);
    			attr_dev(button4, "class", "celestialB svelte-zeom9u");
    			add_location(button4, file$4, 33, 6, 919);
    			attr_dev(p5, "class", "svelte-zeom9u");
    			add_location(p5, file$4, 34, 6, 986);
    			attr_dev(div5, "id", "celestial");
    			attr_dev(div5, "class", "flexy svelte-zeom9u");
    			add_location(div5, file$4, 32, 4, 877);
    			attr_dev(div6, "class", "left svelte-zeom9u");
    			add_location(div6, file$4, 37, 6, 1046);
    			attr_dev(div7, "class", "right svelte-zeom9u");
    			add_location(div7, file$4, 38, 6, 1078);
    			attr_dev(div8, "class", "tail svelte-zeom9u");
    			add_location(div8, file$4, 36, 4, 1020);
    			attr_dev(section, "class", "svelte-zeom9u");
    			add_location(section, file$4, 12, 0, 262);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, p0);
    			append_dev(section, t1);
    			append_dev(section, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t2);
    			append_dev(div1, p1);
    			append_dev(section, t4);
    			append_dev(section, div2);
    			append_dev(div2, button1);
    			append_dev(div2, t5);
    			append_dev(div2, p2);
    			append_dev(section, t7);
    			append_dev(section, div3);
    			append_dev(div3, button2);
    			append_dev(div3, t8);
    			append_dev(div3, p3);
    			append_dev(section, t10);
    			append_dev(section, div4);
    			append_dev(div4, button3);
    			append_dev(div4, t11);
    			append_dev(div4, p4);
    			append_dev(section, t13);
    			append_dev(section, div5);
    			append_dev(div5, button4);
    			append_dev(div5, t14);
    			append_dev(div5, p5);
    			append_dev(section, t16);
    			append_dev(section, div8);
    			append_dev(div8, div6);
    			append_dev(div8, t17);
    			append_dev(div8, div7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*styleChange*/ ctx[0], false, false, false),
    					listen_dev(button1, "click", /*styleChange*/ ctx[0], false, false, false),
    					listen_dev(button2, "click", /*styleChange*/ ctx[0], false, false, false),
    					listen_dev(button3, "click", /*styleChange*/ ctx[0], false, false, false),
    					listen_dev(button4, "click", /*styleChange*/ ctx[0], false, false, false)
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Colors",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\dropdown.svelte generated by Svelte v3.46.4 */

    const file$3 = "src\\dropdown.svelte";

    function create_fragment$3(ctx) {
    	let section1;
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let div12;
    	let div4;
    	let input;
    	let t3;
    	let div5;
    	let p0;
    	let t5;
    	let div8;
    	let p1;
    	let t7;
    	let div6;
    	let p2;
    	let t9;
    	let div7;
    	let p3;
    	let t11;
    	let div9;
    	let p4;
    	let t13;
    	let div10;
    	let p5;
    	let t15;
    	let div11;
    	let p6;
    	let t17;
    	let section0;
    	let div13;
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
    			div12 = element("div");
    			div4 = element("div");
    			input = element("input");
    			t3 = space();
    			div5 = element("div");
    			p0 = element("p");
    			p0.textContent = "Home";
    			t5 = space();
    			div8 = element("div");
    			p1 = element("p");
    			p1.textContent = "Menu";
    			t7 = space();
    			div6 = element("div");
    			p2 = element("p");
    			p2.textContent = "Food";
    			t9 = space();
    			div7 = element("div");
    			p3 = element("p");
    			p3.textContent = "Drinks";
    			t11 = space();
    			div9 = element("div");
    			p4 = element("p");
    			p4.textContent = "Events";
    			t13 = space();
    			div10 = element("div");
    			p5 = element("p");
    			p5.textContent = "Hiring";
    			t15 = space();
    			div11 = element("div");
    			p6 = element("p");
    			p6.textContent = "FAQ";
    			t17 = space();
    			section0 = element("section");
    			div13 = element("div");
    			attr_dev(div0, "class", "bar1 svelte-149j79e");
    			add_location(div0, file$3, 16, 6, 458);
    			attr_dev(div1, "class", "bar2 svelte-149j79e");
    			add_location(div1, file$3, 17, 6, 490);
    			attr_dev(div2, "class", "bar3 svelte-149j79e");
    			add_location(div2, file$3, 18, 6, 522);
    			attr_dev(div3, "class", "dropdown svelte-149j79e");
    			add_location(div3, file$3, 15, 2, 407);
    			attr_dev(input, "type", "search");
    			attr_dev(input, "maxlength", "7");
    			attr_dev(input, "autocomplete", "off");
    			attr_dev(input, "placeholder", "Search...");
    			input.disabled = true;
    			attr_dev(input, "class", "svelte-149j79e");
    			add_location(input, file$3, 22, 6, 618);
    			attr_dev(div4, "class", "search hidden svelte-149j79e");
    			add_location(div4, file$3, 21, 2, 583);
    			attr_dev(p0, "class", "svelte-149j79e");
    			add_location(p0, file$3, 25, 6, 752);
    			attr_dev(div5, "class", "home hidden svelte-149j79e");
    			add_location(div5, file$3, 24, 2, 719);
    			attr_dev(p1, "class", "svelte-149j79e");
    			add_location(p1, file$3, 28, 6, 837);
    			attr_dev(p2, "class", "svelte-149j79e");
    			add_location(p2, file$3, 30, 10, 886);
    			attr_dev(div6, "class", "food svelte-149j79e");
    			add_location(div6, file$3, 29, 6, 856);
    			attr_dev(p3, "class", "svelte-149j79e");
    			add_location(p3, file$3, 33, 10, 950);
    			attr_dev(div7, "class", "drink svelte-149j79e");
    			add_location(div7, file$3, 32, 6, 919);
    			attr_dev(div8, "class", "menu hidden closed svelte-149j79e");
    			add_location(div8, file$3, 27, 2, 777);
    			attr_dev(p4, "class", "svelte-149j79e");
    			add_location(p4, file$3, 37, 6, 1026);
    			attr_dev(div9, "class", "events hidden svelte-149j79e");
    			add_location(div9, file$3, 36, 2, 991);
    			attr_dev(p5, "class", "svelte-149j79e");
    			add_location(p5, file$3, 40, 6, 1088);
    			attr_dev(div10, "class", "hiring hidden svelte-149j79e");
    			add_location(div10, file$3, 39, 2, 1053);
    			attr_dev(p6, "class", "svelte-149j79e");
    			add_location(p6, file$3, 43, 6, 1147);
    			attr_dev(div11, "class", "faq hidden svelte-149j79e");
    			add_location(div11, file$3, 42, 2, 1115);
    			attr_dev(div12, "class", "stuff svelte-149j79e");
    			add_location(div12, file$3, 20, 2, 560);
    			attr_dev(div13, "class", "bar1 bar2 bar3 stuff svelte-149j79e");
    			add_location(div13, file$3, 47, 6, 1235);
    			attr_dev(section0, "class", "ignore visible opened change svelte-149j79e");
    			add_location(section0, file$3, 46, 2, 1181);
    			attr_dev(section1, "lang", "en");
    			attr_dev(section1, "class", "svelte-149j79e");
    			add_location(section1, file$3, 14, 0, 386);
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
    			append_dev(section1, div12);
    			append_dev(div12, div4);
    			append_dev(div4, input);
    			append_dev(div12, t3);
    			append_dev(div12, div5);
    			append_dev(div5, p0);
    			append_dev(div12, t5);
    			append_dev(div12, div8);
    			append_dev(div8, p1);
    			append_dev(div8, t7);
    			append_dev(div8, div6);
    			append_dev(div6, p2);
    			append_dev(div8, t9);
    			append_dev(div8, div7);
    			append_dev(div7, p3);
    			append_dev(div12, t11);
    			append_dev(div12, div9);
    			append_dev(div9, p4);
    			append_dev(div12, t13);
    			append_dev(div12, div10);
    			append_dev(div10, p5);
    			append_dev(div12, t15);
    			append_dev(div12, div11);
    			append_dev(div11, p6);
    			append_dev(section1, t17);
    			append_dev(section1, section0);
    			append_dev(section0, div13);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div3, "click", navChange, false, false, false),
    					listen_dev(div8, "click", menuOpen, false, false, false)
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
    		id: create_fragment$3.name,
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
    	let x = event.target.closest('.hidden');
    	x.classList.toggle('closed');
    	x.classList.toggle('visible');
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dropdown', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dropdown> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ navChange, menuOpen });
    	return [];
    }

    class Dropdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dropdown",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\header.svelte generated by Svelte v3.46.4 */
    const file$2 = "src\\header.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let dropdown;
    	let t0;
    	let div;
    	let h1;
    	let t2;
    	let h3;
    	let t4;
    	let colors;
    	let current;
    	dropdown = new Dropdown({ $$inline: true });
    	colors = new Colors({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(dropdown.$$.fragment);
    			t0 = space();
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Chancellor's Counselling Cafe";
    			t2 = space();
    			h3 = element("h3");
    			h3.textContent = "\"Come on in! Take a chance.\" - Katherine Stout";
    			t4 = space();
    			create_component(colors.$$.fragment);
    			attr_dev(h1, "class", "svelte-1bre63x");
    			add_location(h1, file$2, 8, 8, 168);
    			add_location(h3, file$2, 9, 8, 216);
    			attr_dev(div, "class", "text svelte-1bre63x");
    			add_location(div, file$2, 7, 4, 140);
    			attr_dev(main, "class", "svelte-1bre63x");
    			add_location(main, file$2, 5, 0, 111);
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
    			append_dev(div, t2);
    			append_dev(div, h3);
    			append_dev(main, t4);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Colors, Dropdown });
    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\homepage.svelte generated by Svelte v3.46.4 */

    const file$1 = "src\\homepage.svelte";

    function create_fragment$1(ctx) {
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
    	let img1;
    	let t9;
    	let div5;
    	let img2;
    	let img2_src_value;
    	let t10;
    	let div3;
    	let h22;
    	let t12;
    	let p2;
    	let t14;
    	let img3;
    	let t15;
    	let div4;
    	let h23;
    	let t17;
    	let p3;
    	let t19;
    	let div7;
    	let h4;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "About Us";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "We're pretty epic. Pretty awesome. We make stuff and you buy it. This is some more text to fill the space so I can see what it looks like. It looks pretty good so far, but here's even more text now.";
    			t3 = space();
    			img0 = element("img");
    			t4 = space();
    			div1 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Allergy & Diet";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "We're pretty epic. Pretty awesome. We make stuff and you buy it. This is some more text to fill the space so I can see what it looks like. It looks pretty good so far, but here's even more text now.";
    			t8 = space();
    			img1 = element("img");
    			t9 = space();
    			div5 = element("div");
    			img2 = element("img");
    			t10 = space();
    			div3 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Location";
    			t12 = space();
    			p2 = element("p");
    			p2.textContent = "We're pretty epic. Pretty awesome. We make stuff and you buy it. This is some more text to fill the space so I can see what it looks like. It looks pretty good so far, but here's even more text now.";
    			t14 = space();
    			img3 = element("img");
    			t15 = space();
    			div4 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Charity/Profit";
    			t17 = space();
    			p3 = element("p");
    			p3.textContent = "We're pretty epic. Pretty awesome. We make stuff and you buy it. This is some more text to fill the space so I can see what it looks like. It looks pretty good so far, but here's even more text now.";
    			t19 = space();
    			div7 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Please don't sue us :)";
    			attr_dev(h20, "class", "svelte-117xld");
    			add_location(h20, file$1, 8, 12, 130);
    			add_location(p0, file$1, 9, 12, 161);
    			attr_dev(div0, "class", "about text svelte-117xld");
    			add_location(div0, file$1, 7, 8, 92);
    			attr_dev(img0, "class", "image2 svelte-117xld");
    			attr_dev(img0, "alt", "cool food :)");
    			add_location(img0, file$1, 11, 8, 392);
    			attr_dev(h21, "class", "svelte-117xld");
    			add_location(h21, file$1, 13, 12, 481);
    			add_location(p1, file$1, 14, 12, 518);
    			attr_dev(div1, "class", "allergy text svelte-117xld");
    			add_location(div1, file$1, 12, 8, 441);
    			attr_dev(img1, "class", "image4 svelte-117xld");
    			attr_dev(img1, "alt", "cool food :)");
    			add_location(img1, file$1, 16, 8, 749);
    			attr_dev(div2, "class", "left svelte-117xld");
    			add_location(div2, file$1, 6, 4, 64);
    			if (!src_url_equal(img2.src, img2_src_value = "images/logo.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "image1 svelte-117xld");
    			attr_dev(img2, "alt", "cool logo :)");
    			add_location(img2, file$1, 19, 8, 835);
    			attr_dev(h22, "class", "svelte-117xld");
    			add_location(h22, file$1, 21, 12, 947);
    			add_location(p2, file$1, 22, 12, 978);
    			attr_dev(div3, "class", "location text svelte-117xld");
    			add_location(div3, file$1, 20, 8, 906);
    			attr_dev(img3, "class", "image3 svelte-117xld");
    			attr_dev(img3, "alt", "cool food :)");
    			add_location(img3, file$1, 24, 8, 1209);
    			attr_dev(h23, "class", "svelte-117xld");
    			add_location(h23, file$1, 26, 12, 1298);
    			add_location(p3, file$1, 27, 12, 1335);
    			attr_dev(div4, "class", "charity text svelte-117xld");
    			add_location(div4, file$1, 25, 8, 1258);
    			attr_dev(div5, "class", "right svelte-117xld");
    			add_location(div5, file$1, 18, 4, 806);
    			attr_dev(div6, "class", "main svelte-117xld");
    			add_location(div6, file$1, 5, 4, 40);
    			add_location(h4, file$1, 32, 8, 1615);
    			attr_dev(div7, "class", "legal svelte-117xld");
    			add_location(div7, file$1, 31, 4, 1586);
    			attr_dev(section, "class", "svelte-117xld");
    			add_location(section, file$1, 4, 0, 25);
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
    			append_dev(div2, t8);
    			append_dev(div2, img1);
    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			append_dev(div5, img2);
    			append_dev(div5, t10);
    			append_dev(div5, div3);
    			append_dev(div3, h22);
    			append_dev(div3, t12);
    			append_dev(div3, p2);
    			append_dev(div5, t14);
    			append_dev(div5, img3);
    			append_dev(div5, t15);
    			append_dev(div5, div4);
    			append_dev(div4, h23);
    			append_dev(div4, t17);
    			append_dev(div4, p3);
    			append_dev(section, t19);
    			append_dev(section, div7);
    			append_dev(div7, h4);
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Homepage",
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
    	let t;
    	let div1;
    	let homepage;
    	let current;
    	header = new Header({ $$inline: true });
    	homepage = new Homepage({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			create_component(header.$$.fragment);
    			t = space();
    			div1 = element("div");
    			create_component(homepage.$$.fragment);
    			attr_dev(div0, "class", "header svelte-n2tfl7");
    			add_location(div0, file, 6, 4, 126);
    			attr_dev(div1, "class", "content");
    			add_location(div1, file, 9, 4, 179);
    			attr_dev(section, "class", "svelte-n2tfl7");
    			add_location(section, file, 5, 0, 111);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			mount_component(header, div0, null);
    			append_dev(section, t);
    			append_dev(section, div1);
    			mount_component(homepage, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(homepage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(homepage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(header);
    			destroy_component(homepage);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Header, Homepage });
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
