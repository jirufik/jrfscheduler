# jrfscheduler

**jrfscheduler** is a **async/await** scheduled task scheduler.

## Installation
```
$ npm i jrfscheduler
```

## schedule
 
You can set one of six types of schedules.

### 1 - date

The task is performed on the set date once

```js
let schedule = new JrfScheduler();
let now = new Date();

schedule.schedule = {
    date: new Date(now.getTime() + 600)
};
```

### 2 - interval

The task is performed every time at a specified interval.

the format string: Xms - X milliseconds, Xs - X seconds, Xm - X minutes, Xh - X hours, Xd - X days. 

For example: "1d, 2h, 3ms"

```js
let schedule = new JrfScheduler();

schedule.schedule = {
    interval: '100ms'
};
```

### 3 - times

The task is performed every day at a specified time.

```js
let schedule = new JrfScheduler();

schedule.schedule = {
    times: [
               {h: 0, m: 2, s: 33},
               {h: 13, m: 12, s: 35},
               {h: 22, m: 43, s: 49}
           ]
};
```

### 4 - daysOfWeek

The task is performed on the specified days of the week at the specified time.

1(mon) - 7(sun)

```js
let schedule = new JrfScheduler();

schedule.schedule = {
            daysOfWeek: [
                {
                    dayOfWeek: 1,
                    times: [
                        {h: 0, m: 2, s: 33},
                        {h: 13, m: 12, s: 35},
                        {h: 22, m: 43, s: 49}
                    ]
                },
                {
                    dayOfWeek: 3,
                    times: [
                        {h: 0, m: 2, s: 33},
                        {h: 13, m: 12, s: 35},
                        {h: 22, m: 43, s: 49}
                    ]
                },
                {
                    dayOfWeek: 7,
                    times: [
                        {h: 0, m: 2, s: 33},
                        {h: 13, m: 12, s: 35},
                        {h: 22, m: 43, s: 49}
                    ]
                },
            ]
};
```

### 5 - daysOfMonth

The task is executed on the specified day of the month at the specified time.

```js
let schedule = new JrfScheduler();

schedule.schedule = {
            daysOfMonth: [
                {
                    dayOfMonth: 1,
                    times: [
                        {h: 0, m: 2, s: 33},
                        {h: 13, m: 12, s: 35},
                        {h: 22, m: 43, s: 49}
                    ]
                },
                {
                    dayOfMonth: 12,
                    times: [
                        {h: 0, m: 2, s: 33},
                        {h: 13, m: 12, s: 35},
                        {h: 22, m: 43, s: 49}
                    ]
                },
                {
                    dayOfMonth: 27,
                    times: [
                        {h: 0, m: 2, s: 33},
                        {h: 13, m: 12, s: 35},
                        {h: 22, m: 43, s: 49}
                    ]
                },
            ]
};
```

### 6 - months

The task is executed on the specified days at the specified time of the specified months.

```js
let schedule = new JrfScheduler();

schedule.schedule = {
       months: [
                   {
                       month: 1,
                       daysOfMonth: [
                           {
                               dayOfMonth: 1,
                               times: [
                                   {h: 0, m: 2, s: 33},
                                   {h: 13, m: 12, s: 35},
                                   {h: 22, m: 43, s: 49}
                               ]
                           },
                           {
                               dayOfMonth: 12,
                               times: [
                                   {h: 0, m: 2, s: 33},
                                   {h: 13, m: 12, s: 35},
                                   {h: 22, m: 43, s: 49}
                               ]
                           },
                           {
                               dayOfMonth: 27,
                               times: [
                                   {h: 0, m: 2, s: 33},
                                   {h: 13, m: 12, s: 35},
                                   {h: 22, m: 43, s: 49}
                               ]
                           }
                       ]
                   },
                   {
                       month: 12,
                       daysOfMonth: [
                           {
                               dayOfMonth: 1,
                               times: [
                                   {h: 0, m: 2, s: 33},
                                   {h: 13, m: 12, s: 35},
                                   {h: 22, m: 43, s: 49}
                               ]
                           },
                           {
                               dayOfMonth: 12,
                               times: [
                                   {h: 0, m: 2, s: 33},
                                   {h: 13, m: 12, s: 35},
                                   {h: 22, m: 43, s: 49}
                               ]
                           },
                           {
                               dayOfMonth: 27,
                               times: [
                                   {h: 0, m: 2, s: 33},
                                   {h: 13, m: 12, s: 35},
                                   {h: 22, m: 43, s: 49}
                               ]
                           }
                       ]
                   }
               ]     
};
```

