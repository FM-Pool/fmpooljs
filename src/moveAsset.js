(function() {
    function injectPublisherButton() {
        // Nur fortfahren, wenn ein Element mit der Klasse "language" existiert
        if (!document.querySelector('.language')) return;

        const targetBtn = document.querySelector('a[aria-label="Avanti"]');
        if (targetBtn && !document.getElementById('planon-publisher-btn')) {
            // Standardtext (Fallback)
            let buttonText = 'Visualizza richiesta su planimetria / Meldung auf dem Lageplan anzeigen';

            // Prüfen, ob ein <a class="language"> existiert, das einen <span> mit "Avanti" enthält
            const langSpan = document.querySelector('a.language span');
            if (langSpan && langSpan.textContent.includes('Avanti')) {
                buttonText = 'Alla planimetria';
            }
            // Sonst: Prüfen, ob der Ziel-Button (targetBtn) den Text "Weiter" enthält
            else if (targetBtn.textContent.includes('Weiter')) {
                buttonText = 'Zum Lageplan';
            }

            const pubButton = document.createElement('a');
            pubButton.id = 'planon-publisher-btn'; 
            pubButton.className = 'pss_action pss_button';
            pubButton.innerHTML = `<span class="pss_action_label">${buttonText}</span>`;
            pubButton.style.backgroundColor = '#00b2ee';
            pubButton.style.color = '#ffffff';
            pubButton.style.marginRight = '10px';
            pubButton.href = "javascript:void(0);";

            pubButton.onclick = function(e) {
                e.preventDefault();
                let results = [];
                const allRows = document.querySelectorAll('tr.pss_mrw_rowvalid');

                allRows.forEach(row => {
                    const edificioCell = row.querySelector('.Edificio');
                    const pianoCell = row.querySelector('.Piano');
                    const spaceCell = row.querySelector('td[data-column-name*="Spazio"]');

                    if (edificioCell && spaceCell) {
                        results.push({
                            edificio: edificioCell.innerText.trim().split(' - ')[0],
                            piano: pianoCell ? pianoCell.innerText.trim().split(' - ')[0] : "",
                            spaceId: spaceCell.innerText.trim()
                        });
                    }
                });

                if (results.length === 0) return alert("Keine gültigen Zeilen gefunden.");

                const jsonStr = JSON.stringify(results);
                const base64Data = btoa(unescape(encodeURIComponent(jsonStr)));
                const url = `https://sabes-acc.planoncloud.com/case/BP/MK_PUB_02a_cad?data=${base64Data}`;
                window.open(url, '_blank');
            };
            targetBtn.parentNode.insertBefore(pubButton, targetBtn);
        }
    }
    setInterval(injectPublisherButton, 10);
})();