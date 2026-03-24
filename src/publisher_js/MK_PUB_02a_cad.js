(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');
    
    const currentLang = urlParams.get('lang') || 'de'; 
    if (!encodedData) return;

    let item;
    try {
        const decodedStr = decodeURIComponent(escape(atob(encodedData)));
        item = JSON.parse(decodedStr)[0];
    } catch (e) { return; }

   
    const translations = {
        de: "Automatisches Ausfüllen läuft...",
        it: "Compilazione automatica in corso...",
        en: "Automatic filling in progress..."
    };

    const overlayId = 'autofill-overlay';
    
    const hideContainer = (selector) => {
        const el = document.querySelector(selector);
        const container = el?.closest('.pss_field, .pss_field_container');
        if (container) {
            container.style.setProperty('display', 'none', 'important');
        }
    };

    const injectFinalHideStyle = () => {
        const style = document.createElement('style');
        style.textContent = `
            .pss_fieldname_propertyref, 
            .pss_fieldname_pubcadviewerspacemapping, 
            .pss_fieldname_floorattributeenddate { 
                display: none !important; 
            }
        `;
        document.head.appendChild(style);
    };

    function showOverlay() {
        if (document.getElementById(overlayId)) return;
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

    const handlePopup = (searchLabels, searchValue, classToHide) => {
        return new Promise((resolve) => {
            let openBtn = null;
            for (let label of searchLabels) {
                const input = document.querySelector(`input[aria-label*="${label}"]`);
                const container = input?.closest('.pss_field, .pss_field_container, td');
                openBtn = container?.querySelector('a.pss_action, button.pss_action, .pnicon-chevron-right-light');
                if (openBtn) break;
            }
            if (!openBtn) return resolve(false);

            setTimeout(() => {
                openBtn.click();
                const checkModal = setInterval(() => {
                    const modal = document.querySelector('.modal-dialog, .pss_modal');
                    if (modal && modal.offsetParent !== null) {
                        modal.style.setProperty('opacity', '0.01', 'important');
                        const rows = Array.from(modal.querySelectorAll('tr.aria_row, tr.row_title'));
                        const match = rows.find(r => r.innerText.includes(searchValue));

                        if (match) {
                            clearInterval(checkModal);
                            const selectBtn = match.querySelector('.pnicon-chevron-right, .pnicon-chevron-right-light, a.pss_action');
                            if (selectBtn) selectBtn.click(); else match.click();
                            
                            setTimeout(() => {
                                if (classToHide !== 'none') hideContainer(`.${classToHide}`);
                                resolve(true);
                            }, 300);
                        }
                    }
                }, 300);
                setTimeout(() => { clearInterval(checkModal); resolve(false); }, 5000);
            }, 400);
        });
    };

    const runWorkflow = async () => {
        showOverlay();
        
        try {
            
            await handlePopup(['Edificio', 'Gebäude', 'Property'], item.edificio, 'pss_fieldname_propertyref');
            await new Promise(r => setTimeout(r, 600));

            
            await handlePopup(['Piano', 'Stockwerk', 'Floor'], item.piano, 'none');
            await new Promise(r => setTimeout(r, 600));

            
            const selects = document.querySelectorAll('select');
            selects.forEach(s => {
                const opt = Array.from(s.options).find(o => o.text.includes('MK_CAD_SelectedMoveRequest'));
                if (opt) {
                    s.value = opt.value;
                    s.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });

           
            injectFinalHideStyle();
            hideContainer('.pss_fieldname_pubcadviewerspacemapping');
            hideContainer('.pss_fieldname_floorattributeenddate');

       
            setTimeout(() => {
                const goBtn = document.querySelector('.go, button.pss_button_main, a[aria-label*="Weiter"], a[aria-label*="Avanti"], a[aria-label*="Continue"]');
                if (goBtn) goBtn.click();
                setTimeout(() => document.getElementById(overlayId)?.remove(), 800);
            }, 1000);

        } catch (e) {
            document.getElementById(overlayId)?.remove();
        }
    };

    const startRetry = setInterval(() => {
        const check = document.querySelector('input[aria-label*="Edificio"], input[aria-label*="Gebäude"], input[aria-label*="Property"]');
        if (check && check.offsetParent !== null) {
            clearInterval(startRetry);
            runWorkflow();
        }
    }, 200);
})();