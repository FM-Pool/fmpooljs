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
    const version = "0.1.13";
    const script = document.currentScript;
    const config = script?.dataset;

    let colorPerStatus = [
        { color: '#746D75', status: ['Rejected', 'Abgelehnt', 'Rifiutato'] },
        { color: '#DA4949', status: ['Reported', 'Gemeldet', 'Segnalato'] },
        { color: '#9E643C', status: ['Approved', 'Genehmigt', 'Approvato', 'Erledigt'] },
        { color: '#593837', status: ['Accepted', 'Akzeptiert', 'Accettato'] },
        { color: '#B4E1FF', status: ['Analyse issue', 'Analyse der Meldung', 'Analisi richista'] },
        { color: '#000075', status: ['In progress', 'Im Gange', 'In corso', 'In Bearbeitung', 'In lavorazione'] },
        { color: '#F0E247', status: ['In review ACC', 'Prüfung in ACC', 'Verifica in ACC'] },
        { color: '#F7A82A', status: ['In review PROD', 'Prüfung in PROD', 'Verifica in PROD'] },
        { color: '#F7672A', status: ['Migration to PROD', 'Migration nach PROD', 'Migrazione in PROD'] },
        { color: '#FFACE4', status: ['Assigned', 'Beauftragt', 'Assegnato'] },
        { color: '#A167A5', status: ['Waiting on customer (Request)', 'Warten auf den Kunden (Meldung)', 'In attesa del cliente (Richiesta)'] },
        { color: '#A167A5', status: ['Waiting on customer', 'Warten auf den Kunden', 'In attesa del cliente'] },
        { color: '#CC207C', status: ['Waiting on supplier', 'Warten auf den Lieferant', 'In attesa del fornitore'] },
        { color: '#3345BD', status: ['On hold', 'In der Warteschleife', 'In attesa'] },
        { color: '#7CFEF0', status: ['Temporary Fix', 'Provisorische Reparatur', 'Correzione temporanea'] },
        { color: '#00B04F', status: ['Administratively completed', 'Administrativ abgeschlossen', 'Completato a livello amministrativo'] },
        { color: '#6BFFB8', status: ['Technically completed', 'Technisch abgeschlossen', 'Completato a livello tecnico'] },
        { color: '#0d4726', status: ['Completed', 'Abgeschlossen', 'Completato', 'Erledigt'] },
        { color: '#000000', status: ['Cancelled', 'Storniert', 'Zurückgenommen', 'Annullato'] },
    ];

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
                if (val === undefined) {
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
            $el.getFieldValue = function () {
                let val = $el.find("input").val();
                if (val === undefined) {
                    val = $el.find(".pss_field_value").text().trim();
                }
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

            /**
             * @function setStandardStatusColor
             * @access public
             * @summary set colors for datasets according to color definition
             * @returns fmpooljs object
             */
            $el.setStandardStatusColor = function () {
                log("setStandardStatusColor", $el);
                for (var eleIdx = 0; eleIdx < $el.length; eleIdx++) {
                    var element = $el[eleIdx];
                    if (element.hasOwnProperty('FusionCharts')) {
                        var chart = element.FusionCharts;
                        var data = chart.getChartData('json');
                        data.dataset.forEach(setColorPerDataset);
                        log("set colors", chart, data);
                        chart.setChartData(data, 'json');
                    }
                }
                return $el;
            }

            function setColorPerDataset(dateElement) {
                for (var colorIdx = 0; colorIdx < colorPerStatus.length; colorIdx++) {
                    var colorPerStatusEntry = colorPerStatus[colorIdx];
                    for (var statusIdx = 0; statusIdx < colorPerStatusEntry.status.length; statusIdx++) {
                        let statusName = colorPerStatus[colorIdx].status[statusIdx];
                        if (statusName == dateElement.seriesname) {
                            dateElement.color = colorPerStatus[colorIdx].color;
                        }
                    }
                }
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

        /**
         * @function disableLogging
         * @access public
         * @static
         * @summary waits till the element exist (max waiting time 5000s).
         * @param {*} selector select of element to appear
         * @param {*} callback call back as a lambda function i.e.: f => myFunction()
         */
        fmpooljs.waitForElementToExist = function (selector, callback) {
            log("waitForElementToExist", selector, callback);
            fmpooljs.waitForElementToExistWithCounter(selector, callback, 0);
        }

        fmpooljs.waitForElementToExistWithCounter = function (selector, callback, counter) {
            log("waitForElementToExistWithCounter", selector, callback, counter);
            var fmElement = fmpooljs(selector);
            log(fmElement, fmElement.length);
            if (fmElement.length > 0) {
                callback();
            } else {
                counter++;
                if (counter > 10) {
                    return;
                }
                window.setTimeout(function () {
                    fmpooljs.waitForElementToExistWithCounter(selector, callback, counter);
                }, 500);
            }
        }



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
