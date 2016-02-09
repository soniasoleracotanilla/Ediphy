import {combineReducers} from 'redux';
import undoable, {excludeAction} from 'redux-undo';

import {ADD_BOX, SELECT_BOX, MOVE_BOX, RESIZE_BOX, UPDATE_BOX, DELETE_BOX, REORDER_BOX, ADD_SORTABLE_CONTAINER,
    ADD_NAV_ITEM, SELECT_NAV_ITEM, EXPAND_NAV_ITEM, REMOVE_NAV_ITEM,
    TOGGLE_PLUGIN_MODAL, TOGGLE_PAGE_MODAL, TOGGLE_TEXT_EDITOR, TOGGLE_TITLE_MODE,
    CHANGE_DISPLAY_MODE, SET_BUSY, UPDATE_TOOLBAR, IMPORT_STATE
} from './actions';
import {ID_PREFIX_SECTION, ID_PREFIX_PAGE, ID_PREFIX_SORTABLE_BOX, ID_PREFIX_SORTABLE_CONTAINER} from './constants';

function boxCreator(state = {}, action = {}){
    switch (action.type){
        case ADD_BOX:
            /*
            let styleStr = "min-width: '100px'; min-height: '100px'; background-color: 'yellow'".split(';');
            let style = {};
            styleStr.forEach(item =>{
                let keyValue = item.split(':');
                //We camelCase style keys
                let key = keyValue[0].trim().replace(/-./g,function(char){return char.toUpperCase()[1]});
                style[key] = keyValue[1].trim().replace(/'/g, "");
            });
            */
            let content = action.payload.content;
            if(!content)
                content = "<h1>Placeholder</h1>";

            let position, width, height;
            switch(action.payload.type){
                case 'sortable':
                    position = {x: 0, y: 0};
                    width = '100%';
                    break;
                default:
                    position = {x: Math.floor(Math.random() * 500), y: Math.floor(Math.random() * 500)}
                    width = 200;
                    height = 200;
                    break;
            }
            return {
                id: action.payload.id,
                children: [],
                parent: action.payload.parent,
                type: action.payload.type,
                position: position,
                width: width,
                height: height,
                content: content,
                draggable: action.payload.draggable,
                resizable: action.payload.resizable,
                showTextEditor: action.payload.showTextEditor,
                fragment: {}
            };
        default:
            return state;
    }
}



function boxesById(state = {}, action = {}){
    switch (action.type){
        case ADD_SORTABLE_CONTAINER:
            return Object.assign({}, state, {
                [action.payload.parent]: Object.assign({}, state[action.payload.parent], {children: [...state[action.payload.parent].children, action.payload.id]})
            });
        case ADD_BOX:
            return Object.assign({}, state, {
                [action.payload.id]: boxCreator(state[action.payload.id], action)
            });
        case MOVE_BOX:
            return Object.assign({}, state, {
                [action.payload.id]: Object.assign({}, state[action.payload.id], {position: {x: action.payload.x, y: action.payload.y}})
            });
        case RESIZE_BOX:
            return Object.assign({}, state, {
                [action.payload.id]: Object.assign({}, state[action.payload.id], {width: action.payload.width, height: action.payload.height})
            });
        case UPDATE_BOX:
            return Object.assign({}, state, {
                [action.payload.id]: Object.assign({}, state[action.payload.id], {content: action.payload.content})
            });
        case DELETE_BOX:
            var newState = Object.assign({})
             for (let i in state){
                 if(i!=action.payload.id){
                    if(i!=action.payload.parent){
                        newState = Object.assign({},newState, {[i]: Object.assign({}, state[i])})
                    } else {
                        var parent = state[action.payload.parent]
                        parent.children = parent.children.filter(id =>  id!=action.payload.id);
                        console.log(parent.children)
                        newState = Object.assign({},newState, {[i]: Object.assign({}, parent)})
                    }
                }
            }
           return newState;
        case REORDER_BOX:
            let oldChildren = state[action.payload.parent].children
            var newChildren = []
            for(let i in oldChildren){
                newChildren.push(oldChildren[action.payload.ids[i]])
            }
            return Object.assign({}, state, {
                [action.payload.parent]: Object.assign({}, state[action.payload.parent], {children: newChildren}) });
        case IMPORT_STATE:
            return action.payload.present.boxesById;
        default:
            return state;
    }
}

