import './App.css';

import * as React from 'react';
import AddNoteBtn from './components/AddNoteBtn';
import Note, { INoteProps } from './components/Note';
import RedoBtn from './components/RedoBtn';
import SearchBar from './components/SearchBar';
import UndoBtn from './components/UndoBtn';
import { noteModel } from './logic/noteModel';
import notePresenter, { INotePresenter } from './logic/notePresenter';
import { ID, NoteData, Observer, } from './utilities/constructors';

interface IAppState {
  board: Note[];
}

class App extends React.Component<{}, IAppState> {
  private notePresenter: INotePresenter;
  private searchBar: SearchBar;
  private board: Note[];
  constructor(props: {}) {
    super(props);
    this.board = [];
    this.state = {
      board: [],
    }
    this.handleAddNote = this.handleAddNote.bind(this);
    this.handleRemoveNote = this.handleRemoveNote.bind(this);
  }
  public componentDidMount() {
    this.notePresenter = notePresenter(noteModel, this);
  }
  public findParentClassName(elem: HTMLElement, classNameRegex: RegExp): HTMLElement | boolean {
    if (elem.className.search(classNameRegex) >= 0) {
      return elem;
    }
    const parent = elem.parentNode
    if (parent && parent.nodeName !== "#document") {
      return this.findParentClassName((elem.parentNode as HTMLElement), classNameRegex)
    }
    else {
      return false;
    }
  }
  public subscribe(observer: Observer<INoteProps>) {
    this.searchBar.addObserver(observer);
  }
  public unsubscribe(observer: Observer<INoteProps>) {
    this.searchBar.removeObserver(observer);
  }
  public handleRemoveNote(guid: ID, note: Note) {
    this.notePresenter.delete("delete", guid, note);
  }
  public removeNote(guid: ID, target?: Note) {
    let noteView: Note | undefined;
    noteView = target;
    if (target === undefined) {
      noteView = this.board.find((note) => {
        return note.guid === guid;
      });
    }
    if (noteView !== undefined) {
      this.searchBar.removeObserver(noteView);
      this.board = this.board.filter((note) => noteView!.props.guid !== note.props.guid);
      const board = Array.from(this.board);
      this.setState({board});
    }
  }
  public handleAddNote(event: React.MouseEvent<HTMLDivElement>) {
    this.notePresenter.create("create");
  }
  public addNote(note: NoteData) {
    const noteView: Note = (<Note key={note.id} guid={note.id} {...note} handleRemoveNote={this.handleRemoveNote}/> as any);
    this.board.push(noteView);
    const board = Array.from(this.board);
    this.setState({ board });
  }
  public edit(...args: any[]) {
    // const notes = Array.from(this.board)
    // args.forEach((data) => {
    //   const note = notes.find((noteBoard) => {
    //     return noteBoard.guid === data.id;
    //   });
    //   for (const key in data) {
    //     if (data.hasOwnProperty(key)) {
    //       switch (key) {
    //         case "title":
    //           note.children[1].children[0].value = data[key];
    //           break;
    //         case "message":
    //           note.children[1].children[1].value = data[key];
    //           break;
    //         case "creationDate":
    //         case "editionDate":
    //           note.children[1].children[2].innerText = data.editionDate ? "Posted: " + data.creationDate + "\n Edited: " + data.editionDate : "Posted: " + data.creationDate;
    //           break;
    //         case "order":
    //           note.style.order = data[key];
    //           break;
    //         default:
    //           break;
    //       }
    //     }
    //   }
    // });
  }
  public render() {
    return (
      <div>
        <header>
          <div className="container">
            <h1>Dental Notes</h1>
          </div>
        </header>
        <div id="notebook" className="container notebook">
          <div className="notebook-tools">
            <SearchBar ref={(searchBar) => {
              if (searchBar) {
                this.searchBar = searchBar
              }
            }} />
            <RedoBtn />
            <UndoBtn />
          </div>
          <div className="notebook-notes">
            {this.state.board}
            <AddNoteBtn onClick={this.handleAddNote} />
          </div>
        </div>
      </div >
    );
  }

}

export default App;
