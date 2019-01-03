import App from 'src/App';
import Note from 'src/components/Note';
import { Action, ID, IOrderChange, NoteData, } from 'src/utilities/constructors';
import { Change } from './../utilities/constructors';
import { INoteModel } from './noteModel';

export interface INotePresenter {
    execute(name: string): any;
    create(action: Action, note?: NoteData): void;
    orderingByDom(notes: any, data: any): void;
    ordering(action: Action, notes: any): void;
    edit(action: Action, data: any): boolean | undefined;
    delete(action: Action, id: ID, note: Note): void;
    redo(): void;
    undo(): void;
}

function notePresenter(noteModel: INoteModel, noteView: App) {

    function init() {
        let notes: NoteData[] = [];
        let length;
        noteModel.init();
        notes = noteModel.getNotes();
        length = notes.length;
        while (length--) {
            printNote(notes.shift());
        }
    }

    function printNote(note: NoteData | undefined) {
        if (note) {
            noteView.addNote(note);
        }
    }

    init();

    return {
        execute(name: string, ...args: any[]) {
            return notePresenter[name] && notePresenter[name].apply(notePresenter, args);
        },
        create(action: Action, note?: NoteData) {

            if (note === undefined) {
                const id = noteModel.genID();
                // creating a new note
                note = new NoteData(id, "", "", new Date(), id);
            }

            noteModel.create(action, note);
            printNote(note);
        },
        orderingByDom(notes: Note[], data: Note) {
            notes.sort((note1: Note, note2: Note) => {
                return note1.order - note2.order;
            });
            const noteTargetIndex = notes.findIndex((note) => {
                return note.guid === data.guid;
            })
            const noteReferenceIndex = notes.findIndex((note) => {
                return note.guid === data.noteReferenceGuid;
            })
            const notesChanged: IOrderChange[] = [] // array of data info
            let data2: IOrderChange;

            notes[noteTargetIndex].order = notes[noteReferenceIndex].order;
            data2 = { id: notes[noteTargetIndex].guid, order: notes[noteTargetIndex].order };
            notesChanged.push(data2);
            if (noteReferenceIndex < noteTargetIndex) {
                for (let index = noteReferenceIndex; index < noteTargetIndex; index++) {
                    notes[index].order++;
                    data2 = { id: notes[index].guid, order: notes[index].order };
                    notesChanged.push(data2);
                    if (notes[index].order !== notes[index + 1].order) {
                        break;
                    }
                }
            }
            else {
                for (let index = noteReferenceIndex; index > noteTargetIndex; index--) {
                    notes[index].order--;
                    data2 = { id: notes[index].guid, order: notes[index].order };
                    notesChanged.push(data2);
                    if (notes[index].order !== notes[index - 1].order) {
                        break;
                    }
                }
            }
            noteModel.ordering("ordering", notesChanged);
        },
        ordering(action: Action, notes: NoteData[]) {
            noteModel.ordering(action, notes);
            noteView.edit.apply(undefined, notes);
        },
        edit(action: Action, data: NoteData) {
            const hadChange = noteModel.edit(action, data);
            if (action === "edit") {
                return hadChange;
            }
            noteView.edit(data);
            return;
        },
        delete(action: Action, id: ID, note: Note) {
            noteModel.delete(action, id);
            noteView.removeNote(id, note);
        },
        redo() {
            let change: Change | undefined;
            change = noteModel.redo();
            if (!!change) {
                this.execute(change.action, "redo", change.changes);
            }
        },
        undo() {
            let change: Change | undefined
            change = noteModel.undo();
            if (!!change) {
                this.execute(change.action, "undo", change.changes);
            }
        }
    }
}

export default notePresenter;
