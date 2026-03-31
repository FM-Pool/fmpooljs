(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');
    const currentLang = urlParams.get('lang') || 'de';
    const loggingEnabled = true;
    if (!encodedData) {
        log(["abort because no data provided."])
        return;
    }

    let item;
    try {
        const decodedStr = decodeURIComponent(escape(atob(encodedData)));
        item = JSON.parse(decodedStr);
        log(["decode data", item])
    } catch (e) {
        log(["Could process data", encodedData, decodedStr]);
        return;
    }

    const translations = {
        de: "Automatisches Ausfüllen läuft...",
        it: "Compilazione automatica in corso...",
        en: "Automatic filling in progress..."
    };

    const overlayId = 'autofill-overlay';

    const fieldClasses = {
        building: 'pss_fieldname_propertyref',
        floor: 'pss_fieldname_pubcadviewerfloor',
        mapping: 'pss_fieldname_pubcadviewerspacemapping',
        date: 'pss_fieldname_floorattributeenddate'
    };

    const hideContainer = (selector) => {
        const el = document.querySelector(selector);
        if (el) {
            el.style.setProperty('display', 'none', 'important');
        }
    };

    const injectFinalHideStyle = () => {
        const style = document.createElement('style');
        style.textContent = `
            .${fieldClasses.building}, 
            .${fieldClasses.mapping}, 
            .${fieldClasses.date} { 
                display: none !important; 
            }
        `;
        document.head.appendChild(style);
    };

    function showOverlay() {
        if (document.getElementById(overlayId)) {
            log(["Overlay shown", overlayId]);
            return;
        }
        const msg = translations[currentLang] || translations.de;
        const overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                <div class="spinner" style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #00b2ee; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <div style="font-size: 18px; color: #333; font-family: Arial; text-align: center; padding: 0 20px;">${msg}</div>
            </div>`;
        const style = document.createElement('style');
        style.textContent = `@keyframes spin { to { transform: rotate(360deg); } } #${overlayId} { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.9); z-index: 999999; display: flex; align-items: center; justify-content: center; }`;
        document.head.appendChild(style);
        document.body.appendChild(overlay);
    }

    const handlePopup = (targetClass, searchValue, shouldHide) => {
        return new Promise((resolve) => {
            const container = document.querySelector(`.${targetClass}`);
            if (!container) {
                return resolve(false);
            }

            const openBtn = container.querySelector('a.pss_action, button.pss_action, .pnicon-chevron-right-light, .pnicon-chevron-right');

            if (!openBtn) {
                return resolve(false);
            }

            setTimeout(() => {
                openBtn.click();
                const checkModal = setInterval(() => {
                    const modal = document.querySelector('.modal-dialog, .pss_modal');
                    if (modal && modal.offsetParent !== null) {
                        modal.style.setProperty('opacity', '0.01', 'important');
                        const rows = Array.from(modal.querySelectorAll('tbody tr.aria_row'));
                        log("rows from search", rows, searchValue);
                        if (searchValue) {
                            const match = rows.find(r => r.innerText.includes(searchValue));
                            clickValueInSearch(match, checkModal, shouldHide, targetClass, resolve);
                        } else {
                            clickValueInSearch(rows[0], checkModal, shouldHide, targetClass, resolve);
                        }
                    }
                }, 300);
                setTimeout(() => { clearInterval(checkModal); resolve(false); }, 5000);
            }, 400);
        });
    };

    function clickValueInSearch(element, checkModal, shouldHide, targetClass, resolve) {
        log(clickValueInSearch, element, checkModal, shouldHide, targetClass, resolve);
        if (element) {
            clearInterval(checkModal);
            const selectBtn = element.querySelector('.pnicon-chevron-right, .pnicon-chevron-right-light, a.pss_action');
            if (selectBtn) {
                selectBtn.click();
            } else {
                element.click();
            }

            setTimeout(() => {
                if (shouldHide) {
                    hideContainer(`.${targetClass}`);
                }
                resolve(true);
            }, 300);
        }
    }

    const runWorkflow = async () => {
        showOverlay();
        try {
            await handlePopup(fieldClasses.building, item.building, true);
            await new Promise(r => setTimeout(r, 600));

            await handlePopup(fieldClasses.floor, item.floor, false);
            await new Promise(r => setTimeout(r, 600));


            const mappingContainer = document.querySelector(`.${fieldClasses.mapping}`);
            if (mappingContainer) {
                const select = mappingContainer.querySelector('select');
                if (select) {
                    const opt = Array.from(select.options).find(o => o.text.includes('MK_CAD_SelectedMoveRequest'));
                    if (opt) {
                        select.value = opt.value;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            }

            injectFinalHideStyle();
            hideContainer(`.${fieldClasses.mapping}`);
            hideContainer(`.${fieldClasses.date}`);

            setTimeout(() => {
                const goBtn = document.querySelector('.go, button.pss_button_main, a[aria-label*="Weiter"], a[aria-label*="Avanti"], a[aria-label*="Continue"]');
                if (goBtn) {
                    goBtn.click();
                }
                setTimeout(() => document.getElementById(overlayId)?.remove(), 800);
            }, 1000);

        } catch (e) {
            console.error("Autofill error:", e);
            document.getElementById(overlayId)?.remove();
        }
    };

    function log(...args) {
        if (loggingEnabled) {
            console.log(args);
        }
    }

    const startRetry = setInterval(() => {
        const check = document.querySelector(`.${fieldClasses.building}`);
        if (check && check.offsetParent !== null) {
            clearInterval(startRetry);
            runWorkflow();
        }
    }, 200);
})();