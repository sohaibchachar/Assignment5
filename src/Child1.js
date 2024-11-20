import React, { Component } from "react";
import * as d3 from "d3";
import "./Child1.css";

class Child1 extends Component {
  state = {
    company: "Apple", 
    selectedMonth: "November", 
  };

  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.csv_data !== this.props.csv_data ||
      prevState.company !== this.state.company ||
      prevState.selectedMonth !== this.state.selectedMonth
    ) {
      this.renderChart(); 
    }
  }

  renderChart = () => {
    const { csv_data } = this.props;
    const { company, selectedMonth } = this.state;
    const data = csv_data
      .filter((d) =>d.Company === company &&new Date(d.Date).toLocaleString("default", { month: "long" }) ===selectedMonth)
      .map((d) => ({
        date: new Date(d.Date),
        open: d.Open,
        close: d.Close,
        difference: +(d.Close - d.Open).toFixed(2),
      }));
  
    const margin = { top: 20, right: 100, bottom: 50, left: 50 };
    const width = 700;
    const height = 400;
    const innerWidth = width -margin.left -margin.right;
    const innerHeight = height-margin.top-margin.bottom;
  
    const svg = d3.select("#mysvg").attr("width", width).attr("height", height).select("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  

  
    const x_Scale = d3.scaleTime().domain(d3.extent(data, (d)=>d.date)).range([0,innerWidth]);
    const y_Scale = d3.scaleLinear().domain([
        d3.min(data,(d) => Math.min(d.open,d.close)) - 2,
        d3.max(data,(d) => Math.max(d.open,d.close)) + 2,
      ]).range([innerHeight,0]);
  


    const lineGeneratorOpen = d3.line()
      .x((d)=> x_Scale(d.date))
      .y((d)=> y_Scale(d.open))
      .curve(d3.curveCardinal);
  
    const lineGeneratorClose = d3.line()
      .x((d)=> x_Scale(d.date))
      .y((d)=> y_Scale(d.close))
      .curve(d3.curveCardinal);

    svg.selectAll(".line-open").data([data]).join("path").attr("class", "line-open").attr("d", lineGeneratorOpen).attr("fill", "none").attr("stroke", "#b2df8a").attr("stroke-width", 2);
  
    svg.selectAll(".line-close").data([data]).join("path").attr("class", "line-close").attr("d", lineGeneratorClose).attr("fill", "none").attr("stroke", "#e41a1c").attr("stroke-width", 2);
  
    svg.selectAll(".circle-open")
      .data(data)
      .join("circle")
      .attr("class", "circle-open")
      .attr("cx", (d) => x_Scale(d.date))
      .attr("cy", (d) => y_Scale(d.open))
      .attr("r", 4)
      .attr("fill", "#b2df8a")
      .on("mouseover", (event, d) => {
        d3.select(".tooltip")
          .style("opacity", 1)
          .html(
            `Date: ${d.date.toLocaleDateString()}<br>Open: ${d.open}<br>Close: ${d.close}<br>Difference: ${d.difference}`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", ()=>d3.select(".tooltip").style("opacity", 0));
  
    svg.selectAll(".circle-close")
      .data(data)
      .join("circle")
      .attr("class", "circle-close")
      .attr("cx", (d) => x_Scale(d.date))
      .attr("cy", (d) => y_Scale(d.close))
      .attr("r", 4)
      .attr("fill", "#e41a1c")
      .on("mouseover", (event, d) => {
        d3.select(".tooltip")
          .style("opacity", 1)
          .html(
            `Date: ${d.date.toLocaleDateString()}<br>Open: ${d.open}<br>Close: ${d.close}<br>Difference: ${d.difference}`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => d3.select(".tooltip").style("opacity", 0));
  
    svg.selectAll(".x.axis").data([0]).join("g").attr("class", "x axis").attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x_Scale).tickFormat((d) => {
          const date = new Date(d);
          return d3.timeFormat("%b %d")(date); 
        })
      )
      .selectAll("text").style("text-anchor", "end").attr("transform", "rotate(-45)").style("font-size", "12px");
  
    svg.selectAll(".y.axis").data([0]).join("g").attr("class", "y axis").call(d3.axisLeft(y_Scale));
  
    const legend = svg.selectAll(".legend").data(["Open", "Close"]).join("g");
  
    legend.attr("class", "legend").attr("transform", (_, i) => `translate(${innerWidth + 40}, ${i * 30})`);
  
    legend.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 7).attr("fill", (d) => (d === "Open" ? "#b2df8a" : "#e41a1c"));
  
    legend.append("text").attr("x", 22).attr("y", 18).attr("dy", "-0.2em").style("text-anchor", "start").text((d)=>d);
  };
  
  
  

  render() {
    const options = ["Apple", "Microsoft", "Amazon", "Google", "Meta"];
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December",];

    return (
      <div className="parent">
        <div>
          <h4>Company:</h4>
          {options.map((company) => (
            <label key={company} style={{ marginRight: "10px" }}>
              <input
                type="radio"
                value={company}
                checked={this.state.company === company}
                onChange={(e) => this.setState({ company: e.target.value })}
              />
              {company}
            </label>
          ))}
        </div>
        <div>
          <h4>Month:</h4>
          <select
            value={this.state.selectedMonth}
            onChange={(e) => this.setState({ selectedMonth: e.target.value })}
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <svg id="mysvg">
          <g></g>
        </svg>
        <div className="tooltip"></div>
      </div>
    );
  }
}

export default Child1;
