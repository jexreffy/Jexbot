'use strict'
const JexCron = require('../cron/cron');

module.exports = class CronSeedOfTheWeek extends JexCron {
    constructor(app) {
        super(app);
    }

    get cronName() {
        return 'sotw';
    }

    get isGuildBased() {
        return false;
    }

    shouldTick(context) {
        return (Math.floor(new Date().getTime() - this._app.db.getLastSotw()) / 604800000) > 1;
    }

    tick(context) {
        let now = new Date();
        let guilds = this._app.guilds;
        for (let i = 0; i < guilds.length; i++) {
            let guildId = guilds[i];
            if (this._app.config['guilds'][guildId]['sotwEnabled']) {
                let easyIndex = this._app.db.getEasySotw(guildId);
                let easyCategory = this._app.config['guilds'][guildId]['sotwEasy'][easyIndex];
                easyIndex = easyIndex >= this._app.config['guilds'][guildId]['sotwEasy'].length - 1 ? 0 : easyIndex + 1;

                let mediumIndex = this._app.db.getMediumSotw(guildId);
                let mediumCategory = this._app.config['guilds'][guildId]['sotwMedium'][mediumIndex];
                mediumIndex = mediumIndex >= this._app.config['guilds'][guildId]['sotwMedium'].length - 1 ? 0 : mediumIndex + 1;

                let hardIndex = this._app.db.getHardSotw(guildId);
                let hardCategory = this._app.config['guilds'][guildId]['sotwHard'][hardIndex];
                hardIndex = hardIndex >= this._app.config['guilds'][guildId]['sotwHard'].length - 1 ? 0 : hardIndex + 1;

                let tourneyIndex = this._app.db.getTourneySotw(guildId);
                let tourneyCategory = this._app.config['guilds'][guildId]['sotwTourney'][tourneyIndex];
                tourneyIndex = tourneyIndex >= this._app.config['guilds'][guildId]['sotwTourney'].length - 1 ? 0 : tourneyIndex + 1;

                this._app.db.setSotwNext(guildId, easyIndex, mediumIndex, hardIndex, tourneyIndex, new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0).valueOf());

                this.#rollSeeds(guildId,
                                this._app.routines['categorySettings'](this._app, 'alttpr', easyCategory),
                                this._app.routines['categorySettings'](this._app, 'alttpr', mediumCategory),
                                this._app.routines['categorySettings'](this._app, 'alttpr', hardCategory),
                                this._app.routines['categorySettings'](this._app, 'alttpr', tourneyCategory));
            }
        }

        return false;
    }

    #rollSeeds(guildId, easySettings, mediumSettings, hardSettings, tourneySettings) {
        let codeStartAt = this._app.config['codeStartAt']
        let codeMap = this._app.config['guilds'][guildId]['codeMap'];
        let seeds = [];

        this._app.axios.post(easySettings.url, easySettings.settings).then(easyResult => {
            seeds.push(this._app.routines['processSeed'](codeStartAt, codeMap, easySettings.name, easySettings.title, easyResult));

            this._app.axios.post(mediumSettings.url, mediumSettings.settings).then(mediumResult => {
                seeds.push(this._app.routines['processSeed'](codeStartAt, codeMap, mediumSettings.name, mediumSettings.title, mediumResult));

                this._app.axios.post(hardSettings.url, hardSettings.settings).then(hardResult => {
                    seeds.push(this._app.routines['processSeed'](codeStartAt, codeMap, hardSettings.name, hardSettings.title, hardResult));

                    this._app.axios.post(tourneySettings.url, tourneySettings.settings).then(tourneyResult => {
                        seeds.push(this._app.routines['processSeed'](codeStartAt, codeMap, tourneySettings.name, tourneySettings.title, tourneyResult));

                        let role = this._app.getPingRole(guildId);
                        let randomSponsor = this._app.routines['getRandom'](this._app.config['sotwSponsor'].length);
                        let message = `${role} ${this._app.config['sotwMessage']} ${this._app.config['sotwSponsor'][randomSponsor]}`;

                        for (let i = 0; i < seeds.length; i++) {
                            message += `\n${seeds[i].name} ${seeds[i].link} ${seeds[i].code}`;
                        }

                        this._app.sendToDiscordSotwChannel(guildId, message);

                        this._app.db.setSotwSeeds(guildId, seeds[0], seeds[1], seeds[2], seeds[3]);
                    }).catch(console.error);
                }).catch(console.error);
            }).catch(console.error);
        }).catch(console.error);
    }
}