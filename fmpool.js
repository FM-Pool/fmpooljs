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

    // --- Internal state ---
    let loggingEnabled = false;

    // --- Helper: controlled logger ---
    function log(...args) {
        if (loggingEnabled) {
            console.log("[fmpooljs]", [...args]);
        }
    }

    // ===========================================================
    // 🔧 Shared Builder — defines everything once
    // ===========================================================
    function createFmpool(win, jq, frame) {
        log("createFmpool", win, jq, frame, win.location?.href, frame);
        const session = win.sessionStorage;
        let currentWindow = win;
        let newWindow = null;
        if (frame !== undefined) {
            newWindow = frame;
        }

        function fmpooljs(selector, context) {
            if (newWindow != null) {
                log("reinit", newWindow, frame, currentWindow.location?.href, newWindow.location.href);
                //fmpooljs.reinitialize(newWindow, jq);
                //newWindow = null;
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

    instance.prepareReinitalize = function (frame, jq) {
        log("prepareReinitalize", frame.location?.href);
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
                frame.fmpooljs.prepareReinitalize(frame, jq);
                log("Attached fmpooljs to iframe:", frame.location?.href || "(no href)");
                count++;
            } catch (e) {
                log("Skipped cross-origin iframe:", e.message);
            }
        }

        log(`fmpooljs exposed to ${count} iframe(s)`);
    };


    // Expose version for clarity
    instance.version = "0.0.1";

    return instance;
});

jQuery(function () {

});