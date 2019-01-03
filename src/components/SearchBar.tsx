import * as React from 'react';
import { Subject } from 'src/utilities/constructors';
import { INoteProps } from './Note';

// interface ISearchBarProps{

// }

class SearchBar extends Subject<{},INoteProps> {
    constructor(props: {}){
        super(props);
    }

    public render() {
        return <input type="text" placeholder="Search"/>
    };
}

export default SearchBar;