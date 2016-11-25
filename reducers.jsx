import {combineReducers} from 'redux';
import undoable, {excludeAction} from 'redux-undo';
import Utils from './utils';
import {ADD_BOX, SELECT_BOX, MOVE_BOX, DUPLICATE_BOX, RESIZE_BOX, UPDATE_BOX, DELETE_BOX, REORDER_BOX, DROP_BOX, INCREASE_LEVEL,
    ADD_RICH_MARK, EDIT_RICH_MARK, SELECT_CONTAINED_VIEW,
    RESIZE_SORTABLE_CONTAINER, CHANGE_COLS, CHANGE_ROWS, CHANGE_SORTABLE_PROPS, REORDER_BOXES,
    ADD_NAV_ITEM, SELECT_NAV_ITEM, EXPAND_NAV_ITEM, REMOVE_NAV_ITEM, REORDER_NAV_ITEM, TOGGLE_NAV_ITEM, UPDATE_NAV_ITEM_EXTRA_FILES,
    CHANGE_SECTION_TITLE, CHANGE_UNIT_NUMBER, VERTICALLY_ALIGN_BOX,
    TOGGLE_TEXT_EDITOR, TOGGLE_TITLE_MODE, CHANGE_TITLE,
    CHANGE_DISPLAY_MODE, SET_BUSY, UPDATE_TOOLBAR, COLLAPSE_TOOLBAR, IMPORT_STATE, FETCH_VISH_RESOURCES_SUCCESS
} from './actions';
import {ID_PREFIX_SECTION, ID_PREFIX_PAGE, ID_PREFIX_BOX, ID_PREFIX_SORTABLE_BOX, ID_PREFIX_CONTAINED_VIEW, ID_PREFIX_SORTABLE_CONTAINER} from './constants';
import i18n from 'i18next';


function boxCreator(state = {}, action = {}) {
    switch (action.type) {
        case ADD_BOX:
            let position, width, height;
            let level = (state[action.payload.ids.parent] && !(action.payload.ids.container.length && action.payload.ids.container.indexOf(ID_PREFIX_CONTAINED_VIEW) !== -1)) ?
            state[action.payload.ids.parent].level + 1 :
                0;
            if(action.payload.ids.id.indexOf(ID_PREFIX_SORTABLE_BOX) !== -1) {
                position = {x: 0, y: 0, type: 'relative'};
                width = '100%';
                level = -1;
            }else{
                position = {
                    x: 0,
                    y: 0,
                    type: 'absolute'
                };
                if (action.payload.config.category !== "text") {
                    width = 200;
                }
                height = 'auto';
            }
            if (action.payload.ids.container.length && action.payload.ids.container.indexOf(ID_PREFIX_SORTABLE_CONTAINER) !== -1) {
                position.x = 0;
                position.y = 0;
                position.type = 'relative';
                if (action.payload.ids.parent.indexOf(ID_PREFIX_SORTABLE_BOX) !== -1) {
                    if (action.payload.config.category !== "text") {
                        width = "25%";
                    }
                }
                height = 'auto';
            }
            let col = 0;
            let row = 0;
            if (action.payload.initialParams) {
                if (action.payload.initialParams.position) {
                    position = action.payload.initialParams.position;
                }
                if (action.payload.initialParams.col) {
                    col = action.payload.initialParams.col;
                }
                if (action.payload.initialParams.row) {
                    row = action.payload.initialParams.row;
                }
                if (action.payload.initialParams.width) {
                    width = action.payload.initialParams.width;
                }
            }

            let children = [];
            let sortableContainers = {};
            let containedViews = [];
            if (action.payload.state) {
                let pluginContainers = action.payload.state.__pluginContainerIds;
                if (pluginContainers) {
                    for (let key in pluginContainers) {
                        children.push(pluginContainers[key].id);
                        sortableContainers[pluginContainers[key].id] = {
                            children: [],
                            style: {
                                padding: '0px',
                                borderColor: '#ffffff',
                                borderWidth: '0px',
                                borderStyle: 'solid',
                                opacity: '1',
                                textAlign: 'center'
                            },
                            height: pluginContainers[key].height || 'auto',
                            key: key,
                            colDistribution: [100],
                            cols: [
                                [100]
                            ]
                        };
                    }
                }
            }

            return {
                id: action.payload.ids.id,
                parent: action.payload.ids.parent,
                container: action.payload.ids.container,
                level: level,
                col: col,
                row: row,
                position: position,
                width: width,
                height: height,
                content: action.payload.content,
                draggable: action.payload.draggable,
                resizable: action.payload.resizable,
                showTextEditor: false,
                fragment: {},
                children: children,
                sortableContainers: sortableContainers,
                containedViews: containedViews
            };
        default:
            return state;
    }
}

