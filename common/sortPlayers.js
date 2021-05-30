module.exports = (players, teams, relay) => {
    players.sort(function(a, b) {
        if (teams && a.team !== b.team) {
            return a.team - b.team;
        }

        if (teams && relay) {
            return a.leg - b.leg;
        }

        if (!a.time) {
            if (b.time) {
                return 1;
            }
        }
        if (!b.time) {
            if (a.time) {
                return -1;
            }
        }
        if (b.forfeited) {
            if (!a.forfeited) {
                return 1;
            }
        }
        if (a.forfeited) {
            if (!b.forfeited) {
                return -1;
            }
        }

        return a.time - b.time;
    });
}