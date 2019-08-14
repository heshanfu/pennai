import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header } from 'semantic-ui-react';
import * as d3 from "d3";
//import * as bananaSet from './bananaJson.json';

class BoxPlot extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  this.createBoxPlot = this.createBoxPlot.bind(this);
  }

  componentDidMount() {
    this.createBoxPlot();
  }

  componentDidUpdate(prevProps, prevState) {
    //this.createBarGraph();
  }

  // from - https://www.d3-graph-gallery.com/graph/boxplot_basic.html
  createBoxPlot(){
    const { dataPreview, valByRowObj, rawKey, cleanKey } = this.props;
    //window.console.log('datapreview for boxplot', dataPreview);
    let margin = { top: 5, right: 60, bottom: 50, left: 85 },
        width = 425 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    // to make background of svg transparent set stroke & fill to none
    // or do not specify background color
    let svg = d3.select("#test_box_plot_" + cleanKey)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("stroke", "none")
    .style("fill", "none")
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    // get stats
    let data_sorted = valByRowObj[rawKey].sort(d3.ascending);
    // let data_sorted_AB = valByRowObj[rawKey].sort( (a, b) => {
    //   return a - b;
    // });

    let q1 = d3.quantile(data_sorted, .25);
    //let median_quantile = d3.quantile(data_sorted, .5);
    let median = d3.median(data_sorted);
    //window.console.log('median_quantile', median_quantile);
    //window.console.log('median', median);

    let q3 = d3.quantile(data_sorted, .75);
    let interQuantileRange = q3 - q1;
    let min = q1 - (1.5 * interQuantileRange);
    let max = q3 + (1.5 * interQuantileRange);
    // min = -1;
    // median = 0;
    // max = 1;
    let minData = Math.min(...data_sorted);
    let maxData = Math.max(...data_sorted);

    // print stats
    // window.console.debug('raw key: ', rawKey);
    // window.console.debug('sorted data: ', data_sorted);
    // window.console.debug('q1: ', q1);
    // window.console.debug('q3: ', q3);
    // window.console.debug('interQuantileRange: ', interQuantileRange);
    // window.console.debug('median: ', median);
    // window.console.debug('min (whisker): ', min);
    // window.console.debug('max (whisker): ', max);
    // use minimum/max values in data as lower & upper bounds for whisker lines
    min < minData ? min = minData : null;
    max > maxData ? max = maxData : null;

    // window.console.debug('minData: ', minData);
    // window.console.debug('maxData: ', maxData);
    // color scale for jitter points
    let myColor = d3.scaleSequential()
      .interpolator(d3.interpolateInferno)
      .domain([min, max]);

    // Y scale - use .domain([rawKey]) to show y-axis label
    let yScale = d3.scaleBand()
      .range([height, 0])
      .paddingInner(1)
      .paddingOuter(.5)
    svg.append("g")
      .style("color", "white")
      .call(d3.axisLeft(yScale).tickSize(0))
      .select(".domain").remove()
    // X scale
    let xScale = d3.scaleLinear()
      .domain([min, max])
      .range([0, width]);
    svg.append("g")
      .attr("stroke", "white")
      .style("color", "white")
      .call(d3.axisBottom(xScale))
      .attr("transform", "translate(0," + (height) + ")")
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
      //.attr("transform", "translate(0," + (height) + ")");
    // box features
    let center = 150;
    width = 100;
    // main vertical line
    svg.append("line")
      .attr("y1", center)
      .attr("y2", center)
      .attr("x1", xScale(min) )
      .attr("x2", xScale(max) )
      .attr("stroke", "white");

    // Show the box
    svg.append("rect")
      .attr("x", xScale(q1))
      .attr("y", center - width/2 )
      .attr("height",  width)
      .attr("width", (xScale(q3)-xScale(q1)) )
      .attr("stroke", "white")
      .style("fill", "#1678c2")
      // orange - #f26202
      // sea foam green - rgb(85, 214, 190)
      // #1678c2
    // show median, min and max horizontal lines
    svg.selectAll("toto")
    .data([min, median, max])
    .enter()
    .append("line")
      .attr("y1", center-width/2)
      .attr("y2", center+width/2)
      .attr("x1", function(d){ return(xScale(d))} )
      .attr("x2", function(d){ return(xScale(d))} )
      .attr("stroke", "white");

    let statisticsObj = {
      q1: q1 ? q1 : undefined,
      q3: q3 ? q3 : undefined,
      median: median ? median : undefined,
      min: min ? min : undefined,
      max: max ? max : undefined,
      min_val_in_data: minData ? minData : undefined,
      max_val_in_data: maxData ? maxData : undefined
    };

    return statisticsObj;
  }

  render() {
    const {cleanKey} = this.props;
    createBoxPlotStatsTest();
    return (
      <div id={"test_box_plot_" + cleanKey} style={{position:'relative', left:'-100px'}}/>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { BoxPlot };
export default connect(mapStateToProps, {})(BoxPlot);

// export helper method for unit test
export function createBoxPlotStatsTest(valByRowObj={'test':[0]}, rawKey='test'){

  valByRowObj[rawKey] = Object.values(valByRowObj[rawKey]);
  let data_sorted = valByRowObj[rawKey].sort(d3.ascending);

  let q1 = d3.quantile(data_sorted, .25);
  let median = d3.median(data_sorted);
  let q3 = d3.quantile(data_sorted, .75);
  let interQuantileRange = q3 - q1;
  let min = q1 - (1.5 * interQuantileRange);
  let max = q3 + (1.5 * interQuantileRange);

  let minData = Math.min(...data_sorted);
  let maxData = Math.max(...data_sorted);

  min < minData ? min = minData : null;
  max > maxData ? max = maxData : null;

  let statisticsObj = {
    q1: q1 ? q1 : undefined,
    q3: q3 ? q3 : undefined,
    median: median ? median : undefined,
    min: min ? min : undefined,
    max: max ? max : undefined,
    min_val_in_data: minData ? minData : undefined,
    max_val_in_data: maxData ? maxData : undefined
  };

  return statisticsObj;
}