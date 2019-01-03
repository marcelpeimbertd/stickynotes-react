import * as React from 'react';

type IAddNoteBtnProps = React.DOMAttributes<HTMLDivElement>;

function AddNoteBtn(props: IAddNoteBtnProps) {
    return (
        <div className="note note-add" {...props}>
            <div className="add"/>
        </div>
    );
}

export default AddNoteBtn;