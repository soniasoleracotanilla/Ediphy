
import i18n from 'i18next';

export const testState = { present:
        {
            globalConfig: {
                title: "Ediphy",
                canvasRatio: 16 / 9,
                visorNav: {
                    player: true,
                    sidebar: true,
                    keyBindings: true,
                },
                trackProgress: true,
                age: {
                    min: 0,
                    max: 100,
                },
                context: 'school',
                rights: "Public Domain",
                keywords: [],
                typicalLearningTime: {
                    h: 0,
                    m: 0,
                    s: 0,
                },
                version: '1.0.0',
                thumbnail: '',
                status: 'draft',
                structure: 'linear',
                difficulty: 'easy',
            },
            displayMode: "list",
            filesUploaded: [],
            indexSelected: -1,
            navItemsById: {
                0: {
                    id: 0,
                    children: [],
                    boxes: [],
                    level: 0,
                    type: '',
                    hidden: false,
                },
                "pa-1511252955865": {
                    id: "pa-1511252955865",
                    children: [],
                    parent: 0,
                    boxes: ['bo-1511252957954'],
                    level: 1,
                    type: 'slide',
                    hidden: false,
                    isExpanded: true,
                },
            },
            navItemsIds: ["pa-1511252955865"],
            navItemSelected: 0,
            marksById: {
                "rm-1511252975065": {
                    parent: 'bo-1511252957954',
                    id: "rm-1511252975065",
                    title: "new mark",
                    connectMode: "existing",
                    connection: "cv-1511252975055",
                    displayMode: "navigate",
                    value: "30.95,49.15",
                    color: "#222222",
                    oldConnection: '',
                    newConnection: 'cv-1511252975055',
                },
            },
            containedViewsById: {
                'cv-1511252975055': {
                    id: 'cv-1511252975055',
                    extraFiles: {},
                    boxes: [],
                    parent: {
                        'bo-1511252957954': ['rm-1511252975055'],
                    },
                },
            },
            exercises: {
                'pa-1511252955865': {
                    id: 'pa-1511252955865',
                    submitButton: true,
                    trackProgress: false,
                    attempted: false,
                    weight: 10,
                    minForPass: 50,
                    exercises: {},
                    score: 0,
                },
            },
            boxesById: {
                'bo-1511252957954': {
                    children: [],
                    col: 0,
                    containedViews: [],
                    container: 0,
                    content: "",
                    draggable: true,
                    fragment: {},
                    id: 'bo-1511252957954',
                    level: 0,
                    parent: "pa-1511252955865",
                    position: {
                        type: "absolute",
                        x: "56.57015590200445%",
                        y: "1.5978695073235685%" },
                    resizable: true,
                    row: 0,
                    showTextEditor: false,
                },
            },
            viewToolbarsById: {
                "pa-1511252955865": {
                    id: "pa-1511252955865",
                    hidden: false,
                    viewName: "Section",
                    breadcrumb: 'reduced',
                    displayableTitle: "Documento",
                    courseTitle: 'hidden',
                    documentSubtitle: 'hidden',
                    documentSubtitleContent: '',
                    documentTitle: 'expanded',
                    documentTitleContent: '',
                    numPage: 'hidden',
                    numPageContent: '',
                },
                'cv-1511252975055': {
                    id: "cv-1511252975055",
                    hidden: false,
                    viewName: "Page",
                    breadcrumb: 'reduced',
                    displayableTitle: "Documento: vita contenida",
                    courseTitle: 'hidden',
                    pageSubtitle: 'hidden',
                    pageSubtitleContent: '',
                    pageTitle: 'expanded',
                    pageTitleContent: '',
                    numPage: 'hidden',
                    numPageContent: '',
                },
            },
            pluginToolbarsById: {
                'bo-1511252957954': {
                    id: 'bo-1511252957954',
                    showTextEditor: false,
                    pluginId: 'HotspotImages',
                    state: {
                        url: "\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAHCCAIAAAC8ESAzAAAAB3RJTUUH4QgEES4UoueqBwAAAAlwSFlzAAALEgAACxIB0t1+/AAAAARnQU1BAACxjwv8YQUAAA3zSURBVHja7d1rUxtXgsdhpBag1h18mRqTfbHz/T/S7r6ZmMzETgyYi21AbIMyxmAwCCS3pP/zFOWqOEQckWr/fA7d5zT2P+ytAUCqZt0DAIA6CSEA0YQQgGhCCEA0IQQgmhACEE0IAYgmhABEE0IAogkhANGEEIBoQghANCEEIJoQAhBNCAGIJoQARBNCAKIJIQDRhBCAaEIIQDQhBCCaEAIQTQgBiCaEAEQTQgCiCSEA0YQQgGhCCEA0IQQgmhACEE0IAYgmhABEE0IAogkhANGEEIBoQghANCEEIJoQAhBNCAGIJoQARBNCAKIJIQDRhBCAaEIIQDQhBCCaEAIQTQgBiCaEAEQTQg...\"",
                    },
                    style: {
                        backgroundColor: "#ffffff",
                        borderColor: "#000000",
                        borderRadius: 0,
                        borderStyle: "solid",
                        boderWidth: 0,
                        opacity: 1,
                        padding: 0,
                    },
                    structure: {
                        __width: "200px",
                        __height: "200px",
                        rotation: 0,
                    },
                    /*
                "bs-1511252985426": {
                    "id": "bs-1511252985426",
                    "parent": "pa-1511252985426",
                    "container": 0,
                    "level": -1,
                    "col": 0,
                    "row": 0,
                    "position": { "x": 0, "y": 0, "type": "relative" },
                    "draggable": false,
                    "resizable": false,
                    "showTextEditor": false,
                    "fragment": {},
                    "children": ['sc-1511443052922', 'sc-1511443052923'],
                    "sortableContainers": {
                        "sc-1511443052922": {
                            "children": ["bo-1511443052925", "bo-1511443052967"],
                            "colDistribution": [100],
                            "cols": [[100]],
                            "height": "auto",
                            "key": "sc-1511443052922",
                            "style": {
                                "borderColor": "#ffffff",
                                "borderStyle": "solid",
                                "borderWidth": "0px",
                                "className": "",
                                "opacity": "1",
                                "padding": "0px",
                                "textAlign": "center",
                            },
                        },
                        "sc-1511443052923": {
                            "children": [],
                            "colDistribution": [100],
                            "cols": [[100]],
                            "height": "auto",
                            "key": "sc-1511443052923",
                            "style": {
                                "borderColor": "#ffffff",
                                "borderStyle": "solid",
                                "borderWidth": "0px",
                                "className": "",
                                "opacity": "1",
                                "padding": "0px",
                                "textAlign": "center",
                            },
                        },
                    },
                    "containedViews": [],
 */
                },
                "bs-1511252985426": {
                    "id": "bs-1511252985426",
                    "controls": { "main": { "__name": "Main", "accordions": {} } },
                    "config": { "displayName": "Contenedor" },
                    "state": {},
                    "showTextEditor": false,
                }, "-1": { "showTextEditor": false },
            },
            "isBusy": { "value": false, "msg": "La operación se ha realizado correctamente" },
            "fetchVishResults": { "results": [] },
        },
};
