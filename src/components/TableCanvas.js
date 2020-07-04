import React, { Component, Fragment } from 'react';
import Tables from './Tables';
import { ROW_HEIGHT, PER_REP } from './TablesConsts';
import "./TableCanvas.css"

export default class TableCanvas extends Component {
    isMouseDown = false;

    constructor(props) {
        super(props);
        this.state = {
            prevSelectedRow: null,
            selectedRow: null,
            prevHoveredRow: null,
            hoveredRow: null,
            selectedCol: null,
            mouseXClicked: 0,
            mouseYClicked: 0,
            currentRowOnTop: null,
            currentRowOnBottom: null,
            thead: this.props.thead
        }
    }

    containerRef = React.createRef();
    stickyHeaderRef = React.createRef();

    componentDidMount() {
        window.addEventListener('mousedown', this._onClickRowHandler);
        window.addEventListener('mousemove', this._onHoverRowHandler);
        window.addEventListener('mouseup', this._onMouseUpHandler);
        this.bound = this.getBoundingContainerRef();
    }

    componentWillUnmount() {
        window.removeEventListener('mousedown', this._onClickRowHandler);
        window.removeEventListener('mousemove', this._onHoverRowHandler);
    }

    _onClickRowHandler = (evt) => {
        const mouseY = evt.clientY + this.containerRef.scrollTop - this.bound.top;
        const mouseX = evt.clientX + this.containerRef.scrollLeft - this.bound.left;

        const selectedRow = this.getRowMouseOver(mouseY);
        const selectedCol = this.getColMouseOver(mouseX);
        const prevSelected = this.state.selectedRow;

        if (selectedRow !== prevSelected) {
            this.setState({ selectedRow, prevSelectedRow: prevSelected, selectedCol, mouseXClicked: mouseX, mouseYClicked: mouseY });
        } else {
            this.setState({ selectedCol, mouseXClicked: mouseX, mouseYClicked: mouseY });
        }
    }

    _onHoverRowHandler = (evt) => {
        const { prevHoveredRow } = this.state;

        const mouseY = evt.clientY + this.containerRef.scrollTop - this.bound.top;
        const hoveredRow = this.getRowMouseOver(mouseY);
        if (hoveredRow !== prevHoveredRow) {
            this.setState({ hoveredRow, prevHoveredRow: this.state.hoveredRow });
        }
    }

    getRowMouseOver = (mouseY) => {
        const { data } = this.props;
        let rowMouseOver = Math.floor(mouseY / ROW_HEIGHT);
        const dataLength = data.length;
        if (rowMouseOver > dataLength - 1) {
            rowMouseOver = dataLength - 1;
        }
        return rowMouseOver;
    }

    getColMouseOver = (mouseX) => {
        const { thead } = this.props;

        let selectedCol = null;
        let startXPosOfCol = 0;
        for (let col = 0; col < thead.length; col++) {
            if (col !== 0) {
                startXPosOfCol = startXPosOfCol + thead[col - 1].width;
            }

            const endXPosOfCol = startXPosOfCol + thead[col].width;
            if (mouseX <= endXPosOfCol) {
                selectedCol = col;
                break;
            }
        }

        return selectedCol;
    }

    getBoundingContainerRef = () => {
        if (this.containerRef instanceof HTMLElement) {
            const bound = this.containerRef.getBoundingClientRect();
            return bound;
        }
    }

    _onScroll = () => {
        this.setStickyHeader();
        console.log("hello")
        const currentRowOnTop = this.getCurrentRowOnTop();
        const currentRowOnBottom = this.getCurrentRowOnBottom();
        this.setState({ currentRowOnTop, currentRowOnBottom });
    }

    setStickyHeader = () => {
        const left = this.containerRef.scrollLeft;
        this.stickyHeaderRef.style.left = `${-left}px`;
    }

    _onMouseDownSpanHead = (evt, colIndex) => {
        // console.log(this.state.thead)
        // const thead = [
        //     { lable: "ID", width: 10, target: 'id', onClick: () => {} },
        //     { lable: "NAME", width: 500, target: 'name', onClick: () => {} },
        //     { lable: "PHONE", width: 100, target: 'phone' },
        //   ]
        this.isMouseDown = true;
        // this.setState({thead});
        evt.preventDefault();
        window.addEventListener('mousemove', this.resizeFunction = (evt) => this._onResizeHandler(evt, colIndex));
    }