function sortableContainerCreator(state = {}, action = {}) {
    switch (action.type) {
        case ADD_BOX:
            return Object.assign({}, state, {
                [action.payload.ids.container]: (state[action.payload.ids.container] ?
                    Object.assign({}, state[action.payload.ids.container], {
                        children: [...state[action.payload.ids.container].children, action.payload.ids.id]
                    }) : {
                    children: [action.payload.ids.id],
                    height: "auto",
                    style: {
                        padding: '0px',
                        borderColor: '#ffffff',
                        borderWidth: '0px',
                        borderStyle: 'solid',
                        opacity: 1
                    },
                    colDistribution: [100],
                    cols: [
                        [100]
                    ]
                })
            });
        case RESIZE_SORTABLE_CONTAINER:
            return Object.assign({}, state, {
                [action.payload.id]: Object.assign({}, state[action.payload.id], {
                    height: action.payload.height
                })
            });
        case DELETE_BOX:
            let newChildren = state[action.payload.container].children.filter(id => id !== action.payload.id);
            let container = Utils.deepClone(state[action.payload.container]);
            container.children = newChildren;

            return Object.assign({}, state, {
                [action.payload.container]: container
            });
        case CHANGE_COLS:
            let cols = state[action.payload.id].cols;
            if (action.payload.distribution.length < cols.length) {
                cols = cols.slice(0, cols.length - 1);
            }
            let reduced = action.payload.distribution.reduce(function (prev, curr) {
                return prev + curr;
            });
            if (reduced > 99 || reduced <= 101) {
                if (action.payload.distribution.length > cols.length) {
                    let difference = action.payload.distribution.length - cols.length;
                    for (var i = 0; i < difference; i++) {
                        cols.push([100]);
                    }
                }
            }
            return Object.assign({}, state, {
                [action.payload.id]: Object.assign({}, state[action.payload.id], {
                    colDistribution: action.payload.distribution,
                    cols: cols
                })
            });
        case CHANGE_ROWS:
            let newCols = state[action.payload.id].cols.slice();
            newCols[action.payload.column] = action.payload.distribution;
            return Object.assign({}, state, {
                [action.payload.id]: Object.assign({}, state[action.payload.id], {
                    cols: newCols
                })
            });
        default:
            return state;
    }
}

function boxesById(state = {}, action = {}) {
    console.log(action);
    var newState;
    switch (action.type) {
        case ADD_BOX:
            let box = boxCreator(state, action);
            if (action.payload.ids.container.length && action.payload.ids.container.indexOf(ID_PREFIX_SORTABLE_CONTAINER) !== -1) {
                return Object.assign({}, state, {
                    [action.payload.ids.id]: box,
                    [action.payload.ids.parent]: Object.assign({}, state[action.payload.ids.parent], {
                        children: (state[action.payload.ids.parent].children.indexOf(action.payload.ids.container) !== -1) ?
                            state[action.payload.ids.parent].children :
                            [...state[action.payload.ids.parent].children, action.payload.ids.container],
                        sortableContainers: sortableContainerCreator(state[action.payload.ids.parent].sortableContainers, action)
                    })
                });
            }

            return Object.assign({}, state, {
                [action.payload.ids.id]: box
            });
        case MOVE_BOX:
            return Object.assign({}, state, {
                [action.payload.id]: Object.assign({}, state[action.payload.id], {
                    position: {
                        x: action.payload.x,
                        y: action.payload.y,
                        type: action.payload.position
                    }
                })
            });
        case DUPLICATE_BOX:
            newState = Object.assign({}, state);
            let replaced = Object.assign({}, state);
            let newIds = action.payload.newIds;
            let newId = ID_PREFIX_BOX + action.payload.newId;
            //let count = 0;
            Object.keys(newIds).map(box => {
                replaced = Object.replaceAll(replaced, box, newIds[box]);
            });
            replaced = Object.replaceAll(replaced, action.payload.id.substr(3), action.payload.newId);//split -
            let defState = Object.assign({}, newState, replaced);
            if (action.payload.container !== 0) {
                replaced[action.payload.parent].sortableContainers[action.payload.container].children.push(action.payload.id);
            }

            return Object.assign({}, defState, {
                [newId]: Object.assign({}, defState[newId], {position: {x: 0, y: 0, position: 'absolute'}})
            });

        case RESIZE_BOX:
            return Object.assign({}, state, {
                [action.payload.id]: Object.assign({}, state[action.payload.id], {
                    width: action.payload.width,
                    height: action.payload.height
                })
            });
        case RESIZE_SORTABLE_CONTAINER:
            return Object.assign({}, state, {
                [action.payload.parent]: Object.assign({}, state[action.payload.parent], {
                    sortableContainers: sortableContainerCreator(state[action.payload.parent].sortableContainers, action)
                })
            });
        case UPDATE_BOX:
            newState = Object.assign({}, state);
            //newState[action.payload.id].content = action.payload.content;
            let sortableContainers = {};
            let children = [];
            if (action.payload.state.__pluginContainerIds) {
                for (let containerKey in action.payload.state.__pluginContainerIds) {
                    let container = action.payload.state.__pluginContainerIds[containerKey];
                    if (!newState[action.payload.id].sortableContainers[container.id]) {
                        sortableContainers[container.id] = {
                            children: [],
                            style: container.style || {
                                padding: '0px',
                                borderColor: '#ffffff',
                                borderWidth: '0px',
                                borderStyle: 'solid',
                                opacity: '1'
                            },
                            key: containerKey,
                            height: container.height,
                            colDistribution: [100],
                            cols: [
                                [100]
                            ]
                        };
                        children.push(container.id);
                    } else {
                        sortableContainers[container.id] = newState[action.payload.id].sortableContainers[container.id];
                        children.push(container.id);
                    }
                }
            }

            return Object.assign({}, state, {
                [action.payload.id]: Object.assign({}, state[action.payload.id], {
                    content: action.payload.content,
                    children: children,
                    sortableContainers: sortableContainers
                })
            });
        case ADD_RICH_MARK:
            if (action.payload.mark.connection.id) {
                return Object.assign({}, state, {
                    [action.payload.parent]: Object.assign({}, state[action.payload.parent], {
                        containedViews: [...state[action.payload.parent].containedViews, action.payload.mark.connection.id]
                    })
                });
            }
            return state;
        case REORDER_BOXES:
            return Object.assign({}, state, {
                [action.payload.parent]: Object.assign({}, state[action.payload.parent], {
                    sortableContainers: Object.assign({}, state[action.payload.parent].sortableContainers, {
                        [action.payload.container]: Object.assign({}, state[action.payload.parent].sortableContainers[action.payload.container], {
                            children: action.payload.order
                        })
                    })
                })
            });

        case CHANGE_SORTABLE_PROPS:
            let changedState = Utils.deepClone(state);
            changedState[action.payload.parent].sortableContainers[action.payload.id].style[action.payload.prop] = action.payload.value;
            return changedState;
        case DROP_BOX:
            return Object.assign({}, state, {
                [action.payload.id]: Object.assign({}, state[action.payload.id], {
                    row: action.payload.row,
                    col: action.payload.col
                })
            });
        case CHANGE_COLS:
            return Object.assign({}, state, {
                [action.payload.parent]: Object.assign({}, state[action.payload.parent], {
                    sortableContainers: sortableContainerCreator(state[action.payload.parent].sortableContainers, action)
                })
            });
        case CHANGE_ROWS:
            return Object.assign({}, state, {
                [action.payload.parent]: Object.assign({}, state[action.payload.parent], {
                    sortableContainers: sortableContainerCreator(state[action.payload.parent].sortableContainers, action)
                })
            });
        case DELETE_BOX:
            newState = Utils.deepClone(state);

            delete newState[action.payload.id];
            if (action.payload.children) {
                action.payload.children.forEach(id => {
                    delete newState[id];
                });
            }

            if (action.payload.container.length && action.payload.container.indexOf(ID_PREFIX_SORTABLE_CONTAINER) !== -1) {
                newState[action.payload.parent].sortableContainers = sortableContainerCreator(newState[action.payload.parent].sortableContainers, action);
            }

            return newState;
        case REMOVE_NAV_ITEM:
            newState = Object.assign({}, state);
            action.payload.boxes.map(box => {
                delete newState[box];
            });
            return newState;
        case REORDER_BOX:
            return Object.assign({}, state, {
                [action.payload.parent]: Object.assign({}, state[action.payload.parent], {
                    children: action.payload.ids
                })
            });
        case IMPORT_STATE:
            return action.payload.present.boxesById || state;
        default:
            return state;
    }
}

