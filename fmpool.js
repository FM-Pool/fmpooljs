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

    // --- helper functions (available inside closure) ---
    function setSessionItem(key, val) {
        sessionStorage.setItem(key, val);
    }

    function getSessionItem(key) {
        return sessionStorage.getItem(key);
    }

    /**
     * Main wrapper (returns enhanced jQuery object)
     */
    function fmpooljs(selector, context) {
        const $el = $(selector);

        log("selected element", $el, selector, context);

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
            log("set element readonly", $el);
            return $el;
        };

        $el.readonlyOnSessionCondition = function (key, predict) {
            if (predict(getSessionItem(key))) {
                $el.readonly();
                log("Condition met to set element readonly", $el, key, "==", predict);
            } else {
                log("Condition not met to set element readonly", $el, key, "==", predict);
            }
            return $el;
        };

        $el.countAmountOfElements = function () {
            return this.length;
        };

        $el.saveAmountIfElementsToSession = function (key) {
            var val = this.countAmountOfElements();
            setSessionItem(key, val);
            log("Set item in seesion store", key, "==", val);
            return $el;
        };

        $el.clear = function () {
            log("Cleared element", $el, this);
            $el.val("");
            return $el;
        };

        return $el;
    }

    // --- Static / global methods ---
    fmpooljs.setSessionItem = function (key, val) {
        sessionStorage.setItem(key, val);
        log("Set item in seesion store", key, "==", val);
    };

    fmpooljs.getSessionItem = function (key) {
        var value = sessionStorage.getItem(key);
        log("Read value from store", key, "==", value);
        return value;
    };

    fmpooljs.unevenCompare = function (value) {
        var func = ((el) => el != value)
        log("unevenCompare", func);
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

    fmpooljs.exposeToIframes = function () {
        if (!window.frames || window.frames.length === 0) {
            log("No iframes found in this window");
            return;
        }

        const frames = Array.from(window.frames);
        let count = 0;

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            try {
                frame.fmpooljs = fmpooljs;
                log("Attached fmpooljs to iframe:", frame.location?.href || "(no href)");
                count++;
            } catch (e) {
                debug("Skipped cross-origin iframe:", e.message);
            }
        }

        log(`fmpooljs exposed to ${count} iframe(s)`);
    };


    // Expose version for clarity
    fmpooljs.version = "0.0.1";

    return fmpooljs;
});

jQuery(function () {

});