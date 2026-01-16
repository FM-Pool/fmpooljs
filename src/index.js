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
    const version = "0.1.12";
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
    /**
     * @module sharedBuilder
     * @desc shared builder to create fmpooljs instance.
     * @param {*} win browser windwo
     * @param {*} jq jquery
     * @param {*} frame optional: current frame
     * @returns fmpooljs object
     */
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

        /**
         * @module fmpooljs
         * @desc fmpooljs uses jquery to select elements from the DOM.
         * @param {string} selector - CSS selector
         * @param {*} context - Contex
         * @returns fmpooljs object
         */
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

            /** 
             * @function readonly
             * @access public
             * @summary Sets field to readonly
             * @desc Works only with fields which are configured with "Allowed select actions: 'Pop-up and autosuggest'"
             * @returns fmpooljs object
             */
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

            /**
             * @function clear
             * @access public
             * @summary Empties an input field
             * @returns fmpooljs
             */
            $el.clear = function () {
                $el.val("");
                log("Cleared element(s):", $el);
                return $el;
            };

            /** 
             * @function countAmountOfElements
             * @access public
             * @summary counts elements of given selector
             * @returns amount of elements
             */
            $el.countAmountOfElements = function () {
                const len = this.length;
                log("Counted elements:", len);
                return len;
            };

            /**
             * @function saveAmountIfElementsToSession
             * @access public
             * @summary saves the amount of elements to a session variable
             * @param {String} key name of the session variable
             * @returns fmpooljs object
             */
            $el.saveAmountIfElementsToSession = function (key) {
                const val = this.countAmountOfElements();
                session.setItem(key, val);
                log("Saved element count to session:", key, "=", val);
                return $el;
            };

            
            /**
             * @function readonlyOnSessionCondition
             * @access public
             * @summary Compares the value of the session storage to a given predict and set the element readonly when condition is met.
             * @param {String} key Key of session to of the value to read
             * @param {Function} predict Function for comparison
             * @returns fmpooljs object
             */
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

            /**
             * @function saveValueToStore
             * @access public
             * @summary save the input value of the element into the session storage
             * @param {String} key key of the session storage
             * @returns fmpooljs object
             */
            $el.saveValueToStore = function (key) {
                const val = $el.val();
                log("Save value to store:", key, val);
                session.setItem(key, val);
                return $el;
            }

            /**
             * @function saveFieldValueToStore
             * @access public
             * @summary saves the value of the current selected field to the given session storage
             * @param {String} key key of the session storage
             * @returns fmpooljs object
             */
            $el.saveFieldValueToStore = function (key) {
                let val = $el.find("input").val();
                if(val === undefined) {
                    val = $el.find(".pss_field_value").text().trim();
                }
                log("Save field value to store:", key, val);
                session.setItem(key, val);
                return $el;
            }

            /**
             * @function getFieldValue
             * @access public
             * @summary gets the value of the input within the selector.
             * @returns value of the input field
             */
            $el.getFieldValue = function(){
                let inputField = $el.find("input");
                log("Try find input field", inputField);
                let val = inputField.val();
                if(val === undefined) {
                    let textField = $el.find(".pss_field_value");
                    log("Try find text field", textField);
                    val = textField.text().trim();
                }
                log("Found Field Value: " + val);
                return val;
            }

            /**
             * @function clearOnSessionValueCondition
             * @access public
             * @summary Clears input field when predict for value of given session storage key validates to true.
             * @param {String} key key of the session storage
             * @param {Function} predict compare function
             * @returns fmpooljs object
             */
            $el.clearOnSessionValueCondition = function (key, predict) {
                const value = session.getItem(key);
                log("Check condition for clear value:", key, value, predict);
                if (typeof predict === "function" ? predict(value) : value === predict) {
                    $el.clear();
                    log("Value cleared", $el);
                }
                return $el;
            }

            /**
             * @function prefillFromStore
             * @access public
             * @summary prefills field from storage and uses fillAutoCompleteTextField function
             * @param {String} key key of session storage
             * @returns fmpooljs object
             */
            $el.prefillFromStore = function (key) {
                const value = session.getItem(key);
                log("Prefill from store", key, value, $el);
                $el.fillAutoCompleteTextField(value);
                return $el;
            }

            return $el;
        }

        // --- Static helpers ---
        /**
         * @function setSessionItem
         * @access public
         * @static
         * @summary set value into session storage
         * @param {String} key key of session storage
         * @param {String} val value of session storage
         */
        fmpooljs.setSessionItem = function (key, val) {
            session.setItem(key, val);
            log("Session item set:", key, "=", val);
        };

        /**
         * @function getSessionItem
         * @access public
         * @static
         * @summary save value to session storage
         * @param {*} key key of session storage
         * @returns value of session storage
         */
        fmpooljs.getSessionItem = function (key) {
            const value = session.getItem(key);
            log("Session item get:", key, "=", value);
            return value;
        };

        /**
         * @function unevenCompare
         * @access public
         * @static
         * @summary returns a function for uneven comparison
         * @param {*} value value to compare with
         * @returns function
         */
        fmpooljs.unevenCompare = function (value) {
            const func = (el) => el != value;
            log("unevenCompare created:", func);
            return func;
        };

        /**
         * @function evenCompare
         * @access public
         * @static
         * @summary returns a function for even comparison
         * @param {*} value value to compare with
         * @returns function
         */
        fmpooljs.evenCompare = function (value) {
            const func = (el) => el == value;
            log("evenCompare created:", func);
            return func;
        };

        /**
         * @function createCustomButton
         * @access public
         * @static
         * @summary Adds a button with a link to an element
         * @param {*} text the text of the button
         * @param {*} link the link the button goes to
         * @param {*} targetSelector the selector where the button is added
         */
        fmpooljs.createCustomButton = function(text, link, targetSelector) {
            log("createCustomButton:", text, link, targetSelector);
            var addButton = `<div class='customAddContainer'>
                <a target='_blank' href='${link}' class='pss_button add_button pss_action'><span><b>${text}</b></span></a>
            </div>`;
            fmpooljs(targetSelector).append(addButton);
            $(".customAddContainer").css({" margin-top":"-36px","text-align":"center"});
            var a_href = $(".customAddContainer a").attr('href');
            log("link set to: ", a_href);
        };

        /**
         * @function getEnvoirmentUrl
         * @access public
         * @static
         * @summary retuns the current url
         * @returns url of the envoirment
         */
        fmpooljs.getEnvoirmentUrl = function() {
            var url = location.href;
            log("getEnvoirmentUrl -> current url" + url);
            var environmentUrl = url.substring(0, url.indexOf('case'));
            log("getEnvoirmentUrl: " + environmentUrl);
            return environmentUrl;
        };

        /**
         * @function buildUrl
         * @access public
         * @static
         * @summary builds an url of the current envoirment
         * @param {*} path the second path of the url
         * @returns url
         */
        fmpooljs.buildUrl = function(path) {
            var url = fmpooljs.getEnvoirmentUrl() + path;
            log("buildUrl: " + url);
            return url;
        };

        /**
         * @function hideParent
         * @access public
         * @static
         * @summary hides the parent element where the script is added. The selector is given in the data-hide-selector attribute of the script tag
         */
        fmpooljs.hideParent = function() {
            log("hideParent: ", config?.hideSelector);
            if (config?.hideSelector) {
                let element = $(config.hideSelector);
                log("found selector: ", element);
                element.hide();
            }
        };


        // --- Logging controls ---
        /**
         * @function enableLogging
         * @access public
         * @static
         * @summary activats logging
         */
        fmpooljs.enableLogging = function () {
            loggingEnabled = true;
            log("Logging enabled");
        };

        /**
         * @function disableLogging
         * @access public
         * @static
         * @summary deactivats logging
         */
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
