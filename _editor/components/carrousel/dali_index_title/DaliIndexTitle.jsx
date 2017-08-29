import React, { Component } from 'react';
import { isPage, isSection } from '../../../../common/utils';
import { FormControl } from 'react-bootstrap';
import Dali from './../../../../core/main';
import i18n from 'i18next';

require('./_daliIndexTitle.scss');

/**
 * Component for editing index elements in situ
 */
export default class DaliIndexTitle extends Component {
    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        /**
         * Component's initial state
         */
        this.state = {
            editing: false,
            currentValue: this.props.title,
        };
    }

    /**
     * Renders React Component
     * @returns {code}
     */
    render() {
        return (
            <span>
                {!this.state.editing ?
                    (<div className="actualSectionTitle"
                        style={{ textDecoration: this.props.hidden ? "line-through" : "initial" }}
                        onDoubleClick={e => {
                            this.setState({ editing: !this.state.editing });
                            if (this.state.editing) { /* Save changes to Redux state*/
                                this.props.onNameChanged(this.props.id, this.state.currentValue);

                            // Synchronize current component state with Redux state when entering edition mode
                            } else {
                                this.setState({ currentValue: this.props.title });
                            }
                            e.stopPropagation();
                        }}>
                        {Dali.Config.show_numbers_before_navitems ? this.props.index : ""} {this.props.title}
                    </div>) :
                    (<FormControl
                        type="text"
                        ref="titleIndex"
                        className={this.props.id ? "editSectionTitle" : "editTitle"}
                        value={this.state.currentValue}
                        autoFocus
                        onKeyDown={e=> {
                            if (e.keyCode === 13) { // Enter Key
                                this.setState({ editing: !this.state.editing });
                                this.props.onNameChanged(this.props.id, (this.state.currentValue.length > 0) ? this.state.currentValue : this.getDefaultValue());
                            }
                            if (e.keyCode === 27) { // Escape key
                                this.setState({ editing: !this.state.editing });
                            }
                        }}
                        onFocus={e => {
                        /* Select all the content when enter edition mode*/
                            e.target.setSelectionRange(0, e.target.value.length);

                        }}
                        onChange={e => {
                        /* Save it on component state, not Redux*/
                            this.setState({ currentValue: e.target.value });
                        }}
                        onBlur={e => {
                        /* Change to non-edition mode*/
                            this.setState({ editing: !this.state.editing });
                            this.props.onNameChanged(this.props.id, (this.state.currentValue.length > 0) ? this.state.currentValue : this.getDefaultValue());
                        }} />
                    )
                }
                <i className="material-icons"
                    style={{ position: "absolute", right: "0", color: this.props.hidden ? "gray" : "white" }}>{this.props.hidden ? "visibility_off" : ""}</i>
            </span>
        );
    }

    /**
     * Get default value if left empty
     * @returns {string}
     */
    getDefaultValue() {
        if (isPage(this.props.id)) {
            return i18n.t("page");
        } else if(isSection(this.props.id)) {
            return i18n.t("section");
        }
        return "Blank";

    }

}