/**
 * Dev Console Filter — Suppresses browser extension noise
 * Load this FIRST (before other scripts) to keep console clean.
 * Only filters errors/warnings from known extension sources.
 */
(function() {
    var extensionPatterns = [
        /sw\.js/,
        /evmAsk/,
        /requestProvider/,
        /inpage\.js/,
        /contentscript\.js/,
        /contentScript\.js/,
        /mobx-state-tree/,
        /Cannot redefine property: ethereum/,
        /Cannot set property ethereum/,
        /jamToggleDumpStore/,
        /migrate function was not provided/
    ];

    function isExtensionNoise(args) {
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (typeof arg === 'string') {
                for (var j = 0; j < extensionPatterns.length; j++) {
                    if (extensionPatterns[j].test(arg)) return true;
                }
            }
            if (arg instanceof Error && typeof arg.message === 'string') {
                for (var k = 0; k < extensionPatterns.length; k++) {
                    if (extensionPatterns[k].test(arg.message)) return true;
                }
            }
            if (arg && typeof arg.stack === 'string') {
                for (var m = 0; m < extensionPatterns.length; m++) {
                    if (extensionPatterns[m].test(arg.stack)) return true;
                }
            }
        }
        return false;
    }

    ['error', 'warn'].forEach(function(method) {
        var original = console[method].bind(console);
        console[method] = function() {
            if (!isExtensionNoise(arguments)) {
                original.apply(console, arguments);
            }
        };
    });
})();
