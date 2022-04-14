
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
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    			attr_dev(div1, "id", "Classy");
    			attr_dev(div1, "class", "flexy accent svelte-hk042q");
    			add_location(div1, file$8, 14, 4, 315);
    			attr_dev(div2, "class", "cozyB button svelte-hk042q");
    			add_location(div2, file$8, 18, 6, 480);
    			attr_dev(div3, "id", "Cozy");
    			attr_dev(div3, "class", "flexy accent svelte-hk042q");
    			add_location(div3, file$8, 17, 4, 436);
    			attr_dev(div4, "class", "coolB button svelte-hk042q");
    			add_location(div4, file$8, 21, 6, 597);
    			attr_dev(div5, "id", "Cool");
    			attr_dev(div5, "class", "flexy accent svelte-hk042q");
    			add_location(div5, file$8, 20, 4, 553);
    			attr_dev(div6, "class", "carefreeB button svelte-hk042q");
    			add_location(div6, file$8, 24, 6, 718);
    			attr_dev(div7, "id", "Carefree");
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
    const file$7 = "src\\dropdown.svelte";

    // (42:8) {:else}
    function create_else_block_5(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/homeIconClassy.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Home");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 42, 8, 1294);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_5.name,
    		type: "else",
    		source: "(42:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (40:45) 
    function create_if_block_17(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/homeIconCarefree.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Home");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 40, 8, 1217);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(40:45) ",
    		ctx
    	});

    	return block;
    }

    // (38:41) 
    function create_if_block_16(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/homeIconCool.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Home");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 38, 8, 1114);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(38:41) ",
    		ctx
    	});

    	return block;
    }

    // (36:8) {#if (iconColors == 'Cozy')}
    function create_if_block_15(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/homeIconCozy.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Home");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 36, 8, 1015);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(36:8) {#if (iconColors == 'Cozy')}",
    		ctx
    	});

    	return block;
    }

    // (54:8) {:else}
    function create_else_block_4(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/menuIconClassy.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Menu");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 54, 8, 1848);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", menuOpen, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_4.name,
    		type: "else",
    		source: "(54:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (52:45) 
    function create_if_block_14(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/menuIconCarefree.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Menu");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 52, 8, 1751);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", menuOpen, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(52:45) ",
    		ctx
    	});

    	return block;
    }

    // (50:41) 
    function create_if_block_13(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/menuIconCool.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Menu");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 50, 8, 1628);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", menuOpen, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(50:41) ",
    		ctx
    	});

    	return block;
    }

    // (48:8) {#if (iconColors == 'Cozy')}
    function create_if_block_12(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/menuIconCozy.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Menu");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 48, 8, 1509);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", menuOpen, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(48:8) {#if (iconColors == 'Cozy')}",
    		ctx
    	});

    	return block;
    }

    // (65:12) {:else}
    function create_else_block_3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/foodIconClassy.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Food");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 65, 12, 2378);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(65:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:49) 
    function create_if_block_11(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/foodIconCarefree.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Food");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 63, 12, 2293);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(63:49) ",
    		ctx
    	});

    	return block;
    }

    // (61:45) 
    function create_if_block_10(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/foodIconCool.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Food");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 61, 12, 2182);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(61:45) ",
    		ctx
    	});

    	return block;
    }

    // (59:12) {#if (iconColors == 'Cozy')}
    function create_if_block_9(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/foodIconCozy.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Food");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 59, 12, 2075);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(59:12) {#if (iconColors == 'Cozy')}",
    		ctx
    	});

    	return block;
    }

    // (77:12) {:else}
    function create_else_block_2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/drinkIconClassy.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Drink");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 77, 12, 2918);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(77:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (75:49) 
    function create_if_block_8(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/drinkIconCarefree.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Drink");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 75, 12, 2831);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(75:49) ",
    		ctx
    	});

    	return block;
    }

    // (73:45) 
    function create_if_block_7(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/drinkIconCool.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Drink");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 73, 12, 2718);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(73:45) ",
    		ctx
    	});

    	return block;
    }

    // (71:12) {#if (iconColors == 'Cozy')}
    function create_if_block_6(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/drinkIconCozy.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Drink");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 71, 12, 2609);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(71:12) {#if (iconColors == 'Cozy')}",
    		ctx
    	});

    	return block;
    }

    // (90:8) {:else}
    function create_else_block_1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/contactIconClassy.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Contact");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 90, 8, 3446);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(90:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (88:45) 
    function create_if_block_5(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/contactIconCarefree.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Contact");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 88, 8, 3363);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(88:45) ",
    		ctx
    	});

    	return block;
    }

    // (86:41) 
    function create_if_block_4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/contactIconCool.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Contact");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 86, 8, 3254);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(86:41) ",
    		ctx
    	});

    	return block;
    }

    // (84:8) {#if (iconColors == 'Cozy')}
    function create_if_block_3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/contactIconCozy.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Contact");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 84, 8, 3149);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(84:8) {#if (iconColors == 'Cozy')}",
    		ctx
    	});

    	return block;
    }

    // (102:8) {:else}
    function create_else_block$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/scheduleIconClassy.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Schedule");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 102, 8, 3960);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(102:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (100:45) 
    function create_if_block_2$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/scheduleIconCarefree.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Schedule");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 100, 8, 3875);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(100:45) ",
    		ctx
    	});

    	return block;
    }

    // (98:41) 
    function create_if_block_1$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/scheduleIconCool.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Schedule");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 98, 8, 3764);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(98:41) ",
    		ctx
    	});

    	return block;
    }

    // (96:8) {#if (iconColors == 'Cozy')}
    function create_if_block$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/scheduleIconCozy.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Schedule");
    			attr_dev(img, "class", "svelte-dljkuk");
    			add_location(img, file$7, 96, 8, 3657);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(96:8) {#if (iconColors == 'Cozy')}",
    		ctx
    	});

    	return block;
    }

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
    	let t5;
    	let div7;
    	let p1;
    	let t7;
    	let t8;
    	let div5;
    	let p2;
    	let t10;
    	let t11;
    	let div6;
    	let p3;
    	let t13;
    	let t14;
    	let div8;
    	let p4;
    	let t15;
    	let br;
    	let t16;
    	let t17;
    	let t18;
    	let div9;
    	let p5;
    	let t20;
    	let t21;
    	let section0;
    	let div11;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*iconColors*/ ctx[0] == 'Cozy') return create_if_block_15;
    		if (/*iconColors*/ ctx[0] == 'Cool') return create_if_block_16;
    		if (/*iconColors*/ ctx[0] == 'Carefree') return create_if_block_17;
    		return create_else_block_5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*iconColors*/ ctx[0] == 'Cozy') return create_if_block_12;
    		if (/*iconColors*/ ctx[0] == 'Cool') return create_if_block_13;
    		if (/*iconColors*/ ctx[0] == 'Carefree') return create_if_block_14;
    		return create_else_block_4;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*iconColors*/ ctx[0] == 'Cozy') return create_if_block_9;
    		if (/*iconColors*/ ctx[0] == 'Cool') return create_if_block_10;
    		if (/*iconColors*/ ctx[0] == 'Carefree') return create_if_block_11;
    		return create_else_block_3;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_2(ctx);

    	function select_block_type_3(ctx, dirty) {
    		if (/*iconColors*/ ctx[0] == 'Cozy') return create_if_block_6;
    		if (/*iconColors*/ ctx[0] == 'Cool') return create_if_block_7;
    		if (/*iconColors*/ ctx[0] == 'Carefree') return create_if_block_8;
    		return create_else_block_2;
    	}

    	let current_block_type_3 = select_block_type_3(ctx);
    	let if_block3 = current_block_type_3(ctx);

    	function select_block_type_4(ctx, dirty) {
    		if (/*iconColors*/ ctx[0] == 'Cozy') return create_if_block_3;
    		if (/*iconColors*/ ctx[0] == 'Cool') return create_if_block_4;
    		if (/*iconColors*/ ctx[0] == 'Carefree') return create_if_block_5;
    		return create_else_block_1;
    	}

    	let current_block_type_4 = select_block_type_4(ctx);
    	let if_block4 = current_block_type_4(ctx);

    	function select_block_type_5(ctx, dirty) {
    		if (/*iconColors*/ ctx[0] == 'Cozy') return create_if_block$1;
    		if (/*iconColors*/ ctx[0] == 'Cool') return create_if_block_1$1;
    		if (/*iconColors*/ ctx[0] == 'Carefree') return create_if_block_2$1;
    		return create_else_block$1;
    	}

    	let current_block_type_5 = select_block_type_5(ctx);
    	let if_block5 = current_block_type_5(ctx);

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
    			if_block0.c();
    			t5 = space();
    			div7 = element("div");
    			p1 = element("p");
    			p1.textContent = "Menu";
    			t7 = space();
    			if_block1.c();
    			t8 = space();
    			div5 = element("div");
    			p2 = element("p");
    			p2.textContent = "Food";
    			t10 = space();
    			if_block2.c();
    			t11 = space();
    			div6 = element("div");
    			p3 = element("p");
    			p3.textContent = "Drinks";
    			t13 = space();
    			if_block3.c();
    			t14 = space();
    			div8 = element("div");
    			p4 = element("p");
    			t15 = text("Contact");
    			br = element("br");
    			t16 = text("Us");
    			t17 = space();
    			if_block4.c();
    			t18 = space();
    			div9 = element("div");
    			p5 = element("p");
    			p5.textContent = "Schedule";
    			t20 = space();
    			if_block5.c();
    			t21 = space();
    			section0 = element("section");
    			div11 = element("div");
    			attr_dev(div0, "class", "bar1 svelte-dljkuk");
    			add_location(div0, file$7, 28, 6, 760);
    			attr_dev(div1, "class", "bar2 svelte-dljkuk");
    			add_location(div1, file$7, 29, 6, 792);
    			attr_dev(div2, "class", "bar3 svelte-dljkuk");
    			add_location(div2, file$7, 30, 6, 824);
    			attr_dev(div3, "id", "dropdown");
    			attr_dev(div3, "class", "dropdown svelte-dljkuk");
    			add_location(div3, file$7, 27, 2, 695);
    			attr_dev(p0, "class", "svelte-dljkuk");
    			add_location(p0, file$7, 34, 8, 956);
    			attr_dev(div4, "class", "home hidden svelte-dljkuk");
    			add_location(div4, file$7, 33, 4, 899);
    			attr_dev(p1, "class", "svelte-dljkuk");
    			add_location(p1, file$7, 46, 8, 1430);
    			attr_dev(p2, "class", "svelte-dljkuk");
    			add_location(p2, file$7, 57, 12, 2008);
    			attr_dev(div5, "id", "navFood");
    			attr_dev(div5, "class", "food svelte-dljkuk");
    			add_location(div5, file$7, 56, 8, 1941);
    			attr_dev(p3, "class", "svelte-dljkuk");
    			add_location(p3, file$7, 69, 12, 2540);
    			attr_dev(div6, "id", "navDrink");
    			attr_dev(div6, "class", "drink svelte-dljkuk");
    			add_location(div6, file$7, 68, 8, 2471);
    			attr_dev(div7, "id", "navMenu");
    			attr_dev(div7, "class", "menu hidden closed svelte-dljkuk");
    			add_location(div7, file$7, 45, 4, 1375);
    			add_location(br, file$7, 82, 18, 3091);
    			attr_dev(p4, "class", "svelte-dljkuk");
    			add_location(p4, file$7, 82, 8, 3081);
    			attr_dev(div8, "class", "contact hidden svelte-dljkuk");
    			add_location(div8, file$7, 81, 4, 3021);
    			attr_dev(p5, "class", "svelte-dljkuk");
    			add_location(p5, file$7, 94, 8, 3594);
    			attr_dev(div9, "class", "schedule hidden svelte-dljkuk");
    			add_location(div9, file$7, 93, 4, 3533);
    			attr_dev(div10, "class", "stuff accent text svelte-dljkuk");
    			add_location(div10, file$7, 32, 2, 862);
    			attr_dev(div11, "class", "bar1 bar2 bar3 stuff svelte-dljkuk");
    			add_location(div11, file$7, 107, 6, 4111);
    			attr_dev(section0, "class", "ignore visible opened change svelte-dljkuk");
    			add_location(section0, file$7, 106, 2, 4057);
    			attr_dev(section1, "id", "test");
    			attr_dev(section1, "class", "svelte-dljkuk");
    			add_location(section1, file$7, 26, 0, 672);
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
    			if_block0.m(div4, null);
    			append_dev(div10, t5);
    			append_dev(div10, div7);
    			append_dev(div7, p1);
    			append_dev(div7, t7);
    			if_block1.m(div7, null);
    			append_dev(div7, t8);
    			append_dev(div7, div5);
    			append_dev(div5, p2);
    			append_dev(div5, t10);
    			if_block2.m(div5, null);
    			append_dev(div7, t11);
    			append_dev(div7, div6);
    			append_dev(div6, p3);
    			append_dev(div6, t13);
    			if_block3.m(div6, null);
    			append_dev(div10, t14);
    			append_dev(div10, div8);
    			append_dev(div8, p4);
    			append_dev(p4, t15);
    			append_dev(p4, br);
    			append_dev(p4, t16);
    			append_dev(div8, t17);
    			if_block4.m(div8, null);
    			append_dev(div10, t18);
    			append_dev(div10, div9);
    			append_dev(div9, p5);
    			append_dev(div9, t20);
    			if_block5.m(div9, null);
    			append_dev(section1, t21);
    			append_dev(section1, section0);
    			append_dev(section0, div11);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div3, "click", navChange, false, false, false),
    					listen_dev(div4, "click", /*pageChange*/ ctx[1], false, false, false),
    					listen_dev(p1, "click", menuOpen, false, false, false),
    					listen_dev(div5, "click", /*pageChange*/ ctx[1], false, false, false),
    					listen_dev(div6, "click", /*pageChange*/ ctx[1], false, false, false),
    					listen_dev(div8, "click", /*pageChange*/ ctx[1], false, false, false),
    					listen_dev(div9, "click", /*pageChange*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div4, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div7, t8);
    				}
    			}

    			if (current_block_type_2 !== (current_block_type_2 = select_block_type_2(ctx))) {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div5, null);
    				}
    			}

    			if (current_block_type_3 !== (current_block_type_3 = select_block_type_3(ctx))) {
    				if_block3.d(1);
    				if_block3 = current_block_type_3(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(div6, null);
    				}
    			}

    			if (current_block_type_4 !== (current_block_type_4 = select_block_type_4(ctx))) {
    				if_block4.d(1);
    				if_block4 = current_block_type_4(ctx);

    				if (if_block4) {
    					if_block4.c();
    					if_block4.m(div8, null);
    				}
    			}

    			if (current_block_type_5 !== (current_block_type_5 = select_block_type_5(ctx))) {
    				if_block5.d(1);
    				if_block5 = current_block_type_5(ctx);

    				if (if_block5) {
    					if_block5.c();
    					if_block5.m(div9, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section1);
    			if_block0.d();
    			if_block1.d();
    			if_block2.d();
    			if_block3.d();
    			if_block4.d();
    			if_block5.d();
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

    	let { iconColors } = $$props;
    	const writable_props = ['iconColors'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dropdown> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('iconColors' in $$props) $$invalidate(0, iconColors = $$props.iconColors);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		navChange,
    		menuOpen,
    		pageChange,
    		iconColors
    	});

    	$$self.$inject_state = $$props => {
    		if ('iconColors' in $$props) $$invalidate(0, iconColors = $$props.iconColors);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [iconColors, pageChange];
    }

    class Dropdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { iconColors: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dropdown",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*iconColors*/ ctx[0] === undefined && !('iconColors' in props)) {
    			console.warn("<Dropdown> was created without expected prop 'iconColors'");
    		}
    	}

    	get iconColors() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconColors(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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

    	dropdown = new Dropdown({
    			props: { iconColors: /*iconColors*/ ctx[0] },
    			$$inline: true
    		});

    	dropdown.$on("pageChange", /*pageChange*/ ctx[1]);
    	colors = new Colors({ $$inline: true });
    	colors.$on("styleChange", /*changeStyle*/ ctx[2]);

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
    			attr_dev(h1, "class", "svelte-1t1bih4");
    			add_location(h1, file$6, 28, 8, 705);
    			attr_dev(div, "class", "box text base svelte-1t1bih4");
    			add_location(div, file$6, 27, 4, 668);
    			attr_dev(main, "class", "background svelte-1t1bih4");
    			add_location(main, file$6, 25, 0, 580);
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
    		p: function update(ctx, [dirty]) {
    			const dropdown_changes = {};
    			if (dirty & /*iconColors*/ 1) dropdown_changes.iconColors = /*iconColors*/ ctx[0];
    			dropdown.$set(dropdown_changes);
    		},
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

    	let { iconColors } = $$props;
    	const writable_props = ['iconColors'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('iconColors' in $$props) $$invalidate(0, iconColors = $$props.iconColors);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		Colors,
    		Dropdown,
    		pageChange,
    		changeStyle,
    		iconColors
    	});

    	$$self.$inject_state = $$props => {
    		if ('iconColors' in $$props) $$invalidate(0, iconColors = $$props.iconColors);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*iconColors*/ 1) ;
    	};

    	return [iconColors, pageChange, changeStyle];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { iconColors: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*iconColors*/ ctx[0] === undefined && !('iconColors' in props)) {
    			console.warn("<Header> was created without expected prop 'iconColors'");
    		}
    	}

    	get iconColors() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconColors(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\homepage.svelte generated by Svelte v3.46.4 */

    const file$5 = "src\\homepage.svelte";

    // (44:8) {:else}
    function create_else_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/footstepsClassy.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "footsteps svelte-4spa1i");
    			attr_dev(img, "alt", "footsteps");
    			add_location(img, file$5, 44, 8, 1836);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(44:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (42:44) 
    function create_if_block_2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/footstepsCarefree.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "footsteps svelte-4spa1i");
    			attr_dev(img, "alt", "footsteps");
    			add_location(img, file$5, 42, 8, 1735);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(42:44) ",
    		ctx
    	});

    	return block;
    }

    // (40:40) 
    function create_if_block_1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/footstepsCool.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "footsteps svelte-4spa1i");
    			attr_dev(img, "alt", "footsteps");
    			add_location(img, file$5, 40, 8, 1609);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(40:40) ",
    		ctx
    	});

    	return block;
    }

    // (38:8) {#if (sideColor == 'Cozy')}
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/footstepsCozy.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "footsteps svelte-4spa1i");
    			attr_dev(img, "alt", "footsteps");
    			add_location(img, file$5, 38, 8, 1487);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(38:8) {#if (sideColor == 'Cozy')}",
    		ctx
    	});

    	return block;
    }

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
    	let t23;
    	let div10;
    	let p7;

    	function select_block_type(ctx, dirty) {
    		if (/*sideColor*/ ctx[0] == 'Cozy') return create_if_block;
    		if (/*sideColor*/ ctx[0] == 'Cool') return create_if_block_1;
    		if (/*sideColor*/ ctx[0] == 'Carefree') return create_if_block_2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

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
    			if_block.c();
    			t23 = space();
    			div10 = element("div");
    			p7 = element("p");
    			p7.textContent = "Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts";
    			attr_dev(h20, "class", "svelte-4spa1i");
    			add_location(h20, file$5, 8, 12, 178);
    			attr_dev(p0, "class", "svelte-4spa1i");
    			add_location(p0, file$5, 9, 12, 214);
    			attr_dev(div0, "class", "about text svelte-4spa1i");
    			add_location(div0, file$5, 7, 8, 140);
    			if (!src_url_equal(img0.src, img0_src_value = "images/iacs1.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "cool food :)");
    			attr_dev(img0, "class", "svelte-4spa1i");
    			add_location(img0, file$5, 12, 8, 465);
    			attr_dev(div1, "class", "image accent svelte-4spa1i");
    			add_location(div1, file$5, 11, 8, 429);
    			attr_dev(h21, "class", "svelte-4spa1i");
    			add_location(h21, file$5, 15, 12, 575);
    			attr_dev(p1, "class", "svelte-4spa1i");
    			add_location(p1, file$5, 16, 12, 614);
    			attr_dev(div2, "class", "help text svelte-4spa1i");
    			add_location(div2, file$5, 14, 8, 538);
    			attr_dev(div3, "class", "left base svelte-4spa1i");
    			add_location(div3, file$5, 6, 4, 107);
    			if (!src_url_equal(img1.src, img1_src_value = "images/logo.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "cool logo :)");
    			attr_dev(img1, "class", "svelte-4spa1i");
    			add_location(img1, file$5, 22, 8, 959);
    			attr_dev(div4, "class", "image accent svelte-4spa1i");
    			add_location(div4, file$5, 21, 8, 923);
    			attr_dev(h22, "class", "svelte-4spa1i");
    			add_location(h22, file$5, 25, 12, 1072);
    			attr_dev(p2, "class", "svelte-4spa1i");
    			add_location(p2, file$5, 26, 12, 1104);
    			attr_dev(p3, "class", "svelte-4spa1i");
    			add_location(p3, file$5, 27, 12, 1135);
    			attr_dev(p4, "class", "svelte-4spa1i");
    			add_location(p4, file$5, 28, 12, 1180);
    			attr_dev(p5, "class", "svelte-4spa1i");
    			add_location(p5, file$5, 29, 12, 1213);
    			attr_dev(p6, "class", "svelte-4spa1i");
    			add_location(p6, file$5, 30, 12, 1251);
    			attr_dev(div5, "class", "location text svelte-4spa1i");
    			add_location(div5, file$5, 24, 8, 1031);
    			if (!src_url_equal(img2.src, img2_src_value = "images/iacs2.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "cool food :)");
    			attr_dev(img2, "class", "svelte-4spa1i");
    			add_location(img2, file$5, 33, 8, 1338);
    			attr_dev(div6, "class", "image accent svelte-4spa1i");
    			add_location(div6, file$5, 32, 8, 1302);
    			attr_dev(div7, "class", "right base svelte-4spa1i");
    			add_location(div7, file$5, 20, 4, 889);
    			attr_dev(div8, "class", "righter svelte-4spa1i");
    			add_location(div8, file$5, 36, 4, 1419);
    			attr_dev(div9, "class", "main svelte-4spa1i");
    			add_location(div9, file$5, 5, 4, 83);
    			attr_dev(p7, "class", "svelte-4spa1i");
    			add_location(p7, file$5, 49, 8, 2004);
    			attr_dev(div10, "class", "footer text base background svelte-4spa1i");
    			add_location(div10, file$5, 48, 4, 1953);
    			attr_dev(section, "class", "background svelte-4spa1i");
    			add_location(section, file$5, 4, 0, 49);
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
    			if_block.m(div8, null);
    			append_dev(section, t23);
    			append_dev(section, div10);
    			append_dev(div10, p7);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div8, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
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

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Homepage', slots, []);
    	let { sideColor } = $$props;
    	const writable_props = ['sideColor'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Homepage> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('sideColor' in $$props) $$invalidate(0, sideColor = $$props.sideColor);
    	};

    	$$self.$capture_state = () => ({ sideColor });

    	$$self.$inject_state = $$props => {
    		if ('sideColor' in $$props) $$invalidate(0, sideColor = $$props.sideColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [sideColor];
    }

    class Homepage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { sideColor: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Homepage",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*sideColor*/ ctx[0] === undefined && !('sideColor' in props)) {
    			console.warn("<Homepage> was created without expected prop 'sideColor'");
    		}
    	}

    	get sideColor() {
    		throw new Error("<Homepage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sideColor(value) {
    		throw new Error("<Homepage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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
    	let section_class_value;
    	let current;

    	header = new Header({
    			props: { iconColors: /*iconColors*/ ctx[2] },
    			$$inline: true
    		});

    	header.$on("pageChange", changePage);
    	header.$on("changeColor", /*changeColor*/ ctx[3]);

    	homepage = new Homepage({
    			props: { sideColor: /*color*/ ctx[0] },
    			$$inline: true
    		});

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
    			add_location(div0, file, 34, 4, 1044);
    			attr_dev(div1, "id", "home");
    			attr_dev(div1, "class", "active svelte-pbzasp");
    			add_location(div1, file, 38, 4, 1193);
    			attr_dev(div2, "id", "food");
    			attr_dev(div2, "class", "inactive svelte-pbzasp");
    			add_location(div2, file, 41, 4, 1276);
    			attr_dev(div3, "id", "drink");
    			attr_dev(div3, "class", "inactive svelte-pbzasp");
    			add_location(div3, file, 44, 4, 1339);
    			attr_dev(div4, "id", "contact");
    			attr_dev(div4, "class", "inactive svelte-pbzasp");
    			add_location(div4, file, 47, 4, 1404);
    			attr_dev(div5, "id", "schedule");
    			attr_dev(div5, "class", "inactive svelte-pbzasp");
    			add_location(div5, file, 50, 4, 1473);
    			attr_dev(div6, "class", "content");
    			add_location(div6, file, 37, 4, 1166);
    			attr_dev(section, "id", "base");
    			attr_dev(section, "class", section_class_value = "" + (null_to_empty(/*color*/ ctx[0]) + " svelte-pbzasp"));
    			add_location(section, file, 33, 0, 988);
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
    			/*section_binding*/ ctx[4](section);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};
    			if (dirty & /*iconColors*/ 4) header_changes.iconColors = /*iconColors*/ ctx[2];
    			header.$set(header_changes);
    			const homepage_changes = {};
    			if (dirty & /*color*/ 1) homepage_changes.sideColor = /*color*/ ctx[0];
    			homepage.$set(homepage_changes);

    			if (!current || dirty & /*color*/ 1 && section_class_value !== (section_class_value = "" + (null_to_empty(/*color*/ ctx[0]) + " svelte-pbzasp"))) {
    				attr_dev(section, "class", section_class_value);
    			}
    		},
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
    			/*section_binding*/ ctx[4](null);
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
    	let iconColors;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	let color = 'Classy';
    	let base;

    	function changeColor(event) {
    		let newStyle = event.detail.newStyle;
    		let old = base.classList[0];

    		if (old != newStyle) {
    			$$invalidate(0, color = newStyle);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	function section_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			base = $$value;
    			$$invalidate(1, base);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Header,
    		Homepage,
    		Food,
    		Drink,
    		Contact,
    		Schedule,
    		changePage,
    		color,
    		base,
    		changeColor,
    		iconColors
    	});

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('base' in $$props) $$invalidate(1, base = $$props.base);
    		if ('iconColors' in $$props) $$invalidate(2, iconColors = $$props.iconColors);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color*/ 1) {
    			$$invalidate(2, iconColors = color);
    		}
    	};

    	return [color, base, iconColors, changeColor, section_binding];
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
