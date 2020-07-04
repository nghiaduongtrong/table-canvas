import React, { Component } from 'react';
import './Table.css';
import { ROW_HEIGHT, DEFAULT_PADDING } from './TablesConsts';

export default class Tables extends Component {
    canvas = React.createRef();
    containerRef = React.createRef();
    PIXEL_RATIO = 0;

    constructor(props) {
        super(props);
        this.state = {
            _hoveredRow: this.props.hoveredRow || null
        }
    }

    getPixelRatio = () => {
        const ctx = this.canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1
        const bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;

        return dpr / bsr;
    }

    createHiDPICanvas = (width, height, ratio) => {
        if (!ratio) {
            ratio = this.PIXEL_RATIO;
        }

        this.canvas.width = width * ratio;
        this.canvas.height = height * ratio;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    componentDidMount() {
        // window.addEventListener('mousedown', this._onClickTextOfColumn);
        const { data, thead } = this.props;
        if (this.canvas instanceof HTMLElement) {
            this.PIXEL_RATIO = this.getPixelRatio();
        }

        const tableHeight = data.length * ROW_HEIGHT;
        let tableWidth = 0;

        for (let i = 0; i < thead.length; i++) {
            tableWidth = tableWidth + thead[i].width;
        }

        this.createHiDPICanvas(tableWidth, tableHeight);
        this.bound = this.getBoundingCanvasRef();

        let context = this.canvas.getContext('2d');
        this.renderTable();
        context.stroke();
    }

    componentWillUnmount() {
        window.removeEventListener('mousedown', this._onClickTextOfColumn);
    }

    componentDidUpdate(prevProps) {
        if (this.props.prevSelectedRow !== prevProps.prevSelectedRow) {
            const { startRow, endRow, prevSelectedRow } = this.props;
            if (prevSelectedRow !== null && prevSelectedRow >= startRow && prevSelectedRow <= endRow) {
                const backgroundColor = this.getBackgroundColorRow(prevSelectedRow);
                this.drawRow(prevSelectedRow - startRow, backgroundColor);
            }
        }

        if (this.props.thead !== prevProps.thead || this.props.currentRowOnTop !== prevProps.currentRowOnTop) {
            const { startRow, endRow, currentRowOnTop, currentRowOnBottom } = this.props;
            if (startRow <= currentRowOnTop && endRow >= currentRowOnBottom) {
                this.clearRectCanvas();
                this.setWidthCanvasToDrawTable(this.props.thead);
                for (let i = currentRowOnTop; i <= currentRowOnBottom; i++) {
                    const backgroundColor = this.getBackgroundColorRow(i);
                    this.clearRectRow(i - startRow, prevProps.thead);
                    this.drawRow(i - startRow, backgroundColor);
                }
            }
        }
    }

    clearRectCanvas = () => {
        const context = this.canvas.getContext('2d');
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setWidthCanvasToDrawTable = (thead) => {
        let tableWidth = 0;

        for (let i = 0; i < thead.length; i++) {
            tableWidth = tableWidth + thead[i].width;
        }
        this.canvas.width = 1000
        this.canvas.width = tableWidth * 1;
        this.canvas.style.width = tableWidth + 'px';
    }

    drawBorderRect = (xPos, yPos, width, height, thickness = 1, context) => {
        context.fillStyle = '#000';
        context.fillRect(xPos - (thickness), yPos - (thickness), width + (thickness * 2), height + (thickness * 2));
    }

    renderTable = () => {
        const { data, selectedRow, startRow } = this.props;
        const dataLength = data.length;
        for (let index = 0; index < dataLength; index++) {
            let backgroundColor = this.getBackgroundColorRow(index + startRow);
            if (index === selectedRow) {
                backgroundColor = "red";
            }
            this.drawRow(index, backgroundColor);
        }
    }

    drawRow = (rowIndex, backgroundColor) => {
        const { data, thead } = this.props;

        let x = 0;
        for (let col = 0; col < thead.length; col++) {
            if (col !== 0) {
                x = x + thead[col - 1].width;
            }

            const fontColor = "black";
            this.drawColumn(x, rowIndex * ROW_HEIGHT, thead[col].width, ROW_HEIGHT, data[rowIndex][thead[col].target], backgroundColor, fontColor);
        }
    }

    clearRectRow = (rowIndex, prevThead) => {
        const context = this.canvas.getContext('2d');
        let x = 0;
        for (let col = 0; col < prevThead.length; col++) {
            if (col !== 0) {
                x = x + prevThead[col - 1].width;
            }
            context.clearRect(x, rowIndex * ROW_HEIGHT, prevThead[col].width, ROW_HEIGHT);
        }
    }

    drawColumn = (x, y, width, height, text, backgroundColor, fontColor) => {
        let context = this.canvas.getContext('2d');
        context.globalCompositeOperation = "source-over";

        this.drawBorderRect(x, y, width, height, 1, context);

        context.fillStyle = backgroundColor;
        context.fillRect(x, y, width, height);

        context.globalCompositeOperation = "source-atop";

        context.fillStyle = fontColor;
        context.font = "12px sans-serif";
        context.textBaseline = "middle";
        context.fillText(`${text}`, x + DEFAULT_PADDING, y + height / 2);
    }

    getBackgroundColorRow = (index) => {
        const { tableStriped } = this.props;
        if (tableStriped) {
            let backgroundColor = "#fff";
            if (index % 2 === 0) {
                backgroundColor = "gray";
            }

            return backgroundColor;
        }

        return "#fff";
    }

    getActualWidthHeightOfText = (text) => {
        let context = this.canvas.getContext('2d');
        const textMetrics = context.measureText(text);
        const actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
        const actualWidth = textMetrics.actualBoundingBoxRight + textMetrics.actualBoundingBoxLeft;

        return { actualHeight, actualWidth };
    }

    _onClickTextOfColumn = () => {
        const { startRow, selectedRow, selectedCol, data, thead, mouseXClicked, mouseYClicked } = this.props;
        const actualRowOfTable = selectedRow - startRow;
        const textOfCell = data[actualRowOfTable][thead[selectedCol].target];
        const textWidthHeightOfCell = this.getActualWidthHeightOfText(textOfCell);
        // position begin top of the highest bounding rectangle of all the fonts
        const topPosText = selectedRow * ROW_HEIGHT + (ROW_HEIGHT - textWidthHeightOfCell.actualHeight) / 2;
        // position begin top of the lowest bounding rectangle of all the fonts
        const bottomPosText = (selectedRow + 1) * ROW_HEIGHT - (ROW_HEIGHT - textWidthHeightOfCell.actualHeight) / 2;

        let startXPosOfCol = this.bound.left;
        for (let col = 0; col <= selectedCol; col++) {
            if (col !== 0) {
                startXPosOfCol = startXPosOfCol + thead[col - 1].width;
            }
        }

        if (mouseYClicked >= topPosText && mouseYClicked <= bottomPosText &&
            mouseXClicked > startXPosOfCol && mouseXClicked < startXPosOfCol + textWidthHeightOfCell.actualWidth) {
            if (thead[selectedCol]["onClick"] && typeof (thead[selectedCol]["onClick"]) === 'function') {
                thead[selectedCol].onClick();
            }
        }

        // ===================================
        if (this.props.selectedRow !== this.props.prevSelectedRow) {
            const { endRow } = this.props;
            if (selectedRow >= startRow && selectedRow <= endRow) {
                this.drawRow(selectedRow - startRow, "red");
            }

        }
    }

    getBoundingCanvasRef = () => {
        if (this.canvas instanceof HTMLElement) {
            const bound = this.canvas.getBoundingClientRect();
            return bound;
        }
    }

    _onMouseMove = () => {
        if (this.props.hoveredRow !== this.state._hoveredRow) {
            const { startRow, endRow, hoveredRow, prevHoveredRow, selectedRow } = this.props;
            if (hoveredRow >= startRow && hoveredRow <= endRow && hoveredRow !== selectedRow) {
                this.drawRow(hoveredRow - startRow, "red");
            }

            if (prevHoveredRow >= startRow && prevHoveredRow <= endRow && prevHoveredRow !== selectedRow) {
                const backgroundColor = this.getBackgroundColorRow(prevHoveredRow);
                this.drawRow(prevHoveredRow - startRow, backgroundColor);
            }
            this.setState({ _hoveredRow: hoveredRow });
        }
    }

    _onMouseLeave = () => {
        const { startRow, endRow, prevHoveredRow, selectedRow } = this.props;
        if (prevHoveredRow >= startRow && prevHoveredRow <= endRow && prevHoveredRow !== selectedRow) {
            const backgroundColor = this.getBackgroundColorRow(prevHoveredRow);
            this.drawRow(prevHoveredRow - startRow, backgroundColor);
        }
    }

    render() {
        return (
            <canvas
                ref={r => this.canvas = r}
                onClick={this._onClickTextOfColumn}
                onMouseMove={this._onMouseMove}
                onMouseLeave={this._onMouseLeave}
                className="table-canvas"
            />
        )
    }
}