## status 

Scheduler can have one of three statuses.

### 1 - READY

The scheduler is in a reset state. You need to set the task and schedule.

### 2 - RUNNING

The scheduler is in a running state.

### 3 - COMPLETED

The scheduler is in a stopped state.

## task

Scheduled task.

## countRun

The number of times the task was performed on a schedule.

## nextRun

Date of the next start of the task.

## prevRun 

Date of the previous start of the task.

## history

History of the scheduler.

```js
[ { act: 'START', datetime: '2018-11-24T14:41:36.729Z' },
  { act: 'RUN_TASK', datetime: '2018-11-24T14:41:36.825Z' },
  { act: 'RUN_TASK', datetime: '2018-11-24T14:41:36.875Z' },
  { act: 'STOP', datetime: '2018-11-24T14:41:36.900Z' },
  { act: 'START', datetime: '2018-11-24T14:41:37.000Z' },
  { act: 'RUN_TASK', datetime: '2018-11-24T14:41:37.726Z' },
  { act: 'STOP', datetime: '2018-11-24T14:41:37.801Z' } ]
```

## datetimeStart

The date from which the execution will begin. If null means execution will begin immediately.

## datetimeFinish

End date. If the null scheduler will run indefinitely.

## Methods

| Method | Set status | Allowed with statuses | Description |
|--|--|--|--|
| start | RUNNING | READY or COMPLETED | Runs the scheduler. Before starting, you need to set the task and schedule. This event is recorded in history. Returns true or false. |
| stop | COMPLETED | RUNNING | Stops the scheduler. This event is recorded in history. Returns true or false. |
| reset | READY | any | Stops the scheduler. Resets to the original state. |
| getInfo | nothing | any | Restores the current **state** of the scheduler. |

**state**

```js
{
    "datetimeStart": null,
    "datetimeFinish": null,
    "statusLists": {
        "READY": "READY",
        "RUNNING": "RUNNING",
        "COMPLETED": "COMPLETED"
    },
    "status": "COMPLETED",
    "schedule": {
        "times": [
            {
                "h": 0,
                "m": 0,
                "s": 0,
                "ms": 0
            },
            {
                "h": 18,
                "m": 2,
                "s": 14,
                "ms": 608
            },
            {
                "h": 18,
                "m": 2,
                "s": 14,
                "ms": 658
            },
            {
                "h": 18,
                "m": 2,
                "s": 15,
                "ms": 508
            }
        ]
    },
    "countRun": 3,
    "nextRun": "2018-11-24T21:00:00.000Z",
    "prevRun": "2018-11-24T15:02:15.504Z",
    "history": [
        {
            "act": "START",
            "datetime": "2018-11-24T15:02:14.508Z"
        },
        {
            "act": "RUN_TASK",
            "datetime": "2018-11-24T15:02:14.608Z"
        },
        {
            "act": "RUN_TASK",
            "datetime": "2018-11-24T15:02:14.657Z"
        },
        {
            "act": "STOP",
            "datetime": "2018-11-24T15:02:14.678Z"
        },
        {
            "act": "START",
            "datetime": "2018-11-24T15:02:14.778Z"
        },
        {
            "act": "RUN_TASK",
            "datetime": "2018-11-24T15:02:15.504Z"
        },
        {
            "act": "STOP",
            "datetime": "2018-11-24T15:02:15.579Z"
        }
    ],
    "actLists": {
        "START": "START",
        "RUN_TASK": "RUN_TASK",
        "STOP": "STOP"
    }
}
```

## Example

```js
const JrfScheduler = require('jrfscheduler');

function wait(mlsecond = 1000) {
    return new Promise(resolve => setTimeout(resolve, mlsecond));
}

async function scheduleInterval() {

    let schedule = new JrfScheduler();

    schedule.schedule = {
        interval: '100ms'
    };

    schedule.task = async () => {
        dateFinish = new Date();
    };

    let now = new Date();
    schedule.datetimeFinish = new Date(now.getTime() + 5000);

    let dateFinish = null;

    await schedule.start();
    await wait(210);
    await schedule.stop();

    let info = await schedule.getInfo();
    console.log(info);

    await wait(100);
    await schedule.start();
    await wait(110);
    await schedule.stop();

    info = await schedule.getInfo();
    console.log(info);

}

scheduleInterval();
```