import * as React from 'react';
import { ID, Observer } from 'src/utilities/constructors';

export interface INoteProps {
    guid: ID;
    title: string;
    message: string;
    creationDate: string;
    order: number;
    handleRemoveNote(guid: ID, note: Note):void ;
}

class Note extends Observer<INoteProps> {
    public guid: ID;
    public order: number;
    public noteReferenceGuid: number
    constructor(props: INoteProps) {
        super(props);
        this.guid = props.guid;
        this.order = props.order;

        this.handleRemoveNote = this.handleRemoveNote.bind(this);
    }
    public handleRemoveNote(){
        this.props.handleRemoveNote(this.guid, this);
    }
    public update(searchValue: string) {

        return;
    }
    public render() {
        const { guid, title, message, creationDate } = this.props;
        return (
            <div className="note note-filled" draggable={true} key={guid}>
                <div className="note-remove"><div className="delete" onClick={this.handleRemoveNote} /></div>
                <div className="note-flexbox">
                    <textarea className="note-title" placeholder="Title" defaultValue={title}/>
                    <textarea className="note-content" placeholder="Message" defaultValue={message}/>
                    <p className="note-footer">
                        {creationDate}
                    </p>
                </div>
            </div>
        );
    }
}
export default Note;