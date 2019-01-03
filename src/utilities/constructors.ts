import { Component } from 'react';

// Types
export interface IOrderChange { id: number, order: number };
export type ID = number;
export type Action = "delete" | "ordering" | "edit" | "create" | "redo" | "undo";
export type BeforOrder = IOrderChange[];
export type ChangeSchema = NoteData | ID | BeforOrder;

// Notes constructor
export class NoteData {
    public id: number;
    public title: string;
    public message: string;
    public creationDate: string;
    public order: number;
    constructor(id: number, title: string, message: string, creationDate: Date, order: number) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.creationDate = creationDate.toLocaleString('en-US', { hour12: false });
        this.order = order;
    }
}

// Change constructor those help to add changes into the history
export class Change {
    public action: Action;
    public changes: ChangeSchema;
    constructor(action: Action, changes: ChangeSchema) {
        this.action = action;
        this.changes = changes;
    }
}

// History constructor hPointer = 'history pointer'
export class History {
    public changes: Change[]
    public hPointer: number;
    constructor() {
        this.changes = [];
        this.hPointer = 0;
    }

    public addChange(action: Action, change: Change) {
        if (action !== "redo" || this.hPointer < this.changes.length) {
            this.changes[this.hPointer] = change;
        }

        if (action !== "undo" && this.hPointer < this.changes.length) {
            this.hPointer++;
            if (action !== "redo") {
                for (let index = this.hPointer, length = this.changes.length; index < length; index++) {
                    delete this.changes[index];
                }
            }
        }
    }

    public undo() {
        if (this.hPointer > 0) {
            return this.changes[--this.hPointer];
        }
        return;
    }

    public redo() {
        if (this.hPointer < this.changes.length) {
            return this.changes[this.hPointer];
        }
        return;
    }
}



// First, let's model the list of dependent Observers a subject may have:
export class ObserverList<T> {
    public observerList: Array<Observer<T>>;
    constructor() {
        this.observerList = [];
    }

    public add(obj: Observer<T>) {
        return this.observerList.push(obj);
    }

    public count() {
        return this.observerList.length;
    }
    public get(index: number) {
        if (index > -1 && index < this.observerList.length) {
            return this.observerList[index];
        }
        return;
    }
    public indexOf(obj: Observer<T>, startIndex: number) {
        let i = startIndex;
        while (i < this.observerList.length) {
            if (this.observerList[i] === obj) {
                return i;
            }
            i++;
        }
        return -1;
    }

    public removeAt(index: number) {
        this.observerList.splice(index, 1);
    }
}


// Next, let's model the Subject and the ability to add, remove or notify observers on the observer list.
export abstract class Subject<T, N> extends Component<T> {
    public observers: ObserverList<N>;
    constructor(props: T) {
        super(props);
        this.observers = new ObserverList();
    }
    public addObserver(observer: Observer<N>) {
        this.observers.add(observer);
    }
    public removeObserver(observer: Observer<N>) {
        this.observers.removeAt(this.observers.indexOf(observer, 0));
    }
    public notify(context: any) {
        const observerCount = this.observers.count();
        for (let i = 0; i < observerCount; i++) {
            const observer = this.observers.get(i)
            if (observer) {
                observer.update(context);
            }
        }
    }
}


// We then define a skeleton for creating new Observers. The update functionality here will be overwritten later with custom behaviour.
// The Observer
export abstract class Observer<T> extends Component<T> {
    public abstract update(...args: any[]): any;
}