function boxLevelSelected(state = 0, action = {}) {
    switch (action.type) {
        case ADD_BOX:
            return 0;
        case INCREASE_LEVEL:
            return state + 1;
        case SELECT_BOX:
            if (action.payload.id === -1) {
                return 0;
            }
            if (action.payload.id.indexOf(ID_PREFIX_SORTABLE_BOX) !== -1) {
                return -1;
            }
            return state;
        case DELETE_BOX:
            return state;
        case SELECT_NAV_ITEM:
            return 0;
        case REMOVE_NAV_ITEM:
            return 0;
        default:
            return state;
    }
}

function boxSelected(state = -1, action = {}) {
    switch (action.type) {
        case ADD_BOX:
            if (action.payload.ids.id.indexOf(ID_PREFIX_SORTABLE_BOX) !== -1) {
                return -1;
            }
            return (action.payload.initialParams && action.payload.initialParams.isDefaultPlugin) ? state : action.payload.ids.id;
        case SELECT_BOX:
            return action.payload.id;
        case DUPLICATE_BOX:
            return ID_PREFIX_BOX + action.payload.newId;
        case DELETE_BOX:
            if(action.payload.container.length && action.payload.container.indexOf(ID_PREFIX_CONTAINED_VIEW) !== -1){
                return -1;
            }
            if (action.payload.parent.indexOf(ID_PREFIX_BOX) !== -1) {
                return action.payload.parent;
            }
            return -1;
        case SELECT_CONTAINED_VIEW:
            return -1;
        case ADD_NAV_ITEM:
            return -1;
        case SELECT_NAV_ITEM:
            return -1;
        case REMOVE_NAV_ITEM:
            return -1;
        case IMPORT_STATE:
            return action.payload.present.boxSelected || state;
        default:
            return state;
    }
}

function boxesIds(state = [], action = {}) {
    switch (action.type) {
        case ADD_BOX:
            return [...state, action.payload.ids.id];
        case DUPLICATE_BOX:
            let firstJoin = state;
            firstJoin.push(ID_PREFIX_BOX + action.payload.newId);
            let newIds = action.payload.newIds;
            Object.keys(newIds).map((box)=> {
                firstJoin.push(ID_PREFIX_BOX + newIds[box]);
            });
            return firstJoin;
        case DELETE_BOX:
            return state.filter(id => {
                return id !== action.payload.id && (action.payload.children ? action.payload.children.indexOf(id) === -1 : true);
            });
        case REMOVE_NAV_ITEM:
            return state.filter(id => {
                return action.payload.boxes.indexOf(id) === -1;
            });
        case IMPORT_STATE:
            return action.payload.present.boxes || state;
        default:
            return state;
    }
}

