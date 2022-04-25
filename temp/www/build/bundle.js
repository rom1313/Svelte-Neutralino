
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
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
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.2' }, detail), true));
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
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    class Allier {
        constructor(pseudo, sprite, x, y) {
            this.pseudo = pseudo;
            this.sprite = sprite;
            this.x = x;
            this.y = y;
        }
    }

    //TODO ----------------------------------------------- Personnage -------------------------


    class Personnage {
        constructor(pseudo, cyberz, niveau) {
            this.pseudo = pseudo;
            this.cyberz = cyberz;
            this.sante = 20;
            this.attaque = 5;
            this.defense = 1;
            this.vitesse = 1;
            this.niveau = niveau;
            this.xp = 0;
            this.pass = "0000";
            this.sprite;
            this.score = [0, 0, 0, 0];
            this.kill = [0, 0, 0, 0];
            this.inventaire = [{ img: 'img/carteagent.png', nom: "Carte d'agent", prix: 0 }];
            this.puce = ["", "", ""];
            this.relique = [""];
            this.amelioration = ["", "", ""];
            this.ventes = [];
            this.messages = [];
            this.coffres = [""];
            this.classe = '';
            this.partenaire = '';
            this.skills = ["", "", "", "", "", "", ""];
            this.progression = '';
            this.skin = '';
            this.personnage = '';
            this.img = "img/inviteface.png";


        }
        nivplus() {
            this.niveau += 1;
            /* console.log(this.pseudo + " passe au niveau " + this.niveau); */

            // methode de classe on ne met pas le mot function
        }
        verifiersante() {
            if (this.sante <= 0) {
                this.sante = 0;
                return this.sante;
            } else {
                return this.sante;
            }
        }
        get info() { }
        ajoutxp(xp) {
            if (xp >= 100) {
                nivplus();
            } else {
                this.xp += xp;
            }
        }
    }

    class Objet {
        constructor(nom, prix, img, type, description, effet, createur, qualite) {
            this.nom = nom;
            this.prix = prix;
            this.effet = effet;
            this.img = img;
            this.type = type;
            this.description = description;
            this.createur = createur;
            this.qualite = qualite;

        }
    }

    //TODO ----------------------------------------------- Scenes -------------------------
    let chatouvert = true;
    let focuschat = writable();
    let volume = writable(1);

    /**
     * Parses an URI
     *
     * @author Steven Levithan <stevenlevithan.com> (MIT license)
     * @api private
     */
    var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

    var parts = [
        'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
    ];

    var parseuri = function parseuri(str) {
        var src = str,
            b = str.indexOf('['),
            e = str.indexOf(']');

        if (b != -1 && e != -1) {
            str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
        }

        var m = re.exec(str || ''),
            uri = {},
            i = 14;

        while (i--) {
            uri[parts[i]] = m[i] || '';
        }

        if (b != -1 && e != -1) {
            uri.source = src;
            uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
            uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
            uri.ipv6uri = true;
        }

        uri.pathNames = pathNames(uri, uri['path']);
        uri.queryKey = queryKey(uri, uri['query']);

        return uri;
    };

    function pathNames(obj, path) {
        var regx = /\/{2,9}/g,
            names = path.replace(regx, "/").split("/");

        if (path.substr(0, 1) == '/' || path.length === 0) {
            names.splice(0, 1);
        }
        if (path.substr(path.length - 1, 1) == '/') {
            names.splice(names.length - 1, 1);
        }

        return names;
    }

    function queryKey(uri, query) {
        var data = {};

        query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
            if ($1) {
                data[$1] = $2;
            }
        });

        return data;
    }

    /**
     * URL parser.
     *
     * @param uri - url
     * @param path - the request path of the connection
     * @param loc - An object meant to mimic window.location.
     *        Defaults to window.location.
     * @public
     */
    function url(uri, path = "", loc) {
        let obj = uri;
        // default to window.location
        loc = loc || (typeof location !== "undefined" && location);
        if (null == uri)
            uri = loc.protocol + "//" + loc.host;
        // relative path support
        if (typeof uri === "string") {
            if ("/" === uri.charAt(0)) {
                if ("/" === uri.charAt(1)) {
                    uri = loc.protocol + uri;
                }
                else {
                    uri = loc.host + uri;
                }
            }
            if (!/^(https?|wss?):\/\//.test(uri)) {
                if ("undefined" !== typeof loc) {
                    uri = loc.protocol + "//" + uri;
                }
                else {
                    uri = "https://" + uri;
                }
            }
            // parse
            obj = parseuri(uri);
        }
        // make sure we treat `localhost:80` and `localhost` equally
        if (!obj.port) {
            if (/^(http|ws)$/.test(obj.protocol)) {
                obj.port = "80";
            }
            else if (/^(http|ws)s$/.test(obj.protocol)) {
                obj.port = "443";
            }
        }
        obj.path = obj.path || "/";
        const ipv6 = obj.host.indexOf(":") !== -1;
        const host = ipv6 ? "[" + obj.host + "]" : obj.host;
        // define unique id
        obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
        // define href
        obj.href =
            obj.protocol +
                "://" +
                host +
                (loc && loc.port === obj.port ? "" : ":" + obj.port);
        return obj;
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var hasCors = createCommonjsModule(function (module) {
    /**
     * Module exports.
     *
     * Logic borrowed from Modernizr:
     *
     *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
     */

    try {
      module.exports = typeof XMLHttpRequest !== 'undefined' &&
        'withCredentials' in new XMLHttpRequest();
    } catch (err) {
      // if XMLHttp support is disabled in IE then it will throw
      // when trying to create
      module.exports = false;
    }
    });

    var globalThis$1 = (() => {
        if (typeof self !== "undefined") {
            return self;
        }
        else if (typeof window !== "undefined") {
            return window;
        }
        else {
            return Function("return this")();
        }
    })();

    // browser shim for xmlhttprequest module
    function XMLHttpRequest$1 (opts) {
        const xdomain = opts.xdomain;
        // XMLHttpRequest can be disabled on IE
        try {
            if ("undefined" !== typeof XMLHttpRequest && (!xdomain || hasCors)) {
                return new XMLHttpRequest();
            }
        }
        catch (e) { }
        if (!xdomain) {
            try {
                return new globalThis$1[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
            }
            catch (e) { }
        }
    }

    function pick(obj, ...attr) {
        return attr.reduce((acc, k) => {
            if (obj.hasOwnProperty(k)) {
                acc[k] = obj[k];
            }
            return acc;
        }, {});
    }
    // Keep a reference to the real timeout functions so they can be used when overridden
    const NATIVE_SET_TIMEOUT = setTimeout;
    const NATIVE_CLEAR_TIMEOUT = clearTimeout;
    function installTimerFunctions(obj, opts) {
        if (opts.useNativeTimers) {
            obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globalThis$1);
            obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(globalThis$1);
        }
        else {
            obj.setTimeoutFn = setTimeout.bind(globalThis$1);
            obj.clearTimeoutFn = clearTimeout.bind(globalThis$1);
        }
    }

    /**
     * Expose `Emitter`.
     */

    var Emitter_1 = Emitter;

    /**
     * Initialize a new `Emitter`.
     *
     * @api public
     */

    function Emitter(obj) {
      if (obj) return mixin(obj);
    }

    /**
     * Mixin the emitter properties.
     *
     * @param {Object} obj
     * @return {Object}
     * @api private
     */

    function mixin(obj) {
      for (var key in Emitter.prototype) {
        obj[key] = Emitter.prototype[key];
      }
      return obj;
    }

    /**
     * Listen on the given `event` with `fn`.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.on =
    Emitter.prototype.addEventListener = function(event, fn){
      this._callbacks = this._callbacks || {};
      (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
        .push(fn);
      return this;
    };

    /**
     * Adds an `event` listener that will be invoked a single
     * time then automatically removed.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.once = function(event, fn){
      function on() {
        this.off(event, on);
        fn.apply(this, arguments);
      }

      on.fn = fn;
      this.on(event, on);
      return this;
    };

    /**
     * Remove the given callback for `event` or all
     * registered callbacks.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.off =
    Emitter.prototype.removeListener =
    Emitter.prototype.removeAllListeners =
    Emitter.prototype.removeEventListener = function(event, fn){
      this._callbacks = this._callbacks || {};

      // all
      if (0 == arguments.length) {
        this._callbacks = {};
        return this;
      }

      // specific event
      var callbacks = this._callbacks['$' + event];
      if (!callbacks) return this;

      // remove all handlers
      if (1 == arguments.length) {
        delete this._callbacks['$' + event];
        return this;
      }

      // remove specific handler
      var cb;
      for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i];
        if (cb === fn || cb.fn === fn) {
          callbacks.splice(i, 1);
          break;
        }
      }

      // Remove event specific arrays for event types that no
      // one is subscribed for to avoid memory leak.
      if (callbacks.length === 0) {
        delete this._callbacks['$' + event];
      }

      return this;
    };

    /**
     * Emit `event` with the given args.
     *
     * @param {String} event
     * @param {Mixed} ...
     * @return {Emitter}
     */

    Emitter.prototype.emit = function(event){
      this._callbacks = this._callbacks || {};

      var args = new Array(arguments.length - 1)
        , callbacks = this._callbacks['$' + event];

      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }

      if (callbacks) {
        callbacks = callbacks.slice(0);
        for (var i = 0, len = callbacks.length; i < len; ++i) {
          callbacks[i].apply(this, args);
        }
      }

      return this;
    };

    // alias used for reserved events (protected method)
    Emitter.prototype.emitReserved = Emitter.prototype.emit;

    /**
     * Return array of callbacks for `event`.
     *
     * @param {String} event
     * @return {Array}
     * @api public
     */

    Emitter.prototype.listeners = function(event){
      this._callbacks = this._callbacks || {};
      return this._callbacks['$' + event] || [];
    };

    /**
     * Check if this emitter has `event` handlers.
     *
     * @param {String} event
     * @return {Boolean}
     * @api public
     */

    Emitter.prototype.hasListeners = function(event){
      return !! this.listeners(event).length;
    };

    const PACKET_TYPES = Object.create(null); // no Map = no polyfill
    PACKET_TYPES["open"] = "0";
    PACKET_TYPES["close"] = "1";
    PACKET_TYPES["ping"] = "2";
    PACKET_TYPES["pong"] = "3";
    PACKET_TYPES["message"] = "4";
    PACKET_TYPES["upgrade"] = "5";
    PACKET_TYPES["noop"] = "6";
    const PACKET_TYPES_REVERSE = Object.create(null);
    Object.keys(PACKET_TYPES).forEach(key => {
        PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
    });
    const ERROR_PACKET = { type: "error", data: "parser error" };

    const withNativeBlob$1 = typeof Blob === "function" ||
        (typeof Blob !== "undefined" &&
            Object.prototype.toString.call(Blob) === "[object BlobConstructor]");
    const withNativeArrayBuffer$2 = typeof ArrayBuffer === "function";
    // ArrayBuffer.isView method is not defined in IE10
    const isView$1 = obj => {
        return typeof ArrayBuffer.isView === "function"
            ? ArrayBuffer.isView(obj)
            : obj && obj.buffer instanceof ArrayBuffer;
    };
    const encodePacket = ({ type, data }, supportsBinary, callback) => {
        if (withNativeBlob$1 && data instanceof Blob) {
            if (supportsBinary) {
                return callback(data);
            }
            else {
                return encodeBlobAsBase64(data, callback);
            }
        }
        else if (withNativeArrayBuffer$2 &&
            (data instanceof ArrayBuffer || isView$1(data))) {
            if (supportsBinary) {
                return callback(data);
            }
            else {
                return encodeBlobAsBase64(new Blob([data]), callback);
            }
        }
        // plain string
        return callback(PACKET_TYPES[type] + (data || ""));
    };
    const encodeBlobAsBase64 = (data, callback) => {
        const fileReader = new FileReader();
        fileReader.onload = function () {
            const content = fileReader.result.split(",")[1];
            callback("b" + content);
        };
        return fileReader.readAsDataURL(data);
    };

    /*
     * base64-arraybuffer 1.0.1 <https://github.com/niklasvh/base64-arraybuffer>
     * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
     * Released under MIT License
     */
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    // Use a lookup table to find the index.
    var lookup$1 = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
    for (var i$1 = 0; i$1 < chars.length; i$1++) {
        lookup$1[chars.charCodeAt(i$1)] = i$1;
    }
    var decode$2 = function (base64) {
        var bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
        if (base64[base64.length - 1] === '=') {
            bufferLength--;
            if (base64[base64.length - 2] === '=') {
                bufferLength--;
            }
        }
        var arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
        for (i = 0; i < len; i += 4) {
            encoded1 = lookup$1[base64.charCodeAt(i)];
            encoded2 = lookup$1[base64.charCodeAt(i + 1)];
            encoded3 = lookup$1[base64.charCodeAt(i + 2)];
            encoded4 = lookup$1[base64.charCodeAt(i + 3)];
            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }
        return arraybuffer;
    };

    const withNativeArrayBuffer$1 = typeof ArrayBuffer === "function";
    const decodePacket = (encodedPacket, binaryType) => {
        if (typeof encodedPacket !== "string") {
            return {
                type: "message",
                data: mapBinary(encodedPacket, binaryType)
            };
        }
        const type = encodedPacket.charAt(0);
        if (type === "b") {
            return {
                type: "message",
                data: decodeBase64Packet(encodedPacket.substring(1), binaryType)
            };
        }
        const packetType = PACKET_TYPES_REVERSE[type];
        if (!packetType) {
            return ERROR_PACKET;
        }
        return encodedPacket.length > 1
            ? {
                type: PACKET_TYPES_REVERSE[type],
                data: encodedPacket.substring(1)
            }
            : {
                type: PACKET_TYPES_REVERSE[type]
            };
    };
    const decodeBase64Packet = (data, binaryType) => {
        if (withNativeArrayBuffer$1) {
            const decoded = decode$2(data);
            return mapBinary(decoded, binaryType);
        }
        else {
            return { base64: true, data }; // fallback for old browsers
        }
    };
    const mapBinary = (data, binaryType) => {
        switch (binaryType) {
            case "blob":
                return data instanceof ArrayBuffer ? new Blob([data]) : data;
            case "arraybuffer":
            default:
                return data; // assuming the data is already an ArrayBuffer
        }
    };

    const SEPARATOR = String.fromCharCode(30); // see https://en.wikipedia.org/wiki/Delimiter#ASCII_delimited_text
    const encodePayload = (packets, callback) => {
        // some packets may be added to the array while encoding, so the initial length must be saved
        const length = packets.length;
        const encodedPackets = new Array(length);
        let count = 0;
        packets.forEach((packet, i) => {
            // force base64 encoding for binary packets
            encodePacket(packet, false, encodedPacket => {
                encodedPackets[i] = encodedPacket;
                if (++count === length) {
                    callback(encodedPackets.join(SEPARATOR));
                }
            });
        });
    };
    const decodePayload = (encodedPayload, binaryType) => {
        const encodedPackets = encodedPayload.split(SEPARATOR);
        const packets = [];
        for (let i = 0; i < encodedPackets.length; i++) {
            const decodedPacket = decodePacket(encodedPackets[i], binaryType);
            packets.push(decodedPacket);
            if (decodedPacket.type === "error") {
                break;
            }
        }
        return packets;
    };
    const protocol$1 = 4;

    class Transport extends Emitter_1 {
        /**
         * Transport abstract constructor.
         *
         * @param {Object} options.
         * @api private
         */
        constructor(opts) {
            super();
            this.writable = false;
            installTimerFunctions(this, opts);
            this.opts = opts;
            this.query = opts.query;
            this.readyState = "";
            this.socket = opts.socket;
        }
        /**
         * Emits an error.
         *
         * @param {String} str
         * @return {Transport} for chaining
         * @api protected
         */
        onError(msg, desc) {
            const err = new Error(msg);
            // @ts-ignore
            err.type = "TransportError";
            // @ts-ignore
            err.description = desc;
            super.emit("error", err);
            return this;
        }
        /**
         * Opens the transport.
         *
         * @api public
         */
        open() {
            if ("closed" === this.readyState || "" === this.readyState) {
                this.readyState = "opening";
                this.doOpen();
            }
            return this;
        }
        /**
         * Closes the transport.
         *
         * @api public
         */
        close() {
            if ("opening" === this.readyState || "open" === this.readyState) {
                this.doClose();
                this.onClose();
            }
            return this;
        }
        /**
         * Sends multiple packets.
         *
         * @param {Array} packets
         * @api public
         */
        send(packets) {
            if ("open" === this.readyState) {
                this.write(packets);
            }
        }
        /**
         * Called upon open
         *
         * @api protected
         */
        onOpen() {
            this.readyState = "open";
            this.writable = true;
            super.emit("open");
        }
        /**
         * Called with data.
         *
         * @param {String} data
         * @api protected
         */
        onData(data) {
            const packet = decodePacket(data, this.socket.binaryType);
            this.onPacket(packet);
        }
        /**
         * Called with a decoded packet.
         *
         * @api protected
         */
        onPacket(packet) {
            super.emit("packet", packet);
        }
        /**
         * Called upon close.
         *
         * @api protected
         */
        onClose() {
            this.readyState = "closed";
            super.emit("close");
        }
    }

    var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('')
      , length = 64
      , map = {}
      , seed = 0
      , i = 0
      , prev;

    /**
     * Return a string representing the specified number.
     *
     * @param {Number} num The number to convert.
     * @returns {String} The string representation of the number.
     * @api public
     */
    function encode$1(num) {
      var encoded = '';

      do {
        encoded = alphabet[num % length] + encoded;
        num = Math.floor(num / length);
      } while (num > 0);

      return encoded;
    }

    /**
     * Return the integer value specified by the given string.
     *
     * @param {String} str The string to convert.
     * @returns {Number} The integer value represented by the string.
     * @api public
     */
    function decode$1(str) {
      var decoded = 0;

      for (i = 0; i < str.length; i++) {
        decoded = decoded * length + map[str.charAt(i)];
      }

      return decoded;
    }

    /**
     * Yeast: A tiny growing id generator.
     *
     * @returns {String} A unique id.
     * @api public
     */
    function yeast() {
      var now = encode$1(+new Date());

      if (now !== prev) return seed = 0, prev = now;
      return now +'.'+ encode$1(seed++);
    }

    //
    // Map each character to its index.
    //
    for (; i < length; i++) map[alphabet[i]] = i;

    //
    // Expose the `yeast`, `encode` and `decode` functions.
    //
    yeast.encode = encode$1;
    yeast.decode = decode$1;
    var yeast_1 = yeast;

    /**
     * Compiles a querystring
     * Returns string representation of the object
     *
     * @param {Object}
     * @api private
     */
    var encode = function (obj) {
      var str = '';

      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          if (str.length) str += '&';
          str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
        }
      }

      return str;
    };

    /**
     * Parses a simple querystring into an object
     *
     * @param {String} qs
     * @api private
     */

    var decode = function(qs){
      var qry = {};
      var pairs = qs.split('&');
      for (var i = 0, l = pairs.length; i < l; i++) {
        var pair = pairs[i].split('=');
        qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
      return qry;
    };

    var parseqs = {
    	encode: encode,
    	decode: decode
    };

    class Polling extends Transport {
        constructor() {
            super(...arguments);
            this.polling = false;
        }
        /**
         * Transport name.
         */
        get name() {
            return "polling";
        }
        /**
         * Opens the socket (triggers polling). We write a PING message to determine
         * when the transport is open.
         *
         * @api private
         */
        doOpen() {
            this.poll();
        }
        /**
         * Pauses polling.
         *
         * @param {Function} callback upon buffers are flushed and transport is paused
         * @api private
         */
        pause(onPause) {
            this.readyState = "pausing";
            const pause = () => {
                this.readyState = "paused";
                onPause();
            };
            if (this.polling || !this.writable) {
                let total = 0;
                if (this.polling) {
                    total++;
                    this.once("pollComplete", function () {
                        --total || pause();
                    });
                }
                if (!this.writable) {
                    total++;
                    this.once("drain", function () {
                        --total || pause();
                    });
                }
            }
            else {
                pause();
            }
        }
        /**
         * Starts polling cycle.
         *
         * @api public
         */
        poll() {
            this.polling = true;
            this.doPoll();
            this.emit("poll");
        }
        /**
         * Overloads onData to detect payloads.
         *
         * @api private
         */
        onData(data) {
            const callback = packet => {
                // if its the first message we consider the transport open
                if ("opening" === this.readyState && packet.type === "open") {
                    this.onOpen();
                }
                // if its a close packet, we close the ongoing requests
                if ("close" === packet.type) {
                    this.onClose();
                    return false;
                }
                // otherwise bypass onData and handle the message
                this.onPacket(packet);
            };
            // decode payload
            decodePayload(data, this.socket.binaryType).forEach(callback);
            // if an event did not trigger closing
            if ("closed" !== this.readyState) {
                // if we got data we're not polling
                this.polling = false;
                this.emit("pollComplete");
                if ("open" === this.readyState) {
                    this.poll();
                }
            }
        }
        /**
         * For polling, send a close packet.
         *
         * @api private
         */
        doClose() {
            const close = () => {
                this.write([{ type: "close" }]);
            };
            if ("open" === this.readyState) {
                close();
            }
            else {
                // in case we're trying to close while
                // handshaking is in progress (GH-164)
                this.once("open", close);
            }
        }
        /**
         * Writes a packets payload.
         *
         * @param {Array} data packets
         * @param {Function} drain callback
         * @api private
         */
        write(packets) {
            this.writable = false;
            encodePayload(packets, data => {
                this.doWrite(data, () => {
                    this.writable = true;
                    this.emit("drain");
                });
            });
        }
        /**
         * Generates uri for connection.
         *
         * @api private
         */
        uri() {
            let query = this.query || {};
            const schema = this.opts.secure ? "https" : "http";
            let port = "";
            // cache busting is forced
            if (false !== this.opts.timestampRequests) {
                query[this.opts.timestampParam] = yeast_1();
            }
            if (!this.supportsBinary && !query.sid) {
                query.b64 = 1;
            }
            // avoid port if default for schema
            if (this.opts.port &&
                (("https" === schema && Number(this.opts.port) !== 443) ||
                    ("http" === schema && Number(this.opts.port) !== 80))) {
                port = ":" + this.opts.port;
            }
            const encodedQuery = parseqs.encode(query);
            const ipv6 = this.opts.hostname.indexOf(":") !== -1;
            return (schema +
                "://" +
                (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) +
                port +
                this.opts.path +
                (encodedQuery.length ? "?" + encodedQuery : ""));
        }
    }

    /* global attachEvent */
    /**
     * Empty function
     */
    function empty() { }
    const hasXHR2 = (function () {
        const xhr = new XMLHttpRequest$1({
            xdomain: false
        });
        return null != xhr.responseType;
    })();
    class XHR extends Polling {
        /**
         * XHR Polling constructor.
         *
         * @param {Object} opts
         * @api public
         */
        constructor(opts) {
            super(opts);
            if (typeof location !== "undefined") {
                const isSSL = "https:" === location.protocol;
                let port = location.port;
                // some user agents have empty `location.port`
                if (!port) {
                    port = isSSL ? "443" : "80";
                }
                this.xd =
                    (typeof location !== "undefined" &&
                        opts.hostname !== location.hostname) ||
                        port !== opts.port;
                this.xs = opts.secure !== isSSL;
            }
            /**
             * XHR supports binary
             */
            const forceBase64 = opts && opts.forceBase64;
            this.supportsBinary = hasXHR2 && !forceBase64;
        }
        /**
         * Creates a request.
         *
         * @param {String} method
         * @api private
         */
        request(opts = {}) {
            Object.assign(opts, { xd: this.xd, xs: this.xs }, this.opts);
            return new Request(this.uri(), opts);
        }
        /**
         * Sends data.
         *
         * @param {String} data to send.
         * @param {Function} called upon flush.
         * @api private
         */
        doWrite(data, fn) {
            const req = this.request({
                method: "POST",
                data: data
            });
            req.on("success", fn);
            req.on("error", err => {
                this.onError("xhr post error", err);
            });
        }
        /**
         * Starts a poll cycle.
         *
         * @api private
         */
        doPoll() {
            const req = this.request();
            req.on("data", this.onData.bind(this));
            req.on("error", err => {
                this.onError("xhr poll error", err);
            });
            this.pollXhr = req;
        }
    }
    class Request extends Emitter_1 {
        /**
         * Request constructor
         *
         * @param {Object} options
         * @api public
         */
        constructor(uri, opts) {
            super();
            installTimerFunctions(this, opts);
            this.opts = opts;
            this.method = opts.method || "GET";
            this.uri = uri;
            this.async = false !== opts.async;
            this.data = undefined !== opts.data ? opts.data : null;
            this.create();
        }
        /**
         * Creates the XHR object and sends the request.
         *
         * @api private
         */
        create() {
            const opts = pick(this.opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
            opts.xdomain = !!this.opts.xd;
            opts.xscheme = !!this.opts.xs;
            const xhr = (this.xhr = new XMLHttpRequest$1(opts));
            try {
                xhr.open(this.method, this.uri, this.async);
                try {
                    if (this.opts.extraHeaders) {
                        xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
                        for (let i in this.opts.extraHeaders) {
                            if (this.opts.extraHeaders.hasOwnProperty(i)) {
                                xhr.setRequestHeader(i, this.opts.extraHeaders[i]);
                            }
                        }
                    }
                }
                catch (e) { }
                if ("POST" === this.method) {
                    try {
                        xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
                    }
                    catch (e) { }
                }
                try {
                    xhr.setRequestHeader("Accept", "*/*");
                }
                catch (e) { }
                // ie6 check
                if ("withCredentials" in xhr) {
                    xhr.withCredentials = this.opts.withCredentials;
                }
                if (this.opts.requestTimeout) {
                    xhr.timeout = this.opts.requestTimeout;
                }
                xhr.onreadystatechange = () => {
                    if (4 !== xhr.readyState)
                        return;
                    if (200 === xhr.status || 1223 === xhr.status) {
                        this.onLoad();
                    }
                    else {
                        // make sure the `error` event handler that's user-set
                        // does not throw in the same tick and gets caught here
                        this.setTimeoutFn(() => {
                            this.onError(typeof xhr.status === "number" ? xhr.status : 0);
                        }, 0);
                    }
                };
                xhr.send(this.data);
            }
            catch (e) {
                // Need to defer since .create() is called directly from the constructor
                // and thus the 'error' event can only be only bound *after* this exception
                // occurs.  Therefore, also, we cannot throw here at all.
                this.setTimeoutFn(() => {
                    this.onError(e);
                }, 0);
                return;
            }
            if (typeof document !== "undefined") {
                this.index = Request.requestsCount++;
                Request.requests[this.index] = this;
            }
        }
        /**
         * Called upon successful response.
         *
         * @api private
         */
        onSuccess() {
            this.emit("success");
            this.cleanup();
        }
        /**
         * Called if we have data.
         *
         * @api private
         */
        onData(data) {
            this.emit("data", data);
            this.onSuccess();
        }
        /**
         * Called upon error.
         *
         * @api private
         */
        onError(err) {
            this.emit("error", err);
            this.cleanup(true);
        }
        /**
         * Cleans up house.
         *
         * @api private
         */
        cleanup(fromError) {
            if ("undefined" === typeof this.xhr || null === this.xhr) {
                return;
            }
            this.xhr.onreadystatechange = empty;
            if (fromError) {
                try {
                    this.xhr.abort();
                }
                catch (e) { }
            }
            if (typeof document !== "undefined") {
                delete Request.requests[this.index];
            }
            this.xhr = null;
        }
        /**
         * Called upon load.
         *
         * @api private
         */
        onLoad() {
            const data = this.xhr.responseText;
            if (data !== null) {
                this.onData(data);
            }
        }
        /**
         * Aborts the request.
         *
         * @api public
         */
        abort() {
            this.cleanup();
        }
    }
    Request.requestsCount = 0;
    Request.requests = {};
    /**
     * Aborts pending requests when unloading the window. This is needed to prevent
     * memory leaks (e.g. when using IE) and to ensure that no spurious error is
     * emitted.
     */
    if (typeof document !== "undefined") {
        // @ts-ignore
        if (typeof attachEvent === "function") {
            // @ts-ignore
            attachEvent("onunload", unloadHandler);
        }
        else if (typeof addEventListener === "function") {
            const terminationEvent = "onpagehide" in globalThis$1 ? "pagehide" : "unload";
            addEventListener(terminationEvent, unloadHandler, false);
        }
    }
    function unloadHandler() {
        for (let i in Request.requests) {
            if (Request.requests.hasOwnProperty(i)) {
                Request.requests[i].abort();
            }
        }
    }

    const nextTick = (() => {
        const isPromiseAvailable = typeof Promise === "function" && typeof Promise.resolve === "function";
        if (isPromiseAvailable) {
            return cb => Promise.resolve().then(cb);
        }
        else {
            return (cb, setTimeoutFn) => setTimeoutFn(cb, 0);
        }
    })();
    const WebSocket = globalThis$1.WebSocket || globalThis$1.MozWebSocket;
    const usingBrowserWebSocket = true;
    const defaultBinaryType = "arraybuffer";

    // detect ReactNative environment
    const isReactNative = typeof navigator !== "undefined" &&
        typeof navigator.product === "string" &&
        navigator.product.toLowerCase() === "reactnative";
    class WS extends Transport {
        /**
         * WebSocket transport constructor.
         *
         * @api {Object} connection options
         * @api public
         */
        constructor(opts) {
            super(opts);
            this.supportsBinary = !opts.forceBase64;
        }
        /**
         * Transport name.
         *
         * @api public
         */
        get name() {
            return "websocket";
        }
        /**
         * Opens socket.
         *
         * @api private
         */
        doOpen() {
            if (!this.check()) {
                // let probe timeout
                return;
            }
            const uri = this.uri();
            const protocols = this.opts.protocols;
            // React Native only supports the 'headers' option, and will print a warning if anything else is passed
            const opts = isReactNative
                ? {}
                : pick(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
            if (this.opts.extraHeaders) {
                opts.headers = this.opts.extraHeaders;
            }
            try {
                this.ws =
                    usingBrowserWebSocket && !isReactNative
                        ? protocols
                            ? new WebSocket(uri, protocols)
                            : new WebSocket(uri)
                        : new WebSocket(uri, protocols, opts);
            }
            catch (err) {
                return this.emit("error", err);
            }
            this.ws.binaryType = this.socket.binaryType || defaultBinaryType;
            this.addEventListeners();
        }
        /**
         * Adds event listeners to the socket
         *
         * @api private
         */
        addEventListeners() {
            this.ws.onopen = () => {
                if (this.opts.autoUnref) {
                    this.ws._socket.unref();
                }
                this.onOpen();
            };
            this.ws.onclose = this.onClose.bind(this);
            this.ws.onmessage = ev => this.onData(ev.data);
            this.ws.onerror = e => this.onError("websocket error", e);
        }
        /**
         * Writes data to socket.
         *
         * @param {Array} array of packets.
         * @api private
         */
        write(packets) {
            this.writable = false;
            // encodePacket efficient as it uses WS framing
            // no need for encodePayload
            for (let i = 0; i < packets.length; i++) {
                const packet = packets[i];
                const lastPacket = i === packets.length - 1;
                encodePacket(packet, this.supportsBinary, data => {
                    // always create a new object (GH-437)
                    const opts = {};
                    // Sometimes the websocket has already been closed but the browser didn't
                    // have a chance of informing us about it yet, in that case send will
                    // throw an error
                    try {
                        if (usingBrowserWebSocket) {
                            // TypeError is thrown when passing the second argument on Safari
                            this.ws.send(data);
                        }
                    }
                    catch (e) {
                    }
                    if (lastPacket) {
                        // fake drain
                        // defer to next tick to allow Socket to clear writeBuffer
                        nextTick(() => {
                            this.writable = true;
                            this.emit("drain");
                        }, this.setTimeoutFn);
                    }
                });
            }
        }
        /**
         * Closes socket.
         *
         * @api private
         */
        doClose() {
            if (typeof this.ws !== "undefined") {
                this.ws.close();
                this.ws = null;
            }
        }
        /**
         * Generates uri for connection.
         *
         * @api private
         */
        uri() {
            let query = this.query || {};
            const schema = this.opts.secure ? "wss" : "ws";
            let port = "";
            // avoid port if default for schema
            if (this.opts.port &&
                (("wss" === schema && Number(this.opts.port) !== 443) ||
                    ("ws" === schema && Number(this.opts.port) !== 80))) {
                port = ":" + this.opts.port;
            }
            // append timestamp to URI
            if (this.opts.timestampRequests) {
                query[this.opts.timestampParam] = yeast_1();
            }
            // communicate binary support capabilities
            if (!this.supportsBinary) {
                query.b64 = 1;
            }
            const encodedQuery = parseqs.encode(query);
            const ipv6 = this.opts.hostname.indexOf(":") !== -1;
            return (schema +
                "://" +
                (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) +
                port +
                this.opts.path +
                (encodedQuery.length ? "?" + encodedQuery : ""));
        }
        /**
         * Feature detection for WebSocket.
         *
         * @return {Boolean} whether this transport is available.
         * @api public
         */
        check() {
            return (!!WebSocket &&
                !("__initialize" in WebSocket && this.name === WS.prototype.name));
        }
    }

    const transports = {
        websocket: WS,
        polling: XHR
    };

    class Socket$1 extends Emitter_1 {
        /**
         * Socket constructor.
         *
         * @param {String|Object} uri or options
         * @param {Object} opts - options
         * @api public
         */
        constructor(uri, opts = {}) {
            super();
            if (uri && "object" === typeof uri) {
                opts = uri;
                uri = null;
            }
            if (uri) {
                uri = parseuri(uri);
                opts.hostname = uri.host;
                opts.secure = uri.protocol === "https" || uri.protocol === "wss";
                opts.port = uri.port;
                if (uri.query)
                    opts.query = uri.query;
            }
            else if (opts.host) {
                opts.hostname = parseuri(opts.host).host;
            }
            installTimerFunctions(this, opts);
            this.secure =
                null != opts.secure
                    ? opts.secure
                    : typeof location !== "undefined" && "https:" === location.protocol;
            if (opts.hostname && !opts.port) {
                // if no port is specified manually, use the protocol default
                opts.port = this.secure ? "443" : "80";
            }
            this.hostname =
                opts.hostname ||
                    (typeof location !== "undefined" ? location.hostname : "localhost");
            this.port =
                opts.port ||
                    (typeof location !== "undefined" && location.port
                        ? location.port
                        : this.secure
                            ? "443"
                            : "80");
            this.transports = opts.transports || ["polling", "websocket"];
            this.readyState = "";
            this.writeBuffer = [];
            this.prevBufferLen = 0;
            this.opts = Object.assign({
                path: "/engine.io",
                agent: false,
                withCredentials: false,
                upgrade: true,
                timestampParam: "t",
                rememberUpgrade: false,
                rejectUnauthorized: true,
                perMessageDeflate: {
                    threshold: 1024
                },
                transportOptions: {},
                closeOnBeforeunload: true
            }, opts);
            this.opts.path = this.opts.path.replace(/\/$/, "") + "/";
            if (typeof this.opts.query === "string") {
                this.opts.query = parseqs.decode(this.opts.query);
            }
            // set on handshake
            this.id = null;
            this.upgrades = null;
            this.pingInterval = null;
            this.pingTimeout = null;
            // set on heartbeat
            this.pingTimeoutTimer = null;
            if (typeof addEventListener === "function") {
                if (this.opts.closeOnBeforeunload) {
                    // Firefox closes the connection when the "beforeunload" event is emitted but not Chrome. This event listener
                    // ensures every browser behaves the same (no "disconnect" event at the Socket.IO level when the page is
                    // closed/reloaded)
                    addEventListener("beforeunload", () => {
                        if (this.transport) {
                            // silently close the transport
                            this.transport.removeAllListeners();
                            this.transport.close();
                        }
                    }, false);
                }
                if (this.hostname !== "localhost") {
                    this.offlineEventListener = () => {
                        this.onClose("transport close");
                    };
                    addEventListener("offline", this.offlineEventListener, false);
                }
            }
            this.open();
        }
        /**
         * Creates transport of the given type.
         *
         * @param {String} transport name
         * @return {Transport}
         * @api private
         */
        createTransport(name) {
            const query = clone(this.opts.query);
            // append engine.io protocol identifier
            query.EIO = protocol$1;
            // transport name
            query.transport = name;
            // session id if we already have one
            if (this.id)
                query.sid = this.id;
            const opts = Object.assign({}, this.opts.transportOptions[name], this.opts, {
                query,
                socket: this,
                hostname: this.hostname,
                secure: this.secure,
                port: this.port
            });
            return new transports[name](opts);
        }
        /**
         * Initializes transport to use and starts probe.
         *
         * @api private
         */
        open() {
            let transport;
            if (this.opts.rememberUpgrade &&
                Socket$1.priorWebsocketSuccess &&
                this.transports.indexOf("websocket") !== -1) {
                transport = "websocket";
            }
            else if (0 === this.transports.length) {
                // Emit error on next tick so it can be listened to
                this.setTimeoutFn(() => {
                    this.emitReserved("error", "No transports available");
                }, 0);
                return;
            }
            else {
                transport = this.transports[0];
            }
            this.readyState = "opening";
            // Retry with the next transport if the transport is disabled (jsonp: false)
            try {
                transport = this.createTransport(transport);
            }
            catch (e) {
                this.transports.shift();
                this.open();
                return;
            }
            transport.open();
            this.setTransport(transport);
        }
        /**
         * Sets the current transport. Disables the existing one (if any).
         *
         * @api private
         */
        setTransport(transport) {
            if (this.transport) {
                this.transport.removeAllListeners();
            }
            // set up transport
            this.transport = transport;
            // set up transport listeners
            transport
                .on("drain", this.onDrain.bind(this))
                .on("packet", this.onPacket.bind(this))
                .on("error", this.onError.bind(this))
                .on("close", () => {
                this.onClose("transport close");
            });
        }
        /**
         * Probes a transport.
         *
         * @param {String} transport name
         * @api private
         */
        probe(name) {
            let transport = this.createTransport(name);
            let failed = false;
            Socket$1.priorWebsocketSuccess = false;
            const onTransportOpen = () => {
                if (failed)
                    return;
                transport.send([{ type: "ping", data: "probe" }]);
                transport.once("packet", msg => {
                    if (failed)
                        return;
                    if ("pong" === msg.type && "probe" === msg.data) {
                        this.upgrading = true;
                        this.emitReserved("upgrading", transport);
                        if (!transport)
                            return;
                        Socket$1.priorWebsocketSuccess = "websocket" === transport.name;
                        this.transport.pause(() => {
                            if (failed)
                                return;
                            if ("closed" === this.readyState)
                                return;
                            cleanup();
                            this.setTransport(transport);
                            transport.send([{ type: "upgrade" }]);
                            this.emitReserved("upgrade", transport);
                            transport = null;
                            this.upgrading = false;
                            this.flush();
                        });
                    }
                    else {
                        const err = new Error("probe error");
                        // @ts-ignore
                        err.transport = transport.name;
                        this.emitReserved("upgradeError", err);
                    }
                });
            };
            function freezeTransport() {
                if (failed)
                    return;
                // Any callback called by transport should be ignored since now
                failed = true;
                cleanup();
                transport.close();
                transport = null;
            }
            // Handle any error that happens while probing
            const onerror = err => {
                const error = new Error("probe error: " + err);
                // @ts-ignore
                error.transport = transport.name;
                freezeTransport();
                this.emitReserved("upgradeError", error);
            };
            function onTransportClose() {
                onerror("transport closed");
            }
            // When the socket is closed while we're probing
            function onclose() {
                onerror("socket closed");
            }
            // When the socket is upgraded while we're probing
            function onupgrade(to) {
                if (transport && to.name !== transport.name) {
                    freezeTransport();
                }
            }
            // Remove all listeners on the transport and on self
            const cleanup = () => {
                transport.removeListener("open", onTransportOpen);
                transport.removeListener("error", onerror);
                transport.removeListener("close", onTransportClose);
                this.off("close", onclose);
                this.off("upgrading", onupgrade);
            };
            transport.once("open", onTransportOpen);
            transport.once("error", onerror);
            transport.once("close", onTransportClose);
            this.once("close", onclose);
            this.once("upgrading", onupgrade);
            transport.open();
        }
        /**
         * Called when connection is deemed open.
         *
         * @api private
         */
        onOpen() {
            this.readyState = "open";
            Socket$1.priorWebsocketSuccess = "websocket" === this.transport.name;
            this.emitReserved("open");
            this.flush();
            // we check for `readyState` in case an `open`
            // listener already closed the socket
            if ("open" === this.readyState &&
                this.opts.upgrade &&
                this.transport.pause) {
                let i = 0;
                const l = this.upgrades.length;
                for (; i < l; i++) {
                    this.probe(this.upgrades[i]);
                }
            }
        }
        /**
         * Handles a packet.
         *
         * @api private
         */
        onPacket(packet) {
            if ("opening" === this.readyState ||
                "open" === this.readyState ||
                "closing" === this.readyState) {
                this.emitReserved("packet", packet);
                // Socket is live - any packet counts
                this.emitReserved("heartbeat");
                switch (packet.type) {
                    case "open":
                        this.onHandshake(JSON.parse(packet.data));
                        break;
                    case "ping":
                        this.resetPingTimeout();
                        this.sendPacket("pong");
                        this.emitReserved("ping");
                        this.emitReserved("pong");
                        break;
                    case "error":
                        const err = new Error("server error");
                        // @ts-ignore
                        err.code = packet.data;
                        this.onError(err);
                        break;
                    case "message":
                        this.emitReserved("data", packet.data);
                        this.emitReserved("message", packet.data);
                        break;
                }
            }
        }
        /**
         * Called upon handshake completion.
         *
         * @param {Object} data - handshake obj
         * @api private
         */
        onHandshake(data) {
            this.emitReserved("handshake", data);
            this.id = data.sid;
            this.transport.query.sid = data.sid;
            this.upgrades = this.filterUpgrades(data.upgrades);
            this.pingInterval = data.pingInterval;
            this.pingTimeout = data.pingTimeout;
            this.onOpen();
            // In case open handler closes socket
            if ("closed" === this.readyState)
                return;
            this.resetPingTimeout();
        }
        /**
         * Sets and resets ping timeout timer based on server pings.
         *
         * @api private
         */
        resetPingTimeout() {
            this.clearTimeoutFn(this.pingTimeoutTimer);
            this.pingTimeoutTimer = this.setTimeoutFn(() => {
                this.onClose("ping timeout");
            }, this.pingInterval + this.pingTimeout);
            if (this.opts.autoUnref) {
                this.pingTimeoutTimer.unref();
            }
        }
        /**
         * Called on `drain` event
         *
         * @api private
         */
        onDrain() {
            this.writeBuffer.splice(0, this.prevBufferLen);
            // setting prevBufferLen = 0 is very important
            // for example, when upgrading, upgrade packet is sent over,
            // and a nonzero prevBufferLen could cause problems on `drain`
            this.prevBufferLen = 0;
            if (0 === this.writeBuffer.length) {
                this.emitReserved("drain");
            }
            else {
                this.flush();
            }
        }
        /**
         * Flush write buffers.
         *
         * @api private
         */
        flush() {
            if ("closed" !== this.readyState &&
                this.transport.writable &&
                !this.upgrading &&
                this.writeBuffer.length) {
                this.transport.send(this.writeBuffer);
                // keep track of current length of writeBuffer
                // splice writeBuffer and callbackBuffer on `drain`
                this.prevBufferLen = this.writeBuffer.length;
                this.emitReserved("flush");
            }
        }
        /**
         * Sends a message.
         *
         * @param {String} message.
         * @param {Function} callback function.
         * @param {Object} options.
         * @return {Socket} for chaining.
         * @api public
         */
        write(msg, options, fn) {
            this.sendPacket("message", msg, options, fn);
            return this;
        }
        send(msg, options, fn) {
            this.sendPacket("message", msg, options, fn);
            return this;
        }
        /**
         * Sends a packet.
         *
         * @param {String} packet type.
         * @param {String} data.
         * @param {Object} options.
         * @param {Function} callback function.
         * @api private
         */
        sendPacket(type, data, options, fn) {
            if ("function" === typeof data) {
                fn = data;
                data = undefined;
            }
            if ("function" === typeof options) {
                fn = options;
                options = null;
            }
            if ("closing" === this.readyState || "closed" === this.readyState) {
                return;
            }
            options = options || {};
            options.compress = false !== options.compress;
            const packet = {
                type: type,
                data: data,
                options: options
            };
            this.emitReserved("packetCreate", packet);
            this.writeBuffer.push(packet);
            if (fn)
                this.once("flush", fn);
            this.flush();
        }
        /**
         * Closes the connection.
         *
         * @api public
         */
        close() {
            const close = () => {
                this.onClose("forced close");
                this.transport.close();
            };
            const cleanupAndClose = () => {
                this.off("upgrade", cleanupAndClose);
                this.off("upgradeError", cleanupAndClose);
                close();
            };
            const waitForUpgrade = () => {
                // wait for upgrade to finish since we can't send packets while pausing a transport
                this.once("upgrade", cleanupAndClose);
                this.once("upgradeError", cleanupAndClose);
            };
            if ("opening" === this.readyState || "open" === this.readyState) {
                this.readyState = "closing";
                if (this.writeBuffer.length) {
                    this.once("drain", () => {
                        if (this.upgrading) {
                            waitForUpgrade();
                        }
                        else {
                            close();
                        }
                    });
                }
                else if (this.upgrading) {
                    waitForUpgrade();
                }
                else {
                    close();
                }
            }
            return this;
        }
        /**
         * Called upon transport error
         *
         * @api private
         */
        onError(err) {
            Socket$1.priorWebsocketSuccess = false;
            this.emitReserved("error", err);
            this.onClose("transport error", err);
        }
        /**
         * Called upon transport close.
         *
         * @api private
         */
        onClose(reason, desc) {
            if ("opening" === this.readyState ||
                "open" === this.readyState ||
                "closing" === this.readyState) {
                // clear timers
                this.clearTimeoutFn(this.pingTimeoutTimer);
                // stop event from firing again for transport
                this.transport.removeAllListeners("close");
                // ensure transport won't stay open
                this.transport.close();
                // ignore further transport communication
                this.transport.removeAllListeners();
                if (typeof removeEventListener === "function") {
                    removeEventListener("offline", this.offlineEventListener, false);
                }
                // set ready state
                this.readyState = "closed";
                // clear session id
                this.id = null;
                // emit close event
                this.emitReserved("close", reason, desc);
                // clean buffers after, so users can still
                // grab the buffers on `close` event
                this.writeBuffer = [];
                this.prevBufferLen = 0;
            }
        }
        /**
         * Filters upgrades, returning only those matching client transports.
         *
         * @param {Array} server upgrades
         * @api private
         *
         */
        filterUpgrades(upgrades) {
            const filteredUpgrades = [];
            let i = 0;
            const j = upgrades.length;
            for (; i < j; i++) {
                if (~this.transports.indexOf(upgrades[i]))
                    filteredUpgrades.push(upgrades[i]);
            }
            return filteredUpgrades;
        }
    }
    Socket$1.protocol = protocol$1;
    function clone(obj) {
        const o = {};
        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                o[i] = obj[i];
            }
        }
        return o;
    }

    const withNativeArrayBuffer = typeof ArrayBuffer === "function";
    const isView = (obj) => {
        return typeof ArrayBuffer.isView === "function"
            ? ArrayBuffer.isView(obj)
            : obj.buffer instanceof ArrayBuffer;
    };
    const toString = Object.prototype.toString;
    const withNativeBlob = typeof Blob === "function" ||
        (typeof Blob !== "undefined" &&
            toString.call(Blob) === "[object BlobConstructor]");
    const withNativeFile = typeof File === "function" ||
        (typeof File !== "undefined" &&
            toString.call(File) === "[object FileConstructor]");
    /**
     * Returns true if obj is a Buffer, an ArrayBuffer, a Blob or a File.
     *
     * @private
     */
    function isBinary(obj) {
        return ((withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj))) ||
            (withNativeBlob && obj instanceof Blob) ||
            (withNativeFile && obj instanceof File));
    }
    function hasBinary(obj, toJSON) {
        if (!obj || typeof obj !== "object") {
            return false;
        }
        if (Array.isArray(obj)) {
            for (let i = 0, l = obj.length; i < l; i++) {
                if (hasBinary(obj[i])) {
                    return true;
                }
            }
            return false;
        }
        if (isBinary(obj)) {
            return true;
        }
        if (obj.toJSON &&
            typeof obj.toJSON === "function" &&
            arguments.length === 1) {
            return hasBinary(obj.toJSON(), true);
        }
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Replaces every Buffer | ArrayBuffer | Blob | File in packet with a numbered placeholder.
     *
     * @param {Object} packet - socket.io event packet
     * @return {Object} with deconstructed packet and list of buffers
     * @public
     */
    function deconstructPacket(packet) {
        const buffers = [];
        const packetData = packet.data;
        const pack = packet;
        pack.data = _deconstructPacket(packetData, buffers);
        pack.attachments = buffers.length; // number of binary 'attachments'
        return { packet: pack, buffers: buffers };
    }
    function _deconstructPacket(data, buffers) {
        if (!data)
            return data;
        if (isBinary(data)) {
            const placeholder = { _placeholder: true, num: buffers.length };
            buffers.push(data);
            return placeholder;
        }
        else if (Array.isArray(data)) {
            const newData = new Array(data.length);
            for (let i = 0; i < data.length; i++) {
                newData[i] = _deconstructPacket(data[i], buffers);
            }
            return newData;
        }
        else if (typeof data === "object" && !(data instanceof Date)) {
            const newData = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    newData[key] = _deconstructPacket(data[key], buffers);
                }
            }
            return newData;
        }
        return data;
    }
    /**
     * Reconstructs a binary packet from its placeholder packet and buffers
     *
     * @param {Object} packet - event packet with placeholders
     * @param {Array} buffers - binary buffers to put in placeholder positions
     * @return {Object} reconstructed packet
     * @public
     */
    function reconstructPacket(packet, buffers) {
        packet.data = _reconstructPacket(packet.data, buffers);
        packet.attachments = undefined; // no longer useful
        return packet;
    }
    function _reconstructPacket(data, buffers) {
        if (!data)
            return data;
        if (data && data._placeholder) {
            return buffers[data.num]; // appropriate buffer (should be natural order anyway)
        }
        else if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                data[i] = _reconstructPacket(data[i], buffers);
            }
        }
        else if (typeof data === "object") {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    data[key] = _reconstructPacket(data[key], buffers);
                }
            }
        }
        return data;
    }

    /**
     * Protocol version.
     *
     * @public
     */
    const protocol = 5;
    var PacketType;
    (function (PacketType) {
        PacketType[PacketType["CONNECT"] = 0] = "CONNECT";
        PacketType[PacketType["DISCONNECT"] = 1] = "DISCONNECT";
        PacketType[PacketType["EVENT"] = 2] = "EVENT";
        PacketType[PacketType["ACK"] = 3] = "ACK";
        PacketType[PacketType["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
        PacketType[PacketType["BINARY_EVENT"] = 5] = "BINARY_EVENT";
        PacketType[PacketType["BINARY_ACK"] = 6] = "BINARY_ACK";
    })(PacketType || (PacketType = {}));
    /**
     * A socket.io Encoder instance
     */
    class Encoder {
        /**
         * Encode a packet as a single string if non-binary, or as a
         * buffer sequence, depending on packet type.
         *
         * @param {Object} obj - packet object
         */
        encode(obj) {
            if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
                if (hasBinary(obj)) {
                    obj.type =
                        obj.type === PacketType.EVENT
                            ? PacketType.BINARY_EVENT
                            : PacketType.BINARY_ACK;
                    return this.encodeAsBinary(obj);
                }
            }
            return [this.encodeAsString(obj)];
        }
        /**
         * Encode packet as string.
         */
        encodeAsString(obj) {
            // first is type
            let str = "" + obj.type;
            // attachments if we have them
            if (obj.type === PacketType.BINARY_EVENT ||
                obj.type === PacketType.BINARY_ACK) {
                str += obj.attachments + "-";
            }
            // if we have a namespace other than `/`
            // we append it followed by a comma `,`
            if (obj.nsp && "/" !== obj.nsp) {
                str += obj.nsp + ",";
            }
            // immediately followed by the id
            if (null != obj.id) {
                str += obj.id;
            }
            // json data
            if (null != obj.data) {
                str += JSON.stringify(obj.data);
            }
            return str;
        }
        /**
         * Encode packet as 'buffer sequence' by removing blobs, and
         * deconstructing packet into object with placeholders and
         * a list of buffers.
         */
        encodeAsBinary(obj) {
            const deconstruction = deconstructPacket(obj);
            const pack = this.encodeAsString(deconstruction.packet);
            const buffers = deconstruction.buffers;
            buffers.unshift(pack); // add packet info to beginning of data list
            return buffers; // write all the buffers
        }
    }
    /**
     * A socket.io Decoder instance
     *
     * @return {Object} decoder
     */
    class Decoder extends Emitter_1 {
        constructor() {
            super();
        }
        /**
         * Decodes an encoded packet string into packet JSON.
         *
         * @param {String} obj - encoded packet
         */
        add(obj) {
            let packet;
            if (typeof obj === "string") {
                packet = this.decodeString(obj);
                if (packet.type === PacketType.BINARY_EVENT ||
                    packet.type === PacketType.BINARY_ACK) {
                    // binary packet's json
                    this.reconstructor = new BinaryReconstructor(packet);
                    // no attachments, labeled binary but no binary data to follow
                    if (packet.attachments === 0) {
                        super.emitReserved("decoded", packet);
                    }
                }
                else {
                    // non-binary full packet
                    super.emitReserved("decoded", packet);
                }
            }
            else if (isBinary(obj) || obj.base64) {
                // raw binary data
                if (!this.reconstructor) {
                    throw new Error("got binary data when not reconstructing a packet");
                }
                else {
                    packet = this.reconstructor.takeBinaryData(obj);
                    if (packet) {
                        // received final buffer
                        this.reconstructor = null;
                        super.emitReserved("decoded", packet);
                    }
                }
            }
            else {
                throw new Error("Unknown type: " + obj);
            }
        }
        /**
         * Decode a packet String (JSON data)
         *
         * @param {String} str
         * @return {Object} packet
         */
        decodeString(str) {
            let i = 0;
            // look up type
            const p = {
                type: Number(str.charAt(0)),
            };
            if (PacketType[p.type] === undefined) {
                throw new Error("unknown packet type " + p.type);
            }
            // look up attachments if type binary
            if (p.type === PacketType.BINARY_EVENT ||
                p.type === PacketType.BINARY_ACK) {
                const start = i + 1;
                while (str.charAt(++i) !== "-" && i != str.length) { }
                const buf = str.substring(start, i);
                if (buf != Number(buf) || str.charAt(i) !== "-") {
                    throw new Error("Illegal attachments");
                }
                p.attachments = Number(buf);
            }
            // look up namespace (if any)
            if ("/" === str.charAt(i + 1)) {
                const start = i + 1;
                while (++i) {
                    const c = str.charAt(i);
                    if ("," === c)
                        break;
                    if (i === str.length)
                        break;
                }
                p.nsp = str.substring(start, i);
            }
            else {
                p.nsp = "/";
            }
            // look up id
            const next = str.charAt(i + 1);
            if ("" !== next && Number(next) == next) {
                const start = i + 1;
                while (++i) {
                    const c = str.charAt(i);
                    if (null == c || Number(c) != c) {
                        --i;
                        break;
                    }
                    if (i === str.length)
                        break;
                }
                p.id = Number(str.substring(start, i + 1));
            }
            // look up json data
            if (str.charAt(++i)) {
                const payload = tryParse(str.substr(i));
                if (Decoder.isPayloadValid(p.type, payload)) {
                    p.data = payload;
                }
                else {
                    throw new Error("invalid payload");
                }
            }
            return p;
        }
        static isPayloadValid(type, payload) {
            switch (type) {
                case PacketType.CONNECT:
                    return typeof payload === "object";
                case PacketType.DISCONNECT:
                    return payload === undefined;
                case PacketType.CONNECT_ERROR:
                    return typeof payload === "string" || typeof payload === "object";
                case PacketType.EVENT:
                case PacketType.BINARY_EVENT:
                    return Array.isArray(payload) && payload.length > 0;
                case PacketType.ACK:
                case PacketType.BINARY_ACK:
                    return Array.isArray(payload);
            }
        }
        /**
         * Deallocates a parser's resources
         */
        destroy() {
            if (this.reconstructor) {
                this.reconstructor.finishedReconstruction();
            }
        }
    }
    function tryParse(str) {
        try {
            return JSON.parse(str);
        }
        catch (e) {
            return false;
        }
    }
    /**
     * A manager of a binary event's 'buffer sequence'. Should
     * be constructed whenever a packet of type BINARY_EVENT is
     * decoded.
     *
     * @param {Object} packet
     * @return {BinaryReconstructor} initialized reconstructor
     */
    class BinaryReconstructor {
        constructor(packet) {
            this.packet = packet;
            this.buffers = [];
            this.reconPack = packet;
        }
        /**
         * Method to be called when binary data received from connection
         * after a BINARY_EVENT packet.
         *
         * @param {Buffer | ArrayBuffer} binData - the raw binary data received
         * @return {null | Object} returns null if more binary data is expected or
         *   a reconstructed packet object if all buffers have been received.
         */
        takeBinaryData(binData) {
            this.buffers.push(binData);
            if (this.buffers.length === this.reconPack.attachments) {
                // done with buffer list
                const packet = reconstructPacket(this.reconPack, this.buffers);
                this.finishedReconstruction();
                return packet;
            }
            return null;
        }
        /**
         * Cleans up binary packet reconstruction variables.
         */
        finishedReconstruction() {
            this.reconPack = null;
            this.buffers = [];
        }
    }

    var parser = /*#__PURE__*/Object.freeze({
        __proto__: null,
        protocol: protocol,
        get PacketType () { return PacketType; },
        Encoder: Encoder,
        Decoder: Decoder
    });

    function on(obj, ev, fn) {
        obj.on(ev, fn);
        return function subDestroy() {
            obj.off(ev, fn);
        };
    }

    /**
     * Internal events.
     * These events can't be emitted by the user.
     */
    const RESERVED_EVENTS = Object.freeze({
        connect: 1,
        connect_error: 1,
        disconnect: 1,
        disconnecting: 1,
        // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
        newListener: 1,
        removeListener: 1,
    });
    class Socket extends Emitter_1 {
        /**
         * `Socket` constructor.
         *
         * @public
         */
        constructor(io, nsp, opts) {
            super();
            this.connected = false;
            this.disconnected = true;
            this.receiveBuffer = [];
            this.sendBuffer = [];
            this.ids = 0;
            this.acks = {};
            this.flags = {};
            this.io = io;
            this.nsp = nsp;
            if (opts && opts.auth) {
                this.auth = opts.auth;
            }
            if (this.io._autoConnect)
                this.open();
        }
        /**
         * Subscribe to open, close and packet events
         *
         * @private
         */
        subEvents() {
            if (this.subs)
                return;
            const io = this.io;
            this.subs = [
                on(io, "open", this.onopen.bind(this)),
                on(io, "packet", this.onpacket.bind(this)),
                on(io, "error", this.onerror.bind(this)),
                on(io, "close", this.onclose.bind(this)),
            ];
        }
        /**
         * Whether the Socket will try to reconnect when its Manager connects or reconnects
         */
        get active() {
            return !!this.subs;
        }
        /**
         * "Opens" the socket.
         *
         * @public
         */
        connect() {
            if (this.connected)
                return this;
            this.subEvents();
            if (!this.io["_reconnecting"])
                this.io.open(); // ensure open
            if ("open" === this.io._readyState)
                this.onopen();
            return this;
        }
        /**
         * Alias for connect()
         */
        open() {
            return this.connect();
        }
        /**
         * Sends a `message` event.
         *
         * @return self
         * @public
         */
        send(...args) {
            args.unshift("message");
            this.emit.apply(this, args);
            return this;
        }
        /**
         * Override `emit`.
         * If the event is in `events`, it's emitted normally.
         *
         * @return self
         * @public
         */
        emit(ev, ...args) {
            if (RESERVED_EVENTS.hasOwnProperty(ev)) {
                throw new Error('"' + ev + '" is a reserved event name');
            }
            args.unshift(ev);
            const packet = {
                type: PacketType.EVENT,
                data: args,
            };
            packet.options = {};
            packet.options.compress = this.flags.compress !== false;
            // event ack callback
            if ("function" === typeof args[args.length - 1]) {
                const id = this.ids++;
                const ack = args.pop();
                this._registerAckCallback(id, ack);
                packet.id = id;
            }
            const isTransportWritable = this.io.engine &&
                this.io.engine.transport &&
                this.io.engine.transport.writable;
            const discardPacket = this.flags.volatile && (!isTransportWritable || !this.connected);
            if (discardPacket) ;
            else if (this.connected) {
                this.packet(packet);
            }
            else {
                this.sendBuffer.push(packet);
            }
            this.flags = {};
            return this;
        }
        /**
         * @private
         */
        _registerAckCallback(id, ack) {
            const timeout = this.flags.timeout;
            if (timeout === undefined) {
                this.acks[id] = ack;
                return;
            }
            // @ts-ignore
            const timer = this.io.setTimeoutFn(() => {
                delete this.acks[id];
                for (let i = 0; i < this.sendBuffer.length; i++) {
                    if (this.sendBuffer[i].id === id) {
                        this.sendBuffer.splice(i, 1);
                    }
                }
                ack.call(this, new Error("operation has timed out"));
            }, timeout);
            this.acks[id] = (...args) => {
                // @ts-ignore
                this.io.clearTimeoutFn(timer);
                ack.apply(this, [null, ...args]);
            };
        }
        /**
         * Sends a packet.
         *
         * @param packet
         * @private
         */
        packet(packet) {
            packet.nsp = this.nsp;
            this.io._packet(packet);
        }
        /**
         * Called upon engine `open`.
         *
         * @private
         */
        onopen() {
            if (typeof this.auth == "function") {
                this.auth((data) => {
                    this.packet({ type: PacketType.CONNECT, data });
                });
            }
            else {
                this.packet({ type: PacketType.CONNECT, data: this.auth });
            }
        }
        /**
         * Called upon engine or manager `error`.
         *
         * @param err
         * @private
         */
        onerror(err) {
            if (!this.connected) {
                this.emitReserved("connect_error", err);
            }
        }
        /**
         * Called upon engine `close`.
         *
         * @param reason
         * @private
         */
        onclose(reason) {
            this.connected = false;
            this.disconnected = true;
            delete this.id;
            this.emitReserved("disconnect", reason);
        }
        /**
         * Called with socket packet.
         *
         * @param packet
         * @private
         */
        onpacket(packet) {
            const sameNamespace = packet.nsp === this.nsp;
            if (!sameNamespace)
                return;
            switch (packet.type) {
                case PacketType.CONNECT:
                    if (packet.data && packet.data.sid) {
                        const id = packet.data.sid;
                        this.onconnect(id);
                    }
                    else {
                        this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
                    }
                    break;
                case PacketType.EVENT:
                    this.onevent(packet);
                    break;
                case PacketType.BINARY_EVENT:
                    this.onevent(packet);
                    break;
                case PacketType.ACK:
                    this.onack(packet);
                    break;
                case PacketType.BINARY_ACK:
                    this.onack(packet);
                    break;
                case PacketType.DISCONNECT:
                    this.ondisconnect();
                    break;
                case PacketType.CONNECT_ERROR:
                    this.destroy();
                    const err = new Error(packet.data.message);
                    // @ts-ignore
                    err.data = packet.data.data;
                    this.emitReserved("connect_error", err);
                    break;
            }
        }
        /**
         * Called upon a server event.
         *
         * @param packet
         * @private
         */
        onevent(packet) {
            const args = packet.data || [];
            if (null != packet.id) {
                args.push(this.ack(packet.id));
            }
            if (this.connected) {
                this.emitEvent(args);
            }
            else {
                this.receiveBuffer.push(Object.freeze(args));
            }
        }
        emitEvent(args) {
            if (this._anyListeners && this._anyListeners.length) {
                const listeners = this._anyListeners.slice();
                for (const listener of listeners) {
                    listener.apply(this, args);
                }
            }
            super.emit.apply(this, args);
        }
        /**
         * Produces an ack callback to emit with an event.
         *
         * @private
         */
        ack(id) {
            const self = this;
            let sent = false;
            return function (...args) {
                // prevent double callbacks
                if (sent)
                    return;
                sent = true;
                self.packet({
                    type: PacketType.ACK,
                    id: id,
                    data: args,
                });
            };
        }
        /**
         * Called upon a server acknowlegement.
         *
         * @param packet
         * @private
         */
        onack(packet) {
            const ack = this.acks[packet.id];
            if ("function" === typeof ack) {
                ack.apply(this, packet.data);
                delete this.acks[packet.id];
            }
        }
        /**
         * Called upon server connect.
         *
         * @private
         */
        onconnect(id) {
            this.id = id;
            this.connected = true;
            this.disconnected = false;
            this.emitBuffered();
            this.emitReserved("connect");
        }
        /**
         * Emit buffered events (received and emitted).
         *
         * @private
         */
        emitBuffered() {
            this.receiveBuffer.forEach((args) => this.emitEvent(args));
            this.receiveBuffer = [];
            this.sendBuffer.forEach((packet) => this.packet(packet));
            this.sendBuffer = [];
        }
        /**
         * Called upon server disconnect.
         *
         * @private
         */
        ondisconnect() {
            this.destroy();
            this.onclose("io server disconnect");
        }
        /**
         * Called upon forced client/server side disconnections,
         * this method ensures the manager stops tracking us and
         * that reconnections don't get triggered for this.
         *
         * @private
         */
        destroy() {
            if (this.subs) {
                // clean subscriptions to avoid reconnections
                this.subs.forEach((subDestroy) => subDestroy());
                this.subs = undefined;
            }
            this.io["_destroy"](this);
        }
        /**
         * Disconnects the socket manually.
         *
         * @return self
         * @public
         */
        disconnect() {
            if (this.connected) {
                this.packet({ type: PacketType.DISCONNECT });
            }
            // remove socket from pool
            this.destroy();
            if (this.connected) {
                // fire events
                this.onclose("io client disconnect");
            }
            return this;
        }
        /**
         * Alias for disconnect()
         *
         * @return self
         * @public
         */
        close() {
            return this.disconnect();
        }
        /**
         * Sets the compress flag.
         *
         * @param compress - if `true`, compresses the sending data
         * @return self
         * @public
         */
        compress(compress) {
            this.flags.compress = compress;
            return this;
        }
        /**
         * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
         * ready to send messages.
         *
         * @returns self
         * @public
         */
        get volatile() {
            this.flags.volatile = true;
            return this;
        }
        /**
         * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
         * given number of milliseconds have elapsed without an acknowledgement from the server:
         *
         * ```
         * socket.timeout(5000).emit("my-event", (err) => {
         *   if (err) {
         *     // the server did not acknowledge the event in the given delay
         *   }
         * });
         * ```
         *
         * @returns self
         * @public
         */
        timeout(timeout) {
            this.flags.timeout = timeout;
            return this;
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback.
         *
         * @param listener
         * @public
         */
        onAny(listener) {
            this._anyListeners = this._anyListeners || [];
            this._anyListeners.push(listener);
            return this;
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback. The listener is added to the beginning of the listeners array.
         *
         * @param listener
         * @public
         */
        prependAny(listener) {
            this._anyListeners = this._anyListeners || [];
            this._anyListeners.unshift(listener);
            return this;
        }
        /**
         * Removes the listener that will be fired when any event is emitted.
         *
         * @param listener
         * @public
         */
        offAny(listener) {
            if (!this._anyListeners) {
                return this;
            }
            if (listener) {
                const listeners = this._anyListeners;
                for (let i = 0; i < listeners.length; i++) {
                    if (listener === listeners[i]) {
                        listeners.splice(i, 1);
                        return this;
                    }
                }
            }
            else {
                this._anyListeners = [];
            }
            return this;
        }
        /**
         * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
         * e.g. to remove listeners.
         *
         * @public
         */
        listenersAny() {
            return this._anyListeners || [];
        }
    }

    /**
     * Expose `Backoff`.
     */

    var backo2 = Backoff;

    /**
     * Initialize backoff timer with `opts`.
     *
     * - `min` initial timeout in milliseconds [100]
     * - `max` max timeout [10000]
     * - `jitter` [0]
     * - `factor` [2]
     *
     * @param {Object} opts
     * @api public
     */

    function Backoff(opts) {
      opts = opts || {};
      this.ms = opts.min || 100;
      this.max = opts.max || 10000;
      this.factor = opts.factor || 2;
      this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
      this.attempts = 0;
    }

    /**
     * Return the backoff duration.
     *
     * @return {Number}
     * @api public
     */

    Backoff.prototype.duration = function(){
      var ms = this.ms * Math.pow(this.factor, this.attempts++);
      if (this.jitter) {
        var rand =  Math.random();
        var deviation = Math.floor(rand * this.jitter * ms);
        ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
      }
      return Math.min(ms, this.max) | 0;
    };

    /**
     * Reset the number of attempts.
     *
     * @api public
     */

    Backoff.prototype.reset = function(){
      this.attempts = 0;
    };

    /**
     * Set the minimum duration
     *
     * @api public
     */

    Backoff.prototype.setMin = function(min){
      this.ms = min;
    };

    /**
     * Set the maximum duration
     *
     * @api public
     */

    Backoff.prototype.setMax = function(max){
      this.max = max;
    };

    /**
     * Set the jitter
     *
     * @api public
     */

    Backoff.prototype.setJitter = function(jitter){
      this.jitter = jitter;
    };

    class Manager extends Emitter_1 {
        constructor(uri, opts) {
            var _a;
            super();
            this.nsps = {};
            this.subs = [];
            if (uri && "object" === typeof uri) {
                opts = uri;
                uri = undefined;
            }
            opts = opts || {};
            opts.path = opts.path || "/socket.io";
            this.opts = opts;
            installTimerFunctions(this, opts);
            this.reconnection(opts.reconnection !== false);
            this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
            this.reconnectionDelay(opts.reconnectionDelay || 1000);
            this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
            this.randomizationFactor((_a = opts.randomizationFactor) !== null && _a !== void 0 ? _a : 0.5);
            this.backoff = new backo2({
                min: this.reconnectionDelay(),
                max: this.reconnectionDelayMax(),
                jitter: this.randomizationFactor(),
            });
            this.timeout(null == opts.timeout ? 20000 : opts.timeout);
            this._readyState = "closed";
            this.uri = uri;
            const _parser = opts.parser || parser;
            this.encoder = new _parser.Encoder();
            this.decoder = new _parser.Decoder();
            this._autoConnect = opts.autoConnect !== false;
            if (this._autoConnect)
                this.open();
        }
        reconnection(v) {
            if (!arguments.length)
                return this._reconnection;
            this._reconnection = !!v;
            return this;
        }
        reconnectionAttempts(v) {
            if (v === undefined)
                return this._reconnectionAttempts;
            this._reconnectionAttempts = v;
            return this;
        }
        reconnectionDelay(v) {
            var _a;
            if (v === undefined)
                return this._reconnectionDelay;
            this._reconnectionDelay = v;
            (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMin(v);
            return this;
        }
        randomizationFactor(v) {
            var _a;
            if (v === undefined)
                return this._randomizationFactor;
            this._randomizationFactor = v;
            (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setJitter(v);
            return this;
        }
        reconnectionDelayMax(v) {
            var _a;
            if (v === undefined)
                return this._reconnectionDelayMax;
            this._reconnectionDelayMax = v;
            (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMax(v);
            return this;
        }
        timeout(v) {
            if (!arguments.length)
                return this._timeout;
            this._timeout = v;
            return this;
        }
        /**
         * Starts trying to reconnect if reconnection is enabled and we have not
         * started reconnecting yet
         *
         * @private
         */
        maybeReconnectOnOpen() {
            // Only try to reconnect if it's the first time we're connecting
            if (!this._reconnecting &&
                this._reconnection &&
                this.backoff.attempts === 0) {
                // keeps reconnection from firing twice for the same reconnection loop
                this.reconnect();
            }
        }
        /**
         * Sets the current transport `socket`.
         *
         * @param {Function} fn - optional, callback
         * @return self
         * @public
         */
        open(fn) {
            if (~this._readyState.indexOf("open"))
                return this;
            this.engine = new Socket$1(this.uri, this.opts);
            const socket = this.engine;
            const self = this;
            this._readyState = "opening";
            this.skipReconnect = false;
            // emit `open`
            const openSubDestroy = on(socket, "open", function () {
                self.onopen();
                fn && fn();
            });
            // emit `error`
            const errorSub = on(socket, "error", (err) => {
                self.cleanup();
                self._readyState = "closed";
                this.emitReserved("error", err);
                if (fn) {
                    fn(err);
                }
                else {
                    // Only do this if there is no fn to handle the error
                    self.maybeReconnectOnOpen();
                }
            });
            if (false !== this._timeout) {
                const timeout = this._timeout;
                if (timeout === 0) {
                    openSubDestroy(); // prevents a race condition with the 'open' event
                }
                // set timer
                const timer = this.setTimeoutFn(() => {
                    openSubDestroy();
                    socket.close();
                    // @ts-ignore
                    socket.emit("error", new Error("timeout"));
                }, timeout);
                if (this.opts.autoUnref) {
                    timer.unref();
                }
                this.subs.push(function subDestroy() {
                    clearTimeout(timer);
                });
            }
            this.subs.push(openSubDestroy);
            this.subs.push(errorSub);
            return this;
        }
        /**
         * Alias for open()
         *
         * @return self
         * @public
         */
        connect(fn) {
            return this.open(fn);
        }
        /**
         * Called upon transport open.
         *
         * @private
         */
        onopen() {
            // clear old subs
            this.cleanup();
            // mark as open
            this._readyState = "open";
            this.emitReserved("open");
            // add new subs
            const socket = this.engine;
            this.subs.push(on(socket, "ping", this.onping.bind(this)), on(socket, "data", this.ondata.bind(this)), on(socket, "error", this.onerror.bind(this)), on(socket, "close", this.onclose.bind(this)), on(this.decoder, "decoded", this.ondecoded.bind(this)));
        }
        /**
         * Called upon a ping.
         *
         * @private
         */
        onping() {
            this.emitReserved("ping");
        }
        /**
         * Called with data.
         *
         * @private
         */
        ondata(data) {
            this.decoder.add(data);
        }
        /**
         * Called when parser fully decodes a packet.
         *
         * @private
         */
        ondecoded(packet) {
            this.emitReserved("packet", packet);
        }
        /**
         * Called upon socket error.
         *
         * @private
         */
        onerror(err) {
            this.emitReserved("error", err);
        }
        /**
         * Creates a new socket for the given `nsp`.
         *
         * @return {Socket}
         * @public
         */
        socket(nsp, opts) {
            let socket = this.nsps[nsp];
            if (!socket) {
                socket = new Socket(this, nsp, opts);
                this.nsps[nsp] = socket;
            }
            return socket;
        }
        /**
         * Called upon a socket close.
         *
         * @param socket
         * @private
         */
        _destroy(socket) {
            const nsps = Object.keys(this.nsps);
            for (const nsp of nsps) {
                const socket = this.nsps[nsp];
                if (socket.active) {
                    return;
                }
            }
            this._close();
        }
        /**
         * Writes a packet.
         *
         * @param packet
         * @private
         */
        _packet(packet) {
            const encodedPackets = this.encoder.encode(packet);
            for (let i = 0; i < encodedPackets.length; i++) {
                this.engine.write(encodedPackets[i], packet.options);
            }
        }
        /**
         * Clean up transport subscriptions and packet buffer.
         *
         * @private
         */
        cleanup() {
            this.subs.forEach((subDestroy) => subDestroy());
            this.subs.length = 0;
            this.decoder.destroy();
        }
        /**
         * Close the current socket.
         *
         * @private
         */
        _close() {
            this.skipReconnect = true;
            this._reconnecting = false;
            this.onclose("forced close");
            if (this.engine)
                this.engine.close();
        }
        /**
         * Alias for close()
         *
         * @private
         */
        disconnect() {
            return this._close();
        }
        /**
         * Called upon engine close.
         *
         * @private
         */
        onclose(reason) {
            this.cleanup();
            this.backoff.reset();
            this._readyState = "closed";
            this.emitReserved("close", reason);
            if (this._reconnection && !this.skipReconnect) {
                this.reconnect();
            }
        }
        /**
         * Attempt a reconnection.
         *
         * @private
         */
        reconnect() {
            if (this._reconnecting || this.skipReconnect)
                return this;
            const self = this;
            if (this.backoff.attempts >= this._reconnectionAttempts) {
                this.backoff.reset();
                this.emitReserved("reconnect_failed");
                this._reconnecting = false;
            }
            else {
                const delay = this.backoff.duration();
                this._reconnecting = true;
                const timer = this.setTimeoutFn(() => {
                    if (self.skipReconnect)
                        return;
                    this.emitReserved("reconnect_attempt", self.backoff.attempts);
                    // check again for the case socket closed in above events
                    if (self.skipReconnect)
                        return;
                    self.open((err) => {
                        if (err) {
                            self._reconnecting = false;
                            self.reconnect();
                            this.emitReserved("reconnect_error", err);
                        }
                        else {
                            self.onreconnect();
                        }
                    });
                }, delay);
                if (this.opts.autoUnref) {
                    timer.unref();
                }
                this.subs.push(function subDestroy() {
                    clearTimeout(timer);
                });
            }
        }
        /**
         * Called upon successful reconnect.
         *
         * @private
         */
        onreconnect() {
            const attempt = this.backoff.attempts;
            this._reconnecting = false;
            this.backoff.reset();
            this.emitReserved("reconnect", attempt);
        }
    }

    /**
     * Managers cache.
     */
    const cache = {};
    function lookup(uri, opts) {
        if (typeof uri === "object") {
            opts = uri;
            uri = undefined;
        }
        opts = opts || {};
        const parsed = url(uri, opts.path || "/socket.io");
        const source = parsed.source;
        const id = parsed.id;
        const path = parsed.path;
        const sameNamespace = cache[id] && path in cache[id]["nsps"];
        const newConnection = opts.forceNew ||
            opts["force new connection"] ||
            false === opts.multiplex ||
            sameNamespace;
        let io;
        if (newConnection) {
            io = new Manager(source, opts);
        }
        else {
            if (!cache[id]) {
                cache[id] = new Manager(source, opts);
            }
            io = cache[id];
        }
        if (parsed.query && !opts.query) {
            opts.query = parsed.queryKey;
        }
        return io.socket(parsed.path, opts);
    }
    // so that "lookup" can be used both as a function (e.g. `io(...)`) and as a
    // namespace (e.g. `io.connect(...)`), for backward compatibility
    Object.assign(lookup, {
        Manager,
        Socket,
        io: lookup,
        connect: lookup,
    });

    const socket = lookup("https://apiildaa.herokuapp.com");
    const sauvegarde = (joueur) => {

        socket.emit("sauvegarde", joueur);


    };
    // setContext("socket", socket);

    /* src\Chat.svelte generated by Svelte v3.46.2 */

    const { console: console_1$2 } = globals;
    const file$4 = "src\\Chat.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (96:8) {#each contenuchat as contenuchat}
    function create_each_block$1(ctx) {
    	let p;
    	let t_value = /*contenuchat*/ ctx[2] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "messagedechat svelte-15inzxi");
    			add_location(p, file$4, 96, 12, 2754);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*contenuchat*/ 4 && t_value !== (t_value = /*contenuchat*/ ctx[2] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(96:8) {#each contenuchat as contenuchat}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let input;
    	let t0;
    	let span;
    	let t2;
    	let div0;
    	let div1_class_value;
    	let t3;
    	let div2;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;
    	let each_value = /*contenuchat*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			input = element("input");
    			t0 = space();
    			span = element("span");
    			span.textContent = "X";
    			t2 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div2 = element("div");
    			img = element("img");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "chat");
    			attr_dev(input, "id", "input2");
    			attr_dev(input, "maxlength", "80");
    			attr_dev(input, "autocomplete", "off");
    			attr_dev(input, "onfocus", "this.placeholder=''");
    			attr_dev(input, "class", "svelte-15inzxi");
    			add_location(input, file$4, 58, 4, 1701);
    			attr_dev(span, "id", "fermer");
    			attr_dev(span, "class", "svelte-15inzxi");
    			add_location(span, file$4, 88, 4, 2547);
    			attr_dev(div0, "id", "containermessagechat");
    			attr_dev(div0, "class", "svelte-15inzxi");
    			add_location(div0, file$4, 94, 4, 2665);
    			attr_dev(div1, "id", "chat");
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*chatcacher*/ ctx[0] ? "menucache" : "") + " svelte-15inzxi"));
    			add_location(div1, file$4, 57, 0, 1642);
    			attr_dev(img, "alt", "");
    			if (!src_url_equal(img.src, img_src_value = "img/chat.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-15inzxi");
    			add_location(img, file$4, 101, 4, 2846);
    			add_location(div2, file$4, 100, 0, 2835);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, input);
    			append_dev(div1, t0);
    			append_dev(div1, span);
    			append_dev(div1, t2);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, img);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*keydown_handler*/ ctx[4], false, false, false),
    					listen_dev(window, "mousemoove", mousemoove_handler$2, false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_1*/ ctx[5], false, false, false),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[6], false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[7], false, false, false),
    					listen_dev(span, "click", /*click_handler*/ ctx[8], false, false, false),
    					listen_dev(img, "click", /*click_handler_1*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*contenuchat*/ 4) {
    				each_value = /*contenuchat*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*chatcacher*/ 1 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*chatcacher*/ ctx[0] ? "menucache" : "") + " svelte-15inzxi"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
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

    const mousemoove_handler$2 = () => {
    	
    };

    function instance$4($$self, $$props, $$invalidate) {
    	let $focuschat;
    	validate_store(focuschat, 'focuschat');
    	component_subscribe($$self, focuschat, $$value => $$invalidate(1, $focuschat = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Chat', slots, []);
    	let { chatcacher = true } = $$props;
    	let contenuchat = [];
    	let joueur = getContext("joueur");

    	let effet = [
    		new Audio("son/effet/ambiance.mp3"),
    		new Audio(""),
    		new Audio("son/effet/chat2.mp3")
    	];

    	//------------------------------------------------------------------------------------
    	onMount(async () => {
    		
    	});

    	function envoimessagechat(e) {
    		/* console.log(e.target.value); */
    		let message = e.target.value;

    		let data = { text: message, id: joueur.pseudo };
    		socket.emit("message", data);
    		e.target.value = "";
    	}

    	socket.on("nouvelleconnexion", data => {
    		$$invalidate(2, contenuchat = data.contenuchat);
    		console.log("un joueur s'est connecté");
    	});

    	socket.on("chatmaj", data => {
    		if (data.id != joueur.pseudo) {
    			effet[2].volume = 0.1;
    			effet[2].play();
    		}

    		$$invalidate(2, contenuchat = data.text);
    	});

    	const writable_props = ['chatcacher'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Chat> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = event => {
    		if (event.key === "Escape") {
    			console.log("echap appuyé");

    			if (chatcacher === false) {
    				$$invalidate(0, chatcacher = true);
    			}
    		}
    	};

    	const keydown_handler_1 = e => {
    		if (e.key === "Enter") {
    			envoimessagechat(e);
    			console.log(e.target.value);
    		}

    		if (e.code === "Space") {
    			console.log("space");
    			e.target.value = e.target.value + " ";
    		}
    	};

    	const focus_handler = e => {
    		console.log("focus");
    		console.log(contenuchat);
    		set_store_value(focuschat, $focuschat = true, $focuschat);
    		console.log($focuschat);
    	};

    	const blur_handler = e => {
    		console.log("focus perdu");
    		set_store_value(focuschat, $focuschat = false, $focuschat);
    		console.log($focuschat);
    	};

    	const click_handler = () => {
    		$$invalidate(0, chatcacher = true);
    	};

    	const click_handler_1 = () => {
    		if (chatcacher === true) {
    			$$invalidate(0, chatcacher = false);
    		} else {
    			$$invalidate(0, chatcacher = true);
    		}
    	};

    	$$self.$$set = $$props => {
    		if ('chatcacher' in $$props) $$invalidate(0, chatcacher = $$props.chatcacher);
    	};

    	$$self.$capture_state = () => ({
    		socket,
    		getContext,
    		setContext,
    		onMount,
    		focuschat,
    		chatcacher,
    		contenuchat,
    		joueur,
    		effet,
    		envoimessagechat,
    		$focuschat
    	});

    	$$self.$inject_state = $$props => {
    		if ('chatcacher' in $$props) $$invalidate(0, chatcacher = $$props.chatcacher);
    		if ('contenuchat' in $$props) $$invalidate(2, contenuchat = $$props.contenuchat);
    		if ('joueur' in $$props) joueur = $$props.joueur;
    		if ('effet' in $$props) effet = $$props.effet;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		chatcacher,
    		$focuschat,
    		contenuchat,
    		envoimessagechat,
    		keydown_handler,
    		keydown_handler_1,
    		focus_handler,
    		blur_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class Chat extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { chatcacher: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chat",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get chatcacher() {
    		throw new Error("<Chat>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set chatcacher(value) {
    		throw new Error("<Chat>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Hud.svelte generated by Svelte v3.46.2 */
    const file$3 = "src\\Hud.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    // (46:0) {#if !menucacher}
    function create_if_block$1(ctx) {
    	let div8;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let div5;
    	let div1;
    	let h10;
    	let t3;
    	let p0;
    	let t4;
    	let t5_value = /*kill*/ ctx[5][0] + "";
    	let t5;
    	let t6;
    	let t7_value = /*score*/ ctx[6][0] + "";
    	let t7;
    	let t8;
    	let div2;
    	let h11;
    	let t10;
    	let p1;
    	let t11;
    	let t12_value = /*kill*/ ctx[5][1] + "";
    	let t12;
    	let t13;
    	let t14_value = /*score*/ ctx[6][1] + "";
    	let t14;
    	let t15;
    	let div3;
    	let h12;
    	let t17;
    	let p2;
    	let t18;
    	let t19_value = /*kill*/ ctx[5][2] + "";
    	let t19;
    	let t20;
    	let t21_value = /*score*/ ctx[6][2] + "";
    	let t21;
    	let t22;
    	let div4;
    	let h13;
    	let t24;
    	let p3;
    	let t25;
    	let t26_value = /*kill*/ ctx[5][3] + "";
    	let t26;
    	let t27;
    	let t28_value = /*score*/ ctx[6][3] + "";
    	let t28;
    	let t29;
    	let div7;
    	let t30;
    	let div6;
    	let t31;
    	let p4;
    	let t32;
    	let t33;
    	let t34;
    	let p5;
    	let t35;
    	let t36;
    	let p6;
    	let t37;
    	let t38;
    	let t39;
    	let p7;
    	let t40;
    	let span;
    	let t41;
    	let t42;
    	let p8;
    	let div8_class_value;
    	let mounted;
    	let dispose;
    	let each_value = /*objets*/ ctx[8];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div0 = element("div");
    			img1 = element("img");
    			t1 = space();
    			div5 = element("div");
    			div1 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Stage 1";
    			t3 = space();
    			p0 = element("p");
    			t4 = text("Kills : ");
    			t5 = text(t5_value);
    			t6 = text(" || Score : ");
    			t7 = text(t7_value);
    			t8 = space();
    			div2 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Stage 2";
    			t10 = space();
    			p1 = element("p");
    			t11 = text("Kills : ");
    			t12 = text(t12_value);
    			t13 = text(" || Score : ");
    			t14 = text(t14_value);
    			t15 = space();
    			div3 = element("div");
    			h12 = element("h1");
    			h12.textContent = "Stage 3";
    			t17 = space();
    			p2 = element("p");
    			t18 = text("Kills : ");
    			t19 = text(t19_value);
    			t20 = text(" || Score : ");
    			t21 = text(t21_value);
    			t22 = space();
    			div4 = element("div");
    			h13 = element("h1");
    			h13.textContent = "Stage 4";
    			t24 = space();
    			p3 = element("p");
    			t25 = text("Kills : ");
    			t26 = text(t26_value);
    			t27 = text(" || Score : ");
    			t28 = text(t28_value);
    			t29 = space();
    			div7 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t30 = space();
    			div6 = element("div");
    			t31 = space();
    			p4 = element("p");
    			t32 = text(/*placeinventaire*/ ctx[1]);
    			t33 = text(" /36");
    			t34 = space();
    			p5 = element("p");
    			t35 = text(/*pseudo*/ ctx[2]);
    			t36 = space();
    			p6 = element("p");
    			t37 = text("Grade : ");
    			t38 = text(/*niv*/ ctx[4]);
    			t39 = space();
    			p7 = element("p");
    			t40 = text("Crédits: ");
    			span = element("span");
    			t41 = text(/*cyberz*/ ctx[3]);
    			t42 = space();
    			p8 = element("p");
    			p8.textContent = "X";
    			attr_dev(img0, "id", "fond");
    			if (!src_url_equal(img0.src, img0_src_value = "img/profil.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-1f6sgvy");
    			add_location(img0, file$3, 47, 8, 1481);
    			if (!src_url_equal(img1.src, img1_src_value = /*joueur*/ ctx[11].img)) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$3, 49, 12, 1569);
    			attr_dev(div0, "id", "portrait");
    			attr_dev(div0, "class", "svelte-1f6sgvy");
    			add_location(div0, file$3, 48, 8, 1536);
    			attr_dev(h10, "class", "svelte-1f6sgvy");
    			add_location(h10, file$3, 53, 16, 1684);
    			attr_dev(p0, "class", "svelte-1f6sgvy");
    			add_location(p0, file$3, 54, 16, 1718);
    			add_location(div1, file$3, 52, 12, 1661);
    			attr_dev(h11, "class", "svelte-1f6sgvy");
    			add_location(h11, file$3, 57, 16, 1821);
    			attr_dev(p1, "class", "svelte-1f6sgvy");
    			add_location(p1, file$3, 58, 16, 1855);
    			add_location(div2, file$3, 56, 12, 1798);
    			attr_dev(h12, "class", "svelte-1f6sgvy");
    			add_location(h12, file$3, 61, 16, 1958);
    			attr_dev(p2, "class", "svelte-1f6sgvy");
    			add_location(p2, file$3, 62, 16, 1992);
    			add_location(div3, file$3, 60, 12, 1935);
    			attr_dev(h13, "class", "svelte-1f6sgvy");
    			add_location(h13, file$3, 65, 16, 2095);
    			attr_dev(p3, "class", "svelte-1f6sgvy");
    			add_location(p3, file$3, 66, 16, 2129);
    			add_location(div4, file$3, 64, 12, 2072);
    			attr_dev(div5, "id", "blockstage");
    			attr_dev(div5, "class", "svelte-1f6sgvy");
    			add_location(div5, file$3, 51, 8, 1626);
    			add_location(div6, file$3, 127, 12, 5133);
    			attr_dev(div7, "id", "inventaire");
    			attr_dev(div7, "class", "svelte-1f6sgvy");
    			add_location(div7, file$3, 69, 8, 2221);
    			attr_dev(p4, "id", "placeinventaire");
    			attr_dev(p4, "class", "svelte-1f6sgvy");
    			add_location(p4, file$3, 129, 8, 5166);
    			attr_dev(p5, "id", "pseudo");
    			attr_dev(p5, "class", "svelte-1f6sgvy");
    			add_location(p5, file$3, 130, 8, 5225);
    			attr_dev(p6, "id", "grade");
    			attr_dev(p6, "class", "svelte-1f6sgvy");
    			add_location(p6, file$3, 131, 8, 5262);
    			attr_dev(span, "class", "svelte-1f6sgvy");
    			add_location(span, file$3, 140, 32, 5557);
    			attr_dev(p7, "id", "cyberz");
    			attr_dev(p7, "class", "svelte-1f6sgvy");
    			add_location(p7, file$3, 140, 8, 5533);
    			attr_dev(p8, "id", "croixfermer");
    			attr_dev(p8, "class", "svelte-1f6sgvy");
    			add_location(p8, file$3, 141, 8, 5592);
    			attr_dev(div8, "id", "block");
    			attr_dev(div8, "class", div8_class_value = "" + (null_to_empty(/*menucacher*/ ctx[0] ? "menucache" : "") + " svelte-1f6sgvy"));
    			add_location(div8, file$3, 46, 4, 1417);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, img0);
    			append_dev(div8, t0);
    			append_dev(div8, div0);
    			append_dev(div0, img1);
    			append_dev(div8, t1);
    			append_dev(div8, div5);
    			append_dev(div5, div1);
    			append_dev(div1, h10);
    			append_dev(div1, t3);
    			append_dev(div1, p0);
    			append_dev(p0, t4);
    			append_dev(p0, t5);
    			append_dev(p0, t6);
    			append_dev(p0, t7);
    			append_dev(div5, t8);
    			append_dev(div5, div2);
    			append_dev(div2, h11);
    			append_dev(div2, t10);
    			append_dev(div2, p1);
    			append_dev(p1, t11);
    			append_dev(p1, t12);
    			append_dev(p1, t13);
    			append_dev(p1, t14);
    			append_dev(div5, t15);
    			append_dev(div5, div3);
    			append_dev(div3, h12);
    			append_dev(div3, t17);
    			append_dev(div3, p2);
    			append_dev(p2, t18);
    			append_dev(p2, t19);
    			append_dev(p2, t20);
    			append_dev(p2, t21);
    			append_dev(div5, t22);
    			append_dev(div5, div4);
    			append_dev(div4, h13);
    			append_dev(div4, t24);
    			append_dev(div4, p3);
    			append_dev(p3, t25);
    			append_dev(p3, t26);
    			append_dev(p3, t27);
    			append_dev(p3, t28);
    			append_dev(div8, t29);
    			append_dev(div8, div7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div7, null);
    			}

    			append_dev(div7, t30);
    			append_dev(div7, div6);
    			append_dev(div8, t31);
    			append_dev(div8, p4);
    			append_dev(p4, t32);
    			append_dev(p4, t33);
    			append_dev(div8, t34);
    			append_dev(div8, p5);
    			append_dev(p5, t35);
    			append_dev(div8, t36);
    			append_dev(div8, p6);
    			append_dev(p6, t37);
    			append_dev(p6, t38);
    			append_dev(div8, t39);
    			append_dev(div8, p7);
    			append_dev(p7, t40);
    			append_dev(p7, span);
    			append_dev(span, t41);
    			append_dev(div8, t42);
    			append_dev(div8, p8);

    			if (!mounted) {
    				dispose = listen_dev(p8, "click", /*click_handler_1*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*kill*/ 32 && t5_value !== (t5_value = /*kill*/ ctx[5][0] + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*score*/ 64 && t7_value !== (t7_value = /*score*/ ctx[6][0] + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*kill*/ 32 && t12_value !== (t12_value = /*kill*/ ctx[5][1] + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*score*/ 64 && t14_value !== (t14_value = /*score*/ ctx[6][1] + "")) set_data_dev(t14, t14_value);
    			if (dirty & /*kill*/ 32 && t19_value !== (t19_value = /*kill*/ ctx[5][2] + "")) set_data_dev(t19, t19_value);
    			if (dirty & /*score*/ 64 && t21_value !== (t21_value = /*score*/ ctx[6][2] + "")) set_data_dev(t21, t21_value);
    			if (dirty & /*kill*/ 32 && t26_value !== (t26_value = /*kill*/ ctx[5][3] + "")) set_data_dev(t26, t26_value);
    			if (dirty & /*score*/ 64 && t28_value !== (t28_value = /*score*/ ctx[6][3] + "")) set_data_dev(t28, t28_value);

    			if (dirty & /*objets, joueur, socket, sauvegarde, ildaa, placeinventaire, setTimeout, menucacher*/ 3331) {
    				each_value = /*objets*/ ctx[8];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div7, t30);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*placeinventaire*/ 2) set_data_dev(t32, /*placeinventaire*/ ctx[1]);
    			if (dirty & /*pseudo*/ 4) set_data_dev(t35, /*pseudo*/ ctx[2]);
    			if (dirty & /*niv*/ 16) set_data_dev(t38, /*niv*/ ctx[4]);
    			if (dirty & /*cyberz*/ 8) set_data_dev(t41, /*cyberz*/ ctx[3]);

    			if (dirty & /*menucacher*/ 1 && div8_class_value !== (div8_class_value = "" + (null_to_empty(/*menucacher*/ ctx[0] ? "menucache" : "") + " svelte-1f6sgvy"))) {
    				attr_dev(div8, "class", div8_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(46:0) {#if !menucacher}",
    		ctx
    	});

    	return block;
    }

    // (71:12) {#each objets as cat, i}
    function create_each_block(ctx) {
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let p;
    	let t1_value = /*cat*/ ctx[20].nom + "";
    	let t1;
    	let t2;
    	let div0;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let img2;
    	let img2_src_value;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[17](/*cat*/ ctx[20], /*i*/ ctx[22], ...args);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img0 = element("img");
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			div0 = element("div");
    			img1 = element("img");
    			t3 = space();
    			img2 = element("img");
    			if (!src_url_equal(img0.src, img0_src_value = /*cat*/ ctx[20].img)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$3, 72, 20, 2342);
    			attr_dev(p, "id", "nomobjet");
    			attr_dev(p, "class", "svelte-1f6sgvy");
    			add_location(p, file$3, 73, 20, 2392);
    			if (!src_url_equal(img1.src, img1_src_value = "img/vendre.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "id", "vendre");
    			attr_dev(img1, "class", "svelte-1f6sgvy");
    			add_location(img1, file$3, 76, 24, 2576);
    			attr_dev(img2, "id", "retroconfection");
    			attr_dev(img2, "alt", "");
    			if (!src_url_equal(img2.src, img2_src_value = "img/infoobjet.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "svelte-1f6sgvy");
    			add_location(img2, file$3, 122, 24, 4985);
    			attr_dev(div0, "id", "blockimgobjet");
    			attr_dev(div0, "class", "svelte-1f6sgvy");
    			add_location(div0, file$3, 74, 20, 2444);
    			attr_dev(div1, "id", "blockobjets");
    			attr_dev(div1, "class", "svelte-1f6sgvy");
    			add_location(div1, file$3, 71, 16, 2298);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img0);
    			append_dev(div1, t0);
    			append_dev(div1, p);
    			append_dev(p, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, img1);
    			append_dev(div0, t3);
    			append_dev(div0, img2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(img1, "click", click_handler, false, false, false),
    					listen_dev(img1, "mouseover", mouseover_handler, false, false, false),
    					listen_dev(img1, "mouseout", mouseout_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*objets*/ 256 && !src_url_equal(img0.src, img0_src_value = /*cat*/ ctx[20].img)) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (dirty & /*objets*/ 256 && t1_value !== (t1_value = /*cat*/ ctx[20].nom + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(71:12) {#each objets as cat, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let t0;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block = !/*menucacher*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			button = element("button");
    			button.textContent = "Carrière";
    			attr_dev(button, "id", "fermer");
    			attr_dev(button, "class", "svelte-1f6sgvy");
    			add_location(button, file$3, 151, 0, 5773);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*keydown_handler*/ ctx[16], false, false, false),
    					listen_dev(window, "mousemoove", mousemoove_handler$1, false, false, false),
    					listen_dev(button, "click", /*click_handler_2*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*menucacher*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
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

    const mousemoove_handler$1 = () => {
    	
    };

    const mouseover_handler = e => {
    	e.target.src = "img/vendre2.png";
    };

    const mouseout_handler = e => {
    	e.target.src = "img/vendre.png";
    };

    function instance$3($$self, $$props, $$invalidate) {
    	let objets;
    	let $focuschat;
    	validate_store(focuschat, 'focuschat');
    	component_subscribe($$self, focuschat, $$value => $$invalidate(9, $focuschat = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Hud', slots, []);
    	let { pseudo } = $$props;
    	let { cyberz } = $$props;
    	let { niv } = $$props;
    	let { barredevie } = $$props;
    	let { sante } = $$props;
    	let { xp } = $$props;
    	let { kill } = $$props;
    	let { score } = $$props;
    	let { inventaire } = $$props;
    	let { menucacher } = $$props;
    	let { placeinventaire } = $$props;

    	onMount(async () => {
    		
    	});

    	let effets = [new Audio(""), new Audio("son/effet/valider.mp3")];
    	let ildaa = [new Audio("son/effet/ildaaok.mp3"), new Audio("")];

    	kill.forEach(element => {
    		
    	});

    	let joueur = getContext("joueur");
    	menucacher = true;

    	const writable_props = [
    		'pseudo',
    		'cyberz',
    		'niv',
    		'barredevie',
    		'sante',
    		'xp',
    		'kill',
    		'score',
    		'inventaire',
    		'menucacher',
    		'placeinventaire'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hud> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = event => {
    		if (event.key === "p" || event.key === "P") {
    			if (!$focuschat === true && menucacher === true) {
    				$$invalidate(0, menucacher = false);
    			} else if (!$focuschat === true && menucacher === false) {
    				$$invalidate(0, menucacher = true);
    			}
    		} else if (event.key === "Escape" && menucacher === false) {
    			$$invalidate(0, menucacher = true);
    		}
    	};

    	const click_handler = (cat, i, event) => {
    		if (cat.nom === "Carte d'agent") {
    			return;
    		} else {
    			let data = { pseudo: joueur.pseudo, objet: cat };
    			socket.emit("cybershop", data);
    			joueur.inventaire.splice(i, 1);

    			/*   enregistrementjoueur(
        joueur.pseudo,
        joueur.cyberz,
        joueur.niveau,
        joueur.sante,
        joueur.attaque,
        joueur.defense,
        joueur.xp,
        joueur.pass,
        joueur.inventaire,
        joueur.kill,
        joueur.score,
        joueur.puce,
        joueur.amelioration,
        joueur.relique
    ); */
    			sauvegarde(joueur);

    			ildaa[0].play();

    			/* menucacher = true; */
    			$$invalidate(1, placeinventaire = joueur.inventaire.length);

    			setTimeout(
    				() => {
    					$$invalidate(0, menucacher = false);
    				},
    				0
    			);
    		}
    	};

    	const click_handler_1 = event => {
    		$$invalidate(0, menucacher = true);
    	};

    	const click_handler_2 = e => {
    		if (menucacher === true) {
    			$$invalidate(7, effets[1].volume = 0.05, effets);
    			effets[1].play();
    			$$invalidate(0, menucacher = false);
    		} else {
    			$$invalidate(0, menucacher = true);
    		}
    	};

    	$$self.$$set = $$props => {
    		if ('pseudo' in $$props) $$invalidate(2, pseudo = $$props.pseudo);
    		if ('cyberz' in $$props) $$invalidate(3, cyberz = $$props.cyberz);
    		if ('niv' in $$props) $$invalidate(4, niv = $$props.niv);
    		if ('barredevie' in $$props) $$invalidate(12, barredevie = $$props.barredevie);
    		if ('sante' in $$props) $$invalidate(13, sante = $$props.sante);
    		if ('xp' in $$props) $$invalidate(14, xp = $$props.xp);
    		if ('kill' in $$props) $$invalidate(5, kill = $$props.kill);
    		if ('score' in $$props) $$invalidate(6, score = $$props.score);
    		if ('inventaire' in $$props) $$invalidate(15, inventaire = $$props.inventaire);
    		if ('menucacher' in $$props) $$invalidate(0, menucacher = $$props.menucacher);
    		if ('placeinventaire' in $$props) $$invalidate(1, placeinventaire = $$props.placeinventaire);
    	};

    	$$self.$capture_state = () => ({
    		socket,
    		sauvegarde,
    		getContext,
    		setContext,
    		Allier,
    		Personnage,
    		Objet,
    		onMount,
    		focuschat,
    		pseudo,
    		cyberz,
    		niv,
    		barredevie,
    		sante,
    		xp,
    		kill,
    		score,
    		inventaire,
    		menucacher,
    		placeinventaire,
    		effets,
    		ildaa,
    		joueur,
    		objets,
    		$focuschat
    	});

    	$$self.$inject_state = $$props => {
    		if ('pseudo' in $$props) $$invalidate(2, pseudo = $$props.pseudo);
    		if ('cyberz' in $$props) $$invalidate(3, cyberz = $$props.cyberz);
    		if ('niv' in $$props) $$invalidate(4, niv = $$props.niv);
    		if ('barredevie' in $$props) $$invalidate(12, barredevie = $$props.barredevie);
    		if ('sante' in $$props) $$invalidate(13, sante = $$props.sante);
    		if ('xp' in $$props) $$invalidate(14, xp = $$props.xp);
    		if ('kill' in $$props) $$invalidate(5, kill = $$props.kill);
    		if ('score' in $$props) $$invalidate(6, score = $$props.score);
    		if ('inventaire' in $$props) $$invalidate(15, inventaire = $$props.inventaire);
    		if ('menucacher' in $$props) $$invalidate(0, menucacher = $$props.menucacher);
    		if ('placeinventaire' in $$props) $$invalidate(1, placeinventaire = $$props.placeinventaire);
    		if ('effets' in $$props) $$invalidate(7, effets = $$props.effets);
    		if ('ildaa' in $$props) $$invalidate(10, ildaa = $$props.ildaa);
    		if ('joueur' in $$props) $$invalidate(11, joueur = $$props.joueur);
    		if ('objets' in $$props) $$invalidate(8, objets = $$props.objets);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*inventaire*/ 32768) {
    			$$invalidate(8, objets = inventaire);
    		}
    	};

    	$$invalidate(1, placeinventaire = joueur.inventaire.length);

    	return [
    		menucacher,
    		placeinventaire,
    		pseudo,
    		cyberz,
    		niv,
    		kill,
    		score,
    		effets,
    		objets,
    		$focuschat,
    		ildaa,
    		joueur,
    		barredevie,
    		sante,
    		xp,
    		inventaire,
    		keydown_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Hud extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			pseudo: 2,
    			cyberz: 3,
    			niv: 4,
    			barredevie: 12,
    			sante: 13,
    			xp: 14,
    			kill: 5,
    			score: 6,
    			inventaire: 15,
    			menucacher: 0,
    			placeinventaire: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hud",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pseudo*/ ctx[2] === undefined && !('pseudo' in props)) {
    			console.warn("<Hud> was created without expected prop 'pseudo'");
    		}

    		if (/*cyberz*/ ctx[3] === undefined && !('cyberz' in props)) {
    			console.warn("<Hud> was created without expected prop 'cyberz'");
    		}

    		if (/*niv*/ ctx[4] === undefined && !('niv' in props)) {
    			console.warn("<Hud> was created without expected prop 'niv'");
    		}

    		if (/*barredevie*/ ctx[12] === undefined && !('barredevie' in props)) {
    			console.warn("<Hud> was created without expected prop 'barredevie'");
    		}

    		if (/*sante*/ ctx[13] === undefined && !('sante' in props)) {
    			console.warn("<Hud> was created without expected prop 'sante'");
    		}

    		if (/*xp*/ ctx[14] === undefined && !('xp' in props)) {
    			console.warn("<Hud> was created without expected prop 'xp'");
    		}

    		if (/*kill*/ ctx[5] === undefined && !('kill' in props)) {
    			console.warn("<Hud> was created without expected prop 'kill'");
    		}

    		if (/*score*/ ctx[6] === undefined && !('score' in props)) {
    			console.warn("<Hud> was created without expected prop 'score'");
    		}

    		if (/*inventaire*/ ctx[15] === undefined && !('inventaire' in props)) {
    			console.warn("<Hud> was created without expected prop 'inventaire'");
    		}

    		if (/*menucacher*/ ctx[0] === undefined && !('menucacher' in props)) {
    			console.warn("<Hud> was created without expected prop 'menucacher'");
    		}

    		if (/*placeinventaire*/ ctx[1] === undefined && !('placeinventaire' in props)) {
    			console.warn("<Hud> was created without expected prop 'placeinventaire'");
    		}
    	}

    	get pseudo() {
    		throw new Error("<Hud>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pseudo(value) {
    		throw new Error("<Hud>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cyberz() {
    		throw new Error("<Hud>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cyberz(value) {
    		throw new Error("<Hud>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get niv() {
    		throw new Error("<Hud>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set niv(value) {
    		throw new Error("<Hud>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get barredevie() {
    		throw new Error("<Hud>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set barredevie(value) {
    		throw new Error("<Hud>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sante() {
    		throw new Error("<Hud>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sante(value) {
    		throw new Error("<Hud>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xp() {
    		throw new Error("<Hud>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xp(value) {
    		throw new Error("<Hud>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get kill() {
    		throw new Error("<Hud>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set kill(value) {
    		throw new Error("<Hud>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get score() {
    		throw new Error("<Hud>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set score(value) {
    		throw new Error("<Hud>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inventaire() {
    		throw new Error("<Hud>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inventaire(value) {
    		throw new Error("<Hud>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get menucacher() {
    		throw new Error("<Hud>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menucacher(value) {
    		throw new Error("<Hud>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeinventaire() {
    		throw new Error("<Hud>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeinventaire(value) {
    		throw new Error("<Hud>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Options.svelte generated by Svelte v3.46.2 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\Options.svelte";

    function create_fragment$2(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let span;
    	let t2;
    	let p0;
    	let t4;
    	let div0;
    	let button0;
    	let t6;
    	let button1;
    	let t8;
    	let p1;
    	let t9;
    	let t10;
    	let div1;
    	let t11;
    	let p2;
    	let t13;
    	let p3;
    	let div2_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			span = element("span");
    			span.textContent = "X";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Musique :";
    			t4 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "-";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "+";
    			t8 = space();
    			p1 = element("p");
    			t9 = text(/*$volume*/ ctx[1]);
    			t10 = space();
    			div1 = element("div");
    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "Aide";
    			t13 = space();
    			p3 = element("p");
    			p3.textContent = "Contact";
    			attr_dev(img, "id", "optionlogo");
    			if (!src_url_equal(img.src, img_src_value = "img/option.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-qty6hc");
    			add_location(img, file$2, 25, 0, 796);
    			attr_dev(span, "id", "fermer");
    			attr_dev(span, "class", "svelte-qty6hc");
    			add_location(span, file$2, 38, 4, 1100);
    			attr_dev(p0, "class", "svelte-qty6hc");
    			add_location(p0, file$2, 44, 4, 1220);
    			attr_dev(button0, "class", "svelte-qty6hc");
    			add_location(button0, file$2, 46, 8, 1274);
    			attr_dev(button1, "class", "svelte-qty6hc");
    			add_location(button1, file$2, 55, 8, 1480);
    			attr_dev(p1, "id", "volume");
    			attr_dev(p1, "class", "svelte-qty6hc");
    			add_location(p1, file$2, 63, 8, 1684);
    			attr_dev(div0, "id", "blockvolume");
    			attr_dev(div0, "class", "svelte-qty6hc");
    			add_location(div0, file$2, 45, 4, 1242);
    			attr_dev(div1, "id", "volumebarre");
    			set_style(div1, "width", /*$volume*/ ctx[1] * 80 + "px");
    			attr_dev(div1, "class", "svelte-qty6hc");
    			add_location(div1, file$2, 66, 4, 1732);
    			attr_dev(p2, "class", "svelte-qty6hc");
    			add_location(p2, file$2, 67, 4, 1793);
    			attr_dev(p3, "class", "svelte-qty6hc");
    			add_location(p3, file$2, 68, 4, 1810);
    			attr_dev(div2, "id", "blockoption");
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(/*optioncacher*/ ctx[0] ? "menucache" : "") + " svelte-qty6hc"));
    			add_location(div2, file$2, 37, 0, 1032);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, span);
    			append_dev(div2, t2);
    			append_dev(div2, p0);
    			append_dev(div2, t4);
    			append_dev(div2, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t6);
    			append_dev(div0, button1);
    			append_dev(div0, t8);
    			append_dev(div0, p1);
    			append_dev(p1, t9);
    			append_dev(div2, t10);
    			append_dev(div2, div1);
    			append_dev(div2, t11);
    			append_dev(div2, p2);
    			append_dev(div2, t13);
    			append_dev(div2, p3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*keydown_handler*/ ctx[2], false, false, false),
    					listen_dev(window, "mousemoove", mousemoove_handler, false, false, false),
    					listen_dev(img, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(span, "click", /*click_handler_1*/ ctx[4], false, false, false),
    					listen_dev(button0, "click", /*click_handler_2*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*click_handler_3*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$volume*/ 2) set_data_dev(t9, /*$volume*/ ctx[1]);

    			if (dirty & /*$volume*/ 2) {
    				set_style(div1, "width", /*$volume*/ ctx[1] * 80 + "px");
    			}

    			if (dirty & /*optioncacher*/ 1 && div2_class_value !== (div2_class_value = "" + (null_to_empty(/*optioncacher*/ ctx[0] ? "menucache" : "") + " svelte-qty6hc"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
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

    const mousemoove_handler = () => {
    	
    };

    function instance$2($$self, $$props, $$invalidate) {
    	let $volume;
    	validate_store(volume, 'volume');
    	component_subscribe($$self, volume, $$value => $$invalidate(1, $volume = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Options', slots, []);
    	let { optioncacher = true } = $$props;

    	//------------------------------------------------------------------------------------
    	onMount(async () => {
    		
    	});

    	const writable_props = ['optioncacher'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Options> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = event => {
    		if (event.key === "Escape") {
    			console.log("echap appuyé");

    			if (optioncacher === false) {
    				$$invalidate(0, optioncacher = true);
    			}
    		}
    	};

    	const click_handler = () => {
    		if (optioncacher === true) {
    			$$invalidate(0, optioncacher = false);
    		} else {
    			$$invalidate(0, optioncacher = true);
    		}
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, optioncacher = true);
    	};

    	const click_handler_2 = () => {
    		if ($volume > 0) {
    			set_store_value(volume, $volume -= 0.25, $volume);
    		}
    	};

    	const click_handler_3 = () => {
    		if ($volume < 1) {
    			set_store_value(volume, $volume += 0.25, $volume);
    		}
    	};

    	$$self.$$set = $$props => {
    		if ('optioncacher' in $$props) $$invalidate(0, optioncacher = $$props.optioncacher);
    	};

    	$$self.$capture_state = () => ({
    		socket,
    		getContext,
    		setContext,
    		onMount,
    		volume,
    		optioncacher,
    		$volume
    	});

    	$$self.$inject_state = $$props => {
    		if ('optioncacher' in $$props) $$invalidate(0, optioncacher = $$props.optioncacher);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		optioncacher,
    		$volume,
    		keydown_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class Options extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { optioncacher: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Options",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get optioncacher() {
    		throw new Error("<Options>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optioncacher(value) {
    		throw new Error("<Options>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Jeu.svelte generated by Svelte v3.46.2 */

    const { console: console_1, window: window_1 } = globals;
    const file$1 = "src\\Jeu.svelte";

    // (514:4) {#if connexionerror}
    function create_if_block_2(ctx) {
    	let p;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = `${/*message*/ ctx[13][2]}`;
    			t1 = space();
    			button = element("button");
    			button.textContent = "recommencer";
    			attr_dev(p, "class", "textinfoerror svelte-ds0igp");
    			add_location(p, file$1, 514, 8, 18139);
    			attr_dev(button, "id", "recommencer");
    			attr_dev(button, "class", "svelte-ds0igp");
    			add_location(button, file$1, 515, 8, 18190);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[20], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(514:4) {#if connexionerror}",
    		ctx
    	});

    	return block;
    }

    // (530:0) {#if !titrecache}
    function create_if_block_1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "id", "titre");
    			if (!src_url_equal(img.src, img_src_value = "img/titre2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-ds0igp");
    			add_location(img, file$1, 529, 17, 18566);
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
    		source: "(530:0) {#if !titrecache}",
    		ctx
    	});

    	return block;
    }

    // (531:0) {#if connecte}
    function create_if_block(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let hud;
    	let updating_pseudo;
    	let updating_cyberz;
    	let updating_niv;
    	let updating_barredevie;
    	let updating_sante;
    	let updating_xp;
    	let updating_srcface;
    	let updating_kill;
    	let updating_score;
    	let updating_inventaire;
    	let updating_placeinventaire;
    	let current;
    	let mounted;
    	let dispose;

    	function hud_pseudo_binding(value) {
    		/*hud_pseudo_binding*/ ctx[23](value);
    	}

    	function hud_cyberz_binding(value) {
    		/*hud_cyberz_binding*/ ctx[24](value);
    	}

    	function hud_niv_binding(value) {
    		/*hud_niv_binding*/ ctx[25](value);
    	}

    	function hud_barredevie_binding(value) {
    		/*hud_barredevie_binding*/ ctx[26](value);
    	}

    	function hud_sante_binding(value) {
    		/*hud_sante_binding*/ ctx[27](value);
    	}

    	function hud_xp_binding(value) {
    		/*hud_xp_binding*/ ctx[28](value);
    	}

    	function hud_srcface_binding(value) {
    		/*hud_srcface_binding*/ ctx[29](value);
    	}

    	function hud_kill_binding(value) {
    		/*hud_kill_binding*/ ctx[30](value);
    	}

    	function hud_score_binding(value) {
    		/*hud_score_binding*/ ctx[31](value);
    	}

    	function hud_inventaire_binding(value) {
    		/*hud_inventaire_binding*/ ctx[32](value);
    	}

    	function hud_placeinventaire_binding(value) {
    		/*hud_placeinventaire_binding*/ ctx[33](value);
    	}

    	let hud_props = {};

    	if (/*joueur*/ ctx[0].pseudo !== void 0) {
    		hud_props.pseudo = /*joueur*/ ctx[0].pseudo;
    	}

    	if (/*joueur*/ ctx[0].cyberz !== void 0) {
    		hud_props.cyberz = /*joueur*/ ctx[0].cyberz;
    	}

    	if (/*joueur*/ ctx[0].niveau !== void 0) {
    		hud_props.niv = /*joueur*/ ctx[0].niveau;
    	}

    	if (/*joueur*/ ctx[0].sante !== void 0) {
    		hud_props.barredevie = /*joueur*/ ctx[0].sante;
    	}

    	if (/*joueur*/ ctx[0].sante !== void 0) {
    		hud_props.sante = /*joueur*/ ctx[0].sante;
    	}

    	if (/*joueur*/ ctx[0].xp !== void 0) {
    		hud_props.xp = /*joueur*/ ctx[0].xp;
    	}

    	if (/*faceimg*/ ctx[8] !== void 0) {
    		hud_props.srcface = /*faceimg*/ ctx[8];
    	}

    	if (/*joueur*/ ctx[0].kill !== void 0) {
    		hud_props.kill = /*joueur*/ ctx[0].kill;
    	}

    	if (/*joueur*/ ctx[0].score !== void 0) {
    		hud_props.score = /*joueur*/ ctx[0].score;
    	}

    	if (/*joueur*/ ctx[0].inventaire !== void 0) {
    		hud_props.inventaire = /*joueur*/ ctx[0].inventaire;
    	}

    	if (/*placeinventaire*/ ctx[11] !== void 0) {
    		hud_props.placeinventaire = /*placeinventaire*/ ctx[11];
    	}

    	hud = new Hud({ props: hud_props, $$inline: true });
    	binding_callbacks.push(() => bind(hud, 'pseudo', hud_pseudo_binding));
    	binding_callbacks.push(() => bind(hud, 'cyberz', hud_cyberz_binding));
    	binding_callbacks.push(() => bind(hud, 'niv', hud_niv_binding));
    	binding_callbacks.push(() => bind(hud, 'barredevie', hud_barredevie_binding));
    	binding_callbacks.push(() => bind(hud, 'sante', hud_sante_binding));
    	binding_callbacks.push(() => bind(hud, 'xp', hud_xp_binding));
    	binding_callbacks.push(() => bind(hud, 'srcface', hud_srcface_binding));
    	binding_callbacks.push(() => bind(hud, 'kill', hud_kill_binding));
    	binding_callbacks.push(() => bind(hud, 'score', hud_score_binding));
    	binding_callbacks.push(() => bind(hud, 'inventaire', hud_inventaire_binding));
    	binding_callbacks.push(() => bind(hud, 'placeinventaire', hud_placeinventaire_binding));

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Mode Histoire";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Mode JcJ";
    			create_component(hud.$$.fragment);
    			attr_dev(button0, "id", "storymode");
    			attr_dev(button0, "class", "svelte-ds0igp");
    			add_location(button0, file$1, 531, 4, 18639);
    			attr_dev(button1, "id", "jcjmode");
    			attr_dev(button1, "class", "svelte-ds0igp");
    			add_location(button1, file$1, 537, 4, 18811);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);
    			mount_component(hud, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler_2*/ ctx[21], false, false, false),
    					listen_dev(button1, "click", /*click_handler_3*/ ctx[22], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const hud_changes = {};

    			if (!updating_pseudo && dirty[0] & /*joueur*/ 1) {
    				updating_pseudo = true;
    				hud_changes.pseudo = /*joueur*/ ctx[0].pseudo;
    				add_flush_callback(() => updating_pseudo = false);
    			}

    			if (!updating_cyberz && dirty[0] & /*joueur*/ 1) {
    				updating_cyberz = true;
    				hud_changes.cyberz = /*joueur*/ ctx[0].cyberz;
    				add_flush_callback(() => updating_cyberz = false);
    			}

    			if (!updating_niv && dirty[0] & /*joueur*/ 1) {
    				updating_niv = true;
    				hud_changes.niv = /*joueur*/ ctx[0].niveau;
    				add_flush_callback(() => updating_niv = false);
    			}

    			if (!updating_barredevie && dirty[0] & /*joueur*/ 1) {
    				updating_barredevie = true;
    				hud_changes.barredevie = /*joueur*/ ctx[0].sante;
    				add_flush_callback(() => updating_barredevie = false);
    			}

    			if (!updating_sante && dirty[0] & /*joueur*/ 1) {
    				updating_sante = true;
    				hud_changes.sante = /*joueur*/ ctx[0].sante;
    				add_flush_callback(() => updating_sante = false);
    			}

    			if (!updating_xp && dirty[0] & /*joueur*/ 1) {
    				updating_xp = true;
    				hud_changes.xp = /*joueur*/ ctx[0].xp;
    				add_flush_callback(() => updating_xp = false);
    			}

    			if (!updating_srcface && dirty[0] & /*faceimg*/ 256) {
    				updating_srcface = true;
    				hud_changes.srcface = /*faceimg*/ ctx[8];
    				add_flush_callback(() => updating_srcface = false);
    			}

    			if (!updating_kill && dirty[0] & /*joueur*/ 1) {
    				updating_kill = true;
    				hud_changes.kill = /*joueur*/ ctx[0].kill;
    				add_flush_callback(() => updating_kill = false);
    			}

    			if (!updating_score && dirty[0] & /*joueur*/ 1) {
    				updating_score = true;
    				hud_changes.score = /*joueur*/ ctx[0].score;
    				add_flush_callback(() => updating_score = false);
    			}

    			if (!updating_inventaire && dirty[0] & /*joueur*/ 1) {
    				updating_inventaire = true;
    				hud_changes.inventaire = /*joueur*/ ctx[0].inventaire;
    				add_flush_callback(() => updating_inventaire = false);
    			}

    			if (!updating_placeinventaire && dirty[0] & /*placeinventaire*/ 2048) {
    				updating_placeinventaire = true;
    				hud_changes.placeinventaire = /*placeinventaire*/ ctx[11];
    				add_flush_callback(() => updating_placeinventaire = false);
    			}

    			hud.$set(hud_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hud.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hud.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			destroy_component(hud, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(531:0) {#if connecte}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let p0;
    	let t1;
    	let input0;
    	let t2;
    	let input1;
    	let t3;
    	let button;
    	let t4;
    	let button_class_value;
    	let t5;
    	let div1;
    	let p1;
    	let t7;
    	let img0;
    	let img0_src_value;
    	let t8;
    	let t9;
    	let img1;
    	let img1_src_value;
    	let img1_class_value;
    	let div2_class_value;
    	let t10;
    	let t11;
    	let t12;
    	let div3;
    	let chat;
    	let t13;
    	let options;
    	let t14;
    	let p2;
    	let t16;
    	let img2;
    	let img2_src_value;
    	let div3_class_value;
    	let t17;
    	let div4;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*connexionerror*/ ctx[7] && create_if_block_2(ctx);
    	let if_block1 = !/*titrecache*/ ctx[4] && create_if_block_1(ctx);
    	let if_block2 = /*connecte*/ ctx[1] && create_if_block(ctx);
    	chat = new Chat({ $$inline: true });
    	options = new Options({ $$inline: true });

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = `${/*message*/ ctx[13][0]}`;
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			button = element("button");
    			t4 = text("Connexion");
    			t5 = space();
    			div1 = element("div");
    			p1 = element("p");
    			p1.textContent = `${/*message*/ ctx[13][1]}`;
    			t7 = space();
    			img0 = element("img");
    			t8 = space();
    			if (if_block0) if_block0.c();
    			t9 = space();
    			img1 = element("img");
    			t10 = space();
    			if (if_block1) if_block1.c();
    			t11 = space();
    			if (if_block2) if_block2.c();
    			t12 = space();
    			div3 = element("div");
    			create_component(chat.$$.fragment);
    			t13 = space();
    			create_component(options.$$.fragment);
    			t14 = space();
    			p2 = element("p");
    			p2.textContent = "version 1.0";
    			t16 = space();
    			img2 = element("img");
    			t17 = space();
    			div4 = element("div");
    			attr_dev(p0, "id", "titrejeu");
    			attr_dev(p0, "class", "svelte-ds0igp");
    			add_location(p0, file$1, 446, 8, 16296);
    			attr_dev(div0, "class", "info svelte-ds0igp");
    			add_location(div0, file$1, 445, 4, 16268);
    			attr_dev(input0, "placeholder", "Pseudo*");
    			attr_dev(input0, "id", "input3");
    			attr_dev(input0, "maxlength", "9");
    			attr_dev(input0, "autocomplete", "off");
    			attr_dev(input0, "onfocus", "this.value=''");
    			attr_dev(input0, "class", "svelte-ds0igp");
    			add_location(input0, file$1, 449, 4, 16349);
    			attr_dev(input1, "placeholder", "Pass*");
    			attr_dev(input1, "id", "input");
    			attr_dev(input1, "maxlength", "9");
    			attr_dev(input1, "autocomplete", "off");
    			attr_dev(input1, "onfocus", "this.value=''");
    			attr_dev(input1, "class", "svelte-ds0igp");
    			add_location(input1, file$1, 457, 4, 16541);
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*classbouttonconnexion*/ ctx[6]) + " svelte-ds0igp"));
    			attr_dev(button, "id", "connexionboutton");
    			add_location(button, file$1, 465, 4, 16728);
    			attr_dev(p1, "class", "textinfo svelte-ds0igp");
    			add_location(p1, file$1, 510, 8, 18007);
    			if (!src_url_equal(img0.src, img0_src_value = "img/infoobjet.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-ds0igp");
    			add_location(img0, file$1, 511, 8, 18053);
    			attr_dev(div1, "class", "info2 svelte-ds0igp");
    			add_location(div1, file$1, 509, 4, 17978);
    			if (!src_url_equal(img1.src, img1_src_value = "/img/glitter3.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "id", "indicateur");

    			attr_dev(img1, "class", img1_class_value = "" + (null_to_empty(/*chargementindicateur*/ ctx[2] === true
    			? "indicateurtourne"
    			: "indicateur") + " svelte-ds0igp"));

    			add_location(img1, file$1, 522, 4, 18370);
    			attr_dev(div2, "id", "menu");
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(/*menucache*/ ctx[3] ? "menucache" : "") + " svelte-ds0igp"));
    			add_location(div2, file$1, 444, 0, 16210);
    			attr_dev(p2, "id", "version");
    			attr_dev(p2, "class", "svelte-ds0igp");
    			add_location(p2, file$1, 576, 4, 20395);
    			attr_dev(img2, "id", "quitter");
    			if (!src_url_equal(img2.src, img2_src_value = "img/quitter.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", "svelte-ds0igp");
    			add_location(img2, file$1, 577, 4, 20432);

    			attr_dev(div3, "class", div3_class_value = "" + (null_to_empty(/*connecte*/ ctx[1] === true
    			? "chatvisible"
    			: "chatinvisible") + " svelte-ds0igp"));

    			add_location(div3, file$1, 573, 0, 20293);
    			attr_dev(div4, "id", "jeu");
    			add_location(div4, file$1, 587, 0, 20619);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(div2, t1);
    			append_dev(div2, input0);
    			set_input_value(input0, /*joueur*/ ctx[0].pseudo);
    			append_dev(div2, t2);
    			append_dev(div2, input1);
    			set_input_value(input1, /*joueur*/ ctx[0].pass);
    			append_dev(div2, t3);
    			append_dev(div2, button);
    			append_dev(button, t4);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, p1);
    			append_dev(div1, t7);
    			append_dev(div1, img0);
    			append_dev(div2, t8);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t9);
    			append_dev(div2, img1);
    			insert_dev(target, t10, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t11, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div3, anchor);
    			mount_component(chat, div3, null);
    			append_dev(div3, t13);
    			mount_component(options, div3, null);
    			append_dev(div3, t14);
    			append_dev(div3, p2);
    			append_dev(div3, t16);
    			append_dev(div3, img2);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, div4, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "keydown", /*keydown_handler*/ ctx[16], false, false, false),
    					listen_dev(window_1, "mousemove", mousemove_handler, false, false, false),
    					listen_dev(window_1, "contextmenu", contextmenu_handler, false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[17]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[18]),
    					listen_dev(button, "click", /*click_handler*/ ctx[19], false, false, false),
    					listen_dev(img2, "click", /*click_handler_4*/ ctx[34], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*joueur*/ 1 && input0.value !== /*joueur*/ ctx[0].pseudo) {
    				set_input_value(input0, /*joueur*/ ctx[0].pseudo);
    			}

    			if (dirty[0] & /*joueur*/ 1 && input1.value !== /*joueur*/ ctx[0].pass) {
    				set_input_value(input1, /*joueur*/ ctx[0].pass);
    			}

    			if (!current || dirty[0] & /*classbouttonconnexion*/ 64 && button_class_value !== (button_class_value = "" + (null_to_empty(/*classbouttonconnexion*/ ctx[6]) + " svelte-ds0igp"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (/*connexionerror*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div2, t9);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty[0] & /*chargementindicateur*/ 4 && img1_class_value !== (img1_class_value = "" + (null_to_empty(/*chargementindicateur*/ ctx[2] === true
    			? "indicateurtourne"
    			: "indicateur") + " svelte-ds0igp"))) {
    				attr_dev(img1, "class", img1_class_value);
    			}

    			if (!current || dirty[0] & /*menucache*/ 8 && div2_class_value !== (div2_class_value = "" + (null_to_empty(/*menucache*/ ctx[3] ? "menucache" : "") + " svelte-ds0igp"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!/*titrecache*/ ctx[4]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(t11.parentNode, t11);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*connecte*/ ctx[1]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*connecte*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t12.parentNode, t12);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*connecte*/ 2 && div3_class_value !== (div3_class_value = "" + (null_to_empty(/*connecte*/ ctx[1] === true
    			? "chatvisible"
    			: "chatinvisible") + " svelte-ds0igp"))) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			transition_in(chat.$$.fragment, local);
    			transition_in(options.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			transition_out(chat.$$.fragment, local);
    			transition_out(options.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t10);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t11);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div3);
    			destroy_component(chat);
    			destroy_component(options);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			run_all(dispose);
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

    async function demarrage() {
    	await Neutralino.window.move(0, 0);
    }

    const mousemove_handler = () => {
    	
    };

    const contextmenu_handler = e => {
    	e.preventDefault();
    };

    function instance$1($$self, $$props, $$invalidate) {
    	let placeinventaire;
    	let $volume;
    	let $focuschat;
    	validate_store(volume, 'volume');
    	component_subscribe($$self, volume, $$value => $$invalidate(45, $volume = $$value));
    	validate_store(focuschat, 'focuschat');
    	component_subscribe($$self, focuschat, $$value => $$invalidate(12, $focuschat = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Jeu', slots, []);
    	demarrage();
    	let windowwidth = window.screen.availWidth;
    	let windowheight = window.screen.availHeight;

    	//----------------------------------------------------------- Variable event
    	let connecte;

    	let chargementindicateur = false;
    	let menucache = false;
    	let titrecache = false;
    	let hudcache = true;
    	let joueur = new Personnage("invité", 0, 1);
    	setContext("joueur", joueur);
    	let toucheclavier;
    	let classbouttonquitter = "bouttoncaché";
    	let classbouttonconnexion = "";
    	let connexionerror = false;
    	let joueurenligne = [];
    	let nbjoueurenligne;
    	let effetfond;
    	let faceimg = new Image(100, 200);
    	faceimg.src = joueur.img;
    	let camera;
    	let difficulte = "normal";
    	let acceuil;
    	let spriteildaa;
    	let spritesonde;
    	let sondefinal = false;

    	//---------------------------------------------------------------------
    	let message = [
    		"Onixyum ",
    		"Nouveau sur Onixyum ?",
    		"Mauvais pass ou pseudo déjà pris",
    		"Un Pseudo*, un Pass* et c'est parti !"
    	];

    	let effet = [
    		new Audio("son/effet/ambiance.mp3"),
    		new Audio(""),
    		new Audio("son/effet/chat.mp3"),
    		new Audio("son/effet/validation3.mp3")
    	];

    	let ildaa = [
    		new Audio("son/effet/ildaabonjour.mp3"),
    		new Audio("son/effet/ildaastrategie.mp3"),
    		new Audio("son/effet/ildaacybershop.mp3"),
    		new Audio("son/effet/ildaastrategie.mp3")
    	];

    	let dopant = new Objet("Stimulant", 90, "img/potion.png", "consommable", "Un cocktail chimique stimulant", "+3 force");

    	//----------------------------------------------------------------------- Socket
    	function testsocket() {
    		let infos = {
    			nom: joueur.pseudo,
    			nb: nbjoueurenligne,
    			id: joueur.pseudo
    		};

    		socket.on("disconnect", () => {
    			socket.emit("deco", joueur.pseudo);
    		});

    		socket.emit("connexionenjeu", infos);
    	}

    	socket.on("alerteconnexion", data => {
    		// console.log(data.nb);
    		console.log(data.joueurs);

    		joueurenligne = data.joueurs;
    		nbjoueurenligne = data.nb--;
    	});

    	socket.on("alertedeconnexion", data => {
    		nbjoueurenligne--;
    		joueurenligne = data.joueurs;
    	});

    	socket.on("chatmaj", data => {
    		console.log("mess chat");
    	});

    	// console.log("connection établie avec ildaa"); // true
    	//--------------------------------------------------------------------- Fonctions
    	function enregistrementjoueur(
    		pseudo,
    	cyberz,
    	niveau,
    	sante,
    	attaque,
    	defense,
    	xp,
    	pass,
    	inventaire,
    	kill,
    	score,
    	puce,
    	amelioration,
    	relique,
    	coffres,
    	classe,
    	partenaire,
    	progression,
    	skin,
    	personnage,
    	img
    	) {
    		fetch("https://apiildaa.herokuapp.com/connectionjoueur", {
    			method: "post",
    			mode: "cors",
    			headers: {
    				Accept: "application/json, text/plain, */*",
    				"Content-Type": "application/json"
    			},
    			body: JSON.stringify({
    				pseudo,
    				cyberz,
    				niveau,
    				sante,
    				attaque,
    				defense,
    				xp,
    				pass,
    				inventaire,
    				kill,
    				score,
    				puce,
    				amelioration,
    				relique,
    				coffres,
    				classe,
    				partenaire,
    				progression,
    				skin,
    				personnage,
    				img
    			})
    		}).then(res => res.json()).then(res => {
    			if (res === "error") {
    				console.log("erreur pseudo ou pass erroné");
    				$$invalidate(2, chargementindicateur = false);
    				$$invalidate(7, connexionerror = true);
    				return "error";
    			} else {

    				if (res.compte != undefined) ; /* console.log("nouveau compte créer"); */

    				$$invalidate(0, joueur.pseudo = res.pseudo, joueur);
    				$$invalidate(0, joueur.cyberz = res.cyberz, joueur);
    				$$invalidate(0, joueur.niveau = res.niveau, joueur);
    				$$invalidate(0, joueur.sante = res.sante, joueur);
    				$$invalidate(0, joueur.attaque = res.attaque, joueur);
    				$$invalidate(0, joueur.defense = res.defense, joueur);
    				$$invalidate(0, joueur.xp = res.xp, joueur);
    				$$invalidate(0, joueur.pass = res.pass, joueur);
    				$$invalidate(0, joueur.inventaire = res.inventaire, joueur);
    				$$invalidate(0, joueur.kill = res.kill, joueur);
    				$$invalidate(0, joueur.score = res.score, joueur);
    				$$invalidate(0, joueur.puce = res.puce, joueur);
    				$$invalidate(0, joueur.amelioration = res.amelioration, joueur);
    				$$invalidate(0, joueur.relique = res.relique, joueur);
    				$$invalidate(0, joueur.coffres = res.coffres, joueur);
    				$$invalidate(0, joueur.classe = res.classe, joueur);
    				$$invalidate(0, joueur.partenaire = res.partenaire, joueur);
    				$$invalidate(0, joueur.progression = res.progresson, joueur);
    				$$invalidate(0, joueur.skin = res.skin, joueur);
    				$$invalidate(0, joueur.personnage = res.personnage, joueur);
    				$$invalidate(0, joueur.img = res.img, joueur);
    				$$invalidate(2, chargementindicateur = false);
    				$$invalidate(1, connecte = true);
    				$$invalidate(3, menucache = true);
    				$$invalidate(4, titrecache = true);
    				$$invalidate(10, effet[0].volume = $volume, effet);
    				joueur.inventaire.push(dopant);
    				console.log(joueur.inventaire);
    			}

    			/* console.log(res); */
    			/* console.log(res.pseudo); */
    			/* console.log(joueur.inventaire.length); */
    			setInterval(
    				() => {
    					effet[0].play();
    				},
    				1000
    			);

    			setTimeout(
    				() => {
    					ildaa[0].volume = $volume;
    					ildaa[0].play();
    				},
    				2000
    			);
    		});
    	}

    	//---------------------------------------------------------------------------------------- Scene
    	class Acceuil extends Phaser.Scene {
    		constructor() {
    			super("Acceuil");
    		}

    		//--------------------------------------------------------------------------------------- PRELOAD
    		preload() {
    			$$invalidate(9, acceuil = this);

    			// JOUEUR
    			// joueur.inventaire.push(objet);
    			// joueur.inventaire.push(objet2);
    			// PNJ
    			/*  this.load.image("dude", "/img/boy.png", { frameWidth: 48, frameHeight: 48 });
    // PARTICULE
    this.load.image("particule", "/img/glitter2.png", {
        frameWidth: 21,
        frameHeight: 21
    }); */
    			// MAP
    			this.load.image("mapimg", "img/tokyo.png", { frameWidth: 1000, frameHeight: 500 });
    		}

    		//------------------------------------------------------ CREATE
    		create() {
    			// CREATION MAP
    			this.background = this.add.image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "mapimg").setOrigin(0.5, 0.5);

    			this.background.displayWidth = this.sys.canvas.width;
    			this.background.displayHeight = this.sys.canvas.height;

    			// CREATION JOUEUR
    			// HITBOX
    			// this.background.setPipeline("Light2D");
    			this.lights.enable();

    			// this.lights.setAmbientColor(55, 55, 255);
    			this.lights.addLight(300, 300, 1600).setIntensity(3);

    			this.lights.addLight(1400, 200, 800).setIntensity(3);
    			this.lights.addLight(690, 200, 800).setIntensity(3);
    			this.lights.addLight(950, 300, 800).setIntensity(2);

    			// // CREATION PARTICULE
    			this.input.on("pointermove", function (pointer) {
    				
    			});

    			toucheclavier = this.input.keyboard.createCursorKeys();
    		} // -----------------------------CREATION ANIMATION

    		//-----------------------------------------------------------------------------------UPDATE
    		update() {
    			if (connecte === true) {
    				/* console.log("jeu commencé"); */
    				hudcache = false;

    				this.scene.start("Menuprincipal", "Acceuil");
    			}
    		}
    	}

    	//--------------------------------------------------------------------------------
    	class Menuprincipal extends Phaser.Scene {
    		constructor() {
    			super("Menuprincipal");
    		}

    		//--------------------------------------------------------------------------------------- PRELOAD
    		preload() {
    			// JOUEUR
    			// joueur.inventaire.push(objet);
    			// joueur.inventaire.push(objet2);
    			// PNJ
    			/*  this.load.image("dude", "/img/boy.png", { frameWidth: 48, frameHeight: 48 });
    // PARTICULE
    this.load.image("particule", "/img/glitter2.png", {
        frameWidth: 21,
        frameHeight: 21
    }); */
    			// MAP
    			this.load.image("fondmenu", "img/session.png", { frameWidth: 1000, frameHeight: 500 });

    			this.load.image("fondmenu2", "img/session2.png", { frameWidth: 1000, frameHeight: 500 });
    			this.load.spritesheet("ildaa", "/img/ildaa.png", { frameWidth: 528, frameHeight: 842 });
    			this.load.spritesheet("sonde", "/img/sonde.png", { frameWidth: 120, frameHeight: 120 });
    		}

    		//------------------------------------------------------ CREATE
    		create() {
    			spritesonde = this.physics.add.sprite(windowwidth - 250, windowheight - 450, "sonde");
    			spritesonde.setSize(89, 92, true);
    			spritesonde.setDepth(2);
    			spriteildaa = this.physics.add.sprite(windowwidth - 350, windowheight - 180, "ildaa");
    			spriteildaa.setSize(30, 80, true);
    			spriteildaa.setDepth(2);
    			camera = this.cameras.main;
    			camera.fadeIn(1500, 1);

    			// CREATION MAP
    			this.background = this.add.image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "fondmenu").setOrigin(0.5, 0.5);

    			this.background.displayWidth = this.sys.canvas.width;
    			this.background.displayHeight = this.sys.canvas.height;

    			// CREATION JOUEUR
    			// HITBOX
    			this.background.setPipeline("Light2D");

    			this.lights.enable();
    			this.lights.setAmbientColor(0x808080);
    			this.lights.addLight(300, 200, 1600).setIntensity(3);
    			this.lights.addLight(1400, 200, 800).setIntensity(3);
    			this.lights.addLight(690, 200, 800).setIntensity(3);
    			this.lights.addLight(950, 300, 800).setIntensity(2);

    			// // CREATION PARTICULE
    			this.input.on("pointermove", function (pointer) {
    				
    			});

    			toucheclavier = this.input.keyboard.createCursorKeys();
    			effetfond = this.add.image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "fondmenu2").setOrigin(0.5, 0.5);
    			effetfond.displayWidth = this.sys.canvas.width;
    			effetfond.displayHeight = this.sys.canvas.height;

    			this.tweens.add({
    				targets: effetfond,
    				alpha: { from: 0, to: 1 },
    				ease: "Sine.InOut",
    				duration: 3000,
    				repeat: -1,
    				yoyo: true
    			});

    			this.anims.create({
    				key: "ildaayeux",
    				frames: this.anims.generateFrameNumbers("ildaa", {
    					frames: [
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						2,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						2,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0,
    						0
    					]
    				}),
    				frameRate: 8,
    				repeat: -1
    			});

    			spriteildaa.play("ildaayeux");

    			/* spritesonde.setVelocity(100, 200); */
    			spritesonde.setBounce(1, 1);

    			spritesonde.setCollideWorldBounds(true);
    		} // -----------------------------CREATION ANIMATION

    		//-----------------------------------------------------------------------------------UPDATE
    		update() {
    			function mouvementsonde(x) {
    				if (sondefinal) {
    					spritesonde.y += 0.1;
    					spritesonde.x += 0.1;
    				} else {
    					spritesonde.y -= 0.2;
    					spritesonde.x -= 0.2;
    				}
    			}

    			/*  this.physics.moveToObject(spritesonde, spriteildaa, 120); */
    			mouvementsonde();

    			if (spritesonde.y <= 270) {
    				sondefinal = true;
    			}

    			if (spritesonde.y >= 310) {
    				sondefinal = false;
    			}
    		}
    	}

    	const config = {
    		width: windowwidth,
    		height: windowheight,
    		pixelArt: false,
    		scene: [Acceuil, Menuprincipal],
    		type: Phaser.AUTO,
    		parent: "jeu",
    		physics: {
    			default: "arcade",
    			arcade: { gravity: { y: 0 } }
    		},
    		scale: {
    			parent: "jeu",
    			mode: Phaser.Scale.FIT,
    			autoCenter: Phaser.Scale.CENTER_BOTH
    		}
    	};

    	var game = new Phaser.Game(config);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Jeu> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = event => {
    		if (event.key === "p") {
    			if ($focuschat === true) {
    				console.log($focuschat + "est true");
    			} else {
    				console.log($focuschat + "est false");
    			}

    			console.log("touche p !");
    			console.log(joueur);
    		}
    	}; /* console.log(event); */

    	function input0_input_handler() {
    		joueur.pseudo = this.value;
    		$$invalidate(0, joueur);
    	}

    	function input1_input_handler() {
    		joueur.pass = this.value;
    		$$invalidate(0, joueur);
    	}

    	const click_handler = () => {
    		$$invalidate(10, effet[3].volume = 0.5, effet);
    		effet[3].play();
    		enregistrementjoueur(joueur.pseudo, joueur.cyberz, joueur.niveau, joueur.sante, joueur.attaque, joueur.defense, joueur.xp, joueur.pass, joueur.inventaire, joueur.kill, joueur.score, joueur.puce, joueur.amelioration, joueur.relique, joueur.coffres, joueur.classe, joueur.partenaire, joueur.progression, joueur.skin, joueur.personnage, joueur.img);

    		{
    			$$invalidate(2, chargementindicateur = true);
    		} // hudcache = false;

    		{
    			$$invalidate(5, classbouttonquitter = "");
    		}

    		{
    			$$invalidate(6, classbouttonconnexion = "bouttoncaché");
    		}

    		testsocket();
    	};

    	const click_handler_1 = event => {
    		window.location.reload();
    	};

    	const click_handler_2 = event => {
    		acceuil.scene.start("Acceuil", "Menuprincipal");
    	};

    	const click_handler_3 = async event => {
    		/*    await window.Neutralino.app.exit();
    await window.Neutralino.app.killProcess(); */
    		await window.Neutralino.window.setDraggableRegion("jcjmode");

    		await window.Neutralino.storage.setData("userDetails", JSON.stringify({ username: "TestValue" }));
    		window.Neutralino.os.open("https://apiildaa.herokuapp.com/");
    		await window.Neutralino.os.showMessageBox("Hello", "Welcome");
    		await window.Neutralino.os.showNotification("Hello world", "It works!. Have a nice day");
    	}; /*  await window.Neutralino.filesystem.writeFile("./myFile.txt", "Sample content");
    await window.Neutralino.clipboard.writeText("hehe");
    await window.Neutralino.app.restartProcess({ args: "--restarted" }); */ /* acceuil.scene.start("Acceuil", "Menuprincipal"); */

    	function hud_pseudo_binding(value) {
    		if ($$self.$$.not_equal(joueur.pseudo, value)) {
    			joueur.pseudo = value;
    			$$invalidate(0, joueur);
    		}
    	}

    	function hud_cyberz_binding(value) {
    		if ($$self.$$.not_equal(joueur.cyberz, value)) {
    			joueur.cyberz = value;
    			$$invalidate(0, joueur);
    		}
    	}

    	function hud_niv_binding(value) {
    		if ($$self.$$.not_equal(joueur.niveau, value)) {
    			joueur.niveau = value;
    			$$invalidate(0, joueur);
    		}
    	}

    	function hud_barredevie_binding(value) {
    		if ($$self.$$.not_equal(joueur.sante, value)) {
    			joueur.sante = value;
    			$$invalidate(0, joueur);
    		}
    	}

    	function hud_sante_binding(value) {
    		if ($$self.$$.not_equal(joueur.sante, value)) {
    			joueur.sante = value;
    			$$invalidate(0, joueur);
    		}
    	}

    	function hud_xp_binding(value) {
    		if ($$self.$$.not_equal(joueur.xp, value)) {
    			joueur.xp = value;
    			$$invalidate(0, joueur);
    		}
    	}

    	function hud_srcface_binding(value) {
    		faceimg = value;
    		$$invalidate(8, faceimg);
    	}

    	function hud_kill_binding(value) {
    		if ($$self.$$.not_equal(joueur.kill, value)) {
    			joueur.kill = value;
    			$$invalidate(0, joueur);
    		}
    	}

    	function hud_score_binding(value) {
    		if ($$self.$$.not_equal(joueur.score, value)) {
    			joueur.score = value;
    			$$invalidate(0, joueur);
    		}
    	}

    	function hud_inventaire_binding(value) {
    		if ($$self.$$.not_equal(joueur.inventaire, value)) {
    			joueur.inventaire = value;
    			$$invalidate(0, joueur);
    		}
    	}

    	function hud_placeinventaire_binding(value) {
    		placeinventaire = value;
    		($$invalidate(11, placeinventaire), $$invalidate(0, joueur));
    	}

    	const click_handler_4 = async () => {
    		await window.Neutralino.app.exit();
    	};

    	$$self.$capture_state = () => ({
    		Allier,
    		Personnage,
    		Objet,
    		chatouvert,
    		socket,
    		sauvegarde,
    		Chat,
    		Hud,
    		Options,
    		getContext,
    		setContext,
    		focuschat,
    		volume,
    		demarrage,
    		windowwidth,
    		windowheight,
    		connecte,
    		chargementindicateur,
    		menucache,
    		titrecache,
    		hudcache,
    		joueur,
    		toucheclavier,
    		classbouttonquitter,
    		classbouttonconnexion,
    		connexionerror,
    		joueurenligne,
    		nbjoueurenligne,
    		effetfond,
    		faceimg,
    		camera,
    		difficulte,
    		acceuil,
    		spriteildaa,
    		spritesonde,
    		sondefinal,
    		message,
    		effet,
    		ildaa,
    		dopant,
    		testsocket,
    		enregistrementjoueur,
    		Acceuil,
    		Menuprincipal,
    		config,
    		game,
    		placeinventaire,
    		$volume,
    		$focuschat
    	});

    	$$self.$inject_state = $$props => {
    		if ('windowwidth' in $$props) windowwidth = $$props.windowwidth;
    		if ('windowheight' in $$props) windowheight = $$props.windowheight;
    		if ('connecte' in $$props) $$invalidate(1, connecte = $$props.connecte);
    		if ('chargementindicateur' in $$props) $$invalidate(2, chargementindicateur = $$props.chargementindicateur);
    		if ('menucache' in $$props) $$invalidate(3, menucache = $$props.menucache);
    		if ('titrecache' in $$props) $$invalidate(4, titrecache = $$props.titrecache);
    		if ('hudcache' in $$props) hudcache = $$props.hudcache;
    		if ('joueur' in $$props) $$invalidate(0, joueur = $$props.joueur);
    		if ('toucheclavier' in $$props) toucheclavier = $$props.toucheclavier;
    		if ('classbouttonquitter' in $$props) $$invalidate(5, classbouttonquitter = $$props.classbouttonquitter);
    		if ('classbouttonconnexion' in $$props) $$invalidate(6, classbouttonconnexion = $$props.classbouttonconnexion);
    		if ('connexionerror' in $$props) $$invalidate(7, connexionerror = $$props.connexionerror);
    		if ('joueurenligne' in $$props) joueurenligne = $$props.joueurenligne;
    		if ('nbjoueurenligne' in $$props) nbjoueurenligne = $$props.nbjoueurenligne;
    		if ('effetfond' in $$props) effetfond = $$props.effetfond;
    		if ('faceimg' in $$props) $$invalidate(8, faceimg = $$props.faceimg);
    		if ('camera' in $$props) camera = $$props.camera;
    		if ('difficulte' in $$props) difficulte = $$props.difficulte;
    		if ('acceuil' in $$props) $$invalidate(9, acceuil = $$props.acceuil);
    		if ('spriteildaa' in $$props) spriteildaa = $$props.spriteildaa;
    		if ('spritesonde' in $$props) spritesonde = $$props.spritesonde;
    		if ('sondefinal' in $$props) sondefinal = $$props.sondefinal;
    		if ('message' in $$props) $$invalidate(13, message = $$props.message);
    		if ('effet' in $$props) $$invalidate(10, effet = $$props.effet);
    		if ('ildaa' in $$props) ildaa = $$props.ildaa;
    		if ('dopant' in $$props) dopant = $$props.dopant;
    		if ('game' in $$props) game = $$props.game;
    		if ('placeinventaire' in $$props) $$invalidate(11, placeinventaire = $$props.placeinventaire);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*joueur*/ 1) {
    			$$invalidate(11, placeinventaire = joueur.inventaire.length);
    		}
    	};

    	return [
    		joueur,
    		connecte,
    		chargementindicateur,
    		menucache,
    		titrecache,
    		classbouttonquitter,
    		classbouttonconnexion,
    		connexionerror,
    		faceimg,
    		acceuil,
    		effet,
    		placeinventaire,
    		$focuschat,
    		message,
    		testsocket,
    		enregistrementjoueur,
    		keydown_handler,
    		input0_input_handler,
    		input1_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		hud_pseudo_binding,
    		hud_cyberz_binding,
    		hud_niv_binding,
    		hud_barredevie_binding,
    		hud_sante_binding,
    		hud_xp_binding,
    		hud_srcface_binding,
    		hud_kill_binding,
    		hud_score_binding,
    		hud_inventaire_binding,
    		hud_placeinventaire_binding,
    		click_handler_4
    	];
    }

    class Jeu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Jeu",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let div;
    	let jeu;
    	let current;
    	jeu = new Jeu({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(jeu.$$.fragment);
    			attr_dev(div, "oncontextmenu", "return false;");
    			attr_dev(div, "class", "svelte-1hyn1za");
    			add_location(div, file, 4, 0, 60);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(jeu, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jeu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jeu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(jeu);
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
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Jeu });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	},
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
