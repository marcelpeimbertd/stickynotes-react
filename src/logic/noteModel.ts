import { Action, BeforOrder, Change, History, IOrderChange, NoteData, } from '../utilities/constructors';

const LAST = "last";
const EDITION_DATE = "editionDate";

export interface INoteModel {
    init(): void;
    getNotes(...args: any[]): NoteData[];
    genID(): number;
    create(action: Action, note: NoteData): void;
    ordering(action: Action, noteschanged: IOrderChange[]): void;
    edit(action: Action, data: NoteData): boolean;
    delete(action: Action, id: number): void;
    redo(): Change | undefined;
    undo(): Change | undefined;
}

export const noteModel: INoteModel = (() => {
    const noteHistory = new History()
    let notes = { last: 0 }

    function addChange(action: Action, change: Change) {
        noteHistory.addChange(action, change);
    }

    function save(note: NoteData | undefined) {
        if (note !== undefined) {
            // save note
            notes[note.id] = note;
        }
        // registing the note
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    return {
        init() {
            let notesJson = localStorage.getItem("notes")
            if (!notesJson) {
                notesJson = JSON.stringify(notes);
                localStorage.setItem("notes", notesJson);
            }
            notes = JSON.parse(notesJson);
        },
        getNotes(...args: any[]) {
            const length = args.length
            const send = [];
            if (length > 0) {
                for (let index = 0; index < length; index++) {
                    send.push(notes[args[index]]);
                }
            }
            else {
                for (const key in notes) {
                    if (notes.hasOwnProperty(key) && key !== LAST) {
                        send.push(notes[key]);
                    }
                }
            }
            return send;
        },
        genID() {
            return ++notes[LAST];
        },
        create(action: Action, note: NoteData) {
            addChange(action, new Change("delete", note.id));
            save(note);
        },
        ordering(action: Action, noteschanged: NoteData[]) {
            const beforeOrder: BeforOrder = [];
            noteschanged.forEach((data) => {
                const note = Object.assign({}, notes[data.id]);
                beforeOrder.push({ id: note.id, order: note.order })
                note.order = data.order;
                save(note);
            });

            addChange(action, new Change("ordering", beforeOrder));
        },
        edit(action: Action, data: NoteData) {
            // finding the note
            const note = Object.assign({}, notes[data.id]);
            let hadChange = false;

            // Comparing if the data change and replacing the note
            for (const key in data) {
                if (data.hasOwnProperty(key) && key !== EDITION_DATE && note[key] !== data[key]) {
                    note[key] = data[key];
                    hadChange = true;
                }
            }

            if (hadChange) {
                note[EDITION_DATE] = data[EDITION_DATE] ? data[EDITION_DATE] : note[EDITION_DATE];

                addChange(action, new Change("edit", Object.assign({}, notes[data.id])));
                // saving the note
                save(note);
            }

            // returning the note to display
            return hadChange;
        },
        delete(action: Action, id: number) {
            const note = Object.assign({}, notes[id]);
            delete notes[id];
            let isEmpty = true;
            for (const key in notes) {
                if (key !== LAST && notes[key]) {
                    isEmpty = false;
                    break;
                }
            }
            if (isEmpty) {
                notes[LAST] = 0;
            }
            save(undefined);
            addChange(action, new Change("create", Object.assign({}, note)));
        },
        redo() {
            return noteHistory.redo();
        },
        undo() {
            return noteHistory.undo();
        }
    }
})();