function navItemCreator(state = {}, action = {}) {
    switch (action.type) {
        case ADD_NAV_ITEM:
            return {
                id: action.payload.id,
                name: action.payload.name,
                isExpanded: true,
                parent: action.payload.parent,
                children: action.payload.children,
                boxes: [],
                level: action.payload.level,
                type: action.payload.type,
                position: action.payload.position,
                unitNumber: (action.payload.parent === 0 ? state[action.payload.parent].children.length + 1 : state[action.payload.parent].unitNumber),
                hidden: state[action.payload.parent].hidden,
                extraFiles: {},
                titlesReduced: action.payload.titlesReduced || 'expanded'
            };
        default:
            return state;
    }
}
//TODO Repasar por qué sobra tanto código
function recalculateNames(state = {}, old = {}, resta = 0, numeroBorrados = 0) {
    var items = state;
    //var sectionNum = 1;
    //Recalculate positions
    for (let i in items) {
        if (resta === 1) {
            if (items[i].position >= old.position) {
                items[i].position -= numeroBorrados;
            }
        } else {
            if (items[i].position > old.position || (items[i].position === old.position && items[i].level < old.level)) {
                items[i].position++;
            }
        }
    }
    // Rename pages
    var pages =
        Object.keys(state).filter(page => {
            if (state[page].type === 'slide' || state[page].type === 'document') {
                return page;
            }
        }).sort(function (a, b) {
            return state[a].position - state[b].position;
        });

    //pages.forEach((page, index) => {
    // items[page].name = 'Page ' + (index + 1);
    //});

    // Rename sections
    //var mainindex = 1;
    //var secondindex = 1;

    var sections = Object.keys(state).filter(sec => {
        if (state[sec].type === 'section') {
            return sec;
        }
    }).sort(function (a, b) {
        return state[a].position - state[b].position;
    });

    sections.forEach((section) => {
        if (items[section].level === 1) {
            // items[section].name = 'Section ' + (mainindex++);
        } else {
            var sub = items[items[section].parent].children.filter(s => s[0] === 's').indexOf(section) + 1;
            //items[section].name = items[items[section].parent].name + '.' + sub;
        }
    });

    return items;
}

function navItemsIds(state = [], action = {}) {
    switch (action.type) {
        case ADD_NAV_ITEM:
            let nState = state.slice();
            nState.splice(action.payload.position - 1, 0, action.payload.id);
            return nState;
        case REMOVE_NAV_ITEM:
            let newState = state.slice();
            action.payload.ids.forEach(id => {
                newState.splice(newState.indexOf(id), 1);
            });
            return newState;
        case REORDER_NAV_ITEM:
            if (action.payload.type < 5) {
                return action.payload.newIndId;
            }
            return state;
        case IMPORT_STATE:
            return action.payload.present.navItemsIds || state;
        default:
            return state;
    }
}

function findNavItemsDescendants(state, parent) {
    let family = [parent];
    state[parent].children.forEach(item => {
        family = family.concat(findNavItemsDescendants(state, item));
    });
    return family;
}

