function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    
    // BAR CHART
    // 3. Create a variable that holds the samples array. 
    var samples = data.samples;  
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var samplesArray = samples.filter(sampleObj => sampleObj.id == sample);
    
    //  5. Create a variable that holds the first sample in the array.
    var sampleFilter = samplesArray[0];

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otu_ids = sampleFilter.otu_ids;
    var otu_labels = sampleFilter.otu_labels;
    var sample_values = sampleFilter.sample_values;

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
    
    // the data is already sorted in order, so technically we could just send it to charts as is and slice 10, but in case future appends to the data are not in order...
    
    // sort sample values by highest to obtain uto_id index order
    var xticks = sample_values.sort((a,b) => b-a).map(value => value).slice(0,10).reverse();
    console.log(xticks);
    // obtain the key
    var xtickKeys = Object.keys(xticks);

    // map keys in sample_values to otu_ids
    var yticks = [];
    for (keyValue in xtickKeys) {yticks.push("OTU " + otu_ids[keyValue])};
    console.log(yticks);
    // hoverlabels by key
    var hoverLabels = [];
    for (keyValue in xtickKeys) {hoverLabels.push(otu_labels[keyValue])};
    console.log(hoverLabels);

    // 8. Create the trace for the bar chart. 
    var barData = [{
      x: xticks,
      y: yticks,
      name: "Top 10 Bacterial OTU IDs by sample count",
      text: hoverLabels,
      type: "bar",
      orientation: "h"
    }];

    // 9. Create the layout for the bar chart. 
    var barLayout = {
    //  title: "Top 10 Bacterial OTU IDs by sample count",
     xaxis: {title:"count"},
     yaxis: {title:"OTU IDs"},
     width: 600,
     height: 400, 
     margin: {t: 10, r: 30, l: 80, b: 50, pad: 0},
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar-plots", barData, barLayout);
      // BUBBLE PLOT

    // 1. Create the trace for the bubble chart.
    var xticksAll = sample_values.sort((a,b) => b-a).map(value => value);
    
    // DEBUG AND NEW METHOD
    // console.log(typeof(otu_ids));
    // console.log(typeof(xticksAll));
    // console.log(typeof(hoverLabels));

    // console.log(typeof(otu_ids[1]));
    // console.log(typeof(xticksAll[1]));
    
    // console.log(xtickKeys)

    // var newhoverLabels = [];
    // for (key in xtickKeys) 
    // {
    //   var x = otu_ids[key];
    //   var y = xticksAll[key];
    //   var z = hoverLabels[key];
    //   var temp = x + ' ' + y + '\n' + z;
    //   newhoverLabels.push(temp);
    // };
    
    // console.log(newhoverLabels);

    var bubbleData = [{
      x: otu_ids,
      y: xticksAll, 
      text: hoverLabels,
      mode: "markers",
      marker:
        {
          size: xticksAll,
          color: otu_ids,
          title: {
            display: false}
    
        }
    }];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      // title: "Bacterial Cultures Per Sample",
      xaxis: {title:"OTU ID"},
      yaxis: {title: "count"},
      margin: {t: 10, r: 50, l: 50, b: 50, pad: 0},
      // height: 600,
      // width: 1000
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble-plot", bubbleData, bubbleLayout); 

    // GAUGE
    var metadata = data.metadata;
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];

    var Wfreq = result.wfreq;
    console.log(Wfreq);
    // 4. Create the trace for the gauge chart.
    var gaugeData = [{
        value: Wfreq,
        title: {text: "Scrubs Per Week"},
        type: "indicator",
        mode: "gauge+number",
        gauge: {
          axis: {range: [null, 10]},
          bar: {color: "black"},
          steps: [
            {range: [0,2], color: "red"},
            {range: [2,4], color: "orange"},
            {range: [4,6], color: "yellow"},
            {range: [6,8], color: "lightgreen"},
            {range: [8,10], color: "green"}
          ]
        }
    }];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
     width: 500,
     height: 400, 
     margin: {t: 0, r: 5, l: 5, b: 5, pad: 0},
     font: {color: "black", family: "Ariel"}
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("wash-gauge", gaugeData, gaugeLayout);
  });  
};