    getCurrentRowOnTop = () => {
        const currentRowOnTop = this.getRowMouseOver(this.containerRef.scrollTop);
        return currentRowOnTop;
    }

    getCurrentRowOnBottom = () => {
        const currentRowOnBottom = this.getRowMouseOver(this.containerRef.scrollTop + this.containerRef.clientHeight);
        return currentRowOnBottom;
    }

    /**
     * 
     * @param {React.MouseEvent} evt 
     * @param {Number} colIndex 
     */
    _onResizeHandler = (evt, colIndex) => {
        evt.preventDefault();
        const currentRowOnTop = this.getCurrentRowOnTop();
        const currentRowOnBottom = this.getCurrentRowOnBottom();


        if (evt.clientX % 2 === 0) {
            const thead = [...this.state.thead];
            const width = evt.clientX - this.bound.left;
            const head = thead[colIndex];
            head.width = width;
            thead[colIndex] = head;
            this.setState({ thead });
        }
        this.setState({ currentRowOnTop, currentRowOnBottom });
    }

    _onMouseUpHandler = () => {
        this.isMouseDown = false;
        window.removeEventListener('mousemove', this.resizeFunction);
    }


    renderTables = () => {
        let tables = [];
        const { data } = this.props;
        const { thead } = this.state;
        const { selectedRow, prevSelectedRow, prevHoveredRow, hoveredRow, selectedCol, mouseXClicked, mouseYClicked, currentRowOnTop, currentRowOnBottom } = this.state;
        const numberOfLatestRep = data.length % PER_REP;
        const numberOfRepWithoutLatestRep = (data.length - numberOfLatestRep) / PER_REP;
        let index = 0;
        for (let i = 1; i <= numberOfRepWithoutLatestRep; i++) {
            const partData = data.slice(index, index + PER_REP);
            tables.push(
                <Tables
                    data={partData}
                    thead={thead}
                    selectedRow={selectedRow}
                    prevSelectedRow={prevSelectedRow}
                    prevHoveredRow={prevHoveredRow}
                    hoveredRow={hoveredRow}
                    selectedCol={selectedCol}
                    startRow={index}
                    endRow={index + PER_REP - 1}
                    tableStriped={true}
                    mouseXClicked={mouseXClicked}
                    mouseYClicked={mouseYClicked}
                    currentRowOnTop={currentRowOnTop}
                    currentRowOnBottom={currentRowOnBottom}
                />
            );
            index = index + PER_REP;
        }


        if (numberOfLatestRep !== 0) {
            const partData = data.slice(index, index + numberOfLatestRep);
            tables.push(
                <Tables
                    data={partData}
                    thead={thead}
                    selectedRow={selectedRow}
                    prevSelectedRow={prevSelectedRow}
                    prevHoveredRow={prevHoveredRow}
                    hoveredRow={hoveredRow}
                    selectedCol={selectedCol}
                    startRow={index}
                    endRow={index + numberOfLatestRep}
                    tableStriped={true}
                    mouseXClicked={mouseXClicked}
                    mouseYClicked={mouseYClicked}
                    currentRowOnTop={currentRowOnTop}
                    currentRowOnBottom={currentRowOnBottom}
                />
            )
        }

        return <React.Fragment>
            {tables}
        </React.Fragment>;
    }

    renderStickyHeader = () => {
        const { thead } = this.props;
        let header = [];
        for (let i = 0; i < thead.length; i++) {
            header.push(
                <div style={{ width: thead[i].width, minWidth: thead[i].width }} >
                    {thead[i].lable}
                    <span
                        style={{ width: 2, height: 10, background: "#000" }}
                        className="float-r curor-resize"
                        onMouseDown={(evt) => this._onMouseDownSpanHead(evt, i)}
                    />
                </div>
            )
        }

        return <div style={{
            display: 'flex',
            background: "red",
            position: "relative",
            left: "unset"
        }} ref={r => this.stickyHeaderRef = r}>
            {header}
        </div>
    }


    render() {
        return (<React.Fragment>
            <div className="overflow-hidden">
                {this.renderStickyHeader()}
            </div>
            <div style={{
                overflow: 'auto',
                height: 500,
            }} ref={r => this.containerRef = r} onScroll={this._onScroll}>

                {this.renderTables()}
            </div>
        </React.Fragment>)
    }
}