function navItemsById(state = {}, action = {}) {
    var newState;
    var newBoxes;
    switch (action.type) {
        case SELECT_NAV_ITEM:
            return state;
        case ADD_NAV_ITEM:
            newState = Object.assign({}, state, {
                [action.payload.id]: navItemCreator(state, action),
                [action.payload.parent]: Object.assign({}, state[action.payload.parent], {children: [...state[action.payload.parent].children, action.payload.id]})
            });
            return recalculateNames(newState, newState[action.payload.id], 0);
        case EXPAND_NAV_ITEM:
            return Object.assign({}, state, {[action.payload.id]: Object.assign({}, state[action.payload.id], {isExpanded: action.payload.value})});
        case TOGGLE_TITLE_MODE:
            return Object.assign({}, state, {[action.payload.id]: Object.assign({}, state[action.payload.id], {titlesReduced: action.payload.value})});
        case REMOVE_NAV_ITEM:
            let oldOne = Object.assign({}, state[action.payload.ids[0]]);
            newState = Object.assign({}, state);
            action.payload.ids.map(id => {
                delete newState[id];
            });
            let newChildren = newState[action.payload.parent].children.slice();
            newChildren.splice(newChildren.indexOf(action.payload.ids[0]), 1);
            let wrongNames = Object.assign({}, newState, {[action.payload.parent]: Object.assign({}, newState[action.payload.parent], {children: newChildren})});
            return recalculateNames(wrongNames, oldOne, 1, action.payload.ids.length);
        case REORDER_NAV_ITEM:
            //   0--> outside to outside /   1--> outside to section /   2--> sectionA to sectionB /   3--> section to section  /   4--> section to outside
            var newSt = Utils.deepClone(state);

            if (action.payload.type === 0 || action.payload.type === 3) {

                newSt[action.payload.newParent].children = action.payload.newChildrenInOrder;

                action.payload.newIndId.forEach(elem => {
                    newSt = Object.assign({}, newSt, {
                        [elem]: Object.assign({}, newSt[elem], {position: action.payload.newIndId.indexOf(elem)})
                    });
                });

            } else if (action.payload.type === 1 || action.payload.type === 2 || action.payload.type === 4) {

                var oldParent = newSt[action.payload.itemId].parent;
                var oldParentChildren = newSt[oldParent].children;
                oldParentChildren.splice(oldParentChildren.indexOf(action.payload.itemId), 1);

                newSt[action.payload.newParent].children = action.payload.newChildrenInOrder;
                newSt[action.payload.itemId].parent = action.payload.newParent;
                newSt[oldParent].children = oldParentChildren;

                var elementsToVisit = [action.payload.itemId];
                var diff = state[action.payload.newParent].level - state[action.payload.itemId].level + 1;
                var currentElement;
                var auxLevel;
                do {
                    currentElement = elementsToVisit.pop();
                    if (newSt[currentElement].children.length > 0) {
                        elementsToVisit = elementsToVisit.concat(newSt[currentElement].children);
                    }
                    auxLevel = newSt[currentElement].level + diff;
                    newSt = Object.assign({}, newSt, {
                        [currentElement]: Object.assign({}, newSt[currentElement], {level: auxLevel})
                    });
                } while (elementsToVisit.length > 0);

                action.payload.newIndId.forEach(elem => {
                    newSt = Object.assign({}, newSt, {
                        [elem]: Object.assign({}, newSt[elem], {position: action.payload.newIndId.indexOf(elem) + 1})
                    });
                });
            }
            let navsToChange = findNavItemsDescendants(state, action.payload.itemId);
            if (action.payload.newParent !== 0) {
                let newUnitNumber = newSt[action.payload.newParent].unitNumber;
                navsToChange.forEach(item => {
                    newSt[item].unitNumber = newUnitNumber;
                });
            }
            return newSt;
        case UPDATE_NAV_ITEM_EXTRA_FILES:
            return Object.assign({}, state, {
                [action.payload.id]: Object.assign({}, state[action.payload.id], {
                    extraFiles: Object.assign({}, state[action.payload.id].extraFiles, {
                        [action.payload.box]: action.payload.xml_path
                    })
                })
            });
        case CHANGE_SECTION_TITLE:
            return Object.assign({}, state, {
                [action.payload.id]: Object.assign({}, state[action.payload.id], {name: action.payload.title})
            });
        case CHANGE_UNIT_NUMBER:
            newState = Utils.deepClone(state);
            let itemsToChange = findNavItemsDescendants(newState, action.payload.id);
            itemsToChange.forEach(item => {
                newState[item].unitNumber = action.payload.value;
            });
            return newState;
        case TOGGLE_NAV_ITEM:
            if (state[state[action.payload.id].parent].hidden) {
                return state;
            }
            newState = Utils.deepClone(state);
            let itemsToHide = findNavItemsDescendants(newState, action.payload.id);
            let hidden = state[action.payload.id].hidden ? false : true;
            newState[action.payload.id].hidden = hidden;
            itemsToHide.forEach(item => {
                newState[item].hidden = hidden;
            });
            return newState;
        case ADD_BOX:
            if (action.payload.ids.parent && action.payload.ids.parent.indexOf(ID_PREFIX_PAGE) !== -1 || action.payload.ids.parent.indexOf(ID_PREFIX_SECTION) !== -1) {
                return Object.assign({}, state, {
                    [action.payload.ids.parent]: Object.assign({}, state[action.payload.ids.parent], {
                        boxes: [...state[action.payload.ids.parent].boxes, action.payload.ids.id]
                    })
                });
            }
            return state;
        case DELETE_BOX:
            if (action.payload.parent.indexOf(ID_PREFIX_PAGE) !== -1 || action.payload.parent.indexOf(ID_PREFIX_SECTION) !== -1) {
                let currentBoxes = state[action.payload.parent].boxes;
                newBoxes = currentBoxes.filter(id => id !== action.payload.id);
                if (action.payload.parent !== 0) {
                    return Object.assign({}, state, {
                        [action.payload.parent]: Object.assign({}, state[action.payload.parent], {
                            boxes: newBoxes
                        })
                    });
                }
            }
            return state;
        case DUPLICATE_BOX:
            if (action.payload.parent.indexOf(ID_PREFIX_PAGE) !== -1 || action.payload.parent.indexOf(ID_PREFIX_SECTION) !== -1) {
                newBoxes = state[action.payload.parent].boxes;
                newBoxes.push(ID_PREFIX_BOX + action.payload.newId);

                if (action.payload.parent !== 0) {
                    return Object.assign({}, state, {
                        [action.payload.parent]: Object.assign({}, state[action.payload.parent], {
                            boxes: newBoxes
                        })
                    });
                }
            }
            return state;
        case IMPORT_STATE:
            return action.payload.present.navItemsById || state;
        default:
            return state;
    }
}

function navItemSelected(state = 0, action = {}) {
    switch (action.type) {
        case SELECT_NAV_ITEM:
            return action.payload.id;
        case ADD_NAV_ITEM:
            return action.payload.id;
        case REMOVE_NAV_ITEM:
            return 0;
        case IMPORT_STATE:
            return action.payload.present.navItemSelected || state;
        default:
            return state;
    }
}

function containedViewSelected(state = 0, action = {}) {
    switch (action.type) {
        case SELECT_NAV_ITEM:
            return 0;
        case SELECT_CONTAINED_VIEW:
            return action.payload.id;
        case ADD_NAV_ITEM:
            return 0;
        case REMOVE_NAV_ITEM:
            return 0;
        case IMPORT_STATE:
            return action.payload.present.containedViewSelected || state;
        default:
            return state;
    }
}

