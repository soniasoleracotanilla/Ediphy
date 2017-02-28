import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import DaliBoxorVisor from './DaliBoxVisor';
import DaliBoxSortableVis from '../dali_box_sortable/DaliBoxSortable';
import {Col} from 'react-bootstrap';
import DaliTitle from '../dali_title/DaliTitle';
import DaliHeader from '../dali_header/DaliHeader';
import {isSortableBox, isSlide} from './../../../utils';

export default class DaliCanvas extends Component {

    render() {
        let titles = [];
        if (this.props.navItemSelected.id !== 0) {
            titles.push(this.props.navItemSelected.name);
            let parent = this.props.navItemSelected.parent;
            while (parent !== 0) {
                titles.push(this.props.navItems[parent].name);
                parent = this.props.navItems[parent].parent;
            }
            titles.reverse();
        }

        let maincontent = document.getElementById('maincontent');
        let actualHeight;
        if (maincontent) {
            actualHeight = parseInt(maincontent.scrollHeight, 10);
            actualHeight = (parseInt(maincontent.clientHeight, 10) < actualHeight) ? (actualHeight) + 'px' : '100%';
        }

        let overlayHeight = actualHeight ? actualHeight : '100%';
        return (
            /* jshint ignore:start */

            <Col id="canvas" md={12} xs={12}
                 style={{display: this.props.containedViewSelected !== 0 ? 'none' : 'initial'}}>
                 <div className="scrollcontainer">
                 <DaliHeader titles={titles}
                        onShowTitle={()=>this.setState({showTitle:true})}
                        courseTitle={this.props.title}
                        titleMode={this.props.navItemSelected.titleMode}
                        navItem={this.props.navItemSelected}
                        navItems={this.props.navItems}
                        titleModeToggled={this.props.titleModeToggled}
                        onUnitNumberChanged={this.props.onUnitNumberChanged}
                        showButton={true}/>
                <div className="outter canvaseditor">
                    <div id="airlayer"
                    className={isSlide(this.props.navItemSelected.type) ? 'slide_air' : 'doc_air'}
                    style={{visibility: (this.props.showCanvas ? 'visible' : 'hidden') }}>

                    <div id="maincontent"
                         onClick={e => {
                        this.props.onBoxSelected(-1);
                        this.setState({showTitle:false})
                       }}
                         className={isSlide(this.props.navItemSelected.type) ? 'innercanvas sli':'innercanvas doc'}
                         style={{visibility: (this.props.showCanvas ? 'visible' : 'hidden')}}>

                        <DaliTitle titles={titles}
                            courseTitle={this.props.title}
                            titleMode={this.props.navItemSelected.titleMode}
                            navItem={this.props.navItemSelected}
                            navItems={this.props.navItems}}/>
                        <br/>



                        <div style={{
                                width: "100%",
                                background: "black",
                                height: overlayHeight,
                                position: "absolute",
                                top: 0,
                                opacity: 0.4,
                                display:(this.props.boxLevelSelected > 0) ? "block" : "none",
                                visibility: (this.props.boxLevelSelected > 0) ? "visible" : "collapse"
                            }}></div>


                        {this.props.navItemSelected.boxes.map(id => {
                            let box = this.props.boxes[id];
                            if (!isSortableBox(box.id)) {
                                return <DaliBoxVisor key={id}
                                                id={id}
                                                boxes={this.props.boxes}
                                                boxSelected={this.props.boxSelected}
                                                boxLevelSelected={this.props.boxLevelSelected}
                                                containedViewSelected={this.props.containedViewSelected}
                                                toolbars={this.props.toolbars}/>
                            } else {
                                return <DaliBoxSortableVisor key={id}
                                                        id={id}
                                                        boxes={this.props.boxes}
                                                        boxSelected={this.props.boxSelected}
                                                        boxLevelSelected={this.props.boxLevelSelected}
                                                        containedViewSelected={this.props.containedViewSelected}
                                                        toolbars={this.props.toolbars}/>
                            }
                        })}
                    </div>
                </div>
                </div>
                </div>
            </Col>
            /* jshint ignore:end */
        );
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.boxSelected !== -1) {
            this.setState({showTitle: false});
        }
        if (this.props.navItemSelected.id !== nextProps.navItemSelected.id) {
            document.getElementById('maincontent').scrollTop = 0;
        }
    }

    componentDidUpdate(prevProps, prevState) {
        //Fixes bug when reordering dalibox sortable CKEDITOR doesn't update otherwise
        if(this.props.lastActionDispatched.type === REORDER_SORTABLE_CONTAINER){
             for (let instance in CKEDITOR.instances) {
                CKEDITOR.instances[instance].destroy();
             }
             CKEDITOR.inlineAll();
             for (let editor in CKEDITOR.instances){
                 if (this.props.toolbars[editor].state.__text) {
                    CKEDITOR.instances[editor].setData(decodeURI(this.props.toolbars[editor].state.__text));
                }
             }
        }
    }

    componentDidMount() {
        interact(ReactDOM.findDOMNode(this)).dropzone({
            accept: '.floatingDaliBox',
            overlap: 'pointer',
            ondropactivate: function (event) {
                event.target.classList.add('drop-active');
            },
            ondragenter: function (event) {
                event.target.classList.add("drop-target");
            },
            ondragleave: function (event) {
                event.target.classList.remove("drop-target");
            },
            ondrop: function (event) {
                let position = {
                    x: (event.dragEvent.clientX - event.target.getBoundingClientRect().left - document.getElementById('maincontent').offsetLeft)*100/event.target.parentElement.offsetWidth + "%",
                    y: (event.dragEvent.clientY - event.target.getBoundingClientRect().top + document.getElementById('maincontent').scrollTop) + 'px',
                    type: 'absolute'
                };
                let initialParams = {
                    parent: this.props.navItemSelected.id,
                    container: 0,
                    position: position
                };
                Dali.Plugins.get(event.relatedTarget.getAttribute("name")).getConfig().callback(initialParams, ADD_BOX);
                event.dragEvent.stopPropagation();
            }.bind(this),
            ondropdeactivate: function (event) {
                event.target.classList.remove('drop-active');
                event.target.classList.remove("drop-target");
            }
        });
    }
}