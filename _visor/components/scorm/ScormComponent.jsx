import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isContainedView, isPage, isSection } from '../../../common/utils';
import Config from '../../../core/config';
import * as API from './../../../core/scorm/scorm_utils';
import GlobalScore from '../scorm/GlobalScore';

export default class ScormComponent extends Component {
    constructor(props) {
        super(props);
        let { exNums, exercises, pages } = API.getExerciseNumsAndAnswers(this.props.exercises);
        this.state = {
            exercises: this.props.exercises,
            totalScore: 0,
            completionProgress: 0,
            userName: "Anonymous",
            isPassed: "incomplete",
            suspendData: { exercises, pages },
        };
        this.onUnload = this.onUnload.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.setAnswer = this.setAnswer.bind(this);
        this.submitPage = this.submitPage.bind(this);
        this.timeProgress = this.timeProgress.bind(this);
        this.totalWeight = 0;
        for (let e in this.props.exercises) {
            this.totalWeight += this.props.exercises[e].weight;
        }
        this.exerciseNums = exNums;
        this.numPages = Object.keys(this.props.exercises).length;
    }
    getFirstPage() {
        let navItems = this.props.navItemsIds || [];
        let bookmark = 0;
        for (let i = 0; i < navItems.length; i++) {
            if (Config.sections_have_content ? isSection(navItems[i]) : isPage(navItems[i])) {
                bookmark = navItems[i];
                break;
            }
        }
        return bookmark;
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.currentView !== nextProps.currentView) {
            setTimeout(()=>{
                if (this.props.currentView === nextProps.currentView) {
                    this.timeProgress();
                }

            }, 5000);
            if(API.isConnected()) {

                if(!isContainedView(nextProps.currentView)) {
                    API.changeLocation(nextProps.currentView);
                }
            }
        }
    }

    render() {
        const { children } = this.props;
        let scoreInfo = { userName: this.state.userName, totalScore: this.state.totalScore, totalWeight: this.totalWeight, isPassed: this.state.isPassed, completionProgress: this.state.completionProgress };
        let childrenWithProps = React.Children.map(children, (child, i) =>
            React.cloneElement(child, {
                key: i,
                setAnswer: this.setAnswer,
                submitPage: this.submitPage,
                exercises: this.state.exercises[this.props.currentView] }));
        return [...childrenWithProps, this.props.globalConfig.hideGlobalScore ? null : null,
            <GlobalScore key="-1" scoreInfo={scoreInfo}/>,
        ];

    }
    componentDidMount() {
        window.addEventListener("load", this.onLoad);
        window.addEventListener("beforeunload", this.onUnload);
    }
    onLoad(event) {
        let DEBUG = Ediphy.Config.debug_scorm;
        let scorm = new API.init(DEBUG, DEBUG);

        if(API.isConnected()) {
            let init = API.getInitialState(this.state.exercises, this.exerciseNums, this.numPages, this.state.suspendData);
            console.log('onload', init);
            let isFirst = false;
            if (init) {
                let bookmark = (init && init.bookmark && init.bookmark !== '') ? init.bookmark : this.getFirstPage();
                this.props.changeCurrentView(bookmark);
                this.setState(init);
                isFirst = this.props.currentView === bookmark;
                console.log(this.props.currentView, bookmark);
                if (isFirst) {
                    return;
                }

            }
        }
        setTimeout(()=>{
            this.timeProgress();
        }, 5000);

    }
    timeProgress() {
        let currentView = this.props.currentView;
        let exercises = JSON.parse(JSON.stringify(this.state.exercises));
        exercises[currentView].visited = true;

        let suspendData = JSON.parse(JSON.stringify(this.state.suspendData));
        let ind = Object.keys(this.state.exercises).indexOf(this.props.currentView);
        suspendData.pages[ind] = true;
        let completionProgress = this.calculateVisitPctg(suspendData.pages);
        let totalScore = this.state.totalScore;
        if (!this.state.exercises[currentView].visited && Object.keys(exercises[currentView].exercises).length === 0) {
            console.log('here no exercises');
            exercises[currentView].attempted = true;
            totalScore += exercises[currentView].weight;
        }

        console.log('TOTALSCORE', totalScore);
        this.setState({ totalScore, suspendData, exercises, completionProgress });

        if (API.isConnected()) {
            API.setSCORMScore(totalScore, this.totalWeight, completionProgress, suspendData);
        }
    }

    onUnload(event) {
        if(API.isConnected()) {
            API.finish();
        }
    }
    componentWillUnmount() {
        window.removeEventListener("beforeunload", this.onUnload);
        window.removeEventListener("onload", this.onLoad);
    }
    setAnswer(id, answer, page) {
        let exercises = JSON.parse(JSON.stringify(this.state.exercises));
        if (exercises[page] && exercises[page].exercises[id]) {
            exercises[page].exercises[id].currentAnswer = answer;
            this.setState({ exercises });
        }
    }
    submitPage(page) {
        let exercises = JSON.parse(JSON.stringify(this.state.exercises));
        let suspendData = JSON.parse(JSON.stringify(this.state.suspendData));
        let total = 0;
        let points = 0;
        let bx = exercises[page].exercises;
        for (let ex in bx) {
            total += bx[ex].weight;
            bx[ex].score = 0;
            let plug = Ediphy.Visor.Plugins.get(bx[ex].name);
            let checkAnswer = plug.checkAnswer(bx[ex].currentAnswer, bx[ex].correctAnswer);
            if (checkAnswer) {
                let exScore = bx[ex].weight;
                try {
                    if(!isNaN(parseFloat(checkAnswer))) {
                        exScore = exScore * checkAnswer;
                    }
                } catch(e) {}
                points += exScore;
                bx[ex].score = exScore;

            }

            bx[ex].attempted = true;
            suspendData.exercises[bx[ex].num - 1] = {
                a: bx[ex].currentAnswer,
                s: bx[ex].score,
                c: bx[ex].attempted ? "completed" : "incomplete" };

        }
        exercises[page].attempted = true;
        let pageScore = points / total;
        exercises[page].score = parseFloat(pageScore.toFixed(2));
        let totalScore = parseFloat((this.state.totalScore + pageScore * exercises[page].weight).toFixed(2));
        let completionProgress = this.calculateVisitPctg(suspendData.pages);
        this.setState({ exercises, totalScore, suspendData, completionProgress });
        if(API.isConnected()) {
            API.setSCORMScore(totalScore, this.totalWeight, completionProgress, suspendData);
        }
    }
    calculateVisitPctg(pages) {
        let visitedPctg = 0;
        visitedPctg = pages.reduce((old, act)=>{
            return old + (act ? 1 : 0);
        });
        visitedPctg = visitedPctg / (pages.length || 1);
        return visitedPctg;
    }

}

ScormComponent.propTypes = {

    /**
     * Array que contiene todas las vistas creadas, accesibles por su *id*
     */
    navItemsIds: PropTypes.array.isRequired,
    /**
     * Vista actual
     */
    currentView: PropTypes.any.isRequired,
    /**
     * Configuración global del curso
     */
    globalConfig: PropTypes.object.isRequired,
    /**
     * Cambia la vista actual
     */
    changeCurrentView: PropTypes.func.isRequired,
    /**
      * Children components
     */
    children: PropTypes.object,
    // /**
    //  * Whether the app is in SCORM mode or not
    //  */
    // fromScorm: PropTypes.bool,
    /**
       * Object containing all the exercises in the course
       */
    exercises: PropTypes.object.isRequired,
};