function containedViews(state = {}, action = {}) {
    switch (action.type) {
        case ADD_RICH_MARK:
            if (action.payload.mark.connection.id) {
                return Object.assign({}, state, {
                    [action.payload.mark.connection.id]: action.payload.mark.connection
                });
            }
            return state;
        case ADD_BOX:
            if (action.payload.ids.container.length && action.payload.ids.container.indexOf(ID_PREFIX_CONTAINED_VIEW) !== -1) {
                return Object.assign({}, state, {
                    [action.payload.ids.container]: Object.assign({}, state[action.payload.ids.container], {
                        boxes: [...state[action.payload.ids.container].boxes, action.payload.ids.id]
                    })
                });
            }
            return state;
        case DELETE_BOX:
            let newState = Utils.deepClone(state);

            if (action.payload.childrenViews) {
                action.payload.childrenViews.map(view => {
                    delete newState[view];
                });
            }

            if (action.payload.container.length && action.payload.container.indexOf(ID_PREFIX_CONTAINED_VIEW) !== -1) {
                newState[action.payload.container].boxes = newState[action.payload.container].boxes.filter(id => action.payload.id !== id);
            }

            return newState;
        case REMOVE_NAV_ITEM:
            if (action.payload.containedViews) {
                let newState = Utils.deepClone(state);
                action.payload.containedViews.map(view => {
                    delete newState[view];
                });
                return newState;
            }
            return state;
        case IMPORT_STATE:
            return action.payload.present.containedViewsById || state;
        default:
            return state;
    }
}

function createAspectRatioButton(controls, config){
    let arb = config.aspectRatioButtonConfig;
    let button = {
        __name: arb.name,
        type: "checkbox",
        value: arb.defaultValue,
        autoManaged: true
    };
    if (arb.location.length === 2) {
        controls[arb.location[0]].accordions[arb.location[1]].buttons.__aspectRatio = button;
    } else {
        controls[arb.location[0]].accordions[arb.location[1]].accordions[arb.location[2]].buttons.__aspectRatio = button;
    }
}

function createRichAccordions(controls) {
    if (!controls.main) {
        controls.main = {
            __name: "Main",
            accordions: {
                __marks_list: {
                    key: 'marks_list',
                    __name: 'Marks List',
                    icon: 'border_all',
                    buttons: {}
                },
                __content_list: {
                    key: 'content_list',
                    __name: 'Content List',
                    icon: 'border_all',
                    buttons: {}
                }
            }
        };
    }
    if (!controls.main.accordions.__marks_list) {
        controls.main.accordions.__marks_list = {
            key: 'marks_list',
            __name: 'Marks List',
            icon: 'border_all',
            buttons: {}
        };
    }
    if (!controls.main.accordions.__content_list) {
        controls.main.accordions.__content_list = {
            key: 'content_list',
            __name: 'Content List',
            icon: 'border_all',
            buttons: {}
        };
    }
}

function createSortableButtons(controls) {
    if (!controls.main) {
        controls.main = {
            __name: "Main",
            accordions: {
                __sortable: {
                    key: 'structure',
                    __name: i18n.t('Structure'),
                    icon: 'border_all',
                    buttons: {}
                }
            }
        };
    } else if (!controls.main.accordions.__sortable) {
        controls.main.accordions.__sortable = {
            key: 'structure',
            __name: i18n.t('Structure'),
            icon: 'border_all',
            buttons: {}
        };
    }
    controls.main.accordions.__sortable.buttons.width = {
        __name: i18n.t('Width_percentage'),
        type: 'number',
        value: 100,
        min: 0,
        max: 100,
        step: 5,
        units: '%',
        autoManaged: true
    };
    controls.main.accordions.__sortable.buttons.height = {
        __name: i18n.t('Height_percentage'),
        type: 'number',
        value: 'auto',
        min: 0,
        max: 100,
        step: 5,
        units: '%',
        autoManaged: true
    };
    controls.main.accordions.__sortable.buttons.__heightAuto = {
        __name: i18n.t('Height_auto'),
        type: 'checkbox',
        value: 'checked',
        checked: 'true',
        autoManaged: true
    };
    controls.main.accordions.__sortable.buttons.__position = {
        __name: i18n.t('Position'),
        type: 'radio',
        value: 'relative',
        options: ['absolute', 'relative'],
        autoManaged: true
    };
    controls.main.accordions.__sortable.buttons.__verticalAlign = {
        __name: i18n.t('Vertical_align'),
        type: 'fancy_radio',
        value: 'middle',
        options: ['top', 'middle', 'bottom'],
        tooltips: [i18n.t('messages.align_top'),i18n.t('messages.align_middle'),i18n.t('messages.align_bottom')],
        icons: ['vertical_align_top', 'vertical_align_center', 'vertical_align_bottom'],
        autoManaged: true
    };
}

