const JrfScheduler = require('../jrfscheduler');

function wait(mlsecond = 1000) {
    return new Promise(resolve => setTimeout(resolve, mlsecond));
}

let glObj = {
    countValid: 0,
    countInvalid: 0
};

let tests = {

    async testCreate(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----
        okay = schedule.datetimeStart === null;

        if (okay) {
            okay = schedule.datetimeFinish === null;
        }

        if (okay) {
            okay = JSON.stringify(schedule.statusLists) === JSON.stringify(
                {
                    READY: 'READY',
                    RUNNING: 'RUNNING',
                    COMPLETED: 'COMPLETED'
                }
            );
        }

        if (okay) {
            okay = schedule.status === schedule.statusLists.READY;
        }

        if (okay) {
            okay = schedule.schedule === null;
        }

        if (okay) {
            okay = schedule.task === null;
        }

        if (okay) {
            okay = schedule.countRun === 0;
        }

        if (okay) {
            okay = schedule.nextRun === null;
        }

        if (okay) {
            okay = schedule.prevRun === null;
        }

        if (okay) {
            okay = JSON.stringify(schedule.history) === JSON.stringify([]);
        }

        if (okay) {
            okay = JSON.stringify(schedule.actLists) === JSON.stringify(
                {
                    START: 'START',
                    RUN_TASK: 'RUN_TASK',
                    STOP: 'STOP'
                }
            );
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testStart(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----

        okay = !await schedule.start();
        schedule.task = async () => {
            console.log('testStart');
        };

        if (okay) {
            okay = !await schedule.start();
        }

        schedule.schedule = {
            interval: '5s'
        };

        if (okay) {
            schedule.status = schedule.statusLists.RUNNING;
            okay = !await schedule.start();
        }

        if (okay) {
            schedule.status = schedule.statusLists.READY;
            okay = await schedule.start();
            await schedule.stop();
        }

        if (okay) {
            schedule.status = schedule.statusLists.COMPLETED;
            okay = await schedule.start();
            await schedule.stop();
        }

        if (okay) {
            await schedule.start();
            okay = schedule.status === schedule.statusLists.RUNNING;
            await schedule.stop();
        }

        if (okay) {
            await schedule.start();
            okay = schedule.history.length > 6;
            await schedule.stop();
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testReset(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----

        schedule.task = async () => {
            console.log('testStart');
        };

        schedule.schedule = {
            interval: '5s'
        };

        await schedule.start();
        await schedule.reset();

        okay = schedule.datetimeStart === null;

        if (okay) {
            okay = schedule.datetimeFinish === null;
        }

        if (okay) {
            okay = JSON.stringify(schedule.statusLists) === JSON.stringify(
                {
                    READY: 'READY',
                    RUNNING: 'RUNNING',
                    COMPLETED: 'COMPLETED'
                }
            );
        }

        if (okay) {
            okay = schedule.status === schedule.statusLists.READY;
        }

        if (okay) {
            okay = schedule.schedule === null;
        }

        if (okay) {
            okay = schedule.task === null;
        }

        if (okay) {
            okay = schedule.countRun === 0;
        }

        if (okay) {
            okay = schedule.nextRun === null;
        }

        if (okay) {
            okay = schedule.prevRun === null;
        }

        if (okay) {
            okay = JSON.stringify(schedule.history) === JSON.stringify([]);
        }

        if (okay) {
            okay = JSON.stringify(schedule.actLists) === JSON.stringify(
                {
                    START: 'START',
                    RUN_TASK: 'RUN_TASK',
                    STOP: 'STOP'
                }
            );
        }


        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testStop(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----

        schedule.task = async () => {
            console.log('testStart');
        };
        schedule.schedule = {
            interval: '5s'
        };

        okay = !await schedule.stop();

        if (okay) {
            schedule.status = schedule.statusLists.RUNNING;
            okay = await schedule.stop();
        }

        if (okay) {
            okay = schedule.status === schedule.statusLists.COMPLETED;
        }

        if (okay) {
            okay = schedule.history.length === 1;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testAddHistory(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----
        okay = schedule.history.length === 0;

        let start = new Date();
        let finish = start.getTime() + 1000;
        if (okay) {
            okay = await schedule._addHistory(schedule.actLists.START);
        }

        if (okay) {
            okay = schedule.history.length === 1;
        }

        let history = schedule.history[0];
        if (okay) {
            okay = history.act === schedule.actLists.START
        }

        if (okay) {
            okay = history.datetime >= start
                && history.datetime <= finish
        }

        if (okay) {
            okay = !await schedule._addHistory();
        }

        if (okay) {
            await schedule._addHistory(schedule.actLists.STOP, finish);
            history = schedule.history[1];
            okay = history.datetime === history.datetime;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testConvertTime(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----
        let fullTime = {
            h: 0,
            m: 0,
            s: 0,
            ms: 0,
            sumMs: 0
        };

        let time = await schedule._convertTime({});
        okay = JSON.stringify(time) === JSON.stringify(fullTime);

        if (okay) {
            time = await schedule._convertTime({h: 1});
            fullTime.h = 1;
            fullTime.sumMs = 3600000;
            okay = JSON.stringify(time) === JSON.stringify(fullTime);
        }

        if (okay) {
            time = await schedule._convertTime({h: 1, m: 1});
            fullTime.h = 1;
            fullTime.m = 1;
            fullTime.sumMs = 3660000;
            okay = JSON.stringify(time) === JSON.stringify(fullTime);
        }

        if (okay) {
            time = await schedule._convertTime({h: 1, m: 1, s: 1});
            fullTime.h = 1;
            fullTime.m = 1;
            fullTime.s = 1;
            fullTime.sumMs = 3661000;
            okay = JSON.stringify(time) === JSON.stringify(fullTime);
        }

        if (okay) {
            time = await schedule._convertTime({h: 1, m: 1, s: 1, ms: 1});
            fullTime.h = 1;
            fullTime.m = 1;
            fullTime.s = 1;
            fullTime.ms = 1;
            fullTime.sumMs = 3661001;
            okay = JSON.stringify(time) === JSON.stringify(fullTime);
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testParseTime(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----
        let now = new Date();
        let parseTime = await schedule._parseTime(now);

        okay = now.getFullYear() === parseTime.year;

        if (okay) {
            okay = now.getMonth() === parseTime.month;
        }

        if (okay) {
            okay = now.getDate() === parseTime.dayOfMonth;
        }

        if (okay) {
            okay = now.getDay() === parseTime.dayOfWeek;
        }

        if (okay) {
            okay = now.getHours() === parseTime.h;
        }

        let sumMs = 0;
        if (okay) {
            okay = now.getHours() * schedule._timer.partsTime.H === parseTime.hms;
            sumMs += now.getHours() * schedule._timer.partsTime.H;
        }

        if (okay) {
            okay = now.getMinutes() === parseTime.m;
        }

        if (okay) {
            okay = now.getMinutes() * schedule._timer.partsTime.M === parseTime.mms;
            sumMs += now.getMinutes() * schedule._timer.partsTime.M;
        }

        if (okay) {
            okay = now.getSeconds() === parseTime.s;
        }

        if (okay) {
            okay = now.getSeconds() * schedule._timer.partsTime.S === parseTime.sms;
            sumMs += now.getSeconds() * schedule._timer.partsTime.S;
        }

        if (okay) {
            okay = now.getMilliseconds() === parseTime.ms;
            sumMs += now.getMilliseconds();
        }

        if (okay) {
            okay = now.getTime() === parseTime.timeMs;
        }

        if (okay) {
            okay = sumMs === parseTime.sumMs;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testFillParseDate(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----
        let nowParse = await schedule._parseTime();
        let newParse = {...nowParse};
        nowParse.year++;
        await schedule._fillParseDate(nowParse);
        okay = nowParse.year === newParse.year + 1;

        if (okay) {
            okay = nowParse.timeMs !== newParse.timeMs;
        }

        if (okay) {
            okay = nowParse.sumMs === newParse.sumMs;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testAddDays(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----
        let date = new Date(2018, 1, 12, 15, 10, 20);
        let parseDate = await schedule._parseTime(date);
        let startParseDate = {...parseDate};

        await schedule._addDays(parseDate);
        okay = parseDate.dayOfMonth === 13;

        if (okay) {
            okay = parseDate.dayOfWeek === 2;
        }

        if (okay) {
            okay = parseDate.timeMs === 1518523820000;
        }

        if (okay) {
            await schedule._addDays(parseDate, 2);
            okay = parseDate.dayOfMonth === 15;
        }

        if (okay) {
            okay = parseDate.dayOfWeek === 4;
        }

        if (okay) {
            okay = parseDate.timeMs === 1518696620000;
        }

        if (okay) {
            await schedule._addDays(parseDate, -3);
            okay = JSON.stringify(parseDate) === JSON.stringify(startParseDate);
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testAddMonths(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----
        let date = new Date(2018, 1, 12, 15, 10, 20);
        let parseDate = await schedule._parseTime(date);
        let startParseDate = {...parseDate};

        await schedule._addMonths(parseDate);
        okay = parseDate.dayOfMonth === 12;

        if (okay) {
            okay = parseDate.dayOfWeek === 1;
        }

        if (okay) {
            okay = parseDate.month === 2;
        }

        if (okay) {
            okay = parseDate.timeMs === 1520856620000;
        }

        if (okay) {
            await schedule._addMonths(parseDate, 2);
            okay = parseDate.dayOfMonth === 12;
        }

        if (okay) {
            okay = parseDate.dayOfWeek === 6;
        }

        if (okay) {
            okay = parseDate.month === 4;
        }

        if (okay) {
            okay = parseDate.timeMs === 1526127020000;
        }

        if (okay) {
            await schedule._addMonths(parseDate, -3);
            okay = JSON.stringify(parseDate) === JSON.stringify(startParseDate);
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testAddYears(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----
        let date = new Date(2018, 1, 12, 15, 10, 20);
        let parseDate = await schedule._parseTime(date);
        let startParseDate = {...parseDate};

        await schedule._addYears(parseDate);
        okay = parseDate.dayOfMonth === 12;

        if (okay) {
            okay = parseDate.dayOfWeek === 2;
        }

        if (okay) {
            okay = parseDate.month === 1;
        }

        if (okay) {
            okay = parseDate.year === 2019;
        }

        if (okay) {
            okay = parseDate.timeMs === 1549973420000;
        }

        if (okay) {
            await schedule._addYears(parseDate, 2);
            okay = parseDate.dayOfMonth === 12;
        }

        if (okay) {
            okay = parseDate.dayOfWeek === 5;
        }

        if (okay) {
            okay = parseDate.month === 1;
        }

        if (okay) {
            okay = parseDate.year === 2021;
        }

        if (okay) {
            okay = parseDate.timeMs === 1613131820000;
        }

        if (okay) {
            await schedule._addYears(parseDate, -3);
            okay = JSON.stringify(parseDate) === JSON.stringify(startParseDate);
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testStartNextWeek(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----
        let date = new Date(2018, 1, 18, 15, 10, 20);
        let parseDate = await schedule._parseTime(date);
        let startParseDate = {...parseDate};

        await schedule._setStartNextWeek(parseDate);
        okay = parseDate.dayOfMonth === 19;

        if (okay) {
            okay = parseDate.dayOfWeek === 1;
        }

        if (okay) {
            okay = parseDate.month === 1;
        }

        if (okay) {
            okay = parseDate.year === 2018;
        }

        if (okay) {
            okay = parseDate.timeMs === 1518987600000;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testStartMonth(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----
        let date = new Date(2018, 1, 12, 15, 10, 20);
        let parseDate = await schedule._parseTime(date);
        let startParseDate = {...parseDate};

        await schedule._setStartMonth(parseDate);
        okay = parseDate.dayOfMonth === 1;

        if (okay) {
            okay = parseDate.dayOfWeek === 4;
        }

        if (okay) {
            okay = parseDate.month === 1;
        }

        if (okay) {
            okay = parseDate.year === 2018;
        }

        if (okay) {
            okay = parseDate.timeMs === 1517432400000;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testStartYear(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----
        let date = new Date(2018, 1, 12, 15, 10, 20);
        let parseDate = await schedule._parseTime(date);
        let startParseDate = {...parseDate};

        await schedule._setStartYear(parseDate);
        okay = parseDate.dayOfMonth === 1;

        if (okay) {
            okay = parseDate.dayOfWeek === 1;
        }

        if (okay) {
            okay = parseDate.month === 0;
        }

        if (okay) {
            okay = parseDate.year === 2018;
        }

        if (okay) {
            okay = parseDate.timeMs === 1514754000000;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testStartDay(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----
        let date = new Date(2018, 0, 12, 15, 10, 20);
        let parseDate = await schedule._parseTime(date);
        let startParseDate = {...parseDate};

        await schedule._setStartDay(parseDate);
        okay = parseDate.dayOfMonth === 12;

        if (okay) {
            okay = parseDate.dayOfWeek === 5;
        }

        if (okay) {
            okay = parseDate.month === 0;
        }

        if (okay) {
            okay = parseDate.year === 2018;
        }

        if (okay) {
            okay = parseDate.h === 0;
        }

        if (okay) {
            okay = parseDate.m === 0;
        }

        if (okay) {
            okay = parseDate.s === 0;
        }

        if (okay) {
            okay = parseDate.ms === 0;
        }

        if (okay) {
            okay = parseDate.sumMs === 0;
        }

        if (okay) {
            okay = parseDate.timeMs === 1515704400000;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testGetNextStrFormatTime(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----
        let date = new Date(2018, 0, 12, 15, 10, 20);
        let parseDate = await schedule._parseTime(date);
        let startParseDate = {...parseDate};

        await schedule._getNextStrFormatTime(parseDate, '1ms, 1s, 1m, 1h, 1d');
        okay = parseDate.dayOfMonth === 13;

        if (okay) {
            okay = parseDate.dayOfWeek === 6;
        }

        if (okay) {
            okay = parseDate.month === 0;
        }

        if (okay) {
            okay = parseDate.year === 2018;
        }

        if (okay) {
            okay = parseDate.h === 16;
        }

        if (okay) {
            okay = parseDate.m === 11;
        }

        if (okay) {
            okay = parseDate.s === 21;
        }

        if (okay) {
            okay = parseDate.ms === 1;
        }

        if (okay) {
            okay = parseDate.sumMs === 58281001;
        }

        if (okay) {
            okay = parseDate.timeMs === 1515849081001;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testGetNextTime(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----
        let date = new Date(2018, 0, 12, 15, 10, 20);
        let parseDate = await schedule._parseTime(date);
        let times = [
            {h: 0, m: 0, s: 0},
            {h: 12, m: 2, s: 33},
            {h: 14, m: 2, s: 35},
            {h: 16, m: 2, s: 49},
            {h: 17, m: 2, s: 55},
            {h: 18, m: 3, s: 1},
            {h: 19, m: 3, s: 15},
        ];

        await schedule._getNextTime(parseDate, times);

        okay = parseDate.year === 2018;

        if (okay) {
            okay = parseDate.month === 0;
        }

        if (okay) {
            okay = parseDate.dayOfMonth === 12;
        }

        if (okay) {
            okay = parseDate.dayOfWeek === 5;
        }

        if (okay) {
            okay = parseDate.h === 16;
        }

        if (okay) {
            okay = parseDate.m === 2;
        }

        if (okay) {
            okay = parseDate.s === 49;
        }

        if (okay) {
            okay = parseDate.ms === 0;
        }

        if (okay) {
            okay = parseDate.sumMs === 57769000;
        }

        if (okay) {
            okay = parseDate.timeMs === 1515762169000;
        }

        if (okay) {
            parseDate.h = 22;
            await schedule._fillParseDate(parseDate);
            await schedule._getNextTime(parseDate, times);
            okay = parseDate.year === 2018;
        }

        if (okay) {
            okay = parseDate.month === 0;
        }

        if (okay) {
            okay = parseDate.dayOfMonth === 13;
        }

        if (okay) {
            okay = parseDate.dayOfWeek === 6;
        }

        if (okay) {
            okay = parseDate.h === 0;
        }

        if (okay) {
            okay = parseDate.m === 0;
        }

        if (okay) {
            okay = parseDate.s === 0;
        }

        if (okay) {
            okay = parseDate.ms === 0;
        }

        if (okay) {
            okay = parseDate.sumMs === 0;
        }

        if (okay) {
            okay = parseDate.timeMs === 1515790800000;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testGetNextDayOfWeek(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----
        let date = new Date(2018, 0, 12, 15, 10, 20);
        let parseDate = await schedule._parseTime(date);
        let daysOfWeek = [
            {
                dayOfWeek: 1,
                times: [
                    {h: 0, m: 0, s: 0},
                    {h: 12, m: 2, s: 33},
                    {h: 14, m: 2, s: 35},
                    {h: 16, m: 2, s: 49},
                    {h: 17, m: 2, s: 55},
                    {h: 18, m: 3, s: 1},
                    {h: 19, m: 3, s: 15}
                ]
            },
            {
                dayOfWeek: 3,
                times: [
                    {h: 0, m: 0, s: 0},
                    {h: 12, m: 2, s: 33},
                    {h: 14, m: 2, s: 35},
                    {h: 16, m: 2, s: 49},
                    {h: 17, m: 2, s: 55},
                    {h: 18, m: 3, s: 1},
                    {h: 19, m: 3, s: 15}
                ]
            },
            {
                dayOfWeek: 7,
                times: [
                    {h: 0, m: 0, s: 0},
                    {h: 12, m: 2, s: 33},
                    {h: 14, m: 2, s: 35},
                    {h: 16, m: 2, s: 49},
                    {h: 17, m: 2, s: 55},
                    {h: 18, m: 3, s: 1},
                    {h: 19, m: 3, s: 15}
                ]
            }
        ];

        await schedule._getNextDayOfWeek(parseDate, daysOfWeek);

        okay = parseDate.year === 2018;

        if (okay) {
            okay = parseDate.month === 0;
        }

        if (okay) {
            okay = parseDate.dayOfMonth === 14;
        }

        if (okay) {
            okay = parseDate.dayOfWeek === 0;
        }

        if (okay) {
            okay = parseDate.h === 16;
        }

        if (okay) {
            okay = parseDate.m === 2;
        }

        if (okay) {
            okay = parseDate.s === 49;
        }

        if (okay) {
            okay = parseDate.ms === 0;
        }

        if (okay) {
            okay = parseDate.sumMs === 57769000;
        }

        if (okay) {
            okay = parseDate.timeMs === 1515934969000;
        }

        if (okay) {
            parseDate.m += 1;
            await schedule._fillParseDate(parseDate);
            await schedule._getNextDayOfWeek(parseDate, daysOfWeek);
            okay = parseDate.year === 2018;
        }

        if (okay) {
            okay = parseDate.month === 0;
        }

        if (okay) {
            okay = parseDate.dayOfMonth === 14;
        }

        if (okay) {
            okay = parseDate.dayOfWeek === 0;
        }

        if (okay) {
            okay = parseDate.h === 17;
        }

        if (okay) {
            okay = parseDate.m === 2;
        }

        if (okay) {
            okay = parseDate.s === 55;
        }

        if (okay) {
            okay = parseDate.ms === 0;
        }

        if (okay) {
            okay = parseDate.sumMs === 61375000;
        }

        if (okay) {
            okay = parseDate.timeMs === 1515938575000;
        }

        if (okay) {
            parseDate.h = 23;
            await schedule._fillParseDate(parseDate);
            await schedule._getNextDayOfWeek(parseDate, daysOfWeek);
            okay = parseDate.year === 2018;
        }

        if (okay) {
            okay = parseDate.month === 0;
        }

        if (okay) {
            okay = parseDate.dayOfMonth === 15;
        }

        if (okay) {
            okay = parseDate.dayOfWeek === 1;
        }

        if (okay) {
            okay = parseDate.h === 0;
        }

        if (okay) {
            okay = parseDate.m === 0;
        }

        if (okay) {
            okay = parseDate.s === 0;
        }

        if (okay) {
            okay = parseDate.ms === 0;
        }

        if (okay) {
            okay = parseDate.sumMs === 0;
        }

        if (okay) {
            okay = parseDate.timeMs === 1515963600000;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testGetNextDayOfMonth(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----
        let date = new Date(2018, 0, 12, 15, 10, 20);
        let parseDate = await schedule._parseTime(date);
        let daysOfMonth = [
            {
                dayOfMonth: 1,
                times: [
                    {h: 0, m: 0, s: 0},
                    {h: 12, m: 2, s: 33},
                    {h: 14, m: 2, s: 35},
                    {h: 16, m: 2, s: 49},
                    {h: 17, m: 2, s: 55},
                    {h: 18, m: 3, s: 1},
                    {h: 19, m: 3, s: 15}
                ]
            },
            {
                dayOfMonth: 19,
                times: [
                    {h: 12, m: 2, s: 33},
                    {h: 14, m: 2, s: 35},
                    {h: 16, m: 2, s: 49},
                    {h: 17, m: 2, s: 55},
                    {h: 18, m: 3, s: 1},
                    {h: 19, m: 3, s: 15}
                ]
            },
            {
                dayOfMonth: 27,
                times: [
                    {h: 0, m: 0, s: 0},
                    {h: 12, m: 2, s: 33},
                    {h: 14, m: 2, s: 35},
                    {h: 16, m: 2, s: 49},
                    {h: 17, m: 2, s: 55},
                    {h: 18, m: 3, s: 1},
                    {h: 19, m: 3, s: 15}
                ]
            },

        ];

        await schedule._getNextDayOfMonth(parseDate, daysOfMonth, 'noMonths');

        okay = parseDate.year === 2018;

        if (okay) {
            okay = parseDate.month === 0;
        }

        if (okay) {
            okay = parseDate.dayOfMonth === 19;
        }

        if (okay) {
            okay = parseDate.dayOfWeek === 5;
        }

        if (okay) {
            okay = parseDate.h === 12;
        }

        if (okay) {
            okay = parseDate.m === 2;
        }

        if (okay) {
            okay = parseDate.s === 33;
        }

        if (okay) {
            okay = parseDate.ms === 0;
        }

        if (okay) {
            okay = parseDate.sumMs === 43353000;
        }

        if (okay) {
            okay = parseDate.timeMs === 1516352553000;
        }

        if (okay) {
            parseDate.m += 1;
            await schedule._fillParseDate(parseDate);
            await schedule._getNextDayOfMonth(parseDate, daysOfMonth, 'noMonths');
            okay = parseDate.year === 2018;
        }

        if (okay) {
            okay = parseDate.month === 0;
        }

        if (okay) {
            okay = parseDate.dayOfMonth === 19;
        }

        if (okay) {
            okay = parseDate.dayOfWeek === 5;
        }

        if (okay) {
            okay = parseDate.h === 14;
        }

        if (okay) {
            okay = parseDate.m === 2;
        }

        if (okay) {
            okay = parseDate.s === 35;
        }

        if (okay) {
            okay = parseDate.ms === 0;
        }

        if (okay) {
            okay = parseDate.sumMs === 50555000;
        }

        if (okay) {
            okay = parseDate.timeMs === 1516359755000;
        }

        if (okay) {
            parseDate.dayOfMonth = 28;
            await schedule._fillParseDate(parseDate);
            await schedule._getNextDayOfMonth(parseDate, daysOfMonth, 'noMonths');
            okay = parseDate.year === 2018;
        }

        if (okay) {
            okay = parseDate.month === 1;
        }

        if (okay) {
            okay = parseDate.dayOfMonth === 1;
        }

        if (okay) {
            okay = parseDate.dayOfWeek === 4;
        }

        if (okay) {
            okay = parseDate.h === 0;
        }

        if (okay) {
            okay = parseDate.m === 0;
        }

        if (okay) {
            okay = parseDate.s === 0;
        }

        if (okay) {
            okay = parseDate.ms === 0;
        }

        if (okay) {
            okay = parseDate.sumMs === 0;
        }

        if (okay) {
            okay = parseDate.timeMs === 1517432400000;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testGetNextMonth(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----
        let date = new Date(2018, 4, 12, 15, 10, 20);
        let parseDate = await schedule._parseTime(date);
        let months = [
            {
                month: 1,
                daysOfMonth: [
                    {
                        dayOfMonth: 6,
                        times: [
                            {h: 0, m: 0, s: 0},
                            {h: 12, m: 2, s: 35},
                            {h: 14, m: 2, s: 49},
                            {h: 18, m: 2, s: 55},
                            {h: 18, m: 3, s: 1},
                            {h: 18, m: 3, s: 15},
                        ]
                    },
                    {
                        dayOfMonth: 19,
                        times: [
                            {h: 4, m: 0, s: 0},
                            {h: 12, m: 2, s: 35},
                            {h: 14, m: 2, s: 49},
                            {h: 18, m: 2, s: 55},
                            {h: 19, m: 0, s: 15},
                            {h: 19, m: 0, s: 25},
                        ]
                    },
                    {
                        dayOfMonth: 27,
                        times: [
                            {h: 4, m: 0, s: 0},
                            {h: 12, m: 2, s: 35},
                            {h: 14, m: 2, s: 49},
                            {h: 18, m: 2, s: 55},
                            {h: 18, m: 3, s: 1},
                            {h: 18, m: 3, s: 15},
                        ]
                    }
                ]
            },
            {
                month: 6,
                daysOfMonth: [
                    {
                        dayOfMonth: 1,
                        times: [
                            {h: 4, m: 0, s: 0},
                            {h: 12, m: 2, s: 35},
                            {h: 14, m: 2, s: 49},
                            {h: 18, m: 2, s: 55},
                            {h: 18, m: 3, s: 1},
                            {h: 18, m: 3, s: 15},
                        ]
                    },
                    {
                        dayOfMonth: 19,
                        times: [
                            {h: 4, m: 0, s: 0},
                            {h: 12, m: 2, s: 35},
                            {h: 14, m: 2, s: 49},
                            {h: 18, m: 2, s: 55},
                            {h: 19, m: 0, s: 15},
                            {h: 19, m: 0, s: 25},
                        ]
                    },
                    {
                        dayOfMonth: 27,
                        times: [
                            {h: 4, m: 0, s: 0},
                            {h: 12, m: 2, s: 35},
                            {h: 14, m: 2, s: 49},
                            {h: 18, m: 2, s: 55},
                            {h: 18, m: 3, s: 1},
                            {h: 18, m: 3, s: 15},
                        ]
                    }
                ]
            },
            {
                month: 11,
                daysOfMonth: [
                    {
                        dayOfMonth: 1,
                        times: [
                            {h: 4, m: 0, s: 0},
                            {h: 12, m: 2, s: 35},
                            {h: 14, m: 2, s: 49},
                            {h: 18, m: 2, s: 55},
                            {h: 18, m: 3, s: 1},
                            {h: 18, m: 3, s: 15},
                        ]
                    },
                    {
                        dayOfMonth: 19,
                        times: [
                            {h: 4, m: 0, s: 0},
                            {h: 12, m: 2, s: 35},
                            {h: 14, m: 2, s: 49},
                            {h: 18, m: 2, s: 55},
                            {h: 22, m: 48, s: 15},
                            {h: 22, m: 48, s: 25},
                        ]
                    }
                ]
            }
        ];

        await schedule._getNextMonth(parseDate, months);

        okay = parseDate.year === 2018;

        if (okay) {
            okay = parseDate.month === 5;
        }

        if (okay) {
            okay = parseDate.dayOfMonth === 1;
        }

        if (okay) {
            okay = parseDate.dayOfWeek === 5;
        }

        if (okay) {
            okay = parseDate.h === 4;
        }

        if (okay) {
            okay = parseDate.m === 0;
        }

        if (okay) {
            okay = parseDate.s === 0;
        }

        if (okay) {
            okay = parseDate.ms === 0;
        }

        if (okay) {
            okay = parseDate.sumMs === 14400000;
        }

        if (okay) {
            okay = parseDate.timeMs === 1527814800000;
        }

        if (okay) {
            parseDate.m += 1;
            await schedule._fillParseDate(parseDate);
            await schedule._getNextMonth(parseDate, months);
            okay = parseDate.year === 2018;
        }

        if (okay) {
            okay = parseDate.month === 5;
        }

        if (okay) {
            okay = parseDate.dayOfMonth === 1;
        }

        if (okay) {
            okay = parseDate.dayOfWeek === 5;
        }

        if (okay) {
            okay = parseDate.h === 12;
        }

        if (okay) {
            okay = parseDate.m === 2;
        }

        if (okay) {
            okay = parseDate.s === 35;
        }

        if (okay) {
            okay = parseDate.ms === 0;
        }

        if (okay) {
            okay = parseDate.sumMs === 43355000;
        }

        if (okay) {
            okay = parseDate.timeMs === 1527843755000;
        }

        if (okay) {
            parseDate.dayOfMonth = 20;
            await schedule._fillParseDate(parseDate);
            await schedule._getNextMonth(parseDate, months);
            okay = parseDate.year === 2018;
        }

        if (okay) {
            okay = parseDate.month === 5;
        }

        if (okay) {
            okay = parseDate.dayOfMonth === 27;
        }

        if (okay) {
            okay = parseDate.dayOfWeek === 3;
        }

        if (okay) {
            okay = parseDate.h === 4;
        }

        if (okay) {
            okay = parseDate.m === 0;
        }

        if (okay) {
            okay = parseDate.s === 0;
        }

        if (okay) {
            okay = parseDate.ms === 0;
        }

        if (okay) {
            okay = parseDate.sumMs === 14400000;
        }

        if (okay) {
            okay = parseDate.timeMs === 1530061200000;
        }

        if (okay) {
            parseDate.dayOfMonth = 28;
            await schedule._fillParseDate(parseDate);
            await schedule._getNextMonth(parseDate, months);
            okay = parseDate.year === 2018;
        }

        if (okay) {
            okay = parseDate.month === 10;
        }

        if (okay) {
            okay = parseDate.dayOfMonth === 1;
        }

        if (okay) {
            okay = parseDate.dayOfWeek === 4;
        }

        if (okay) {
            okay = parseDate.h === 4;
        }

        if (okay) {
            okay = parseDate.m === 0;
        }

        if (okay) {
            okay = parseDate.s === 0;
        }

        if (okay) {
            okay = parseDate.ms === 0;
        }

        if (okay) {
            okay = parseDate.sumMs === 14400000;
        }

        if (okay) {
            okay = parseDate.timeMs === 1541034000000;
        }

        if (okay) {
            parseDate.dayOfMonth = 25;
            await schedule._fillParseDate(parseDate);
            await schedule._getNextMonth(parseDate, months);
            okay = parseDate.year === 2019;
        }

        if (okay) {
            okay = parseDate.month === 0;
        }

        if (okay) {
            okay = parseDate.dayOfMonth === 6;
        }

        if (okay) {
            okay = parseDate.dayOfWeek === 0;
        }

        if (okay) {
            okay = parseDate.h === 0;
        }

        if (okay) {
            okay = parseDate.m === 0;
        }

        if (okay) {
            okay = parseDate.s === 0;
        }

        if (okay) {
            okay = parseDate.ms === 0;
        }

        if (okay) {
            okay = parseDate.sumMs === 0;
        }

        if (okay) {
            okay = parseDate.timeMs === 1546722000000;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testScheduleDate(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----

        let dateFinish = null;
        schedule.task = async () => {
            dateFinish = new Date();
        };

        let now = new Date();
        schedule.datetimeStart = new Date(now.getTime() + 400);
        schedule.datetimeFinish = new Date(now.getTime() + 5000);
        schedule.schedule = {
            date: new Date(now.getTime() + 600)
        };
        await schedule.start();
        await wait();

        let info = await schedule.getInfo();

        okay = schedule.status === schedule.statusLists.COMPLETED;

        if (okay) {
            okay = schedule.history.length === 3;
        }

        let dif = 0;
        if (okay) {
            dif = schedule.datetimeStart - new Date(now.getTime() + 400);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = schedule.datetimeFinish - new Date(now.getTime() + 5000);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = dateFinish - new Date(now.getTime() + 600);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = schedule.history[2].datetime - new Date(now.getTime() + 600);
            okay = dif >= -20 && dif <= 20;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testScheduleInterval(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----

        let dateFinish = null;
        schedule.task = async () => {
            dateFinish = new Date();
        };

        let now = new Date();
        schedule.datetimeFinish = new Date(now.getTime() + 5000);
        schedule.schedule = {
            interval: '100ms'
        };
        await schedule.start();
        await wait(210);
        await schedule.stop();

        let info = await schedule.getInfo();

        okay = schedule.status === schedule.statusLists.COMPLETED;

        if (okay) {
            okay = schedule.history.length === 4;
        }

        let dif = 0;
        if (okay) {
            okay = !schedule.datetimeStart;
        }

        if (okay) {
            dif = schedule.datetimeFinish - new Date(now.getTime() + 5000);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = schedule.history[1].datetime - new Date(now.getTime() + 100);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = schedule.history[2].datetime - new Date(now.getTime() + 200);
            okay = dif >= -20 && dif <= 20;
        }

        await wait(100);
        await schedule.start();
        await wait(110);
        await schedule.stop();
        info = await schedule.getInfo();

        if (okay) {
            okay = schedule.history.length === 7;
        }

        dif = 0;
        if (okay) {
            okay = !schedule.datetimeStart;
        }

        if (okay) {
            dif = schedule.datetimeFinish - new Date(now.getTime() + 5000);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = schedule.history[6].datetime - new Date(now.getTime() + 420);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            okay = schedule.history[6].act === schedule.actLists.STOP;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testScheduleTimes(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----

        let dateFinish = null;
        schedule.task = async () => {
            dateFinish = new Date();
        };

        let now = new Date();
        let firstDate = new Date(now.getTime() + 100);
        let secondDate = new Date(now.getTime() + 150);
        let lastDate = new Date(now.getTime() + 1000);

        schedule.schedule = {
            times: [
                {
                    h: 0,
                    m: 0,
                    s: 0,
                    ms: 0
                },
                {
                    h: firstDate.getHours(),
                    m: firstDate.getMinutes(),
                    s: firstDate.getSeconds(),
                    ms: firstDate.getMilliseconds()
                },
                {
                    h: secondDate.getHours(),
                    m: secondDate.getMinutes(),
                    s: secondDate.getSeconds(),
                    ms: secondDate.getMilliseconds()
                },
                {
                    h: lastDate.getHours(),
                    m: lastDate.getMinutes(),
                    s: lastDate.getSeconds(),
                    ms: lastDate.getMilliseconds()
                }
            ]
        };
        await schedule.start();
        await wait(170);
        await schedule.stop();

        let info = await schedule.getInfo();

        okay = schedule.status === schedule.statusLists.COMPLETED;

        if (okay) {
            okay = schedule.history.length === 4;
        }

        let dif = 0;
        if (okay) {
            okay = !schedule.datetimeStart;
        }

        if (okay) {
            okay = !schedule.datetimeFinish;
        }

        if (okay) {
            dif = schedule.history[1].datetime - new Date(now.getTime() + 100);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = schedule.history[2].datetime - new Date(now.getTime() + 150);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            okay = info.countRun === 2;
        }

        if (okay) {
            dif = info.prevRun - new Date(now.getTime() + 150);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = info.nextRun - new Date(now.getTime() + 1000);
            okay = dif >= -20 && dif <= 20;
        }

        await wait(100);
        await schedule.start();
        await wait(800);
        await schedule.stop();
        info = await schedule.getInfo();

        if (okay) {
            okay = schedule.status === schedule.statusLists.COMPLETED;
        }

        if (okay) {
            okay = schedule.history.length === 7;
        }

        dif = 0;
        if (okay) {
            okay = !schedule.datetimeStart;
        }

        if (okay) {
            okay = !schedule.datetimeFinish;
        }

        if (okay) {
            dif = schedule.history[1].datetime - new Date(now.getTime() + 100);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = schedule.history[2].datetime - new Date(now.getTime() + 150);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = schedule.history[5].datetime - new Date(now.getTime() + 1000);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            okay = info.countRun === 3;
        }

        if (okay) {
            dif = info.prevRun - new Date(now.getTime() + 1000);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            let parseDate = await schedule._parseTime(now);
            await schedule._setStartDay(parseDate);
            await schedule._addDays(parseDate);
            let nextRun = new Date(parseDate.timeMs);
            dif = info.nextRun - nextRun;
            okay = dif === 0;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testScheduleDaysOfWeek(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----

        let dateFinish = null;
        schedule.task = async () => {
            dateFinish = new Date();
        };

        let now = new Date();
        let curDay = await schedule._parseTime(now);

        let prevDay = {...curDay};
        await schedule._addDays(prevDay, -1);

        let nextDay = {...curDay};
        await schedule._addDays(nextDay, 2);

        let prevDayWeek = prevDay.dayOfWeek;
        if (prevDayWeek === 0) prevDayWeek = 7;
        let curDayWeek = curDay.dayOfWeek;
        if (curDayWeek === 0) curDayWeek = 7;
        let nextDayWeek = nextDay.dayOfWeek;
        if (nextDayWeek === 0) nextDayWeek = 7;

        let firstTime = new Date(now.getTime() + 100);
        let secondTime = new Date(now.getTime() + 150);
        let lastTime = new Date(now.getTime() + 1000);

        schedule.schedule = {
            daysOfWeek: [
                {
                    dayOfWeek: prevDayWeek,
                    times: [
                        {
                            h: 0,
                            m: 0,
                            s: 0,
                            ms: 0
                        },
                        {
                            h: firstTime.getHours(),
                            m: firstTime.getMinutes(),
                            s: firstTime.getSeconds(),
                            ms: firstTime.getMilliseconds()
                        },
                        {
                            h: secondTime.getHours(),
                            m: secondTime.getMinutes(),
                            s: secondTime.getSeconds(),
                            ms: secondTime.getMilliseconds()
                        },
                        {
                            h: lastTime.getHours(),
                            m: lastTime.getMinutes(),
                            s: lastTime.getSeconds(),
                            ms: lastTime.getMilliseconds()
                        }
                    ]
                },
                {
                    dayOfWeek: curDayWeek,
                    times: [
                        {
                            h: 0,
                            m: 0,
                            s: 0,
                            ms: 0
                        },
                        {
                            h: firstTime.getHours(),
                            m: firstTime.getMinutes(),
                            s: firstTime.getSeconds(),
                            ms: firstTime.getMilliseconds()
                        },
                        {
                            h: secondTime.getHours(),
                            m: secondTime.getMinutes(),
                            s: secondTime.getSeconds(),
                            ms: secondTime.getMilliseconds()
                        },
                        {
                            h: lastTime.getHours(),
                            m: lastTime.getMinutes(),
                            s: lastTime.getSeconds(),
                            ms: lastTime.getMilliseconds()
                        }
                    ]
                },
                {
                    dayOfWeek: nextDayWeek,
                    times: [
                        {
                            h: 0,
                            m: 0,
                            s: 0,
                            ms: 0
                        },
                        {
                            h: firstTime.getHours(),
                            m: firstTime.getMinutes(),
                            s: firstTime.getSeconds(),
                            ms: firstTime.getMilliseconds()
                        },
                        {
                            h: secondTime.getHours(),
                            m: secondTime.getMinutes(),
                            s: secondTime.getSeconds(),
                            ms: secondTime.getMilliseconds()
                        },
                        {
                            h: lastTime.getHours(),
                            m: lastTime.getMinutes(),
                            s: lastTime.getSeconds(),
                            ms: lastTime.getMilliseconds()
                        }
                    ]
                }
            ]
        };
        await schedule.start();
        await wait(170);
        await schedule.stop();

        let info = await schedule.getInfo();

        okay = schedule.status === schedule.statusLists.COMPLETED;

        if (okay) {
            okay = schedule.history.length === 4;
        }

        let dif = 0;
        if (okay) {
            okay = !schedule.datetimeStart;
        }

        if (okay) {
            okay = !schedule.datetimeFinish;
        }

        if (okay) {
            dif = schedule.history[1].datetime - new Date(now.getTime() + 100);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = schedule.history[2].datetime - new Date(now.getTime() + 150);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            okay = info.countRun === 2;
        }

        if (okay) {
            dif = info.prevRun - new Date(now.getTime() + 150);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = info.nextRun - new Date(now.getTime() + 1000);
            okay = dif >= -20 && dif <= 20;
        }

        await wait(100);
        await schedule.start();
        await wait(800);
        await schedule.stop();
        info = await schedule.getInfo();

        okay = schedule.status === schedule.statusLists.COMPLETED;

        if (okay) {
            okay = schedule.history.length === 7;
        }

        dif = 0;
        if (okay) {
            okay = !schedule.datetimeStart;
        }

        if (okay) {
            okay = !schedule.datetimeFinish;
        }

        if (okay) {
            dif = schedule.history[1].datetime - new Date(now.getTime() + 100);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = schedule.history[2].datetime - new Date(now.getTime() + 150);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = schedule.history[5].datetime - new Date(now.getTime() + 1000);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            okay = info.countRun === 3;
        }

        if (okay) {
            dif = info.prevRun - new Date(now.getTime() + 1000);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            let parseDate = await schedule._parseTime(now);
            await schedule._setStartDay(parseDate);
            await schedule._addDays(parseDate, 2);
            let nextRun = new Date(parseDate.timeMs);
            dif = info.nextRun - nextRun;
            okay = dif === 0;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testScheduleDaysOfMonth(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----

        let dateFinish = null;
        schedule.task = async () => {
            dateFinish = new Date();
        };

        let now = new Date();
        let curDay = await schedule._parseTime(now);

        let prevDay = {...curDay};
        await schedule._addDays(prevDay, -1);

        let nextDay = {...curDay};
        await schedule._addDays(nextDay, 2);

        let firstTime = new Date(now.getTime() + 100);
        let secondTime = new Date(now.getTime() + 150);
        let lastTime = new Date(now.getTime() + 1000);

        schedule.schedule = {
            daysOfMonth: [
                {
                    dayOfMonth: prevDay.dayOfMonth,
                    times: [
                        {
                            h: 0,
                            m: 0,
                            s: 0,
                            ms: 0
                        },
                        {
                            h: firstTime.getHours(),
                            m: firstTime.getMinutes(),
                            s: firstTime.getSeconds(),
                            ms: firstTime.getMilliseconds()
                        },
                        {
                            h: secondTime.getHours(),
                            m: secondTime.getMinutes(),
                            s: secondTime.getSeconds(),
                            ms: secondTime.getMilliseconds()
                        },
                        {
                            h: lastTime.getHours(),
                            m: lastTime.getMinutes(),
                            s: lastTime.getSeconds(),
                            ms: lastTime.getMilliseconds()
                        }
                    ]
                },
                {
                    dayOfMonth: curDay.dayOfMonth,
                    times: [
                        {
                            h: 0,
                            m: 0,
                            s: 0,
                            ms: 0
                        },
                        {
                            h: firstTime.getHours(),
                            m: firstTime.getMinutes(),
                            s: firstTime.getSeconds(),
                            ms: firstTime.getMilliseconds()
                        },
                        {
                            h: secondTime.getHours(),
                            m: secondTime.getMinutes(),
                            s: secondTime.getSeconds(),
                            ms: secondTime.getMilliseconds()
                        },
                        {
                            h: lastTime.getHours(),
                            m: lastTime.getMinutes(),
                            s: lastTime.getSeconds(),
                            ms: lastTime.getMilliseconds()
                        }
                    ]
                },
                {
                    dayOfMonth: nextDay.dayOfMonth,
                    times: [
                        {
                            h: 0,
                            m: 0,
                            s: 0,
                            ms: 0
                        },
                        {
                            h: firstTime.getHours(),
                            m: firstTime.getMinutes(),
                            s: firstTime.getSeconds(),
                            ms: firstTime.getMilliseconds()
                        },
                        {
                            h: secondTime.getHours(),
                            m: secondTime.getMinutes(),
                            s: secondTime.getSeconds(),
                            ms: secondTime.getMilliseconds()
                        },
                        {
                            h: lastTime.getHours(),
                            m: lastTime.getMinutes(),
                            s: lastTime.getSeconds(),
                            ms: lastTime.getMilliseconds()
                        }
                    ]
                }
            ]
        };
        await schedule.start();
        await wait(170);
        await schedule.stop();

        let info = await schedule.getInfo();

        okay = schedule.status === schedule.statusLists.COMPLETED;

        if (okay) {
            okay = schedule.history.length === 4;
        }

        let dif = 0;
        if (okay) {
            okay = !schedule.datetimeStart;
        }

        if (okay) {
            okay = !schedule.datetimeFinish;
        }

        if (okay) {
            dif = schedule.history[1].datetime - new Date(now.getTime() + 100);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = schedule.history[2].datetime - new Date(now.getTime() + 150);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            okay = info.countRun === 2;
        }

        if (okay) {
            dif = info.prevRun - new Date(now.getTime() + 150);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = info.nextRun - new Date(now.getTime() + 1000);
            okay = dif >= -20 && dif <= 20;
        }

        await wait(100);
        await schedule.start();
        await wait(800);
        await schedule.stop();
        info = await schedule.getInfo();

        okay = schedule.status === schedule.statusLists.COMPLETED;

        if (okay) {
            okay = schedule.history.length === 7;
        }

        dif = 0;
        if (okay) {
            okay = !schedule.datetimeStart;
        }

        if (okay) {
            okay = !schedule.datetimeFinish;
        }

        if (okay) {
            dif = schedule.history[1].datetime - new Date(now.getTime() + 100);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = schedule.history[2].datetime - new Date(now.getTime() + 150);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = schedule.history[5].datetime - new Date(now.getTime() + 1000);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            okay = info.countRun === 3;
        }

        if (okay) {
            dif = info.prevRun - new Date(now.getTime() + 1000);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            let parseDate = await schedule._parseTime(now);
            await schedule._setStartDay(parseDate);
            await schedule._addDays(parseDate, 2);
            let nextRun = new Date(parseDate.timeMs);
            dif = info.nextRun - nextRun;
            okay = dif === 0;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    },

    async testScheduleMonths(key) {

        /// ---- HEAD ----
        let okay = false;
        let schedule = new JrfScheduler();

        /// ---- BODY ----

        let dateFinish = null;
        schedule.task = async () => {
            dateFinish = new Date();
        };

        let now = new Date();
        let curDay = await schedule._parseTime(now);

        let prevDay = {...curDay};
        await schedule._addMonths(prevDay, -1);

        let nextDay = {...curDay};
        await schedule._addMonths(nextDay, 2);

        let prevDayMonth = prevDay.month + 1;
        if (prevDayMonth === 13) prevDayMonth = 1;
        let curDayMonth = curDay.month + 1;
        if (curDayMonth === 13) curDayMonth = 1;
        let nextDayMonth = nextDay.month + 1;
        if (nextDayMonth === 13) nextDayMonth = 1;

        let firstTime = new Date(now.getTime() + 100);
        let secondTime = new Date(now.getTime() + 150);
        let lastTime = new Date(now.getTime() + 1000);

        schedule.schedule = {
            months: [
                {
                    month: prevDayMonth,
                    daysOfMonth: [
                        {
                            dayOfMonth: prevDay.dayOfMonth,
                            times: [
                                {
                                    h: 0,
                                    m: 0,
                                    s: 0,
                                    ms: 0
                                },
                                {
                                    h: firstTime.getHours(),
                                    m: firstTime.getMinutes(),
                                    s: firstTime.getSeconds(),
                                    ms: firstTime.getMilliseconds()
                                },
                                {
                                    h: secondTime.getHours(),
                                    m: secondTime.getMinutes(),
                                    s: secondTime.getSeconds(),
                                    ms: secondTime.getMilliseconds()
                                },
                                {
                                    h: lastTime.getHours(),
                                    m: lastTime.getMinutes(),
                                    s: lastTime.getSeconds(),
                                    ms: lastTime.getMilliseconds()
                                }
                            ]
                        }
                    ]
                },
                {
                    month: curDayMonth,
                    daysOfMonth: [
                        {
                            dayOfMonth: curDay.dayOfMonth,
                            times: [
                                {
                                    h: 0,
                                    m: 0,
                                    s: 0,
                                    ms: 0
                                },
                                {
                                    h: firstTime.getHours(),
                                    m: firstTime.getMinutes(),
                                    s: firstTime.getSeconds(),
                                    ms: firstTime.getMilliseconds()
                                },
                                {
                                    h: secondTime.getHours(),
                                    m: secondTime.getMinutes(),
                                    s: secondTime.getSeconds(),
                                    ms: secondTime.getMilliseconds()
                                },
                                {
                                    h: lastTime.getHours(),
                                    m: lastTime.getMinutes(),
                                    s: lastTime.getSeconds(),
                                    ms: lastTime.getMilliseconds()
                                }
                            ]
                        }
                    ]
                },
                {
                    month: nextDayMonth,
                    daysOfMonth: [
                        {
                            dayOfMonth: nextDay.dayOfMonth,
                            times: [
                                {
                                    h: 0,
                                    m: 0,
                                    s: 0,
                                    ms: 0
                                },
                                {
                                    h: firstTime.getHours(),
                                    m: firstTime.getMinutes(),
                                    s: firstTime.getSeconds(),
                                    ms: firstTime.getMilliseconds()
                                },
                                {
                                    h: secondTime.getHours(),
                                    m: secondTime.getMinutes(),
                                    s: secondTime.getSeconds(),
                                    ms: secondTime.getMilliseconds()
                                },
                                {
                                    h: lastTime.getHours(),
                                    m: lastTime.getMinutes(),
                                    s: lastTime.getSeconds(),
                                    ms: lastTime.getMilliseconds()
                                }
                            ]
                        }
                    ]
                }
            ]
        };
        await schedule.start();
        await wait(170);
        await schedule.stop();

        let info = await schedule.getInfo();

        okay = schedule.status === schedule.statusLists.COMPLETED;

        if (okay) {
            okay = schedule.history.length === 4;
        }

        let dif = 0;
        if (okay) {
            okay = !schedule.datetimeStart;
        }

        if (okay) {
            okay = !schedule.datetimeFinish;
        }

        if (okay) {
            dif = schedule.history[1].datetime - new Date(now.getTime() + 100);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = schedule.history[2].datetime - new Date(now.getTime() + 150);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            okay = info.countRun === 2;
        }

        if (okay) {
            dif = info.prevRun - new Date(now.getTime() + 150);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = info.nextRun - new Date(now.getTime() + 1000);
            okay = dif >= -20 && dif <= 20;
        }

        await wait(100);
        await schedule.start();
        await wait(800);
        await schedule.stop();
        info = await schedule.getInfo();

        okay = schedule.status === schedule.statusLists.COMPLETED;

        if (okay) {
            okay = schedule.history.length === 7;
        }

        dif = 0;
        if (okay) {
            okay = !schedule.datetimeStart;
        }

        if (okay) {
            okay = !schedule.datetimeFinish;
        }

        if (okay) {
            dif = schedule.history[1].datetime - new Date(now.getTime() + 100);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = schedule.history[2].datetime - new Date(now.getTime() + 150);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            dif = schedule.history[5].datetime - new Date(now.getTime() + 1000);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            okay = info.countRun === 3;
        }

        if (okay) {
            dif = info.prevRun - new Date(now.getTime() + 1000);
            okay = dif >= -20 && dif <= 20;
        }

        if (okay) {
            let parseDate = await schedule._parseTime(now);
            await schedule._setStartDay(parseDate);
            await schedule._addMonths(parseDate, 2);
            let nextRun = new Date(parseDate.timeMs);
            dif = info.nextRun - nextRun;
            okay = dif === 0;
        }

        /// ---- FOOTER ----
        if (okay) {
            glObj.countValid++;
            return;
        }

        glObj.countInvalid++;
        console.log(`invalid test ${key}`);

    }

};

async function runTests() {

    for (let [key, value] of Object.entries(tests)) {
        await value(key);
    }

    console.log(JSON.stringify(glObj, null, 4));
    console.log(`Count valid tests: ${glObj.countValid}`);
    console.log(`Count invalid tests: ${glObj.countInvalid}`);

}

runTests();