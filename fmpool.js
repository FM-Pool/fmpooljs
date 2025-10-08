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
        const $el = $(selector, context);

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
            return $el;
        };

        $el.readonlyOnSessionCondition = function (key, val) {
            if (getSessionItem(key) === val) {
                this.readonly();
            }
            return $el;
        };

        $el.countAmountOfElements = function () {
            return this.length;
        };

        $el.saveAmountIfElementsToSession = function (key) {
            setSessionItem(key, this.countAmountOfElements());
            return $el;
        };

        $el.clear = function () {
            this.val("");
            return $el;
        };

        return $el;
    }

    // --- Static / global methods ---
    fmpooljs.setSessionItem = function (key, val) {
        sessionStorage.setItem(key, val);
    };

    fmpooljs.getSessionItem = function (key) {
        return sessionStorage.getItem(key);
    };

    fmpooljs.removeSessionItem = function (key) {
        sessionStorage.removeItem(key);
    };

    fmpooljs.clearSession = function () {
        sessionStorage.clear();
    };

    // Expose version for clarity
    fmpooljs.version = "0.0.1";

    return fmpooljs;
});
