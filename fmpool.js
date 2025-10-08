(function (root, factory) {
    // Support both browser and CommonJS environments
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

    function fmpooljs(selector, context) {
        const $el = $(selector, context);

        // --- Element-level methods ---
        $el.readonly = function () {
            var fieldWrapper = this;
            var input = this.find("input");
            var inputWrapper = $(this).find(".pss_editor_container");
            input.removeClass("pss_readwrite").addClass("pss_readonly");
            fieldWrapper.removeClass("pss_field_input").addClass("pss_read_only_editor").attr("readonly", "readonly");
            inputWrapper.removeClass("pss_editor_container").addClass("pss_entry_editor");
            fieldWrapper.find(".pss_actions").remove();
            return $el;
        }

        $el.readonlyOnSessionCondition = function (key, val) {
            if (getSessionItem(key) === val) {
                this.readonly();
            }
            return $el;
        }

        $el.countAmountOfElements = function () {
            return this.length;
        }

        $el.saveAmountIfElementsToSession = function (key) {
            setSessionItem(key, this.countAmountOfElements());
        }

        $el.clear = function () {
            console.log($el);
        }

        return $el;
    }

    fmpooljs.setSessionItem = function (key, val) {
        sessionStorage.setItem(key, val);
    }

    fmpooljs.getSessionItem = function (key) {
        sessionStorage.getItem(key);
    }

    return fmpooljs;
});