function boxSelected(state = -1, action = {}) {
    switch (action.type) {
        case ADD_BOX:
            return action.payload.id;
        case SELECT_BOX:
            return action.payload.id;
        case DELETE_BOX:
            return -1;
        case IMPORT_STATE:
            return action.payload.present.boxSelected;
        default:
            return state;
    }
}

function boxesIds(state = [], action = {}){
    switch (action.type){
        case ADD_BOX:
            return [...state, action.payload.id];
        case IMPORT_STATE:
            return action.payload.present.boxes;
        case DELETE_BOX:
            var newState = []
            var i;
            state.forEach(s=>{if(s!=action.payload.id) newState.push(s);})
            return newState;
       
        default:
            return state;
    }
}

function sortableContainersById(state = {}, action = {}){
    switch (action.type){
        case ADD_SORTABLE_CONTAINER:
            return Object.assign({}, state, {[action.payload.id] : []});
        case ADD_BOX:
            if(action.payload.parent.indexOf(ID_PREFIX_SORTABLE_CONTAINER) !== -1) {
                return Object.assign({}, state, {
                    [action.payload.parent]: [...state[action.payload.parent], action.payload.id]});
            }
            return state;
        case IMPORT_STATE:
            return action.payload.present.sortableContainers;
        default:
            return state;
    }
}

function sortableContainersIds(state = [], action = {}){
    switch (action.type){
        case ADD_SORTABLE_CONTAINER:
            return [...state, action.payload.id];
        case IMPORT_STATE:
            return action.payload.present.sortableContainersIds;
        default:
            return state;
    }
}

function navItemCreator(state = {}, action = {}){
    switch (action.type){
        case ADD_NAV_ITEM:
            return {id: action.payload.id,
                name: action.payload.name,
                isExpanded: true,
                parent: action.payload.parent,
                children: action.payload.children,
                boxes: [],
                level: action.payload.level,
                type: action.payload.type,
                titlesReduced: action.payload.titlesReduced
            };
        default:
            return state;
    }
}

function navItemsIds(state = [], action = {}){
    switch(action.type){
        case ADD_NAV_ITEM:
            let nState = state.slice();
            nState.splice(action.payload.position, 0, action.payload.id);
            return nState;
        case REMOVE_NAV_ITEM:
            let newState = state.slice();
            action.payload.ids.forEach(id =>{
                newState.splice(newState.indexOf(id), 1);
            });
            return newState;
        case IMPORT_STATE:
            return action.payload.present.navItemsIds;
        default:
            return state;
    }
}

function navItemsById(state = {}, action = {}){
    switch(action.type){
        case ADD_NAV_ITEM:
            return Object.assign({}, state, {
                [action.payload.id]: navItemCreator(state[action.payload.id], action),
                [action.payload.parent]: Object.assign({}, state[action.payload.parent], {children: [...state[action.payload.parent].children, action.payload.id]})
            });
        case EXPAND_NAV_ITEM:
            return Object.assign({}, state, {[action.payload.id]: Object.assign({}, state[action.payload.id], {isExpanded: action.payload.value})});
        case TOGGLE_TITLE_MODE:
            return Object.assign({}, state, {[action.payload.id]: Object.assign({}, state[action.payload.id], {titlesReduced: action.payload.value})});
        case REMOVE_NAV_ITEM:
            let newState = Object.assign({}, state);
            action.payload.ids.map(id =>{
                delete newState[id];
            });
            let newChildren = newState[action.payload.parent].children.slice();
            newChildren.splice(newChildren.indexOf(action.payload.ids[0]), 1);

            return Object.assign({}, newState, {[action.payload.parent]: Object.assign({}, newState[action.payload.parent], {children: newChildren})});
        case ADD_BOX:
            if(action.payload.parent !== 0 && (action.payload.parent.indexOf(ID_PREFIX_PAGE) !== -1 || action.payload.parent.indexOf(ID_PREFIX_SECTION) !== -1))
                return Object.assign({}, state, {
                    [action.payload.parent]: Object.assign({}, state[action.payload.parent], {
                        boxes: [...state[action.payload.parent].boxes, action.payload.id]})});
            return state;
        case DELETE_BOX:
           
            if (action.payload.parent[0] == 'p'){ // Si el parent de la box es una página
                let currentBoxes = state[action.payload.parent].boxes    
                var newBoxes = []; 
                currentBoxes.forEach(box => {if(box!=action.payload.id) newBoxes.push(box); });
             if(action.payload.parent !== 0 && (action.payload.parent.indexOf(ID_PREFIX_PAGE) !== -1 || action.payload.parent.indexOf(ID_PREFIX_SECTION) !== -1))
                return Object.assign({}, state, {
                    [action.payload.parent]: Object.assign({}, state[action.payload.parent], {
                        boxes: newBoxes})});
            }
            return state;
              
        case IMPORT_STATE:
            return action.payload.present.navItemsById;
        default:
            return state;
    }
}