function createFloatingBoxButtons(controls) {
    if (!controls.main) {
        controls.main = {
            __name: "Main",
            accordions: {
                __sortable: {
                    key: 'structure',
                    __name: i18n.t('Structure'),
                    icon: 'border_all',
                    buttons: {}
                }
            }
        };
    } else if (!controls.main.accordions.__sortable) {
        controls.main.accordions.__sortable = {
            key: 'structure',
            __name: i18n.t('Structure'),
            icon: 'border_all',
            buttons: {}
        };
    }

    controls.main.accordions.__sortable.buttons.width = {
        __name: i18n.t('Width_pixels'),
        type: 'number',
        value: 100,
        min: 0,
        max: 100,
        step: 5,
        units: 'px',
        autoManaged: true
    };
    controls.main.accordions.__sortable.buttons.height = {
        __name: i18n.t('Height_pixels'),
        type: 'number',
        value: 'auto',
        min: 0,
        max: 100,
        step: 5,
        units: 'px',
        autoManaged: true
    };
    controls.main.accordions.__sortable.buttons.__heightAuto = {
        __name: i18n.t('Height_auto'),
        type: 'checkbox',
        value: 'checked',
        checked: 'true',
        autoManaged: true
    };
}


function createAliasButton(controls) {
    if (!controls.main) {
        controls.main = {
            __name: "Alias",
            icon: 'rate_review',
            accordions: {
                __extra: {
                    __name: "Alias",
                    buttons: {}
                }
            }
        };
    } else if (!controls.main.accordions.__extra) {
        controls.main.accordions.__extra = {
            __name: "Alias",
            icon: 'rate_review',
            buttons: {}
        };
    }
    controls.main.accordions.__extra.buttons.alias = {
        __name: 'Alias',
        type: 'text',
        value: "",
        autoManaged: true,
        isAttribute: true
    };
}

function toolbarsById(state = {}, action = {}) {
    var newState;
    switch (action.type) {
        case ADD_BOX:
            let toolbar = {
                id: action.payload.ids.id,
                controls: action.payload.toolbar || {},
                config: action.payload.config || {},
                state: action.payload.state,
                showTextEditor: false,
                isCollapsed: false
            };
            if (action.payload.ids.id.indexOf(ID_PREFIX_SORTABLE_BOX) !== -1) {
                if (toolbar.config) {
                    toolbar.config.name = i18n.t('Container_');
                }
            }
            // If contained in sortableContainer
            if (action.payload.ids.container.length && action.payload.ids.container.indexOf(ID_PREFIX_SORTABLE_CONTAINER) !== -1) {
                createSortableButtons(toolbar.controls);
            // If not contained (AKA floating box)
            } else if (action.payload.ids.id.indexOf(ID_PREFIX_SORTABLE_BOX) === -1) {
                createFloatingBoxButtons(toolbar.controls);
            }

            // If not a DaliBoxSortable
            if (action.payload.ids.id.indexOf(ID_PREFIX_SORTABLE_BOX) === -1) {
                createAliasButton(toolbar.controls);
            }
            if (toolbar.config && toolbar.config.aspectRatioButtonConfig) {
                createAspectRatioButton(toolbar.controls, toolbar.config);
            }

            if (toolbar.config && toolbar.config.isRich) {
                createRichAccordions(toolbar.controls);
            }

            newState = Object.assign({}, state);
            newState[action.payload.ids.id] = toolbar;
            if (action.payload.ids.parent.indexOf(ID_PREFIX_PAGE) === -1 && action.payload.ids.parent.indexOf(ID_PREFIX_SECTION) === -1) {
                let parentControls = state[action.payload.ids.parent].controls;
                if (Object.keys(parentControls).length === 0) {
                    parentControls.main = {
                        __name: "Main",
                        accordions: {}
                    };
                }
                newState[action.payload.ids.parent].controls = parentControls;
            }

            return newState;
        case DELETE_BOX:
            let newObject = Utils.deepClone(state);
            delete newObject[action.payload.id];

            if (action.payload.children) {
                action.payload.children.forEach(id => {
                    delete newObject[id];
                });
            }

            return newObject;
        case DUPLICATE_BOX:
            newState = Object.assign({}, state);
            let replaced = Object.assign({}, state);
            //let newId = ID_PREFIX_BOX + action.payload.newId;
            let newIds = action.payload.newIds;
            //let count = 0;
            Object.keys(newIds).map((box)=> {
                replaced = Object.assign({}, Object.replaceAll(replaced, box, newIds[box]));
            });
            replaced = Object.assign({}, Object.replaceAll(replaced, action.payload.id.substr(3), action.payload.newId));
            let defState = Object.assign({}, newState, replaced);
            return defState;
        case UPDATE_TOOLBAR:
            newState = Object.assign({}, state);
            let pl = action.payload;
            if (pl.accordions.length > 1) {
                newState[pl.id].controls[pl.tab].accordions[pl.accordions[0]].accordions[pl.accordions[1]].buttons[pl.name].value = pl.value;
            } else {
                newState[pl.id].controls[pl.tab].accordions[pl.accordions[0]].buttons[pl.name].value = pl.value;
            }
            return newState;
        case COLLAPSE_TOOLBAR:
            return Object.assign({}, state, {
                [action.payload.id]: Object.assign({}, state[action.payload.id], {isCollapsed: !(state[action.payload.id].isCollapsed)})
            });
        case VERTICALLY_ALIGN_BOX:
            newState = Utils.deepClone(state);
            newState[action.payload.id].controls.main.accordions.__sortable.buttons.__verticalAlign.value = action.payload.verticalAlign;
            return newState;
        case RESIZE_BOX:
            newState = Object.assign({}, state);
            let height = action.payload.height;
            //let width = action.payload.width;
            let heightAuto = height === 'auto';

            if (newState[action.payload.id] && newState[action.payload.id].controls) {
                if (newState[action.payload.id].controls.main && newState[action.payload.id].controls.main.accordions) {
                    if (newState[action.payload.id].controls.main.accordions.__sortable) {
                        let buttons = newState[action.payload.id].controls.main.accordions.__sortable.buttons;
                        if (buttons.__heightAuto) {
                            newState[action.payload.id].controls.main.accordions.__sortable.buttons.__heightAuto.checked = heightAuto;
                            newState[action.payload.id].controls.main.accordions.__sortable.buttons.__heightAuto.value = heightAuto ? 'checked' : 'unchecked';
                        }
                        if (buttons.height && buttons.width) {
                            newState[action.payload.id].controls.main.accordions.__sortable.buttons.height.value = height;
                            newState[action.payload.id].controls.main.accordions.__sortable.buttons.width.value = height;
                        }
                    }
                }
            }

            return newState;
        case ADD_RICH_MARK:
            return Object.assign({}, state, {
                [action.payload.parent]: Object.assign({}, state[action.payload.parent], {
                    state: action.payload.state
                })
            });
        case EDIT_RICH_MARK:
            return Object.assign({}, state, {
                [action.payload.parent]: Object.assign({}, state[action.payload.parent], {
                    state: action.payload.state
                })
            });
        case UPDATE_BOX:
            let controls = action.payload.toolbar;

            try {
                createSortableButtons(
                    controls,
                    state[action.payload.id].controls.main.accordions.__sortable.buttons.width.value,
                    state[action.payload.id].controls.main.accordions.__sortable.buttons.height.value
                );
                createAliasButton(
                    controls,
                    state[action.payload.id].controls.main.accordions.__extra.buttons.alias.value
                );
            } catch (e) {
            }

            if (state[action.payload.id].config && state[action.payload.id].config.isRich) {
                createRichAccordions(controls);
            }

            return Object.assign({}, state, {
                [action.payload.id]: Object.assign({}, state[action.payload.id], {
                    state: action.payload.state,
                    controls: controls
                })
            });
        case TOGGLE_TEXT_EDITOR:
            return Object.assign({}, state, {
                [action.payload.caller]: Object.assign({}, state[action.payload.caller], {showTextEditor: action.payload.value})
            });
        case IMPORT_STATE:
            return action.payload.present.toolbarsById || state;
        case REMOVE_NAV_ITEM:
            newState = Object.assign({}, state);
            action.payload.boxes.map(box => {
                delete newState[box];
            });
            return newState;
        case RESIZE_SORTABLE_CONTAINER:
            newState = Object.assign({}, state);
            if (newState[action.payload.parent].state) {
                let sortableContainers = newState[action.payload.parent].state.__pluginContainerIds;
                for (let key in sortableContainers) {
                    if (sortableContainers[key].id === action.payload.id) {
                        sortableContainers[key].height = action.payload.height;
                        break;
                    }
                }
            }
            return newState;
        default:
            return state;
    }
}

