'use strict'
module.exports = (settings, items) => {
    for (let i = 0; i < items.length; i++) {
        if (items[i] === 'OcarinaActive') {
            settings.eq.splice(0, 0, settings.mode === 'standard' ? 'OcarinaInactive' : 'OcarinaActive');
            settings.custom.item.count['OcarinaInactive'] = 0;
            settings.custom.item.count.TwentyRupees2++;
        } else if (items[i] === 'SilverArrowUpgrade') {
            settings.eq.splice(0, 0, items[i]);
            settings.custom.item.count.ProgressiveBow--;
            settings.custom.item.count.Arrow++;
        } else if (settings.custom.item.count[items[i]] > 0) {
            settings.eq.splice(0, 0, items[i]);
            settings.custom.item.count[items[i]]--;
            settings.custom.item.count.TwentyRupees2++;
        }
    }
}