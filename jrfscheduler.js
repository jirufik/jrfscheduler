const JrfTimer = require('jrftimer');

module.exports = class JrfScheduler {

    constructor() {

        this.datetimeStart = null;
        this.datetimeFinish = null;
        this.statusLists = {
            READY: 'READY',
            RUNNING: 'RUNNING',
            COMPLETED: 'COMPLETED'
        };
        this.status = this.statusLists.READY;
        this.schedule = null;
        this.task = null;
        this.countRun = 0;
        this.nextRun = null;
        this.prevRun = null;
        this.history = [];
        this.actLists = {
            START: 'START',
            RUN_TASK: 'RUN_TASK',
            STOP: 'STOP'
        };
        this._timer = new JrfTimer();

    }

    async start() {

        if (!this.task) {
            return false;
        }

        if (!this.schedule) {
            return false;
        }

        if (this.status === this.statusLists.RUNNING) {
            return false;
        }

        this.status = this.statusLists.RUNNING;
        await this._addHistory(this.actLists.START);

        if (!this.datetimeStart) {
            await this._startNextTask();
            return true;
        }

        await this._timer.reset();
        await this._timer.start({
            datetimeFinish: this.datetimeStart,
            onStop: async () => {
                this.datetimeStart = new Date();
                this._timer.onStop = null;
                await this._startNextTask(this.datetimeStart);
            }
        });

        return true;

    }

    async reset() {

        await this._timer.reset();

        this.datetimeStart = null;
        this.datetimeFinish = null;
        this.status = this.statusLists.READY;
        this.schedule = null;
        this.task = null;
        this.countRun = 0;
        this.nextRun = null;
        this.prevRun = null;
        this.history = [];
        this._timer = new JrfTimer();

    }

    async getInfo() {

        return {
            datetimeStart: this.datetimeStart,
            datetimeFinish: this.datetimeFinish,
            statusLists: this.statusLists,
            status: this.status,
            schedule: this.schedule,
            task: this.task,
            countRun: this.countRun,
            nextRun: this.nextRun,
            prevRun: this.prevRun,
            history: this.history,
            actLists: this.actLists
        };

    }

    async stop() {

        if (this.status !== this.statusLists.RUNNING) {
            return false;
        }

        this.status = this.statusLists.COMPLETED;
        await this._addHistory(this.actLists.STOP);
        await this._timer.reset();
        // console.log(this);
        return true;

    }

    async _startNextTask(datetime) {

        await this._timer.reset();

        if (this.status !== this.statusLists.RUNNING) {
            return;
        }

        datetime = datetime || new Date();

        let nextDatetimeRun = await this._getNextDatetimeRun(datetime);
        let nextDate = new Date(nextDatetimeRun.timeMs);
        let dif = nextDate - datetime;
        if (dif >= -20 && dif <= 20) {
            nextDatetimeRun = await this._getNextDatetimeRun(new Date(datetime.getTime() + 21));
            nextDate = new Date(nextDatetimeRun.timeMs);
        }

        if (this.datetimeFinish && nextDate >= this.datetimeFinish) {
            await this.stop();
            return;
        }

        await this._timer.setDatetimeFinish(nextDate);
        this.nextRun = nextDate;

        if (this._timer.onStop) {
            await this._timer.start();
            return;
        }

        this._timer.onStop = async () => {

            if (this.status !== this.statusLists.RUNNING) {
                return;
            }

            let now = new Date();
            this.prevRun = now;
            this.countRun++;
            await this._addHistory(this.actLists.RUN_TASK, now);
            await this.task();

            if (this.schedule.date) {
                await this.stop();
                return;
            }

            await this._startNextTask(now);

        };
        await this._timer.start();

    }

    async _getNextDatetimeRun(datetime) {

        datetime = datetime || new Date();

        let nextDatetimeRun = await this._parseTime(datetime);

        if (!this.schedule) {
            return nextDatetimeRun;
        }

        if (typeof this.schedule !== 'object') {
            return nextDatetimeRun;
        }

        if (this.schedule.months) {
            await this._getNextMonth(nextDatetimeRun, this.schedule.months);
            return nextDatetimeRun;
        }

        if (this.schedule.daysOfMonth) {
            await this._getNextDayOfMonth(nextDatetimeRun, this.schedule.daysOfMonth, 'noMonths');
            return nextDatetimeRun;
        }

        if (this.schedule.daysOfWeek) {
            await this._getNextDayOfWeek(nextDatetimeRun, this.schedule.daysOfWeek);
            return nextDatetimeRun;
        }

        if (this.schedule.times) {
            await this._getNextTime(nextDatetimeRun, this.schedule.times);
            return nextDatetimeRun;
        }

        if (this.schedule.date) {
            nextDatetimeRun = await this._parseTime(this.schedule.date);
            return nextDatetimeRun;
        }

        if (this.schedule.interval) {
            await this._getNextStrFormatTime(nextDatetimeRun, this.schedule.interval);
            return nextDatetimeRun;
        }

    }

    async _getNextMonth(nextDatetimeRun, months, nextMonth = false) {

        let setMonth = null;
        let dif = 9999999999;

        if (nextMonth) {
            await this._setStartMonth(nextDatetimeRun);
        }

        for (let month of months) {

            if (!nextMonth && nextDatetimeRun.month > month.month - 1) {
                continue;
            }

            if (nextMonth && nextDatetimeRun.month >= month.month - 1) {
                continue;
            }

            let difBetweenMonths = month.month - nextDatetimeRun.month - 1;
            if (dif >= difBetweenMonths) {
                dif = difBetweenMonths;
                setMonth = month;
            }

        }

        if (!setMonth) {
            await this._addYears(nextDatetimeRun);
            await this._setStartYear(nextDatetimeRun);
            await this._getNextMonth(nextDatetimeRun, months);
            return;
        }

        if (nextDatetimeRun.month !== setMonth.month - 1) {
            await this._setStartMonth(nextDatetimeRun);
        }
        nextDatetimeRun.month = setMonth.month - 1;

        await this._fillParseDate(nextDatetimeRun);
        await this._getNextDayOfMonth(nextDatetimeRun, setMonth.daysOfMonth, months);

    }

    async _getNextDayOfMonth(nextDatetimeRun, daysOfMonth, months, nextDay = false) {

        let setDay = null;
        let dif = 9999999999;

        if (nextDay) {
            await this._setStartDay(nextDatetimeRun);
        }

        for (let day of daysOfMonth) {

            if (!nextDay && nextDatetimeRun.dayOfMonth > day.dayOfMonth) {
                continue;
            }

            if (nextDay && nextDatetimeRun.dayOfMonth >= day.dayOfMonth) {
                continue;
            }

            let difBetweenDays = day.dayOfMonth - nextDatetimeRun.dayOfMonth;
            if (dif >= difBetweenDays) {
                dif = difBetweenDays;
                setDay = day;
            }

        }

        if (!setDay) {

            if (months === 'noMonths') {
                await this._addMonths(nextDatetimeRun);
                await this._setStartMonth(nextDatetimeRun);
                await this._getNextDayOfMonth(nextDatetimeRun, daysOfMonth, months);
                return;
            }

            await this._getNextMonth(nextDatetimeRun, months, true);
            return;

        }

        if (nextDatetimeRun.dayOfMonth !== setDay.dayOfMonth) {
            await this._setStartDay(nextDatetimeRun);
        }
        nextDatetimeRun.dayOfMonth = setDay.dayOfMonth;
        await this._fillParseDate(nextDatetimeRun);

        await this._getNextTime(nextDatetimeRun, setDay.times, months, daysOfMonth);

    }

    async _getNextDayOfWeek(nextDatetimeRun, daysOfWeek, nextDay = false) {

        let setDay = null;
        let dif = 9999999999;

        if (nextDay) {
            await this._setStartDay(nextDatetimeRun);
        }

        let dayOfWeek = nextDatetimeRun.dayOfWeek;
        if (dayOfWeek === 0) {
            dayOfWeek = 7;
        }

        for (let day of daysOfWeek) {

            if (!nextDay && dayOfWeek > day.dayOfWeek) {
                continue;
            }

            if (nextDay && dayOfWeek >= day.dayOfWeek) {
                continue;
            }

            let difBetweenDays = day.dayOfWeek - dayOfWeek;
            if (dif >= difBetweenDays) {
                dif = difBetweenDays;
                setDay = day;
            }

        }

        if (!setDay) {
            await this._setStartNextWeek(nextDatetimeRun);
            await this._getNextDayOfWeek(nextDatetimeRun, daysOfWeek);
            return;
        }

        if (dif > 0) {
            await this._addDays(nextDatetimeRun, dif);
        }

        await this._getNextTime(nextDatetimeRun, setDay.times, null, daysOfWeek);

    }

    async _getNextTime(nextDatetimeRun, times, months = null, daysOfMonth = null, nextTime = false) {

        let setTime = null;
        let dif = 9999999999;

        if (nextTime) {
            await this._addDays(nextDatetimeRun);
            await this._setStartDay(nextDatetimeRun);
        }

        for (let time of times) {

            let partsTime = await this._convertTime(time);

            if (!nextTime && nextDatetimeRun.sumMs > partsTime.sumMs) {
                continue;
            }

            let difBetweenTimes = partsTime.sumMs - nextDatetimeRun.sumMs;
            if (dif >= difBetweenTimes) {
                dif = difBetweenTimes;
                setTime = partsTime;
            }

        }

        if (!setTime && daysOfMonth) {

            if (months) {
                await this._getNextDayOfMonth(nextDatetimeRun, daysOfMonth, months, true);
                return;
            }

            await this._getNextDayOfWeek(nextDatetimeRun, daysOfMonth, true);
            return;

        }

        if (!setTime && !daysOfMonth) {
            await this._getNextTime(nextDatetimeRun, times, months, daysOfMonth, true);
            return;
        }

        nextDatetimeRun.m = setTime.m;
        nextDatetimeRun.h = setTime.h;
        nextDatetimeRun.s = setTime.s;
        nextDatetimeRun.ms = setTime.ms;
        await this._fillParseDate(nextDatetimeRun);

    }

    async _getNextStrFormatTime(nextDatetimeRun, strFormat) {

        let ms = await this._timer._parseStrPeriodToMS(strFormat);
        let newDate = new Date(nextDatetimeRun.timeMs + ms);
        await this._fillParseDate(nextDatetimeRun, newDate);

    }

    async _setStartDay(nextDatetimeRun) {

        nextDatetimeRun.h = 0;
        nextDatetimeRun.hms = 0;

        nextDatetimeRun.m = 0;
        nextDatetimeRun.mms = 0;

        nextDatetimeRun.s = 0;
        nextDatetimeRun.sms = 0;

        nextDatetimeRun.ms = 0;

        await this._fillParseDate(nextDatetimeRun);

    }

    async _setEndDay(nextDatetimeRun) {

        nextDatetimeRun.h = 23;
        nextDatetimeRun.hms = nextDatetimeRun.h * this._timer.partsTime.H;

        nextDatetimeRun.m = 59;
        nextDatetimeRun.mms = nextDatetimeRun.m * this._timer.partsTime.M;

        nextDatetimeRun.s = 59;
        nextDatetimeRun.sms = nextDatetimeRun.s * this._timer.partsTime.S;

        nextDatetimeRun.ms = 999;

        await this._fillParseDate(nextDatetimeRun);

    }

    async _setStartYear(nextDatetimeRun) {

        nextDatetimeRun.month = 0;

        nextDatetimeRun.dayOfMonth = 1;

        nextDatetimeRun.h = 0;
        nextDatetimeRun.hms = 0;

        nextDatetimeRun.m = 0;
        nextDatetimeRun.mms = 0;

        nextDatetimeRun.s = 0;
        nextDatetimeRun.sms = 0;

        nextDatetimeRun.ms = 0;

        await this._fillParseDate(nextDatetimeRun);

    }

    async _setEndYear(nextDatetimeRun) {

        nextDatetimeRun.moth = 11;

        nextDatetimeRun.h = 23;
        nextDatetimeRun.hms = nextDatetimeRun.h * this._timer.partsTime.H;

        nextDatetimeRun.m = 59;
        nextDatetimeRun.mms = nextDatetimeRun.m * this._timer.partsTime.M;

        nextDatetimeRun.s = 59;
        nextDatetimeRun.sms = nextDatetimeRun.s * this._timer.partsTime.S;

        nextDatetimeRun.ms = 999;

        await this._fillParseDate(nextDatetimeRun);

    }

    async _setStartMonth(nextDatetimeRun) {

        nextDatetimeRun.dayOfMonth = 1;

        nextDatetimeRun.h = 0;
        nextDatetimeRun.hms = 0;

        nextDatetimeRun.m = 0;
        nextDatetimeRun.mms = 0;

        nextDatetimeRun.s = 0;
        nextDatetimeRun.sms = 0;

        nextDatetimeRun.ms = 0;

        await this._fillParseDate(nextDatetimeRun);

    }

    async _setStartNextWeek(nextDatetimeRun) {

        let dayOfWeek = nextDatetimeRun.dayOfWeek;
        if (dayOfWeek === 0) {
            dayOfWeek = 7;
        }

        let addDays = 7 - dayOfWeek + 1;
        await this._addDays(nextDatetimeRun, addDays);
        await this._setStartDay(nextDatetimeRun);

        await this._fillParseDate(nextDatetimeRun);

    }

    async _addYears(nextDatetimeRun, years = 1) {

        nextDatetimeRun.year += years;
        await this._fillParseDate(nextDatetimeRun);

    }

    async _addMonths(nextDatetimeRun, months = 1) {

        nextDatetimeRun.month += months;
        await this._fillParseDate(nextDatetimeRun);

    }

    async _addDays(nextDatetimeRun, days = 1) {

        nextDatetimeRun.dayOfMonth += days;
        await this._fillParseDate(nextDatetimeRun);

    }

    async _fillParseDate(nextDatetimeRun, newDate) {

        if (!newDate) {
            newDate = new Date(
                nextDatetimeRun.year,
                nextDatetimeRun.month,
                nextDatetimeRun.dayOfMonth,
                nextDatetimeRun.h,
                nextDatetimeRun.m,
                nextDatetimeRun.s,
                nextDatetimeRun.ms);
        }

        nextDatetimeRun.timeMs = newDate.getTime();

        newDate = await this._parseTime(newDate);

        nextDatetimeRun.year = newDate.year;
        nextDatetimeRun.month = newDate.month;
        nextDatetimeRun.dayOfMonth = newDate.dayOfMonth;
        nextDatetimeRun.dayOfWeek = newDate.dayOfWeek;
        nextDatetimeRun.h = newDate.h;
        nextDatetimeRun.hms = newDate.hms;
        nextDatetimeRun.m = newDate.m;
        nextDatetimeRun.mms = newDate.mms;
        nextDatetimeRun.s = newDate.s;
        nextDatetimeRun.sms = newDate.sms;
        nextDatetimeRun.ms = newDate.ms;
        nextDatetimeRun.timeMs = newDate.timeMs;
        nextDatetimeRun.sumMs = newDate.sumMs;

    }

    async _parseTime(time) {

        time = time || new Date();
        let parseTime = {
            year: time.getFullYear(),
            month: time.getMonth(),
            dayOfMonth: time.getDate(),
            dayOfWeek: time.getDay(),
            h: time.getHours(),
            hms: time.getHours() * this._timer.partsTime.H,
            m: time.getMinutes(),
            mms: time.getMinutes() * this._timer.partsTime.M,
            s: time.getSeconds(),
            sms: time.getSeconds() * this._timer.partsTime.S,
            ms: time.getMilliseconds(),
            timeMs: time.getTime()
        };

        parseTime.sumMs = parseTime.hms + parseTime.mms + parseTime.sms + parseTime.ms;
        return parseTime;

    }

    async _convertTime(time) {

        let fullTime = {
            h: 0,
            m: 0,
            s: 0,
            ms: 0,
            sumMs: 0
        };

        if (time.h) {
            fullTime.h = time.h;
            fullTime.sumMs += time.h * this._timer.partsTime.H;
        }

        if (time.m) {
            fullTime.m = time.m;
            fullTime.sumMs += time.m * this._timer.partsTime.M;
        }

        if (time.s) {
            fullTime.s = time.s;
            fullTime.sumMs += time.s * this._timer.partsTime.S;
        }

        if (time.ms) {
            fullTime.ms = time.ms;
            fullTime.sumMs += time.ms;
        }

        return fullTime;

    }

    async _addHistory(act, datetime) {

        if (!act) {
            return false;
        }

        datetime = datetime || new Date();
        this.history.push({
            act,
            datetime
        });

        return true;

    }

};
