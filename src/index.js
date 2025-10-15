(function (root, factory) {
    // Support browser, AMD, and CommonJS environments
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        // Browser global (normal <script> tag)
        root.fmpooljs = factory(root.jQuery);
    }
})(typeof self !== "undefined" ? self : this, function ($) {
    if (!$) {
        throw new Error("fmpooljs requires jQuery to be loaded first!");
    }

    //
    const version = "0.1.0";
    const script = document.currentScript;
    const config = script?.dataset;

    // --- Internal state ---
    let loggingEnabled = false;

    // --- Helper: controlled logger ---
    function log(...args) {
        if (loggingEnabled) {
            print("log", args);
        }
    }

    function info(...args) {
        print("info", args);
    }

    function print(prefix, args) {
        const logPrefix = `[fmpooljs:${prefix}] `
        if (args.length == 1 && (typeof args[0] === 'string' || args[0] instanceof String)) {
            console.log(logPrefix + args);
        } else {
            console.log(logPrefix, args);
        }
    }

    // ===========================================================
    // 🔧 Shared Builder — defines everything once
    // ===========================================================
    function createFmpool(win, jq, frame) {
        info("init version " + version);
        log("createFmpool", win, jq, frame, win.location?.href, frame, config);
        const session = win.sessionStorage;
        let currentWindow = win;
        let newWindow = null;
        if (frame !== undefined) {
            newWindow = frame;
        }

        info(["Configurations: ", config]);
        if (config?.hideSelector) {
            $(config.hideSelector).hide();
        }

        function fmpooljs(selector, context) {
            if (newWindow != null) {
                log("reinit", newWindow, frame, currentWindow.location?.href, newWindow.location.href);
                instance = createFmpool(newWindow, newWindow.$);
                newWindow.fmpooljs = instance;
                log("Reinitialized fmpooljs for iframe context:", newWindow.location?.href || "(no href)", newWindow);
                newWindow = null;
                return instance(selector, context);
            }
            const $el = jq(selector, context);
            log("Selected elements:", selector, $el, win.location?.href);

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
                $el.val("");
                log("Cleared element(s):", $el);
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

            $el.saveValueToStore = function (key) {
                const val = $el.val();
                log("Save value to store:", key, val);
                session.setItem(key, val);
                return $el;
            }

            $el.saveFieldValueToStore = function (key) {
                const val = $el.find("input").val();
                log("Save field value to store:", key, val);
                session.setItem(key, val);
                return $el;
            }

            $el.clearOnSessionValueCondition = function (key, predict) {
                const value = session.getItem(key);
                log("Check condition for clear value:", key, value, predict);
                if (typeof predict === "function" ? predict(value) : value === predict) {
                    $el.clear();
                    log("Value cleared", $el);
                }
                return $el;
            }

            $el.prefillFromStore = function (key) {
                const value = session.getItem(key);
                log("Prefill from store", key, value, $el);
                $el.fillAutoCompleteTextField(value);
                return $el;
            }

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

        fmpooljs.evenCompare = function (value) {
            const func = (el) => el == value;
            log("evenCompare created:", func);
            return func;
        };

        // --- Logging controls ---
        fmpooljs.enableLogging = function () {
            loggingEnabled = true;
            log("Logging enabled");
        };

        fmpooljs.disableLogging = function () {
            loggingEnabled = false;
            log("Logging disabled");
        };

        fmpooljs.version = version;

        return fmpooljs;
    }

    // ===========================================================
    // Main instance (for the parent window)
    // ===========================================================
    let instance = createFmpool(window, $);

    instance.reinitialize = function (win, jq) {
        if (!win || !jq) {
            console.error("[fmpooljs] reinitialize() requires a window and jQuery instance.");
            return null;
        }
        const newFmpool = createFmpool(win, jq);
        win.fmpooljs = newFmpool;
        log("Reinitialized fmpooljs for iframe context:", win.location?.href || "(no href)");
        return newFmpool;
    };

    instance.exposeToIframes = function () {
        if (!window.frames || window.frames.length === 0) {
            log("No iframes found in this window");
            return;
        }

        const frames = Array.from(window.frames);
        let count = 0;

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            try {
                frame.fmpooljs = createFmpool(window, $, frame);
                log("Attached fmpooljs to iframe:", frame.location?.href || "(no href)");
                count++;
            } catch (e) {
                log("Skipped cross-origin iframe:", e.message);
            }
        }

        log(`fmpooljs exposed to ${count} iframe(s)`);
    };


    // Expose version for clarity
    instance.version = version;

    return instance;
});
