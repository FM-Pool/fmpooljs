(function (global) {
    if (!$) {
        throw new Error("fmpooljs requires jQuery to be loaded first!");
    }

    function fmpooljs(selector) {
        if (!(this instanceof fmpooljs)) {
            return new fmpooljs(selector);
        }

        this.elements = $(selector);
    }

    fmpooljs.setSessionItem = function(key, val) {
        sessionStorage.setItem(key, val);
    }

    fmpooljs.getSessionItem = function(key) {
        sessionStorage.getItem(key);
    }

    fmpooljs.prototype.readOnly = function () {
        var fieldWrapper = this.elements;
        var input = this.elements.find("input");
        var inputWrapper = $(this).find(".pss_editor_container");
        input.removeClass("pss_readwrite").addClass("pss_readonly");
        fieldWrapper.removeClass("pss_field_input").addClass("pss_read_only_editor").attr("readonly", "readonly");
        inputWrapper.removeClass("pss_editor_container").addClass("pss_entry_editor");
        fieldWrapper.find(".pss_actions").remove();
    }

    fmpooljs.prototype.readOnlyOnSessionCondition = function (key, val) {
        if(getSessionItem(key) === val){
            this.readOnly();
        }
    }

    fmpooljs.prototype.countAmountOfElements = function(){
        return this.elements.length;
    }

    fmpooljs.prototype.saveAmountIfElementsToSession = function(key) {
        setSessionItem(key, this.countAmountOfElements());
    }

    global.fmpooljs = fmpooljs;
})(window);