$(document).ready(function () {
    // wird am anfang einmal geladen
    console.log("planon-sender: init.");
    // fmpooljs('.pss_actiontype_continue').injectPublisherButton();
    function injectPublisherButton() {
        // sprachelement als ankerpunkt nutzen damit der button oben im menü bleibt
        const $langTarget = $('.pss_actiontype_continue');

        // nur einfügen wenn der anker da ist und der button nicht schon existiert
        if (!$langTarget.length || $('#planon-publisher-btn').length) return;

        // sprache aus html tag holen für die button beschriftung
        const htmlLang = $('html').attr('lang') || 'de';
        let detectedLang = 'de';
        let buttonText = 'Zum Lageplan';

        if (htmlLang.includes('it')) {
            detectedLang = 'it';
            buttonText = 'Alla planimetria';
        } else if (htmlLang.includes('en')) {
            detectedLang = 'en';
            buttonText = 'To the floor plan';
        }

        const $pubButton = $('<a>', {
            id: 'planon-publisher-btn',
            class: 'pss_action pss_button', // planon styles nutzen für saubere optik
            href: 'javascript:void(0);',
            css: {
                'background-color': '#00b2ee',
                'color': '#ffffff',
                'margin-left': '10px',
                'cursor': 'pointer'
            }
        }).append($('<span>', { class: 'pss_action_label', text: buttonText }));

        $pubButton.on('click', function (e) {
            e.preventDefault();
            let results = [];

            // alle zeilen durchgehen und daten ziehen
            $('tr').each(function () {
                const $row = $(this);
                // technische planon selektoren verwenden (review punkt!)
                const $edi = $row.find('.pss_fieldname_propertyfromref');
                const $pia = $row.find('.pss_fieldname_freestring2');
                const $spa = $row.find('.pss_fieldname_spacefromref ');

                if ($edi.length && $pia.length) {
                    results.push({
                        // nur den code nehmen (alles vor dem bindestrich)
                        edificio: $edi.text().trim().split(' - ')[0],
                        piano: $pia.text().trim().split(' - ')[0],
                        spazio: $spa.text().trim().split(' - ')[0]
                    });
                }
            });

            if (results.length > 0) {
                const jsonStr = JSON.stringify(results);
                const base64Data = btoa(unescape(encodeURIComponent(jsonStr)));

                // relativer pfad damit es auf acc und prod ohne änderung läuft
                const url = `/case/BP/MK_PUB_02a_cad?data=${base64Data}&lang=${detectedLang}`;
                window.open(url, '_blank');
            }
        });

        $langTarget.after($pubButton);
    }

    injectPublisherButton();

    // observer statt intervall nutzen für bessere performance
    const observer = new MutationObserver(() => injectPublisherButton());
    observer.observe(document.body, { childList: true, subtree: true });
});