function navItemSelected(state = 0, action = {}){
    switch(action.type){
        case SELECT_NAV_ITEM:
            return action.payload.id;
        case ADD_NAV_ITEM:
            return action.payload.id;
        case REMOVE_NAV_ITEM:
            return 0;
        case IMPORT_STATE:
            return action.payload.present.navItemSelected;
        default:
            return state;
    }
}

function toolbarsById(state = {}, action = {}){
    switch(action.type) {
        case ADD_BOX:
            let toolbar = {id: action.payload.id, buttons: action.payload.toolbar, config: action.payload.config, state: action.payload.state, showTextEditor: action.payload.showTextEditor};
            return Object.assign({}, state, {[action.payload.id]: toolbar});
        case UPDATE_TOOLBAR:
            let newState = state[action.payload.caller].buttons.slice();
            newState[action.payload.index] = Object.assign({}, newState[action.payload.index], {value: action.payload.value});
            return Object.assign({}, state, {
                [action.payload.caller]: Object.assign({}, state[action.payload.caller], {buttons: newState})
            });
        case UPDATE_BOX:
            return Object.assign({}, state, {
                [action.payload.id]: Object.assign({}, state[action.payload.id], {state: action.payload.state})
            });
        case TOGGLE_TEXT_EDITOR:
            return Object.assign({}, state, {
                [action.payload.caller]: Object.assign({}, state[action.payload.caller], {showTextEditor: action.payload.value})
            });
        case IMPORT_STATE:
            return action.payload.present.toolbarsById;
        default:
            return state;
    }
}

function togglePluginModal(state = {caller: 0, fromSortable: false}, action = {}){
    switch(action.type){
        case TOGGLE_PLUGIN_MODAL:
            return action.payload;
        case ADD_BOX:
            return {caller: 0, fromSortable: false};
        case IMPORT_STATE:
            return action.payload.present.boxModalToggled;
        default:
            return state;
    }
}

function togglePageModal(state = {value: false, caller: 0}, action = {}){
    switch(action.type){
        case TOGGLE_PAGE_MODAL:
            return action.payload;
        case ADD_NAV_ITEM:
            return {value: false, caller: 0};
        case IMPORT_STATE:
            return action.payload.present.pageModalToggled;
        default:
            return state;
    }
}

function changeDisplayMode(state = "", action = {}){
    switch(action.type){
        case CHANGE_DISPLAY_MODE:
            return action.payload.mode;
        case IMPORT_STATE:
            return action.payload.present.displayMode;
        default:
            return state;
    }
}

function isBusy(state = "", action = {}){
    switch(action.type){
        case SET_BUSY:
            return action.payload.msg;
        case IMPORT_STATE:
            return action.payload.present.isBusy;
        default:
            return state;
    }
}

const GlobalState = undoable(combineReducers({
    boxModalToggled: togglePluginModal,
    pageModalToggled: togglePageModal,
    boxesById: boxesById, //{0: box0, 1: box1}
    boxSelected: boxSelected, //0
    boxes: boxesIds, //[0, 1]
    sortableContainersById: sortableContainersById, //{0: cont0, 1: cont1}
    sortableContainers: sortableContainersIds, //[0, 1]
    navItemsIds: navItemsIds, //[0, 1]
    navItemSelected: navItemSelected, // 0
    navItemsById: navItemsById, // {0: navItem0, 1: navItem1}
    displayMode: changeDisplayMode, //"list",
    toolbarsById: toolbarsById, // {0: toolbar0, 1: toolbar1}
    isBusy: isBusy
}), { filter: (action, currentState, previousState) => {
    if(action.type === EXPAND_NAV_ITEM)
        return false;
    else if(action.type === TOGGLE_PAGE_MODAL)
        return false;
    else if(action.type === TOGGLE_PLUGIN_MODAL)
        return false;
    else if(action.type === TOGGLE_TITLE_MODE)
        return false;
    else if(action.type === CHANGE_DISPLAY_MODE)
        return false;
    else if(action.type === SET_BUSY)
        return false;
    return currentState !== previousState; // only add to history if state changed
    }});

export default GlobalState;