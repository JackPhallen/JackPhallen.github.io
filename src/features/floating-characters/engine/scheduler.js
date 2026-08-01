// Runs behavior tasks on a fixed interval; skips while the tab is hidden.
export class IntervalScheduler {
    constructor(interval) {
        this.interval = interval;
        this.tasks = [];
        this.timerId = null;
    }

    add(name, callback) {
        this.tasks.push({ name, callback });
        if (this.timerId === null) {
            this.scheduleNext();
        }
        return this;
    }

    scheduleNext() {
        this.timerId = setTimeout(() => {
            this.timerId = null;
            if (!document.hidden) {
                for (const task of this.tasks) {
                    task.callback();
                }
            }
            if (this.tasks.length > 0) {
                this.scheduleNext();
            }
        }, this.interval);
    }

    stop() {
        clearTimeout(this.timerId);
        this.timerId = null;
    }
}
