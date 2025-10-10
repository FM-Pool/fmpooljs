(function (root, factory) {
    // Support browser, AMD, and CommonJS environments
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        // Browser global
        root.fmpooljs = factory(root.jQuery);
    }
})(typeof self !== "undefined" ? self : this, function ($) {

    if (!$) {
        throw new Error("fmpooljs requires jQuery to be loaded first!");
    }

    // --- Internal logging state ---
    let loggingEnabled = false;

    function log(...args) {
        if (loggingEnabled) console.log("[fmpooljs]", ...args);
    }

    // ===========================================================
    // 🔧 Shared Builder — defines everything once
    // ===========================================================
    function createFmpool(win, jq) {
        const session = win.sessionStorage;

        function fmpooljs(selector, context) {
            const $el = jq(selector, context);
            log("Selected elements:", selector, $el);

            // --- Element-level methods ---
            $el.readonly = function () {
                var fieldWrapper = this;
                var input = this.find("input");
                var inputWrapper = this.find(".pss_editor_container");

                fieldWrapper.removeClass("pss_readwrite").addClass("pss_readonly");
                input
                    .removeClass("pss_field_input")
                    .addClass("pss_read_only_editor")
                    .attr("readonly", "readonly");
                inputWrapper
                    .removeClass("pss_editor_container")
                    .addClass("pss_entry_editor");
                fieldWrapper.find(".pss_actions").remove();

                log("Set element readonly:", this);
                return $el;
            };

            $el.clear = function () {
                this.val("");
                log("Cleared element(s):", this);
                return $el;
            };

            $el.countAmountOfElements = function () {
                const len = this.length;
                log("Counted elements:", len);
                return len;
            };

            $el.saveAmountIfElementsToSession = function (key) {
                const val = this.countAmountOfElements();
                session.setItem(key, val);
                log("Saved element count to session:", key, "=", val);
                return $el;
            };

            $el.readonlyOnSessionCondition = function (key, predict) {
                const value = session.getItem(key);
                if (typeof predict === "function" ? predict(value) : value === predict) {
                    this.readonly();
                    log("Condition met for readonly:", key, value);
                } else {
                    log("Condition not met for readonly:", key, value);
                }
                return $el;
            };

            return $el;
        }

        // --- Static helpers ---
        fmpooljs.setSessionItem = function (key, val) {
            session.setItem(key, val);
            log("Session item set:", key, "=", val);
        };

        fmpooljs.getSessionItem = function (key) {
            const value = session.getItem(key);
            log("Session item get:", key, "=", value);
            return value;
        };

        fmpooljs.unevenCompare = function (value) {
            const func = (el) => el != value;
            log("unevenCompare created:", func);
            return func;
        };

        // --- Logging controls ---
        fmpooljs.enableLogging = function () {
            loggingEnabled = true;
            console.info("[fmpooljs] Logging enabled");
        };

        fmpooljs.disableLogging = function () {
            loggingEnabled = false;
            console.info("[fmpooljs] Logging disabled");
        };

        fmpooljs.version = "1.3.0";

        return fmpooljs;
    }

    // ===========================================================
    // Main instance (for the parent window)
    // ===========================================================
    const fmpooljs = createFmpool(window, $);

    // ===========================================================
    // 🔹 Reinitialize for an iframe
    // ===========================================================
    fmpooljs.reinitialize = function (win, jq) {
        if (!win || !jq) {
            console.error("[fmpooljs] reinitialize() requires a window and jQuery instance.");
            return null;
        }
        const newFmpool = createFmpool(win, jq);
        win.fmpooljs = newFmpool;
        log("Reinitialized fmpooljs for iframe context:", win.location?.href || "(no href)");
        return newFmpool;
    };

    // ===========================================================
    // 🔹 Expose to same-origin iframes
    // ===========================================================

    /**
 * 🔹 Expose fmpooljs to same-origin iframes
 * Waits for iframes to fully load and ensures jQuery exists before initialization.
 *
 * Options:
 *  - timeout (ms)      : how long to wait for jQuery (default 8000)
 *  - interval (ms)     : polling interval to check for jQuery (default 200)
 *  - autoInject (bool) : if true, inject jQuery if not found (default false)
 *  - jQueryUrl (string): optional URL to your jQuery script (default uses CDN latest alias)
 *
 * Example:
 *   fmpooljs.exposeToIframes({ autoInject: true });
 */
    fmpooljs.exposeToIframes = function (options) {
        const opts = Object.assign({
            timeout: 200,
            interval: 20,
            autoInject: false,
            // Use a “latest” alias — not version-locked
            jQueryUrl: "https://code.jquery.com/jquery.min.js"
        }, options || {});

        if (!window.frames || window.frames.length === 0) {
            log("No iframes found in this window");
            return;
        }

        const frames = Array.from(window.frames);
        log(`exposeToIframes: checking ${frames.length} iframe(s)`);

        function waitForJQueryInWindow(win, opts) {
            return new Promise((resolve, reject) => {
                const start = Date.now();
                let injected = false;

                function tryInjectJQuery() {
                    if (!opts.autoInject || injected) return;
                    try {
                        if (!win.document || !win.document.head) return;
                        const script = win.document.createElement("script");
                        script.src = opts.jQueryUrl;
                        script.async = false;
                        script.onload = () => log("Injected jQuery into iframe (onload).");
                        script.onerror = (e) => debug("Failed to inject jQuery:", e.message);
                        win.document.head.appendChild(script);
                        injected = true;
                        log("Attempted to inject jQuery into iframe.");
                    } catch (e) {
                        debug("Injection failed (CSP or cross-origin):", e.message);
                    }
                }

                function check() {
                    try {
                        if (win.jQuery || win.$) {
                            resolve(win.jQuery || win.$);
                            return;
                        }
                    } catch (e) {
                        reject(new Error("cross-origin or inaccessible iframe"));
                        return;
                    }

                    if (opts.autoInject && !injected) {
                        tryInjectJQuery();
                    }

                    if (Date.now() - start >= opts.timeout) {
                        reject(new Error("timeout waiting for jQuery"));
                        return;
                    }

                    setTimeout(check, opts.interval);
                }

                check();
            });
        }

        frames.forEach((frameWin, idx) => {
            try {
                const frameEl = frameWin.frameElement;

                const init = () => {
                    log(`Iframe #${idx} ready — waiting for jQuery.`);
                    waitForJQueryInWindow(frameWin, opts)
                        .then((jq) => {
                            fmpooljs.reinitialize(frameWin, jq);
                            log(`fmpooljs initialized in iframe #${idx}:`, frameEl?.src || "(no src)");
                        })
                        .catch((err) => {
                            debug(`Iframe #${idx} init failed:`, err.message);
                        });
                };

                // If iframe already loaded
                if (frameWin.document && frameWin.document.readyState === "complete") {
                    init();
                } else if (frameEl && frameEl.addEventListener) {
                    frameEl.addEventListener("load", init, { once: true });
                    log(`Attached load listener to iframe #${idx}`);
                } else {
                    try {
                        frameWin.addEventListener("load", init, { once: true });
                        log(`Attached window load listener to iframe #${idx}`);
                    } catch (e) {
                        debug("Could not attach load handler:", e.message);
                    }
                }
            } catch (outerErr) {
                debug("Skipping iframe (cross-origin or inaccessible):", outerErr.message);
            }
        });
    };



    return fmpooljs;
});