function changeTitle(state = "", action = {}) {
    switch (action.type) {
        case CHANGE_TITLE:
            return action.payload;
        case IMPORT_STATE:
            return action.payload.present.title || state;
        default:
            return state;
    }
}

function changeDisplayMode(state = "", action = {}) {
    switch (action.type) {
        case CHANGE_DISPLAY_MODE:
            return action.payload.mode;
        case IMPORT_STATE:
            return action.payload.present.displayMode || state;
        default:
            return state;
    }
}

function isBusy(state = "", action = {}) {
    switch (action.type) {
        case SET_BUSY:
            return action.payload;
        case IMPORT_STATE:
            return action.payload.present.isBusy || state;
        default:
            return state;
    }
}

function fetchVishResults(state = {results: []}, action = {}) {
    switch (action.type) {
        case FETCH_VISH_RESOURCES_SUCCESS:
            return action.payload.result;
        default:
            return state;
    }
}

const GlobalState = undoable(combineReducers({
    title: changeTitle,
    boxesById: boxesById, //{0: box0, 1: box1}
    boxSelected: boxSelected, //0
    boxLevelSelected: boxLevelSelected, //0
    boxesIds: boxesIds, //[0, 1]
    navItemsIds: navItemsIds, //[0, 1]
    navItemSelected: navItemSelected, // 0
    navItemsById: navItemsById, // {0: navItem0, 1: navItem1}
    containedViewsById: containedViews, // {0: containedView0, 1: containedView1}
    containedViewSelected: containedViewSelected, //0
    displayMode: changeDisplayMode, //"list",
    toolbarsById: toolbarsById, // {0: toolbar0, 1: toolbar1}
    isBusy: isBusy,
    fetchVishResults: fetchVishResults
}), {
    filter: (action, currentState, previousState) => {

        switch (action.type) {
            case CHANGE_DISPLAY_MODE:
            case EXPAND_NAV_ITEM:
            case IMPORT_STATE:
            case INCREASE_LEVEL:
            case SELECT_BOX:
            case SELECT_NAV_ITEM:
            case SET_BUSY:
            case TOGGLE_TEXT_EDITOR:
            case TOGGLE_TITLE_MODE:
            case REORDER_BOXES:
            case UPDATE_NAV_ITEM_EXTRA_FILES:
                return false;
        }

        if(action.type === ADD_BOX && action.payload.initialParams && action.payload.initialParams.isDefaultPlugin){
            return false;
        }

        return currentState !== previousState; // only add to history if state changed
    }
});

export default GlobalState;